import { createWorkflow } from "@medusajs/framework/workflows-sdk"
import { batchLinkProductsToCategoryStep } from "../steps/batch-link-products-in-category"
import {
  linkWorkflowInputSchema,
  batchLinkWorkflowOutputSchema,
} from "../utils/batch-schemas"

export {
  type LinkWorkflowInput as BatchUpdateProductsOnCategoryWorkflowInput,
  type BatchLinkWorkflowOutput as BatchUpdateProductsOnCategoryWorkflowOutput,

} from "../utils/batch-schemas"

export const batchLinkProductsToCategoryWorkflowId =
  "batch-link-products-to-category"
/**
 * This workflow manages the links between a category and products. It's used by the
 * [Manage Products of Category Admin API Route](https://docs.medusajs.com/api/admin#product-categories_postproductcategoriesidproducts).
 *
 * You can use this workflow within your own customizations or custom workflows to manage the products in a category.
 *
 * @example
 * const { result } = await batchLinkProductsToCategoryWorkflow(container)
 * .run({
 *   input: {
 *     id: "pcat_123",
 *     add: ["prod_123"],
 *     remove: ["prod_321"]
 *   }
 * })
 *
 * @summary
 *
 * Manage the links between a collection and products.
 */
export const batchLinkProductsToCategoryWorkflow = createWorkflow(
  {
    name: batchLinkProductsToCategoryWorkflowId,
    description: "Batch link products to category",
    inputSchema: linkWorkflowInputSchema,
    outputSchema: batchLinkWorkflowOutputSchema,
  },
  (input) => {
    return batchLinkProductsToCategoryStep(input)
  }
)
