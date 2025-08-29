import { Modules } from "@medusajs/framework/utils"
import { createWorkflow } from "@medusajs/framework/workflows-sdk"
import { removeRemoteLinkStep } from "../../common"
import { deleteReturnReasonStep } from "../steps"
import {
  deleteReturnReasonsWorkflowInputSchema,
  deleteReturnReasonsWorkflowOutputSchema,
} from "../utils/schemas"

export {
  type DeleteReturnReasonsWorkflowInput,
  type DeleteReturnReasonsWorkflowOutput,

} from "../utils/schemas"

export const deleteReturnReasonsWorkflowId = "delete-return-reasons"
/**
 * This workflow deletes one or more return reasons. It's used by the
 * [Delete Return Reasons Admin API Route](https://docs.medusajs.com/api/admin#return-reasons_deletereturnreasonsid).
 *
 * You can use this workflow within your customizations or your own custom workflows, allowing you to
 * delete return reasons within your custom flows.
 *
 * @example
 * const { result } = await deleteReturnReasonsWorkflow(container)
 * .run({
 *   input: {
 *     ids: ["rr_123"]
 *   }
 * })
 *
 * @summary
 *
 * Delete return reasons.
 */
export const deleteReturnReasonsWorkflow = createWorkflow(
  {
    name: deleteReturnReasonsWorkflowId,
    description: "Delete return reasons",
    inputSchema: deleteReturnReasonsWorkflowInputSchema,
    outputSchema: deleteReturnReasonsWorkflowOutputSchema,
  },
  (input) => {
    const deletedReturnReasons = deleteReturnReasonStep(input.ids)

    removeRemoteLinkStep({
      [Modules.ORDER]: {
        return_reason_id: input.ids,
      },
    })

    return deletedReturnReasons
  }
)
