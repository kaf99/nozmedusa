import { createWorkflow } from "@medusajs/framework/workflows-sdk"
import { deleteFulfillmentSetsStep } from "../steps"
import { removeRemoteLinkStep } from "../../common"
import { Modules } from "@medusajs/framework/utils"
import {
  deleteFulfillmentSetsWorkflowInputSchema,
  deleteFulfillmentSetsWorkflowOutputSchema,
} from "../utils/schemas"

export type {
  DeleteFulfillmentSetsWorkflowInput,
  DeleteFulfillmentSetsWorkflowOutput,
} from "../utils/schemas"

export const deleteFulfillmentSetsWorkflowId =
  "delete-fulfillment-sets-workflow"
/**
 * This workflow deletes one or more fulfillment sets. It's used by the
 * [Delete Fulfillment Sets Admin API Route](https://docs.medusajs.com/api/admin#fulfillment-sets_deletefulfillmentsetsid).
 * 
 * You can use this workflow within your own customizations or custom workflows, allowing you to
 * delete fulfillment sets within your custom flows.
 * 
 * @example
 * const { result } = await deleteFulfillmentSetsWorkflow(container)
 * .run({
 *   input: {
 *     ids: ["fulset_123"]
 *   }
 * })
 * 
 * @summary
 * 
 * Delete one or more fulfillment sets.
 */
export const deleteFulfillmentSetsWorkflow = createWorkflow(
  {
    name: deleteFulfillmentSetsWorkflowId,
    description: "Delete one or more fulfillment sets",
    inputSchema: deleteFulfillmentSetsWorkflowInputSchema,
    outputSchema: deleteFulfillmentSetsWorkflowOutputSchema,
  },
  (input) => {
    deleteFulfillmentSetsStep(input.ids)

    removeRemoteLinkStep({
      [Modules.FULFILLMENT]: { fulfillment_set_id: input.ids },
    })
  }
)
