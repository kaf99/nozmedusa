import { OrderChangeDTO } from "@medusajs/framework/types"
import {
  WorkflowResponse,
  createWorkflow,
} from "@medusajs/framework/workflows-sdk"
import { createOrderChangeStep } from "../steps"
import {
  createOrderChangeWorkflowInputSchema,
  createOrderChangeWorkflowOutputSchema,
} from "../utils/schemas"

export type {
  CreateOrderChangeWorkflowInput,
  CreateOrderChangeWorkflowOutput,
} from "../utils/schemas"

export const createOrderChangeWorkflowId = "create-order-change"
/**
 * This workflow creates an order change.
 * 
 * You can use this workflow within your customizations or your own custom workflows, allowing you to wrap custom logic around 
 * creating an order change.
 * 
 * @summary
 * 
 * Create an order change.
 */
export const createOrderChangeWorkflow = createWorkflow(
  {
    name: createOrderChangeWorkflowId,
    description: "Create an order change",
    inputSchema: createOrderChangeWorkflowInputSchema,
    outputSchema: createOrderChangeWorkflowOutputSchema,
  },
  (
    input
  ): WorkflowResponse<OrderChangeDTO> => {
    return new WorkflowResponse(createOrderChangeStep(input))
  }
)
