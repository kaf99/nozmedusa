import {
  WorkflowResponse,
  createWorkflow,
} from "@medusajs/framework/workflows-sdk"
import { updateRefundReasonsStep } from "../steps"
import {
  updateRefundReasonsWorkflowInputSchema,
  updateRefundReasonsWorkflowOutputSchema,
} from "../utils/schemas"
export {
  type UpdateRefundReasonsWorkflowInput,
  type UpdateRefundReasonsWorkflowOutput,

} from "../utils/schemas"

export const updateRefundReasonsWorkflowId = "update-refund-reasons"
/**
 * This workflow updates one or more refund reasons. It's used by the
 * [Update Refund Reason Admin API Route](https://docs.medusajs.com/api/admin#refund-reasons_postrefundreasonsid).
 *
 * You can use this workflow within your own customizations or custom workflows, allowing you
 * to update refund reasons in your custom flows.
 *
 * @example
 * const { result } = await updateRefundReasonsWorkflow(container)
 * .run({
 *   input: [
 *     {
 *       id: "refres_123",
 *       label: "Damaged",
 *     }
 *   ]
 * })
 *
 * @summary
 *
 * Update refund reasons.
 */
export const updateRefundReasonsWorkflow = createWorkflow(
  {
    name: updateRefundReasonsWorkflowId,
    description: "Update refund reasons",
    inputSchema: updateRefundReasonsWorkflowInputSchema,
    outputSchema: updateRefundReasonsWorkflowOutputSchema,
  },
  (input) => {
    return new WorkflowResponse(updateRefundReasonsStep(input))
  }
)
