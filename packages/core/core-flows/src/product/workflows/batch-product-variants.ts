import {
  WorkflowResponse,
  createWorkflow,
  parallelize,
  transform,
} from "@medusajs/framework/workflows-sdk"
import {
  BatchWorkflowInput,
  BatchWorkflowOutput,
  ProductTypes,
  UpdateProductVariantWorkflowInputDTO,
  CreateProductVariantWorkflowInputDTO,
} from "@medusajs/framework/types"
import { createProductVariantsWorkflow } from "./create-product-variants"
import { updateProductVariantsWorkflow } from "./update-product-variants"
import { deleteProductVariantsWorkflow } from "./delete-product-variants"
import {
  batchProductVariantsWorkflowInputSchema,
  batchProductVariantsWorkflowOutputSchema,
  type BatchProductVariantsWorkflowInput as SchemaInput,
  type BatchProductVariantsWorkflowOutput as SchemaOutput,
} from "../utils/batch-schemas"

// Type verification - CORRECT ORDER!
const schemaInput = {} as SchemaInput
const schemaOutput = { created: [], updated: [], deleted: [] } as SchemaOutput

// Check 1: New input can go into old input (schema accepts all valid inputs)
const existingInput: BatchWorkflowInput<
  CreateProductVariantWorkflowInputDTO,
  UpdateProductVariantWorkflowInputDTO
> = schemaInput

// Check 2: Old output can go into new output (schema produces compatible outputs)
const existingOutput: SchemaOutput = {
  created: [] as ProductTypes.ProductVariantDTO[],
  updated: [] as ProductTypes.ProductVariantDTO[],
  deleted: [],
} as BatchWorkflowOutput<ProductTypes.ProductVariantDTO>

console.log(existingInput, existingOutput, schemaOutput)

/**
 * The product variants to manage.
 */
export interface BatchProductVariantsWorkflowInput extends SchemaInput {}

/**
 * The result of managing the product variants.
 */
export interface BatchProductVariantsWorkflowOutput extends SchemaOutput {}

export const batchProductVariantsWorkflowId = "batch-product-variants"
/**
 * This workflow creates, updates, and deletes product variants. It's used by the 
 * [Manage Variants in a Product Admin API Route](https://docs.medusajs.com/api/admin#products_postproductsidvariantsbatch).
 * 
 * You can use this workflow within your own customizations or custom workflows to manage the variants of a product. You can also
 * use this within a [seed script](https://docs.medusajs.com/learn/fundamentals/custom-cli-scripts/seed-data) or in a custom import script.
 * 
 * @example
 * const { result } = await batchProductVariantsWorkflow(container)
 * .run({
 *   input: {
 *     create: [
 *       {
 *         title: "Small Shirt",
 *         product_id: "prod_123",
 *         options: {
 *           Size: "S"
 *         },
 *         prices: [
 *           {
 *             amount: 10,
 *             currency_code: "usd"
 *           }
 *         ]
 *       }
 *     ],
 *     update: [
 *       {
 *         id: "variant_123",
 *         title: "Red Pants"
 *       }
 *     ],
 *     delete: ["variant_321"]
 *   }
 * })
 * 
 * @summary
 * 
 * Create, update, and delete product variants.
 */
export const batchProductVariantsWorkflow = createWorkflow(
  {
    name: batchProductVariantsWorkflowId,
    description: "Batch product variants",
    inputSchema: batchProductVariantsWorkflowInputSchema,
    outputSchema: batchProductVariantsWorkflowOutputSchema,
  },
  (
    input
  ): WorkflowResponse<BatchProductVariantsWorkflowOutput> => {
    const normalizedInput = transform({ input }, (data) => {
      return {
        create: data.input.create ?? [],
        update: data.input.update ?? [],
        delete: data.input.delete ?? [],
      }
    })

    const res = parallelize(
      createProductVariantsWorkflow.runAsStep({
        input: { product_variants: normalizedInput.create },
      }),
      updateProductVariantsWorkflow.runAsStep({
        input: { product_variants: normalizedInput.update },
      }),
      deleteProductVariantsWorkflow.runAsStep({
        input: { ids: normalizedInput.delete },
      })
    )

    const response = transform({ res, input }, (data) => {
      return {
        created: data.res[0],
        updated: data.res[1],
        deleted: data.input.delete ?? [],
      }
    })

    return new WorkflowResponse(response)
  }
)
