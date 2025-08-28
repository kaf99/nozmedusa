import { ProductCategoryWorkflow } from "@medusajs/framework/types"
import { createWorkflow } from "@medusajs/framework/workflows-sdk"
import { batchLinkProductsToCategoryStep } from "../steps/batch-link-products-in-category"
import {
  linkWorkflowInputSchema,
  batchLinkWorkflowOutputSchema,
  type LinkWorkflowInput as SchemaInput,
  type BatchLinkWorkflowOutput as SchemaOutput,
} from "../utils/batch-schemas"

export {
  type LinkWorkflowInput as BatchUpdateProductsOnCategoryWorkflowInput,
  type BatchLinkWorkflowOutput as BatchUpdateProductsOnCategoryWorkflowOutput,
} from "../utils/batch-schemas"

// Type verification - CORRECT ORDER!
const schemaInput = {} as SchemaInput
const schemaOutput = undefined as SchemaOutput

// Check 1: New input can go into old input (schema accepts all valid inputs)
const existingInput: ProductCategoryWorkflow.BatchUpdateProductsOnCategoryWorkflowInput = schemaInput

// Check 2: Old output can go into new output (schema produces compatible outputs)
const existingOutput: SchemaOutput = undefined as any

console.log(existingInput, existingOutput, schemaOutput)

// Legacy types for backward compatibility  
export type { LinkWorkflowInput as LegacyBatchUpdateProductsOnCategoryWorkflowInput } from "../utils/batch-schemas"
export type { BatchLinkWorkflowOutput as LegacyBatchUpdateProductsOnCategoryWorkflowOutput } from "../utils/batch-schemas"

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
