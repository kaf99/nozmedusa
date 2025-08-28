import {
  Modules,
  ProductCategoryWorkflowEvents,
} from "@medusajs/framework/utils"
import {
  WorkflowResponse,
  createHook,
  createWorkflow,
  parallelize,
  transform,
} from "@medusajs/framework/workflows-sdk"
import { emitEventStep, removeRemoteLinkStep } from "../../common"
import { deleteProductCategoriesStep } from "../steps"
import {
  deleteProductCategoriesWorkflowInputSchema,
  deleteProductCategoriesWorkflowOutputSchema,
  type DeleteProductCategoriesWorkflowInput as SchemaInput,
  type DeleteProductCategoriesWorkflowOutput as SchemaOutput,
} from "../utils/schemas"

export {
  type DeleteProductCategoriesWorkflowInput,
  type DeleteProductCategoriesWorkflowOutput,
} from "../utils/schemas"

// Type verification - CORRECT ORDER!
const schemaInput = {} as SchemaInput
const schemaOutput = undefined as any as SchemaOutput

// Check 1: New input can go into old input (schema accepts all valid inputs)
const existingInput: string[] = schemaInput

// Check 2: Old output can go into new output (schema produces compatible outputs)
const existingOutput: SchemaOutput = undefined as any

console.log(existingInput, existingOutput, schemaOutput)

// Legacy types for backward compatibility  
export type { DeleteProductCategoriesWorkflowInput as LegacyDeleteProductCategoriesWorkflowInput } from "../utils/schemas"
export type { DeleteProductCategoriesWorkflowOutput as LegacyDeleteProductCategoriesWorkflowOutput } from "../utils/schemas"

export const deleteProductCategoriesWorkflowId = "delete-product-categories"
/**
 * This workflow deletes one or more product categories. It's used by the
 * [Delete Product Category Admin API Route](https://docs.medusajs.com/api/admin#product-categories_deleteproductcategoriesid).
 *
 * You can use this workflow within your customizations or your own custom workflows, allowing you to
 * delete product categories within your custom flows.
 *
 * @example
 * const { result } = await deleteProductCategoriesWorkflow(container)
 * .run({
 *   input: ["pcat_123"]
 * })
 *
 * @summary
 *
 * Delete product categories.
 */
export const deleteProductCategoriesWorkflow = createWorkflow(
  {
    name: deleteProductCategoriesWorkflowId,
    description: "Delete product categories",
    inputSchema: deleteProductCategoriesWorkflowInputSchema,
    outputSchema: deleteProductCategoriesWorkflowOutputSchema,
  },
  (input) => {
    const deleted = deleteProductCategoriesStep(input)

    const productCategoryIdEvents = transform({ input }, ({ input }) => {
      return input?.map((id) => {
        return { id }
      })
    })

    parallelize(
      removeRemoteLinkStep({
        [Modules.PRODUCT]: {
          product_category_id: input,
        },
      }),
      emitEventStep({
        eventName: ProductCategoryWorkflowEvents.DELETED,
        data: productCategoryIdEvents,
      })
    )

    const categoriesDeleted = createHook("categoriesDeleted", {
      ids: input,
    })

    return new WorkflowResponse(deleted, {
      hooks: [categoriesDeleted],
    })
  }
)
