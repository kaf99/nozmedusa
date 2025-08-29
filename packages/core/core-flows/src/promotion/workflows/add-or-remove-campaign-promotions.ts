import { createWorkflow, parallelize } from "@medusajs/framework/workflows-sdk"
import {
  addCampaignPromotionsStep,
  removeCampaignPromotionsStep,
} from "../steps"
import {
  addOrRemoveCampaignPromotionsWorkflowInputSchema,
  addOrRemoveCampaignPromotionsWorkflowOutputSchema,
} from "../utils/schemas"

export {
  type AddOrRemoveCampaignPromotionsWorkflowInput,
  type AddOrRemoveCampaignPromotionsWorkflowOutput,

} from "../utils/schemas"

export const addOrRemoveCampaignPromotionsWorkflowId =
  "add-or-remove-campaign-promotions"
/**
 * This workflow manages the promotions of a campaign. It's used by the
 * [Manage Promotions Admin API Route](https://docs.medusajs.com/api/admin#campaigns_postcampaignsidpromotions).
 *
 * You can use this workflow within your own customizations or custom workflows, allowing you to
 * manage the promotions of a campaign within your custom flows.
 *
 * @example
 * const { result } = await addOrRemoveCampaignPromotionsWorkflow(container)
 * .run({
 *   input: {
 *     id: "camp_123",
 *     add: ["promo_123"],
 *     remove: ["promo_321"]
 *   }
 * })
 *
 * @summary
 *
 * Manage the promotions of a campaign.
 */
export const addOrRemoveCampaignPromotionsWorkflow = createWorkflow(
  {
    name: addOrRemoveCampaignPromotionsWorkflowId,
    description: "Manage the promotions of a campaign",
    inputSchema: addOrRemoveCampaignPromotionsWorkflowInputSchema,
    outputSchema: addOrRemoveCampaignPromotionsWorkflowOutputSchema,
  },
  (input) => {
    parallelize(
      addCampaignPromotionsStep(input),
      removeCampaignPromotionsStep(input)
    )
  }
)
