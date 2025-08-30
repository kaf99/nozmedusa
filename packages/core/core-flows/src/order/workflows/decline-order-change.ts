import { createWorkflow } from "@medusajs/framework/workflows-sdk"
import { declineOrderChangeStep } from "../steps"
import {
  declineOrderChangeWorkflowInputSchema,
  declineOrderChangeWorkflowOutputSchema,
} from "../utils/schemas"


export const declineOrderChangeWorkflowId = "decline-order-change"
/**
 * This workflow declines an order change.
 *
 * You can use this workflow within your customizations or your own custom workflows, allowing you to wrap custom logic around
 * declining an order change.
 *
 * @summary
 *
 * Decline an order change.
 */
export const declineOrderChangeWorkflow = createWorkflow(
  {
    name: declineOrderChangeWorkflowId,
    description: "Decline an order change",
    inputSchema: declineOrderChangeWorkflowInputSchema,
    outputSchema: declineOrderChangeWorkflowOutputSchema,
  },
  (input) => {
    declineOrderChangeStep(input)
  }
)
