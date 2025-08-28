import {
  WorkflowResponse,
  createWorkflow,
} from "@medusajs/framework/workflows-sdk"
import { deleteRefundReasonsStep } from "../steps"
import {
  deleteRefundReasonsWorkflowInputSchema,
  deleteRefundReasonsWorkflowOutputSchema,
} from "../utils/schemas"

export const deleteRefundReasonsWorkflowId = "delete-refund-reasons-workflow"
/**
 * This workflow deletes one or more refund reasons. It's used by the
 * [Delete Refund Reason Admin API Route](https://docs.medusajs.com/api/admin#refund-reasons_deleterefundreasonsid).
 * 
 * You can use this workflow within your own customizations or custom workflows, allowing you
 * to delete refund reasons in your custom flows.
 * 
 * @example
 * const { result } = await deleteRefundReasonsWorkflow(container)
 * .run({
 *   input: {
 *     ids: ["refres_123"]
 *   }
 * })
 * 
 * @summary
 * 
 * Delete refund reasons.
 */
export const deleteRefundReasonsWorkflow = createWorkflow(
  {
    name: deleteRefundReasonsWorkflowId,
    description: "Delete refund reasons",
    inputSchema: deleteRefundReasonsWorkflowInputSchema,
    outputSchema: deleteRefundReasonsWorkflowOutputSchema,
  },
  (input) => {
    return new WorkflowResponse(deleteRefundReasonsStep(input.ids))
  }
)
