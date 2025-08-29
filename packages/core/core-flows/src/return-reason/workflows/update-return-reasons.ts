import {
  WorkflowResponse,
  createWorkflow,
} from "@medusajs/framework/workflows-sdk"
import { updateReturnReasonsStep } from "../steps"
import {
  updateReturnReasonsWorkflowInputSchema,
  updateReturnReasonsWorkflowOutputSchema,
} from "../utils/schemas"

export {
  type UpdateReturnReasonsWorkflowInput,
  type UpdateReturnReasonsWorkflowOutput,

} from "../utils/schemas"

export const updateReturnReasonsWorkflowId = "update-return-reasons"
/**
 * This workflow updates return reasons matching the specified filters. It's used by the
 * [Update Return Reason Admin API Route](https://docs.medusajs.com/api/admin#return-reasons_postreturnreasonsid).
 *
 * You can use this workflow within your customizations or your own custom workflows, allowing you to
 * update return reasons within your custom flows.
 *
 * @example
 * const { result } = await updateReturnReasonsWorkflow(container)
 * .run({
 *   input: {
 *     selector: {
 *       id: "rr_123",
 *     },
 *     update: {
 *       value: "damaged",
 *     }
 *   }
 * })
 *
 * @summary
 *
 * Update return reasons.
 */
export const updateReturnReasonsWorkflow = createWorkflow(
  {
    name: updateReturnReasonsWorkflowId,
    description: "Update return reasons",
    inputSchema: updateReturnReasonsWorkflowInputSchema,
    outputSchema: updateReturnReasonsWorkflowOutputSchema,
  },
  (input) => {
    return new WorkflowResponse(updateReturnReasonsStep(input))
  }
)
