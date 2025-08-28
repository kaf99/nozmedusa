import {
  BigNumberInput,
  BigNumberValue,
  CreateOrderShippingMethodDTO,
  OrderChangeActionDTO,
} from "@medusajs/framework/types"
import { isDefined } from "@medusajs/framework/utils"

type PrepareShippingMethodInput = {
  shippingOptions: Array<{
    id: string
    name: string
    calculated_price: {
      calculated_amount: BigNumberValue
      is_calculated_price_tax_inclusive?: boolean
    }
    data?: Record<string, unknown> | null
  }>
  customPrice?: BigNumberInput | null
  orderChange: {
    version: number
  }
  relatedEntity: {
    id?: string
    order_id: string
    claim_id?: string
    exchange_id?: string
  }
  return_id?: string
}

/**
 * Prepares the shipping method data for creating or updating a shipping method.
 * If `relatedEntityField` is provided, it will include the related entity ID in the result.
 *
 * @param relatedEntityField - The field name to associate the related entity ID with (e.g., "return_id", "claim_id", "exchange_id").
 * @returns A function that takes `PrepareShippingMethodInput` and returns an object with the prepared shipping method data.
 */
export function prepareShippingMethod(relatedEntityField?: string) {
  return function (data: PrepareShippingMethodInput) {
    const option = data.shippingOptions[0]
    const orderChange = data.orderChange

    const isCustomPrice =
      isDefined(data.customPrice) && data.customPrice !== null
    let amount: BigNumberInput = option.calculated_price.calculated_amount
    if (isDefined(data.customPrice) && data.customPrice !== null) {
      amount = data.customPrice
    }
    const obj: CreateOrderShippingMethodDTO = {
      shipping_option_id: option.id,
      amount,
      is_custom_amount: isCustomPrice,
      is_tax_inclusive:
        !!option.calculated_price.is_calculated_price_tax_inclusive,
      data: option.data ?? {},
      name: option.name,
      version: orderChange.version,
      order_id: data.relatedEntity.order_id,
    }

    if (relatedEntityField) {
      obj.return_id = data.return_id
      obj[relatedEntityField] = data.relatedEntity.id

      if (relatedEntityField === "return_id") {
        obj.claim_id = data.relatedEntity.claim_id
        obj.exchange_id = data.relatedEntity.exchange_id
      }
    }

    return obj
  }
}

export function prepareShippingMethodUpdate({
  input,
  orderChange,
  shippingOptions,
}) {
  const originalAction = (orderChange.actions ?? []).find(
    (a) => a.id === input.action_id
  ) as OrderChangeActionDTO

  const data = input.data

  const option = shippingOptions?.[0]

  const isCustomPrice = !isDefined(shippingOptions)
  const price = isCustomPrice
    ? data.custom_amount
    : option.calculated_price.calculated_amount

  const action = {
    id: originalAction.id,
    amount: price,
    internal_note: data.internal_note,
  }

  const shippingMethod = {
    id: originalAction.reference_id,
    amount: price,
    is_custom_amount: isCustomPrice,
    metadata: data.metadata,
  }

  return {
    action,
    shippingMethod,
  }
}
