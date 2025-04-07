import { CartWorkflowEvents } from "@medusajs/framework/utils"
import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"
import { CartLineItemDTO } from "@medusajs/types"
import { emitEventStep } from "../../common"
export type EmitLineItemUpdateEventStepInput = {
  cart_id: string
  line_item: CartLineItemDTO & {
    old_quantity: number
  }
}

export const emitLineItemUpdateEventStep = createStep(
  "emit-line-item-update-event",
  async (input: EmitLineItemUpdateEventStepInput) => {
    const { cart_id, line_item } = input

    const payload =
      (line_item.quantity as number) > line_item.old_quantity
        ? {
            action: "added",
            value: [
              {
                ...line_item,
                quantity:
                  (line_item.quantity as number) - line_item.old_quantity,
              },
            ],
          }
        : {
            action: "deleted",
            value: [
              {
                ...line_item,
                quantity:
                  line_item.old_quantity - (line_item.quantity as number),
              },
            ],
          }

    emitEventStep({
      eventName: CartWorkflowEvents.UPDATED,
      data: {
        id: cart_id,
        changes: {
          line_items: payload,
        },
      },
    })

    return new StepResponse(void 0)
  }
)
