import {
    OrderChangeDTO,
    OrderDTO,
    PromotionDTO,
} from "@medusajs/framework/types"
import { ChangeActionType } from "@medusajs/framework/utils"
import {
    createWorkflow,
    transform,
    WorkflowData,
} from "@medusajs/framework/workflows-sdk"
import {
    getActionsToComputeFromPromotionsStep,
    prepareAdjustmentsFromPromotionActionsStep,
} from "../../../cart"
import { previewOrderChangeStep } from "../../steps/preview-order-change"
import { createOrderChangeActionsWorkflow } from "../create-order-change-actions"

/**
 * The data to validate that new items can be added to an order edit.
 */
export type ComputeAdjustmentsForPreviewWorkflowInput = {
  /**
   * The order's details.
   */
  order: OrderDTO & { promotions: PromotionDTO[] }
  /**
   * The order change's details.
   */
  orderChange: OrderChangeDTO
}

export const computeAdjustmentsForPreviewWorkflowId =
  "compute-adjustments-for-preview"
/**
 * This workflow adds new items to an order edit. It's used by the
 * [Add Items to Order Edit Admin API Route](https://docs.medusajs.com/api/admin#order-edits_postordereditsiditems).
 *
 * You can use this workflow within your customizations or your own custom workflows, allowing you to add new items to an order edit
 * in your custom flows.
 *
 * @example
 * const { result } = await orderEditAddNewItemWorkflow(container)
 * .run({
 *   input: {
 *     order_id: "order_123",
 *     items: [
 *       {
 *         variant_id: "variant_123",
 *         quantity: 1,
 *       }
 *     ]
 *   }
 * })
 *
 * @summary
 *
 * Add new items to an order edit.
 */
export const computeAdjustmentsForPreviewWorkflow = createWorkflow(
  computeAdjustmentsForPreviewWorkflowId,
  function (input: WorkflowData<ComputeAdjustmentsForPreviewWorkflowInput>) {
    const previewedOrder = previewOrderChangeStep(input.order.id)

    const promotions = transform({ order: input.order }, ({ order }) => {
      return order.promotions.map((p) => p.code).filter((p) => p !== undefined)
    })

    const actionsToComputeItemsInput = transform(
      { previewedOrder },
      ({ previewedOrder }) => {
        return {
          currency_code: input.order.currency_code,
          items: previewedOrder.items.map((item) => ({
            ...item,
            // Buy-Get promotions rely on the product ID, so we need to manually set it before refreshing adjustments
            product: { id: item.product_id },
          })),
        }
      }
    )

    const actions = getActionsToComputeFromPromotionsStep({
      // @ts-ignore
      computeActionContext: actionsToComputeItemsInput,
      promotionCodesToApply: promotions,
    })

    const { lineItemAdjustmentsToCreate } =
      prepareAdjustmentsFromPromotionActionsStep({ actions })

    const orderChangeActionAdjustmentsInput = transform(
      {
        order: input.order,
        previewedOrder,
        orderChange: input.orderChange,
        lineItemAdjustmentsToCreate,
      },
      ({ order, previewedOrder, orderChange, lineItemAdjustmentsToCreate }) => {
        return previewedOrder.items.map((item, index) => {
          const itemAdjustments = lineItemAdjustmentsToCreate.filter(
            (adjustment) => adjustment.item_id === item.id
          )

          return {
            order_change_id: orderChange.id,
            order_id: order.id,
            version: orderChange.version,
            action: ChangeActionType.ITEM_ADJUSTMENTS_REPLACE,
            details: {
              reference_id: item.id,
              adjustments: itemAdjustments,
            },
          }
        })
      }
    )

    createOrderChangeActionsWorkflow
      .runAsStep({
        // @ts-ignore
        input: orderChangeActionAdjustmentsInput,
      })
      .config({ name: "order-change-action-adjustments-input" })
  }
)
