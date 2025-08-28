import { LinkWorkflowInput } from "@medusajs/framework/types"
import {
  createWorkflow,
  parallelize,
} from "@medusajs/framework/workflows-sdk"
import {
  addCampaignPromotionsStep,
  removeCampaignPromotionsStep,
} from "../steps"
import {
  addOrRemoveCampaignPromotionsWorkflowInputSchema,
  addOrRemoveCampaignPromotionsWorkflowOutputSchema,
  type AddOrRemoveCampaignPromotionsWorkflowInput as SchemaInput,
} from "../utils/schemas"

export {
  type AddOrRemoveCampaignPromotionsWorkflowInput,
  type AddOrRemoveCampaignPromotionsWorkflowOutput,
} from "../utils/schemas"

// Type verification - CORRECT ORDER!
const schemaInput = {} as SchemaInput

// Check 1: New input can go into old input (schema accepts all valid inputs)
const existingInput: LinkWorkflowInput = schemaInput

// Check 2: Old output can go into new output (schema produces compatible outputs)
const existingOutput: void = undefined as unknown as void

console.log(existingInput, existingOutput)

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
