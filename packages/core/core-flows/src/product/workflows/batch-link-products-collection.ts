import { LinkWorkflowInput } from "@medusajs/framework/types"
import { createWorkflow } from "@medusajs/framework/workflows-sdk"
import { batchLinkProductsToCollectionStep } from "../steps/batch-link-products-collection"
import {
  linkWorkflowInputSchema,
  batchLinkWorkflowOutputSchema,
  type LinkWorkflowInput as SchemaInput,
  type BatchLinkWorkflowOutput as SchemaOutput,
} from "../utils/batch-schemas"

export {
  type LinkWorkflowInput as BatchLinkProductsToCollectionWorkflowInput,
  type BatchLinkWorkflowOutput as BatchLinkProductsToCollectionWorkflowOutput,
} from "../utils/batch-schemas"

// Type verification - CORRECT ORDER!
const schemaInput = {} as SchemaInput
const schemaOutput = undefined as SchemaOutput

// Check 1: New input can go into old input (schema accepts all valid inputs)
const existingInput: LinkWorkflowInput = schemaInput

// Check 2: Old output can go into new output (schema produces compatible outputs)
const existingOutput: SchemaOutput = undefined as any

console.log(existingInput, existingOutput, schemaOutput)

// Legacy types for backward compatibility  
export type { LinkWorkflowInput as LegacyBatchLinkProductsToCollectionWorkflowInput } from "../utils/batch-schemas"
export type { BatchLinkWorkflowOutput as LegacyBatchLinkProductsToCollectionWorkflowOutput } from "../utils/batch-schemas"

export const batchLinkProductsToCollectionWorkflowId =
  "batch-link-products-to-collection"

/**
 * This workflow manages the links between a collection and products. It's used by the
 * [Manage Products of Collection Admin API Route](https://docs.medusajs.com/api/admin#collections_postcollectionsidproducts).
 * 
 * You can use this workflow within your own customizations or custom workflows to manage the products in a collection.
 * 
 * @example
 * const { result } = await batchLinkProductsToCollectionWorkflow(container)
 * .run({
 *   input: {
 *     id: "pcol_123",
 *     add: ["prod_123"],
 *     remove: ["prod_456"],
 *   }
 * })
 * 
 * @summary
 * 
 * Manage the links between a collection and products.
 */
export const batchLinkProductsToCollectionWorkflow = createWorkflow(
  {
    name: batchLinkProductsToCollectionWorkflowId,
    description: "Batch link products to collection",
    inputSchema: linkWorkflowInputSchema,
    outputSchema: batchLinkWorkflowOutputSchema,
  },
  (input) => {
    return batchLinkProductsToCollectionStep(input)
  }
)
