import {
  BigNumber,
  ChangeActionType,
  MathBN,
  OrderChangeStatus,
  PromotionActions,
} from "@medusajs/framework/utils"
import {
  createWorkflow,
  transform,
  when,
  WorkflowData,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk"
import {
  OrderChangeDTO,
  OrderDTO,
} from "@medusajs/types"
import { useRemoteQueryStep } from "../../common"
import {
  createOrderChangeActionsWorkflow,
  previewOrderChangeStep,
} from "../../order"
import { getDraftOrderPromotionContextStep } from "../steps/get-draft-order-promotion-context"
import { validateDraftOrderChangeStep } from "../steps/validate-draft-order-change"
import { draftOrderFieldsForRefreshSteps } from "../utils/fields"
import { refreshDraftOrderAdjustmentsWorkflow } from "./refresh-draft-order-adjustments"
import {
  orderEditUpdateItemQuantityWorkflowInputSchema,
  orderEditUpdateItemQuantityWorkflowOutputSchema,
  type OrderEditUpdateItemQuantityWorkflowInput,
  type OrderEditUpdateItemQuantityWorkflowOutput,
} from "../utils/schemas"

orderEditUpdateItemQuantityWorkflowInputSchema._def satisfies import("zod").ZodTypeDef
orderEditUpdateItemQuantityWorkflowOutputSchema._def satisfies import("zod").ZodTypeDef

export const updateDraftOrderItemWorkflowId = "update-draft-order-item"

/**
 * This workflow updates an item in a draft order edit. It's used by the
 * [Update Item in Draft Order Edit Admin API Route](https://docs.medusajs.com/api/admin#draft-orders_postdraftordersidedititemsitemitem_id).
 *
 * You can use this workflow within your customizations or your own custom workflows, allowing you to wrap custom logic around
 * updating an item in a draft order edit.
 *
 * @example
 * const { result } = await updateDraftOrderItemWorkflow(container)
 * .run({
 *   input: {
 *     order_id: "order_123",
 *     items: [{ id: "orli_123", quantity: 2 }],
 *   }
 * })
 *
 * @summary
 *
 * Update an item in a draft order edit.
 */
export const updateDraftOrderItemWorkflow = createWorkflow(
  {
    name: updateDraftOrderItemWorkflowId,
    inputSchema: orderEditUpdateItemQuantityWorkflowInputSchema,
    outputSchema: orderEditUpdateItemQuantityWorkflowOutputSchema,
    description: "Update an item in a draft order edit",
  },
  function (
    input: WorkflowData<OrderEditUpdateItemQuantityWorkflowInput>
  ): WorkflowResponse<OrderEditUpdateItemQuantityWorkflowOutput> {
    const order: OrderDTO = useRemoteQueryStep({
      entry_point: "orders",
      fields: draftOrderFieldsForRefreshSteps,
      variables: { id: input.order_id },
      list: false,
      throw_if_key_not_found: true,
    }).config({ name: "order-query" })

    const orderChange: OrderChangeDTO = useRemoteQueryStep({
      entry_point: "order_change",
      fields: ["id", "status"],
      variables: {
        filters: {
          order_id: input.order_id,
          status: [OrderChangeStatus.PENDING, OrderChangeStatus.REQUESTED],
        },
      },
      list: false,
    }).config({ name: "order-change-query" })

    validateDraftOrderChangeStep({ order, orderChange })

    const orderChangeActionInput = transform(
      { order, orderChange, input },
      ({ order, orderChange, input }) => {
        const existing = order?.items?.find(
          (exItem) => exItem.id === input.item_id
        )!

        const quantityDiff = new BigNumber(
          MathBN.sub(input.quantity, existing.quantity)
        )

        return [{
          order_change_id: orderChange.id,
          order_id: order.id,
          version: orderChange.version,
          action: ChangeActionType.ITEM_UPDATE,
          internal_note: undefined,
          details: {
            reference_id: input.item_id,
            quantity: input.quantity,
            unit_price: undefined,
            compare_at_unit_price: undefined,
            quantity_diff: quantityDiff,
          },
        }]
      }
    )

    createOrderChangeActionsWorkflow.runAsStep({
      input: orderChangeActionInput,
    })

    const context = getDraftOrderPromotionContextStep({
      order,
    })

    const appliedPromoCodes: string[] = transform(
      context,
      (context) =>
        (context as any).promotions?.map((promotion) => promotion.code) ?? []
    )

    // If any the order has any promo codes, then we need to refresh the adjustments.
    when(
      appliedPromoCodes,
      (appliedPromoCodes) => appliedPromoCodes.length > 0
    ).then(() => {
      refreshDraftOrderAdjustmentsWorkflow.runAsStep({
        input: {
          order: context,
          promo_codes: appliedPromoCodes,
          action: PromotionActions.REPLACE,
        },
      })
    })

    return new WorkflowResponse(previewOrderChangeStep(input.order_id))
  }
)
