import { createWorkflow } from "@medusajs/framework/workflows-sdk"
import {
  linkSalesChannelsToApiKeyStep,
  validateSalesChannelsExistStep,
} from "../steps"
import {
  linkSalesChannelsToApiKeyWorkflowInputSchema,
  linkSalesChannelsToApiKeyWorkflowOutputSchema,
} from "../utils/schemas"

// Re-export types from schemas for backward compatibility
export type { LinkSalesChannelsToApiKeyWorkflowInput, LinkSalesChannelsToApiKeyWorkflowOutput } from "../utils/schemas"

export const linkSalesChannelsToApiKeyWorkflowId =
  "link-sales-channels-to-api-key"
/**
 * This workflow manages the sales channels of a publishable API key. It's used by the
 * [Manage Sales Channels API Route](https://docs.medusajs.com/api/admin#api-keys_postapikeysidsaleschannels).
 * 
 * You can use this workflow within your customizations or your own custom workflows, allowing you to
 * manage the sales channels of a publishable API key within your custom flows.
 * 
 * @example
 * const { result } = await linkSalesChannelsToApiKeyWorkflow(container)
 * .run({
 *   input: {
 *     id: "apk_132",
 *     add: ["sc_123"],
 *     remove: ["sc_321"]
 *   }
 * })
 * 
 * @summary
 * Manage the sales channels of a publishable API key.
 */
export const linkSalesChannelsToApiKeyWorkflow = createWorkflow(
  {
    name: linkSalesChannelsToApiKeyWorkflowId,
    inputSchema: linkSalesChannelsToApiKeyWorkflowInputSchema,
    outputSchema: linkSalesChannelsToApiKeyWorkflowOutputSchema,
  },
  (input) => {
    validateSalesChannelsExistStep({
      sales_channel_ids: input.add ?? [],
    })

    linkSalesChannelsToApiKeyStep(input)
  }
)
