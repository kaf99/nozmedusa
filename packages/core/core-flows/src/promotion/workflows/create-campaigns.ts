import {
  WorkflowResponse,
  createHook,
  createWorkflow,
} from "@medusajs/framework/workflows-sdk"
import { createCampaignsStep } from "../steps"
import {
  createCampaignsWorkflowInputSchema,
  createCampaignsWorkflowOutputSchema,
} from "../utils/schemas"

export {
  type CreateCampaignsWorkflowInput,
  type CreateCampaignsWorkflowOutput,

} from "../utils/schemas"

export const createCampaignsWorkflowId = "create-campaigns"
/**
 * This workflow creates one or more campaigns. It's used by the [Create Campaign Admin API Route](https://docs.medusajs.com/api/admin#campaigns_postcampaigns).
 *
 * This workflow has a hook that allows you to perform custom actions on the created campaigns. For example, you can pass under `additional_data` custom data that
 * allows you to create custom data models linked to the campaigns.
 *
 * You can also use this workflow within your customizations or your own custom workflows, allowing you to wrap custom logic around creating campaigns.
 *
 * @example
 * const { result } = await createCampaignsWorkflow(container)
 * .run({
 *   input: {
 *     campaignsData: [
 *       {
 *         name: "Launch Promotions",
 *         campaign_identifier: "GA-123456",
 *         starts_at: new Date("2025-01-01"),
 *         ends_at: new Date("2026-01-01"),
 *         budget: {
 *           type: "usage",
 *           limit: 100,
 *         }
 *       }
 *     ],
 *     additional_data: {
 *       target_audience: "new_customers"
 *     }
 *   }
 * })
 *
 * @summary
 *
 * Create one or more campaigns.
 *
 * @property hooks.campaignsCreated - This hook is executed after the campaigns are created. You can consume this hook to perform custom actions on the created campaigns.
 */
export const createCampaignsWorkflow = createWorkflow(
  {
    name: createCampaignsWorkflowId,
    description: "Create one or more campaigns",
    inputSchema: createCampaignsWorkflowInputSchema,
    outputSchema: createCampaignsWorkflowOutputSchema,
  },
  (input) => {
    const createdCampaigns = createCampaignsStep(input.campaignsData)
    const campaignsCreated = createHook("campaignsCreated", {
      campaigns: createdCampaigns,
      additional_data: input.additional_data,
    })

    return new WorkflowResponse(createdCampaigns, {
      hooks: [campaignsCreated],
    })
  }
)
