import { createWorkflow } from "@medusajs/framework/workflows-sdk"
import { cancelOrderChangeStep } from "../steps"
import {
  cancelOrderChangeWorkflowInputSchema,
  cancelOrderChangeWorkflowOutputSchema,
} from "../utils/schemas"

export type {
  CancelOrderChangeWorkflowInput,
  CancelOrderChangeWorkflowOutput,
} from "../utils/schemas"


export const cancelOrderChangeWorkflowId = "cancel-order-change"
/**
 * This workflow cancels an order change.
 * 
 * You can use this workflow within your customizations or your own custom workflows, allowing you to wrap custom logic around 
 * canceling an order change.
 * 
 * @summary
 * 
 * Cancel an order change.
 */
export const cancelOrderChangeWorkflow = createWorkflow(
  {
    name: cancelOrderChangeWorkflowId,
    description: "Cancel an order change",
    inputSchema: cancelOrderChangeWorkflowInputSchema,
    outputSchema: cancelOrderChangeWorkflowOutputSchema,
  },
  (input) => {
    cancelOrderChangeStep(input)
  }
)
