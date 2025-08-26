import {
  OrderChangeDTO,
  OrderDTO,
  OrderPreviewDTO,
  OrderWorkflow,
} from "@medusajs/framework/types"
import {
  ChangeActionType,
  MathBN,
  OrderChangeStatus,
} from "@medusajs/framework/utils"
import {
  createStep,
  createWorkflow,
  transform,
  WorkflowData,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk"
import {
  getActionsToComputeFromPromotionsStep,
  prepareAdjustmentsFromPromotionActionsStep,
} from "../../../cart"
import { useQueryGraphStep } from "../../../common"
import { previewOrderChangeStep } from "../../steps/preview-order-change"
import {
  throwIfIsCancelled,
  throwIfOrderChangeIsNotActive,
} from "../../utils/order-validation"
import { addOrderLineItemsWorkflow } from "../add-line-items"
import { createOrderChangeActionsWorkflow } from "../create-order-change-actions"
import { updateOrderTaxLinesWorkflow } from "../update-tax-lines"
import { fieldsToRefreshOrderEdit } from "./utils/fields"

/**
 * The data to validate that new items can be added to an order edit.
 */
export type OrderEditAddNewItemValidationStepInput = {
  /**
   * The order's details.
   */
  order: OrderDTO
  /**
   * The order change's details.
   */
  orderChange: OrderChangeDTO
}

/**
 * This step validates that new items can be added to an order edit.
 * If the order is canceled or the order change is not active, the step will throw an error.
 *
 * :::note
 *
 * You can retrieve an order and order change details using [Query](https://docs.medusajs.com/learn/fundamentals/module-links/query),
 * or [useQueryGraphStep](https://docs.medusajs.com/resources/references/medusa-workflows/steps/useQueryGraphStep).
 *
 * :::
 *
 * @example
 * const data = orderEditAddNewItemValidationStep({
 *   order: {
 *     id: "order_123",
 *     // other order details...
 *   },
 *   orderChange: {
 *     id: "orch_123",
 *     // other order change details...
 *   }
 * })
 */
export const orderEditAddNewItemValidationStep = createStep(
  "order-edit-add-new-item-validation",
  async function ({
    order,
    orderChange,
  }: OrderEditAddNewItemValidationStepInput) {
    throwIfIsCancelled(order, "Order")
    throwIfOrderChangeIsNotActive({ orderChange })
  }
)

export const orderEditAddNewItemWorkflowId = "order-edit-add-new-item"
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
export const orderEditAddNewItemWorkflow = createWorkflow(
  orderEditAddNewItemWorkflowId,
  function (
    input: WorkflowData<OrderWorkflow.OrderEditAddNewItemWorkflowInput>
  ): WorkflowResponse<OrderPreviewDTO> {
    const orderResult = useQueryGraphStep({
      entity: "order",
      fields: fieldsToRefreshOrderEdit,
      filters: { id: input.order_id },
      options: {
        throwIfKeyNotFound: true,
      },
    }).config({ name: "order-query" })

    const order = transform({ orderResult }, ({ orderResult }) => {
      return orderResult.data[0]
    })

    const orderChangeResult = useQueryGraphStep({
      entity: "order_change",
      fields: ["id", "status", "version", "actions.*"],
      filters: {
        order_id: input.order_id,
        status: [OrderChangeStatus.PENDING, OrderChangeStatus.REQUESTED],
      },
    }).config({ name: "order-change-query" })

    const orderChange = transform(
      { orderChangeResult },
      ({ orderChangeResult }) => {
        return orderChangeResult.data[0]
      }
    )

    orderEditAddNewItemValidationStep({
      order,
      orderChange,
    })

    const lineItems = addOrderLineItemsWorkflow.runAsStep({
      input: {
        order_id: order.id,
        items: input.items,
      },
    })

    const lineItemIds = transform(lineItems, (lineItems) => {
      return lineItems.map((item) => item.id)
    })

    const taxLines = updateOrderTaxLinesWorkflow.runAsStep({
      input: {
        order_id: order.id,
        item_ids: lineItemIds,
      },
    })

    const promotions = transform({ order }, ({ order }) => {
      return order.promotions.map((p) => p.code)
    })

    const actionsToComputeItemsInput = transform(
      { items: input.items, lineItems, itemTaxLines: taxLines.itemTaxLines },
      ({ items, lineItems, itemTaxLines }) => {
        const itemsInput = items.map((item, index) => {
          const lineItem = lineItems[index]

          const taxLines = itemTaxLines.filter(
            (taxLine) => taxLine.line_item_id === lineItem.id
          )

          const sumTax = MathBN.sum(
            ...((taxLines ?? []).map((taxLine) => taxLine.rate) ?? [])
          )

          const sumTaxRate = MathBN.div(sumTax, 100)

          const itemPrice = MathBN.mult(lineItem.unit_price, item.quantity)
          const subtotal = lineItem.is_tax_inclusive
            ? MathBN.div(itemPrice, MathBN.add(1, sumTaxRate))
            : itemPrice

          return {
            ...lineItem,
            product: { id: lineItem.product_id },
            subtotal: subtotal,
            quantity: item.quantity,
          }
        })

        return {
          currency_code: order.currency_code,
          items: itemsInput,
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

    const orderChangeActionInput = transform(
      {
        order,
        orderChange,
        items: input.items,
        lineItems,
        lineItemAdjustmentsToCreate,
      },
      ({
        order,
        orderChange,
        items,
        lineItems,
        lineItemAdjustmentsToCreate,
      }) => {
        return items.map((item, index) => {
          return {
            order_change_id: orderChange.id,
            order_id: order.id,
            version: orderChange.version,
            action: ChangeActionType.ITEM_ADD,
            internal_note: item.internal_note,
            details: {
              reference_id: lineItems[index].id,
              quantity: item.quantity,
              unit_price: item.unit_price ?? lineItems[index].unit_price,
              compare_at_unit_price:
                item.compare_at_unit_price ??
                lineItems[index].compare_at_unit_price,
              metadata: item.metadata,
              adjustments: lineItemAdjustmentsToCreate.filter(
                (adjustment) => adjustment.item_id === lineItems[index].id
              ),
            },
          }
        })
      }
    )

    createOrderChangeActionsWorkflow.runAsStep({
      // @ts-ignore
      input: orderChangeActionInput,
    })

    // const previewedOrder = previewOrderChangeStep(input.order_id)

    // const actionsToComputeItemsInput = transform(
    //   { previewedOrder },
    //   ({ previewedOrder }) => {
    //     return {
    //       currency_code: order.currency_code,
    //       items: previewedOrder.items.map((item) => ({
    //         ...item,
    //         // Buy-Get promotions rely on the product ID, so we need to manually set it before refreshing adjustments
    //         product: { id: item.product_id },
    //       })),
    //     }
    //   }
    // )

    // const actions = getActionsToComputeFromPromotionsStep({
    //   // @ts-ignore
    //   computeActionContext: actionsToComputeItemsInput,
    //   promotionCodesToApply: promotions,
    // })

    // const { lineItemAdjustmentsToCreate } =
    //   prepareAdjustmentsFromPromotionActionsStep({ actions })

    // const orderChangeActionAdjustmentsInput = transform(
    //   {
    //     order,
    //     orderChange,
    //     items: input.items,
    //     lineItems,
    //     lineItemAdjustmentsToCreate,
    //   },
    //   ({
    //     order,
    //     orderChange,
    //     items,
    //     lineItems,
    //     lineItemAdjustmentsToCreate,
    //   }) => {
    //     return items.map((item, index) => {
    //       const itemAdjustments = lineItemAdjustmentsToCreate.filter(
    //         (adjustment) => adjustment.item_id === lineItems[index].id
    //       )

    //       return {
    //         order_change_id: orderChange.id,
    //         order_id: order.id,
    //         version: orderChange.version,
    //         action: ChangeActionType.ITEM_ADJUSTMENTS_REPLACE,
    //         details: {
    //           reference_id: lineItems[index].id,
    //           adjustments: itemAdjustments,
    //         },
    //       }
    //     })
    //   }
    // )

    // createOrderChangeActionsWorkflow
    //   .runAsStep({
    //     // @ts-ignore
    //     input: orderChangeActionAdjustmentsInput,
    //   })
    //   .config({ name: "order-change-action-adjustments-input" })

    return new WorkflowResponse(
      previewOrderChangeStep(input.order_id).config({
        name: "preview-order-result",
      })
    )
  }
)
