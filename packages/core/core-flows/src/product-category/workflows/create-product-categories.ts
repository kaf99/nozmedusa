import { ProductCategoryWorkflowEvents } from "@medusajs/framework/utils"
import {
  createHook,
  createWorkflow,
  transform,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk"
import { emitEventStep } from "../../common"
import { createProductCategoriesStep } from "../steps"
import {
  createProductCategoriesWorkflowInputSchema,
  createProductCategoriesWorkflowOutputSchema,
} from "../utils/schemas"

export {
  type CreateProductCategoriesWorkflowInput,
  type CreateProductCategoriesWorkflowOutput,

} from "../utils/schemas"

export const createProductCategoriesWorkflowId = "create-product-categories"
/**
 * This workflow creates one or more product categories. It's used by the
 * [Create Product Category Admin API Route](https://docs.medusajs.com/api/admin#product-categories_postproductcategories).
 *
 * You can use this workflow within your customizations or your own custom workflows, allowing you to
 * create product categories within your custom flows.
 *
 * @example
 * const { result } = await createProductCategoriesWorkflow(container)
 * .run({
 *   input: {
 *     product_categories: [
 *       {
 *         name: "Shoes",
 *       }
 *     ]
 *   }
 * })
 *
 * @summary
 *
 * Create product categories.
 */
export const createProductCategoriesWorkflow = createWorkflow(
  {
    name: createProductCategoriesWorkflowId,
    description: "Create product categories",
    inputSchema: createProductCategoriesWorkflowInputSchema,
    outputSchema: createProductCategoriesWorkflowOutputSchema,
  },
  (input) => {
    const createdCategories = createProductCategoriesStep(input)

    const productCategoryIdEvents = transform(
      { createdCategories },
      ({ createdCategories }) => {
        return createdCategories.map((v) => {
          return { id: v.id }
        })
      }
    )

    emitEventStep({
      eventName: ProductCategoryWorkflowEvents.CREATED,
      data: productCategoryIdEvents,
    })

    const categoriesCreated = createHook("categoriesCreated", {
      categories: createdCategories,
      additional_data: input.additional_data,
    })

    return new WorkflowResponse(createdCategories, {
      hooks: [categoriesCreated],
    })
  }
)
