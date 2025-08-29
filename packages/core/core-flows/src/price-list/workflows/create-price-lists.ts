import {
  WorkflowResponse,
  createWorkflow,
} from "@medusajs/framework/workflows-sdk"
import { createPriceListsStep, validateVariantPriceLinksStep } from "../steps"
import {
  createPriceListsWorkflowInputSchema,
  createPriceListsWorkflowOutputSchema,
} from "../utils/schemas"

export {
  type CreatePriceListsWorkflowInput,
  type CreatePriceListsWorkflowOutput,

} from "../utils/schemas"

export const createPriceListsWorkflowId = "create-price-lists"
/**
 * This workflow creates one or more price lists. It's used by the
 * [Create Price List Admin API Route](https://docs.medusajs.com/api/admin#price-lists_postpricelists).
 *
 * You can use this workflow within your customizations or your own custom workflows, allowing you to
 * create price lists in your custom flows.
 *
 * @example
 * const { result } = await createPriceListsWorkflow(container)
 * .run({
 *   input: {
 *     price_lists_data: [
 *       {
 *         title: "Price List 1",
 *         description: "Price List 1 Description",
 *       }
 *     ]
 *   }
 * })
 *
 * @summary
 *
 * Create one or more price lists.
 */
export const createPriceListsWorkflow = createWorkflow(
  {
    name: createPriceListsWorkflowId,
    description: "Create one or more price lists",
    inputSchema: createPriceListsWorkflowInputSchema,
    outputSchema: createPriceListsWorkflowOutputSchema,
  },
  (input) => {
    const variantPriceMap = validateVariantPriceLinksStep(
      input.price_lists_data
    )

    return new WorkflowResponse(
      createPriceListsStep({
        data: input.price_lists_data,
        variant_price_map: variantPriceMap,
      })
    )
  }
)
