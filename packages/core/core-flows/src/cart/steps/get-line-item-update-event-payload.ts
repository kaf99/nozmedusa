import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"
import { StoreCartLineItem } from "@medusajs/types"

export type GetLineItemUpdateEventPayloadStepInput = {
  line_item: StoreCartLineItem
  old_quantity: number
  new_quantity: number
}

export const getLineItemUpdateEventPayload = createStep(
  "get-line-item-update-event-payload",
  async (input: GetLineItemUpdateEventPayloadStepInput) => {
    const { line_item, old_quantity, new_quantity } = input

    const payload =
      new_quantity > old_quantity
        ? {
            action: "added",
            value: [
              {
                ...line_item,
                quantity: new_quantity - old_quantity,
              },
            ],
          }
        : {
            action: "deleted",
            value: [
              {
                ...line_item,
                quantity: old_quantity - new_quantity,
              },
            ],
          }

    return new StepResponse(payload)
  }
)
