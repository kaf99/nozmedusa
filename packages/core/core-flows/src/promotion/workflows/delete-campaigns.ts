import {
  createHook,
  createWorkflow,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk"
import { deleteCampaignsStep } from "../steps"
import {
  deleteCampaignsWorkflowInputSchema,
  deleteCampaignsWorkflowOutputSchema,
} from "../utils/schemas"

export const deleteCampaignsWorkflowId = "delete-campaigns"
/**
 * This workflow deletes one or more campaigns. It's used by the
 * [Delete Campaign Admin API Route](https://docs.medusajs.com/api/admin#campaigns_deletecampaignsid).
 *
 * You can use this workflow within your own customizations or custom workflows, allowing you to
 * delete campaigns within your custom flows.
 *
 * @example
 * const { result } = await deleteCampaignsWorkflow(container)
 * .run({
 *   input: {
 *     ids: ["camp_123"]
 *   }
 * })
 *
 * @summary
 *
 * Delete one or more campaigns.
 */
export const deleteCampaignsWorkflow = createWorkflow(
  {
    name: deleteCampaignsWorkflowId,
    description: "Delete one or more campaigns",
    inputSchema: deleteCampaignsWorkflowInputSchema,
    outputSchema: deleteCampaignsWorkflowOutputSchema,
  },
  (input) => {
    const deletedCampaigns = deleteCampaignsStep(input.ids)
    const campaignsDeleted = createHook("campaignsDeleted", {
      ids: input.ids,
    })

    return new WorkflowResponse(deletedCampaigns, {
      hooks: [campaignsDeleted],
    })
  }
)
