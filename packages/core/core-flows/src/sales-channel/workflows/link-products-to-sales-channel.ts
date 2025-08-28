import { createWorkflow } from "@medusajs/framework/workflows-sdk"
import { associateProductsWithSalesChannelsStep } from "../steps/associate-products-with-channels"
import { transform } from "@medusajs/framework/workflows-sdk"
import { detachProductsFromSalesChannelsStep } from "../steps"
import {
  linkProductsToSalesChannelWorkflowInputSchema,
  linkProductsToSalesChannelWorkflowOutputSchema,
  type LinkProductsToSalesChannelWorkflowInput as SchemaInput,
} from "../utils/schemas"

// Re-export workflow types from schemas
export type LinkProductsToSalesChannelWorkflowInput = SchemaInput
export type LinkProductsToSalesChannelWorkflowOutput = void

// Type verification - CORRECT ORDER!
const schemaInput = {} as SchemaInput

// Check 1: New input can go into old input (schema accepts all valid inputs)
const existingInput: {
  id: string
  add?: string[]
  remove?: string[]
} = schemaInput

// Check 2: Old output can go into new output (schema produces compatible outputs)
const existingOutput: void = undefined as unknown as void

console.log(existingInput, existingOutput)

export const linkProductsToSalesChannelWorkflowId =
  "link-products-to-sales-channel"
/**
 * This workflow manages the products available in a sales channel. It's used by the
 * [Manage Products Admin API Route](https://docs.medusajs.com/api/admin#sales-channels_postsaleschannelsidproducts).
 * 
 * You can use this workflow within your customizations or your own custom workflows, allowing you to
 * manage the products available in a sales channel within your custom flows.
 * 
 * @example
 * const { result } = await linkProductsToSalesChannelWorkflow(container)
 * .run({
 *   input: {
 *     id: "sc_123",
 *     add: ["prod_123"],
 *     remove: ["prod_321"]
 *   }
 * })
 * 
 * @summary
 * 
 * Manage the products available in a sales channel.
 */
export const linkProductsToSalesChannelWorkflow = createWorkflow(
  {
    name: linkProductsToSalesChannelWorkflowId,
    description: "Manage the products available in a sales channel",
    inputSchema: linkProductsToSalesChannelWorkflowInputSchema,
    outputSchema: linkProductsToSalesChannelWorkflowOutputSchema,
  },
  (input) => {
    const toAdd = transform({ input }, (data) => {
      return data.input.add?.map((productId) => ({
        sales_channel_id: data.input.id,
        product_id: productId,
      }))
    })

    const toRemove = transform({ input }, (data) => {
      return data.input.remove?.map((productId) => ({
        sales_channel_id: data.input.id,
        product_id: productId,
      }))
    })

    associateProductsWithSalesChannelsStep({ links: toAdd })
    detachProductsFromSalesChannelsStep({ links: toRemove })
  }
)
