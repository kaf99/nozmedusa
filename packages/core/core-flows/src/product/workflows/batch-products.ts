import {
  BatchWorkflowInput,
  BatchWorkflowOutput,
  CreateProductWorkflowInputDTO,
  ProductTypes,
  UpdateProductWorkflowInputDTO,
} from "@medusajs/framework/types"
import {
  WorkflowResponse,
  createWorkflow,
  parallelize,
  transform,
  when,
} from "@medusajs/framework/workflows-sdk"
import { createProductsWorkflow } from "./create-products"
import { deleteProductsWorkflow } from "./delete-products"
import { updateProductsWorkflow } from "./update-products"
import {
  batchProductWorkflowInputSchema,
  batchProductsWorkflowOutputSchema,
  type BatchProductWorkflowInput as SchemaInput,
  type BatchProductsWorkflowOutput as SchemaOutput,
} from "../utils/schemas"

/**
 * The products to manage.
 */
interface OldBatchProductWorkflowInput
  extends BatchWorkflowInput<
    CreateProductWorkflowInputDTO,
    UpdateProductWorkflowInputDTO
  > {}

type OldBatchProductsWorkflowOutput =
  BatchWorkflowOutput<ProductTypes.ProductDTO>

export {
  type BatchProductWorkflowInput,
  type BatchProductsWorkflowOutput,
} from "../utils/schemas"

// Type verification
const _in: SchemaInput = {} as OldBatchProductWorkflowInput
const _out: SchemaOutput = {} as OldBatchProductsWorkflowOutput
void _in, _out

const conditionallyCreateProducts = (input: SchemaInput) =>
  when({ input }, ({ input }) => !!input.create?.length).then(() =>
    createProductsWorkflow.runAsStep({ input: { products: input.create! } })
  )

const conditionallyUpdateProducts = (input: SchemaInput) =>
  when({ input }, ({ input }) => !!input.update?.length).then(() =>
    updateProductsWorkflow.runAsStep({ input: { products: input.update! } })
  )

const conditionallyDeleteProducts = (input: SchemaInput) =>
  when({ input }, ({ input }) => !!input.delete?.length).then(() =>
    deleteProductsWorkflow.runAsStep({ input: { ids: input.delete! } })
  )

export const batchProductsWorkflowId = "batch-products"
/**
 * This workflow creates, updates, or deletes products. It's used by the
 * [Manage Products Admin API Route](https://docs.medusajs.com/api/admin#products_postproductsbatch).
 *
 * You can use this workflow within your own customizations or custom workflows to manage products in bulk. This is
 * also useful when writing a [seed script](https://docs.medusajs.com/learn/fundamentals/custom-cli-scripts/seed-data) or a custom import script.
 *
 * @example
 * const { result } = await batchProductsWorkflow(container)
 * .run({
 *   input: {
 *     create: [
 *       {
 *         title: "Shirt",
 *         options: [
 *           {
 *             title: "Color",
 *             values: ["Red", "Brown"]
 *           }
 *         ],
 *         variants: [
 *           {
 *             title: "Red Shirt",
 *             options: {
 *               "Color": "Red"
 *             },
 *             prices: [
 *               {
 *                 amount: 10,
 *                 currency_code: "usd"
 *               }
 *             ]
 *           }
 *         ]
 *       }
 *     ],
 *     update: [
 *       {
 *         id: "prod_123",
 *         title: "Pants"
 *       }
 *     ],
 *     delete: ["prod_321"]
 *   }
 * })
 *
 * @summary
 *
 * Manage products in bulk.
 */
export const batchProductsWorkflow = createWorkflow(
  {
    name: batchProductsWorkflowId,
    description: "Create, update, and delete products in bulk",
    inputSchema: batchProductWorkflowInputSchema,
    outputSchema: batchProductsWorkflowOutputSchema,
  },
  (input) => {
    const res = parallelize(
      conditionallyCreateProducts(input),
      conditionallyUpdateProducts(input),
      conditionallyDeleteProducts(input)
    )

    return new WorkflowResponse(
      transform({ res, input }, (data) => {
        return {
          created: data.res[0] ?? [],
          updated: data.res[1] ?? [],
          deleted: data.input.delete ?? [],
        }
      })
    )
  }
)
