import {
  WorkflowResponse,
  createWorkflow,
} from "@medusajs/framework/workflows-sdk"
import { createRefundReasonStep } from "../steps/create-refund-reasons"
import {
  createRefundReasonsWorkflowInputSchema,
  createRefundReasonsWorkflowOutputSchema,
} from "../utils/schemas"
export {
  type CreateRefundReasonsWorkflowInput,
  type CreateRefundReasonsWorkflowOutput,

} from "../utils/schemas"

export const createRefundReasonsWorkflowId = "create-refund-reasons-workflow"
/**
 * This workflow creates one or more refund reasons. It's used by the
 * [Create Refund Reason Admin API Route](https://docs.medusajs.com/api/admin#refund-reasons_postrefundreasons).
 *
 * You can use this workflow within your own customizations or custom workflows, allowing you
 * to create refund reasons in your custom flows.
 *
 * @example
 * const { result } = await createRefundReasonsWorkflow(container)
 * .run({
 *   input: {
 *     data: [
 *       {
 *         label: "damaged",
 *       }
 *     ]
 *   }
 * })
 *
 * @summary
 *
 * Create refund reasons.
 */
export const createRefundReasonsWorkflow = createWorkflow(
  {
    name: createRefundReasonsWorkflowId,
    description: "Create refund reasons",
    inputSchema: createRefundReasonsWorkflowInputSchema,
    outputSchema: createRefundReasonsWorkflowOutputSchema,
  },
  (input) => {
    return new WorkflowResponse(createRefundReasonStep(input.data))
  }
)
