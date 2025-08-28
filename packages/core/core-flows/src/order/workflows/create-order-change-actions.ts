import {
  CreateOrderChangeActionDTO,
  OrderChangeActionDTO,
} from "@medusajs/framework/types"
import { Modules } from "@medusajs/framework/utils"
import {
  WorkflowResponse,
  createWorkflow,
} from "@medusajs/framework/workflows-sdk"
import { createEntitiesStep } from "../../common/steps/create-entities"
import {
  createOrderChangeActionsWorkflowInputSchema,
  createOrderChangeActionsWorkflowOutputSchema,
  type CreateOrderChangeActionsWorkflowInput as SchemaInput,
  type CreateOrderChangeActionsWorkflowOutput as SchemaOutput,
} from "../utils/schemas"

export {
  type CreateOrderChangeActionsWorkflowInput,
  type CreateOrderChangeActionsWorkflowOutput,
} from "../utils/schemas"

// Type verification - CORRECT ORDER!
const schemaInput = {} as SchemaInput
const schemaOutput = {} as SchemaOutput

// Check 1: New input can go into old input (schema accepts all valid inputs)
const existingInput: CreateOrderChangeActionDTO[] = schemaInput

// Check 2: Old output can go into new output (schema produces compatible outputs)
const existingOutput: SchemaOutput = {} as OrderChangeActionDTO[]

console.log(existingInput, existingOutput, schemaOutput)

export const createOrderChangeActionsWorkflowId = "create-order-change-actions"
/**
 * This workflow creates order change actions. It's used by other order-related workflows,
 * such as {@link requestItemReturnWorkflow} to create an order change action based on changes made to the order.
 *
 * You can use this workflow within your customizations or your own custom workflows, allowing you to wrap custom logic around
 * creating an order change action.
 *
 * @summary
 *
 * Create an order change action.
 */
export const createOrderChangeActionsWorkflow = createWorkflow(
  {
    name: createOrderChangeActionsWorkflowId,
    description: "Create order change actions",
    inputSchema: createOrderChangeActionsWorkflowInputSchema,
    outputSchema: createOrderChangeActionsWorkflowOutputSchema,
  },
  (input) => {
    const orderChangeActions = createEntitiesStep({
      moduleRegistrationName: Modules.ORDER,
      invokeMethod: "addOrderAction",
      compensateMethod: "deleteOrderChangeActions",
      data: input,
    })

    return new WorkflowResponse(orderChangeActions)
  }
)
