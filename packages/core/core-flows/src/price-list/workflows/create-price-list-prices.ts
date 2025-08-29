import {
  WorkflowResponse,
  createWorkflow,
  parallelize,
} from "@medusajs/framework/workflows-sdk"
import { createPriceListPricesStep } from "../steps/create-price-list-prices"
import { validatePriceListsStep } from "../steps/validate-price-lists"
import { validateVariantPriceLinksStep } from "../steps/validate-variant-price-links"
import {
  createPriceListPricesWorkflowInputSchema,
  createPriceListPricesWorkflowOutputSchema,
} from "../utils/schemas"

export {
  type CreatePriceListPricesWorkflowInput,
  type CreatePriceListPricesWorkflowOutput,

} from "../utils/schemas"

export const createPriceListPricesWorkflowId = "create-price-list-prices"
/**
 * This workflow creates prices in price lists. It's used by other workflows, such as
 * {@link batchPriceListPricesWorkflow}.
 *
 * You can use this workflow within your customizations or your own custom workflows, allowing you to
 * create prices in price lists in your custom flows.
 *
 * @example
 * const { result } = await createPriceListPricesWorkflow(container)
 * .run({
 *   input: {
 *     data: [{
 *       id: "plist_123",
 *       prices: [
 *         {
 *           amount: 10,
 *           currency_code: "usd",
 *           variant_id: "variant_123"
 *         }
 *       ],
 *     }]
 *   }
 * })
 *
 * @summary
 *
 * Create prices in price lists.
 */
export const createPriceListPricesWorkflow = createWorkflow(
  {
    name: createPriceListPricesWorkflowId,
    description: "Create prices in price lists",
    inputSchema: createPriceListPricesWorkflowInputSchema,
    outputSchema: createPriceListPricesWorkflowOutputSchema,
  },
  (input) => {
    const [_, variantPriceMap] = parallelize(
      validatePriceListsStep(input.data),
      validateVariantPriceLinksStep(input.data)
    )

    return new WorkflowResponse(
      createPriceListPricesStep({
        data: input.data,
        variant_price_map: variantPriceMap,
      })
    )
  }
)
