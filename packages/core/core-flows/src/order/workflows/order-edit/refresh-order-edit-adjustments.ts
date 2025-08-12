import { PromotionActions } from "@medusajs/framework/utils"
import {
  createWorkflow,
  transform,
  WorkflowData,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk"
import { OrderDTO, OrderStatus, PromotionDTO } from "@medusajs/types"
import { refreshDraftOrderAdjustmentsWorkflow } from "../../../draft-order/workflows/refresh-draft-order-adjustments"
import { previewOrderChangeStep } from "../../steps"

export const refreshOrderEditAdjustmentsWorkflowId =
  "refresh-order-edit-adjustments"

/**
 * The details of the draft order to refresh the adjustments for.
 */
export interface RefreshOrderEditAdjustmentsWorkflowInput {
  /**
   * The order edit to refresh the adjustments for.
   */
  order: {
    id: string
    status: OrderStatus
    currency_code: string
    canceled_at?: string | Date
    items: OrderDTO["items"]
    promotions: PromotionDTO[]
  }
}

export const refreshOrderEditAdjustmentsWorkflow = createWorkflow(
  refreshOrderEditAdjustmentsWorkflowId,
  function (input: WorkflowData<RefreshOrderEditAdjustmentsWorkflowInput>) {
    const orderEditPromoCodes: string[] = transform({ input }, ({ input }) => {
      return input.order.promotions
        .map((p) => p?.code)
        .filter(Boolean) as string[]
    })

    // we want the previewed order to contain updated promotions,
    // so we fetch it to use it for refreshing adjustments
    const orderPreview = previewOrderChangeStep(input.order.id).config({
      name: "order-preview",
    })

    const orderToRefresh = transform(
      { input, orderPreview },
      ({ input, orderPreview }) => {
        return {
          ...orderPreview,
          currency_code: input.order.currency_code,
          promotions: input.order.promotions,
        }
      }
    )

    refreshDraftOrderAdjustmentsWorkflow.runAsStep({
      input: {
        order: orderToRefresh,
        promo_codes: orderEditPromoCodes,
        action: PromotionActions.REPLACE,
      },
    })

    return new WorkflowResponse(void 0)
  }
)
