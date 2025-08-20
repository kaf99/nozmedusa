import { WorkflowManager } from "@medusajs/orchestration"
import { z } from "zod"
import { createWorkflow } from "../create-workflow"
import { WorkflowResponse } from "../helpers/workflow-response"

let count = 1
const getNewWorkflowId = () => `schema-test-workflow-${count++}`

describe("Workflow schema registration", () => {

  it("should register input and output schemas with WorkflowManager", () => {
    const inputSchema = z.object({
      productId: z.string(),
      quantity: z.number().min(1),
    })

    const outputSchema = z.object({
      orderId: z.string(),
      total: z.number(),
      status: z.enum(["pending", "completed"]),
    })

    const workflowId = getNewWorkflowId()
    
    // Create a workflow with schemas
    createWorkflow(
      {
        name: workflowId,
        inputSchema,
        outputSchema,
      },
      (input) => {
        return new WorkflowResponse({
          orderId: "order-123",
          total: 100,
          status: "pending" as const,
        })
      }
    )

    // Get the registered workflow from WorkflowManager
    const registeredWorkflow = WorkflowManager.getWorkflow(workflowId)

    // Verify the workflow is registered
    expect(registeredWorkflow).toBeDefined()
    expect(registeredWorkflow?.id).toBe(workflowId)

    // Verify schemas are stored
    expect(registeredWorkflow?.inputSchema).toBe(inputSchema)
    expect(registeredWorkflow?.outputSchema).toBe(outputSchema)
  })

  it("should list all workflows with their schemas", () => {
    // Store workflow IDs to find them later
    const workflow1Id = getNewWorkflowId()
    const workflow2Id = getNewWorkflowId()
    const workflow3Id = getNewWorkflowId()
    
    // Create multiple workflows with different schemas
    const workflow1InputSchema = z.object({
      name: z.string(),
      email: z.string().email(),
    })

    const workflow1OutputSchema = z.object({
      userId: z.string(),
      created: z.boolean(),
    })

    createWorkflow(
      {
        name: workflow1Id,
        inputSchema: workflow1InputSchema,
        outputSchema: workflow1OutputSchema,
      },
      (input) => {
        return new WorkflowResponse({
          userId: "user-123",
          created: true,
        })
      }
    )

    const workflow2InputSchema = z.object({
      productId: z.string(),
      updates: z.object({
        price: z.number().optional(),
        stock: z.number().optional(),
      }),
    })

    createWorkflow(
      {
        name: workflow2Id,
        inputSchema: workflow2InputSchema,
      },
      (input) => {
        return new WorkflowResponse({ success: true })
      }
    )

    // Create a workflow without schemas for comparison
    createWorkflow(workflow3Id, (input) => {
      return new WorkflowResponse({ done: true })
    })

    // Get all workflows
    const allWorkflows = WorkflowManager.getWorkflows()

    // Create a list of workflow IDs and their schemas
    const workflowList: Array<{ id: string; inputSchema?: any; outputSchema?: any }> = []
    allWorkflows.forEach((workflow, id) => {
      workflowList.push({
        id,
        inputSchema: workflow.inputSchema,
        outputSchema: workflow.outputSchema,
      })
    })

    // Find and verify each workflow
    const createUserWorkflow = workflowList.find(
      (w) => w.id === workflow1Id
    )
    expect(createUserWorkflow).toBeDefined()
    expect(createUserWorkflow!.inputSchema).toBe(workflow1InputSchema)
    expect(createUserWorkflow!.outputSchema).toBe(workflow1OutputSchema)

    const updateProductWorkflow = workflowList.find(
      (w) => w.id === workflow2Id
    )
    expect(updateProductWorkflow).toBeDefined()
    expect(updateProductWorkflow!.inputSchema).toBe(workflow2InputSchema)
    expect(updateProductWorkflow!.outputSchema).toBeUndefined()

    const simpleWorkflow = workflowList.find((w) => w.id === workflow3Id)
    expect(simpleWorkflow).toBeDefined()
    expect(simpleWorkflow!.inputSchema).toBeUndefined()
    expect(simpleWorkflow!.outputSchema).toBeUndefined()
  })

  it("should preserve schemas when updating a workflow", () => {
    const workflowId = getNewWorkflowId()
    const inputSchema = z.object({
      id: z.string(),
    })

    const outputSchema = z.object({
      result: z.string(),
    })

    // First create a workflow with schemas
    createWorkflow(
      {
        name: workflowId,
        inputSchema,
        outputSchema,
      },
      (input) => {
        return new WorkflowResponse({ result: "initial" })
      }
    )

    // Verify initial schemas are registered
    let workflow = WorkflowManager.getWorkflow(workflowId)
    expect(workflow?.inputSchema).toBe(inputSchema)
    expect(workflow?.outputSchema).toBe(outputSchema)

    // Create the workflow again (this will trigger an update)
    createWorkflow(
      {
        name: workflowId,
        inputSchema,
        outputSchema,
      },
      (input) => {
        return new WorkflowResponse({ result: "updated" })
      }
    )

    // Verify schemas are still preserved after update
    workflow = WorkflowManager.getWorkflow(workflowId)
    expect(workflow?.inputSchema).toBe(inputSchema)
    expect(workflow?.outputSchema).toBe(outputSchema)
  })
})