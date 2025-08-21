import { Context, MedusaContainer } from "@medusajs/types"
import {
  DistributedTransactionType,
  OrchestratorBuilder,
  TransactionHandlerType,
  TransactionMetadata,
  TransactionModelOptions,
  TransactionOrchestrator,
  TransactionStep,
  TransactionStepHandler,
  TransactionStepsDefinition,
} from "../transaction"
import { WorkflowScheduler } from "./scheduler"
import type { StandardSchemaV1 } from "@standard-schema/spec"

export interface WorkflowDefinition {
  id: string
  handler: (
    container: MedusaContainer,
    context?: Context
  ) => TransactionStepHandler
  orchestrator: TransactionOrchestrator
  flow_: TransactionStepsDefinition
  handlers_: Map<
    string,
    { invoke: WorkflowStepHandler; compensate?: WorkflowStepHandler }
  >
  options: TransactionModelOptions
  requiredModules?: Set<string>
  optionalModules?: Set<string>
  inputSchema?: StandardSchemaV1<unknown, unknown>
  outputSchema?: StandardSchemaV1<unknown, unknown>
}

export type WorkflowHandler = Map<
  string,
  { invoke: WorkflowStepHandler; compensate?: WorkflowStepHandler }
>

export type WorkflowStepHandlerArguments = {
  container: MedusaContainer
  payload: unknown
  invoke: { [actions: string]: unknown }
  compensate: { [actions: string]: unknown }
  metadata: TransactionMetadata
  transaction: DistributedTransactionType
  step: TransactionStep
  orchestrator: TransactionOrchestrator
  context?: Context
}

export type WorkflowStepHandler = (
  args: WorkflowStepHandlerArguments
) => Promise<unknown>

export interface WorkflowSchemas {
  inputSchema?: StandardSchemaV1<unknown, unknown>
  outputSchema?: StandardSchemaV1<unknown, unknown>
}

class WorkflowManager {
  protected static workflows: Map<string, WorkflowDefinition> = new Map()
  protected static scheduler = new WorkflowScheduler()

  static unregister(workflowId: string) {
    const workflow = WorkflowManager.workflows.get(workflowId)
    if (workflow?.options.schedule) {
      this.scheduler.clearWorkflow(workflow)
    }

    WorkflowManager.workflows.delete(workflowId)
  }

  static unregisterAll() {
    WorkflowManager.workflows.clear()
    this.scheduler.clear()
  }

  static getWorkflows() {
    return WorkflowManager.workflows
  }

  static getWorkflow(workflowId: string) {
    return WorkflowManager.workflows.get(workflowId)
  }

  static getWorkflowSchemas(workflowId: string): WorkflowSchemas | undefined {
    const workflow = WorkflowManager.workflows.get(workflowId)
    if (!workflow) {
      return undefined
    }
    return {
      inputSchema: workflow.inputSchema,
      outputSchema: workflow.outputSchema,
    }
  }

  static getTransactionDefinition(workflowId): OrchestratorBuilder {
    if (!WorkflowManager.workflows.has(workflowId)) {
      throw new Error(`Workflow with id "${workflowId}" not found.`)
    }

    const workflow = WorkflowManager.workflows.get(workflowId)!
    return new OrchestratorBuilder(workflow.flow_)
  }

  static getEmptyTransactionDefinition(): OrchestratorBuilder {
    return new OrchestratorBuilder()
  }

  static register(
    workflowId: string,
    flow: TransactionStepsDefinition | OrchestratorBuilder | undefined,
    handlers: WorkflowHandler,
    options: TransactionModelOptions = {},
    schemas?: WorkflowSchemas,
    requiredModules?: Set<string>,
    optionalModules?: Set<string>
  ) {
    const finalFlow = flow instanceof OrchestratorBuilder ? flow.build() : flow

    if (WorkflowManager.workflows.has(workflowId)) {
      const excludeStepUuid = (key, value) => {
        return key === "uuid" ? undefined : value
      }

      const areStepsEqual = finalFlow
        ? JSON.stringify(finalFlow, excludeStepUuid) ===
          JSON.stringify(
            WorkflowManager.workflows.get(workflowId)!.flow_,
            excludeStepUuid
          )
        : true

      if (!areStepsEqual) {
        throw new Error(
          `Workflow with id "${workflowId}" and step definition already exists.`
        )
      }
    }

    const workflow = {
      id: workflowId,
      flow_: finalFlow!,
      orchestrator: new TransactionOrchestrator({
        id: workflowId,
        definition: finalFlow ?? {},
        options,
      }),
      handler: WorkflowManager.buildHandlers(handlers),
      handlers_: handlers,
      options,
      requiredModules,
      optionalModules,
      inputSchema: schemas?.inputSchema,
      outputSchema: schemas?.outputSchema,
    }

    WorkflowManager.workflows.set(workflowId, workflow)
    if (options.schedule) {
      this.scheduler.scheduleWorkflow(workflow)
    }
  }

  static update(
    workflowId: string,
    flow: TransactionStepsDefinition | OrchestratorBuilder,
    handlers: Map<
      string,
      { invoke: WorkflowStepHandler; compensate?: WorkflowStepHandler }
    >,
    options: TransactionModelOptions = {},
    schemas?: WorkflowSchemas,
    requiredModules?: Set<string>,
    optionalModules?: Set<string>
  ) {
    if (!WorkflowManager.workflows.has(workflowId)) {
      throw new Error(`Workflow with id "${workflowId}" not found.`)
    }

    const workflow = WorkflowManager.workflows.get(workflowId)!

    for (const [key, value] of handlers.entries()) {
      workflow.handlers_.set(key, value)
    }

    const finalFlow = flow instanceof OrchestratorBuilder ? flow.build() : flow
    const updatedOptions = { ...workflow.options, ...options }

    WorkflowManager.workflows.set(workflowId, {
      id: workflowId,
      flow_: finalFlow,
      orchestrator: new TransactionOrchestrator({
        id: workflowId,
        definition: finalFlow,
        options,
      }),
      handler: WorkflowManager.buildHandlers(workflow.handlers_),
      handlers_: workflow.handlers_,
      options: updatedOptions,
      requiredModules,
      optionalModules,
      inputSchema: schemas?.inputSchema ?? workflow.inputSchema,
      outputSchema: schemas?.outputSchema ?? workflow.outputSchema,
    })
  }

  public static buildHandlers(
    handlers: Map<
      string,
      { invoke: WorkflowStepHandler; compensate?: WorkflowStepHandler }
    >
  ): (container: MedusaContainer, context?: Context) => TransactionStepHandler {
    return (
      container: MedusaContainer,
      context?: Context
    ): TransactionStepHandler => {
      return async (
        actionId: string,
        handlerType: TransactionHandlerType,
        payload: any,
        transaction: DistributedTransactionType,
        step: TransactionStep,
        orchestrator: TransactionOrchestrator
      ) => {
        const command = handlers.get(actionId)

        if (!command) {
          throw new Error(`Handler for action "${actionId}" not found.`)
        } else if (!command[handlerType]) {
          throw new Error(
            `"${handlerType}" handler for action "${actionId}" not found.`
          )
        }

        const { invoke, compensate, payload: input } = payload.context
        const { metadata } = payload

        return await command[handlerType]!({
          container,
          payload: input,
          invoke,
          compensate,
          metadata,
          transaction: transaction as DistributedTransactionType,
          step,
          orchestrator,
          context,
        })
      }
    }
  }
}

global.WorkflowManager ??= WorkflowManager
const GlobalWorkflowManager = global.WorkflowManager

export { GlobalWorkflowManager as WorkflowManager }
