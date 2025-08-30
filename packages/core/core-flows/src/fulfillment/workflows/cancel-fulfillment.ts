import { createWorkflow } from "@medusajs/framework/workflows-sdk"
import { cancelFulfillmentStep } from "../steps"
import {
  cancelFulfillmentWorkflowInputSchema,
  cancelFulfillmentWorkflowOutputSchema,
} from "../utils/schemas"

export type {
  CancelFulfillmentWorkflowInput,
  CancelFulfillmentWorkflowOutput,
} from "../utils/schemas"

export const cancelFulfillmentWorkflowId = "cancel-fulfillment-workflow"
/**
 * This workflow cancels a fulfillment. It's used by the
 * [Cancel Fulfillment Admin API Route](https://docs.medusajs.com/api/admin#fulfillments_postfulfillmentsidcancel).
 * 
 * You can use this workflow within your own customizations or custom workflows, allowing you to
 * cancel a fulfillment within your custom flows.
 * 
 * @example
 * const { result } = await cancelFulfillmentWorkflow(container)
 * .run({
 *   input: {
 *     id: "ful_123"
 *   }
 * })
 * 
 * @summary
 * 
 * Cancel a fulfillment.
 */
export const cancelFulfillmentWorkflow = createWorkflow(
  {
    name: cancelFulfillmentWorkflowId,
    description: "Cancel a fulfillment",
    inputSchema: cancelFulfillmentWorkflowInputSchema,
    outputSchema: cancelFulfillmentWorkflowOutputSchema,
  },
  (input) => {
    cancelFulfillmentStep(input.id)
  }
)
