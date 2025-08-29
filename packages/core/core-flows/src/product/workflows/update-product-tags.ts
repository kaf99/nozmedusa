import { ProductTagWorkflowEvents } from "@medusajs/framework/utils"
import {
  WorkflowResponse,
  createHook,
  createWorkflow,
  transform,
} from "@medusajs/framework/workflows-sdk"
import { emitEventStep } from "../../common/steps/emit-event"
import { updateProductTagsStep } from "../steps"
import {
  updateProductTagsWorkflowInputSchema,
  updateProductTagsWorkflowOutputSchema,
} from "../utils/update-schemas"

export {
  type UpdateProductTagsWorkflowInput,
  type UpdateProductTagsWorkflowOutput,

} from "../utils/update-schemas"

export const updateProductTagsWorkflowId = "update-product-tags"
/**
 * This workflow updates one or more product tags. It's used by the
 * [Update Product Tag Admin API Route](https://docs.medusajs.com/api/admin#product-tags_postproducttagsid).
 *
 * This workflow has a hook that allows you to perform custom actions on the updated product tags. For example, you can pass under `additional_data` custom data that
 * allows you to update custom data models linked to the product tags.
 *
 * You can also use this workflow within your own custom workflows, allowing you to wrap custom logic around product-tag updates.
 *
 * @example
 * const { result } = await updateProductTagsWorkflow(container)
 * .run({
 *   input: {
 *     selector: {
 *       id: "pcol_123"
 *     },
 *     update: {
 *       value: "clothing"
 *     },
 *     additional_data: {
 *       erp_id: "123"
 *     }
 *   }
 * })
 *
 * @summary
 *
 * Update one or more product tags.
 *
 * @property hooks.productTagsUpdated - This hook is executed after the product tags are updated. You can consume this hook to perform custom actions on the updated product tags.
 */
export const updateProductTagsWorkflow = createWorkflow(
  {
    name: updateProductTagsWorkflowId,
    description: "Update one or more product tags",
    inputSchema: updateProductTagsWorkflowInputSchema,
    outputSchema: updateProductTagsWorkflowOutputSchema,
  },
  (input) => {
    const updatedProductTags = updateProductTagsStep(input)
    const productTagsUpdated = createHook("productTagsUpdated", {
      product_tags: updatedProductTags,
      additional_data: input.additional_data,
    })

    const tagIdEvents = transform(
      { updatedProductTags },
      ({ updatedProductTags }) => {
        const arr = Array.isArray(updatedProductTags)
          ? updatedProductTags
          : [updatedProductTags]

        return arr?.map((v) => {
          return { id: v.id }
        })
      }
    )

    emitEventStep({
      eventName: ProductTagWorkflowEvents.UPDATED,
      data: tagIdEvents,
    })

    return new WorkflowResponse(updatedProductTags, {
      hooks: [productTagsUpdated],
    })
  }
)
