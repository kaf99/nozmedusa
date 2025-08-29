import { ProductCategoryWorkflowEvents } from "@medusajs/framework/utils"
import {
  WorkflowResponse,
  createWorkflow,
  transform,
  createHook,
} from "@medusajs/framework/workflows-sdk"
import { emitEventStep } from "../../common"
import { updateProductCategoriesStep } from "../steps"
import {
  updateProductCategoriesWorkflowInputSchema,
  updateProductCategoriesWorkflowOutputSchema,
} from "../utils/schemas"

export {
  type UpdateProductCategoriesWorkflowInput,
  type UpdateProductCategoriesWorkflowOutput,

} from "../utils/schemas"

export const updateProductCategoriesWorkflowId = "update-product-categories"
/**
 * This workflow updates product categories matching specified filters. It's used by the
 * [Update Product Category Admin API Route](https://docs.medusajs.com/api/admin#product-categories_postproductcategoriesid).
 *
 * You can use this workflow within your customizations or your own custom workflows, allowing you to
 * update product categories within your custom flows.
 *
 * @example
 * const { result } = await updateProductCategoriesWorkflow(container)
 * .run({
 *   input: {
 *     selector: {
 *       id: "pcat_123",
 *     },
 *     update: {
 *       name: "Shoes",
 *     }
 *   }
 * })
 *
 * @summary
 *
 * Update product categories.
 */
export const updateProductCategoriesWorkflow = createWorkflow(
  {
    name: updateProductCategoriesWorkflowId,
    description: "Update product categories",
    inputSchema: updateProductCategoriesWorkflowInputSchema,
    outputSchema: updateProductCategoriesWorkflowOutputSchema,
  },
  (input) => {
    const updatedCategories = updateProductCategoriesStep(input)

    const productCategoryIdEvents = transform(
      { updatedCategories },
      ({ updatedCategories }) => {
        const arr = Array.isArray(updatedCategories)
          ? updatedCategories
          : [updatedCategories]

        return arr?.map((v) => {
          return { id: v.id }
        })
      }
    )

    emitEventStep({
      eventName: ProductCategoryWorkflowEvents.UPDATED,
      data: productCategoryIdEvents,
    })

    const categoriesUpdated = createHook("categoriesUpdated", {
      categories: updatedCategories,
      additional_data: input.additional_data,
    })

    return new WorkflowResponse(updatedCategories, {
      hooks: [categoriesUpdated],
    })
  }
)
