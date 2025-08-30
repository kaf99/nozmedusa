import {
  ChangeActionType,
  OrderChangeStatus,
  PromotionActions,
} from "@medusajs/framework/utils"
import {
  createWorkflow,
  parallelize,
  transform,
  when,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk"
import { OrderChangeDTO, OrderDTO } from "@medusajs/framework/types"
import { useRemoteQueryStep } from "../../common"
import { deleteOrderChangesStep, deleteOrderShippingMethods, previewOrderChangeStep } from "../../order"
import { restoreDraftOrderShippingMethodsStep } from "../steps/restore-draft-order-shipping-methods"
import { validateDraftOrderChangeStep } from "../steps/validate-draft-order-change"
import { draftOrderFieldsForRefreshSteps } from "../utils/fields"
import { refreshDraftOrderAdjustmentsWorkflow } from "./refresh-draft-order-adjustments"
import {
  cancelDraftOrderEditWorkflowInputSchema,
  cancelDraftOrderEditWorkflowOutputSchema,
} from "../utils/schemas"

/**
 * The details of the draft order edit to cancel.
 */
export interface CancelDraftOrderEditWorkflowInput {
  /**
   * The ID of the draft order whose edit to cancel.
   */
  order_id: string
}


export const cancelDraftOrderEditWorkflowId = "cancel-draft-order-edit"

/**
 * This workflow cancels a draft order edit. It's used by the
 * [Cancel Draft Order Edit Admin API Route](https://docs.medusajs.com/api/admin#draft-orders_deletedraftordersidedit).
 *
 * You can use this workflow within your customizations or your own custom workflows, allowing you to wrap custom logic around
 * cancelling a draft order edit.
 *
 * @example
 * const { result } = await cancelDraftOrderEditWorkflow(container)
 * .run({
 *   input: {
 *     order_id: "order_123",
 *   }
 * })
 *
 * @summary
 *
 * Cancel a draft order edit.
 */
export const cancelDraftOrderEditWorkflow = createWorkflow(
  {
    name: cancelDraftOrderEditWorkflowId,
    description: "Cancel a draft order edit.",
    inputSchema: cancelDraftOrderEditWorkflowInputSchema,
    outputSchema: cancelDraftOrderEditWorkflowOutputSchema,
  },
  function (input) {
    const order: OrderDTO & {
      promotions: {
        code: string
      }[]
    } = useRemoteQueryStep({
      entry_point: "orders",
      fields: ["version", ...draftOrderFieldsForRefreshSteps],
      variables: { id: input.order_id },
      list: false,
      throw_if_key_not_found: true,
    }).config({ name: "order-query" })

    const orderChange: OrderChangeDTO = useRemoteQueryStep({
      entry_point: "order_change",
      fields: ["id", "status", "version", "actions.*"],
      variables: {
        filters: {
          order_id: input.order_id,
          status: [OrderChangeStatus.PENDING, OrderChangeStatus.REQUESTED],
        },
      },
      list: false,
    }).config({ name: "order-change-query" })

    validateDraftOrderChangeStep({ order, orderChange })

    const shippingToRemove = transform(
      { orderChange, input },
      ({ orderChange }) => {
        return (orderChange.actions ?? [])
          .filter((a) => a.action === ChangeActionType.SHIPPING_ADD)
          .map(({ reference_id }) => reference_id)
      }
    )

    const shippingToRestore = transform(
      { orderChange, input },
      ({ orderChange }) => {
        return (orderChange.actions ?? [])
          .filter((a) => a.action === ChangeActionType.SHIPPING_UPDATE)
          .map(({ reference_id, details }) => ({
            id: reference_id,
            before: {
              shipping_option_id: details?.old_shipping_option_id,
              amount: details?.old_amount,
            },
            after: {
              shipping_option_id: details?.new_shipping_option_id,
              amount: details?.new_amount,
            },
          }))
      }
    )

    const promotionsToRemove = transform(
      { orderChange, input },
      ({ orderChange }) => {
        return (orderChange.actions ?? [])
          .filter((a) => a.action === ChangeActionType.PROMOTION_ADD)
          .map(({ details }) => details?.added_code)
          .filter(Boolean) as string[]
      }
    )

    const promotionsToRestore = transform(
      { orderChange, input },
      ({ orderChange }) => {
        return (orderChange.actions ?? [])
          .filter((a) => a.action === ChangeActionType.PROMOTION_REMOVE)
          .map(({ details }) => details?.removed_code)
          .filter(Boolean) as string[]
      }
    )

    const promotionsToRefresh = transform(
      { order, promotionsToRemove, promotionsToRestore },
      ({ order, promotionsToRemove, promotionsToRestore }) => {
        const orderPromotions = order.promotions
        const codes: Set<string> = new Set()

        orderPromotions?.forEach((promo) => {
          codes.add(promo.code)
        })

        for (const code of promotionsToRemove) {
          codes.delete(code)
        }

        for (const code of promotionsToRestore) {
          codes.add(code)
        }

        return Array.from(codes)
      }
    )

    parallelize(
      deleteOrderChangesStep({ ids: [orderChange.id] }),
      deleteOrderShippingMethods({ ids: shippingToRemove })
    )

    refreshDraftOrderAdjustmentsWorkflow.runAsStep({
      input: {
        order,
        promo_codes: promotionsToRefresh,
        action: PromotionActions.REPLACE,
      },
    })

    when(shippingToRestore, (methods) => !!methods?.length).then(() => {
      restoreDraftOrderShippingMethodsStep({
        shippingMethods: shippingToRestore as any,
      })
    })

    return new WorkflowResponse(previewOrderChangeStep(order.id))
  }
)
