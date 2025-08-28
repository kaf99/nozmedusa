import {
  ProductCategoryDTO,
  ProductCategoryWorkflow,
} from "@medusajs/framework/types"
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
  type CreateProductCategoriesWorkflowInput as SchemaInput,
  type CreateProductCategoriesWorkflowOutput as SchemaOutput,
} from "../utils/schemas"

export {
  type CreateProductCategoriesWorkflowInput,
  type CreateProductCategoriesWorkflowOutput,
} from "../utils/schemas"

// Type verification - CORRECT ORDER!
const schemaInput = {} as SchemaInput
const schemaOutput = {} as SchemaOutput

// Check 1: New input can go into old input (schema accepts all valid inputs)
const existingInput: ProductCategoryWorkflow.CreateProductCategoriesWorkflowInput = schemaInput

// Check 2: Old output can go into new output (schema produces compatible outputs)
const existingOutput: SchemaOutput = {} as ProductCategoryDTO[]

console.log(existingInput, existingOutput, schemaOutput)

// Legacy types for backward compatibility  
export type { CreateProductCategoriesWorkflowInput as LegacyCreateProductCategoriesWorkflowInput } from "../utils/schemas"
export type { CreateProductCategoriesWorkflowOutput as LegacyCreateProductCategoriesWorkflowOutput } from "../utils/schemas"

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
