import {
  Modules,
  ProductVariantWorkflowEvents,
} from "@medusajs/framework/utils"
import {
  WorkflowResponse,
  createHook,
  createWorkflow,
  transform,
} from "@medusajs/framework/workflows-sdk"
import {
  emitEventStep,
  removeRemoteLinkStep,
  useQueryGraphStep,
} from "../../common"
import { deleteProductVariantsStep } from "../steps"
import { deleteInventoryItemWorkflow } from "../../inventory"
import {
  deleteProductVariantsWorkflowInputSchema,
  deleteProductVariantsWorkflowOutputSchema,
} from "../utils/schemas"


export const deleteProductVariantsWorkflowId = "delete-product-variants"
/**
 * This workflow deletes one or more product variants. It's used by the
 * [Delete Product Variants Admin API Route](https://docs.medusajs.com/api/admin#products_deleteproductsidvariantsvariant_id).
 *
 * This workflow has a hook that allows you to perform custom actions after the product variants are deleted. For example,
 * you can delete custom records linked to the product variants.
 *
 * You can also use this workflow within your own custom workflows, allowing you to wrap custom logic around product-variant deletion.
 *
 * @example
 * const { result } = await deleteProductVariantsWorkflow(container)
 * .run({
 *   input: {
 *     ids: ["variant_123"],
 *   }
 * })
 *
 * @summary
 *
 * Delete one or more product variants.
 *
 * @property hooks.productVariantsDeleted - This hook is executed after the variants are deleted. You can consume this hook to perform custom actions on the deleted variants.
 */
export const deleteProductVariantsWorkflow = createWorkflow(
  {
    name: deleteProductVariantsWorkflowId,
    description: "Delete one or more product variants",
    inputSchema: deleteProductVariantsWorkflowInputSchema,
    outputSchema: deleteProductVariantsWorkflowOutputSchema,
  },
  (input) => {
    const variantsWithInventoryStepResponse = useQueryGraphStep({
      entity: "variants",
      fields: [
        "id",
        "manage_inventory",
        "inventory.id",
        "inventory.variants.id",
      ],
      filters: {
        id: input.ids,
      },
    })

    removeRemoteLinkStep({
      [Modules.PRODUCT]: { variant_id: input.ids },
    }).config({ name: "remove-variant-link-step" })

    const toDeleteInventoryItemIds = transform(
      { variants: variantsWithInventoryStepResponse.data },
      (data) => {
        const variants = data.variants || []

        const variantsMap = new Map(variants.map((v) => [v.id, true]))
        const toDeleteIds: Set<string> = new Set()

        variants.forEach((variant) => {
          if (!variant.manage_inventory) {
            return
          }

          for (const inventoryItem of variant.inventory) {
            if (inventoryItem.variants.every((v) => variantsMap.has(v.id))) {
              toDeleteIds.add(inventoryItem.id)
            }
          }
        })

        return Array.from(toDeleteIds)
      }
    )

    deleteInventoryItemWorkflow.runAsStep({
      input: {
        ids: toDeleteInventoryItemIds,
      },
    })

    const deletedProductVariants = deleteProductVariantsStep(input.ids)

    const variantIdEvents = transform({ input }, ({ input }) => {
      return input.ids?.map((id) => {
        return { id }
      })
    })

    emitEventStep({
      eventName: ProductVariantWorkflowEvents.DELETED,
      data: variantIdEvents,
    })

    const productVariantsDeleted = createHook("productVariantsDeleted", {
      ids: input.ids,
    })

    return new WorkflowResponse(deletedProductVariants, {
      hooks: [productVariantsDeleted],
    })
  }
)
