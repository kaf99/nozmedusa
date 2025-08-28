import { z } from "zod"
import {
  bigNumberValueSchema,
  bigNumberInputSchema,
  bigNumberRawValueSchema,
} from "../../common/utils/schemas"
import {
  fulfillmentDTOSchema,
  shippingOptionRuleDTOSchema,
} from "../../fulfillment/utils/schemas"

/**
 * Schema for AdditionalData
 */
const additionalDataSchema = z.object({
  additional_data: z.record(z.unknown()).optional(),
})

/**
 * Schema for OrderStatus enum
 */
const orderStatusSchema = z.enum([
  "pending",
  "completed",
  "draft",
  "archived",
  "canceled",
  "requires_action",
])

/**
 * Schemas for order workflows
 */

/**
 * Schema for CreateOrderAddressDTO
 */
const createOrderAddressDTOSchema = z.object({
  first_name: z.string().optional(),
  last_name: z.string().optional(),
  phone: z.string().optional(),
  company: z.string().optional(),
  address_1: z.string().optional(),
  address_2: z.string().optional(),
  city: z.string().optional(),
  country_code: z.string().optional(),
  province: z.string().optional(),
  postal_code: z.string().optional(),
  metadata: z.record(z.unknown()).nullable().optional(),
})

/**
 * Schema for UpdateOrderAddressDTO
 */
const updateOrderAddressDTOSchema = z.object({
  id: z.string().optional(),
  first_name: z.string().optional(),
  last_name: z.string().optional(),
  phone: z.string().optional(),
  company: z.string().optional(),
  address_1: z.string().optional(),
  address_2: z.string().optional(),
  city: z.string().optional(),
  country_code: z.string().optional(),
  province: z.string().optional(),
  postal_code: z.string().optional(),
  metadata: z.record(z.unknown()).nullable().optional(),
})

/**
 * Schema for CreateOrderCreditLineDTO
 */
const createOrderCreditLineDTOSchema = z.object({
  order_id: z.string(),
  amount: bigNumberInputSchema,
  reference: z.string().nullable().optional(),
  reference_id: z.string().nullable().optional(),
  metadata: z.record(z.unknown()).nullable().optional(),
})

/**
 * Schema for CreateOrderLineItemDTO
 */
const createOrderLineItemDTOSchema = z.object({
  variant_id: z.string().optional(),
  quantity: bigNumberInputSchema,
  unit_price: bigNumberInputSchema,
  compare_at_unit_price: bigNumberInputSchema.optional(),
  title: z.string(),
  subtitle: z.string().optional(),
  thumbnail: z.string().optional(),
  product_id: z.string().optional(),
  product_title: z.string().optional(),
  product_subtitle: z.string().optional(),
  product_description: z.string().optional(),
  product_handle: z.string().optional(),
  product_collection: z.string().optional(),
  product_type: z.string().optional(),
  variant_sku: z.string().optional(),
  variant_barcode: z.string().optional(),
  variant_title: z.string().optional(),
  variant_option_values: z.record(z.unknown()).optional(),
  requires_shipping: z.boolean().optional(),
  is_discountable: z.boolean().optional(),
  is_tax_inclusive: z.boolean().optional(),
  is_giftcard: z.boolean().optional(),
  metadata: z.record(z.unknown()).nullable().optional(),
  should_merge: z.boolean().optional(),
})

/**
 * Schema for CreateOrderShippingMethodDTO without order_id
 */
const createOrderShippingMethodDTOSchema = z.object({
  name: z.string(),
  amount: bigNumberInputSchema,
  data: z.record(z.unknown()).optional(),
  is_tax_inclusive: z.boolean().optional(),
  shipping_option_id: z.string().optional(),
  carrier_id: z.string().optional(),
  provider_id: z.string().optional(),
  metadata: z.record(z.unknown()).nullable().optional(),
})

/**
 * Schema for CreateOrderTransactionDTO without order_id
 */
const createOrderTransactionDTOSchema = z.object({
  currency_code: z.string(),
  amount: bigNumberInputSchema,
  reference: z.string().optional(),
  reference_id: z.string().optional(),
  metadata: z.record(z.unknown()).nullable().optional(),
})

/**
 * Schema for CreateOrderDTO
 */
export const createOrderDTOSchema = z.object({
  region_id: z.string().optional(),
  customer_id: z.string().optional(),
  sales_channel_id: z.string().optional(),
  status: z.string().optional(),
  email: z.string().optional(),
  currency_code: z.string().optional(),
  shipping_address_id: z.string().optional(),
  billing_address_id: z.string().optional(),
  shipping_address: z
    .union([createOrderAddressDTOSchema, updateOrderAddressDTOSchema])
    .optional(),
  billing_address: z
    .union([createOrderAddressDTOSchema, updateOrderAddressDTOSchema])
    .optional(),
  credit_lines: z.array(createOrderCreditLineDTOSchema).optional(),
  no_notification: z.boolean().optional(),
  items: z.array(createOrderLineItemDTOSchema).optional(),
  shipping_methods: z.array(createOrderShippingMethodDTOSchema).optional(),
  transactions: z.array(createOrderTransactionDTOSchema).optional(),
  metadata: z.record(z.unknown()).nullable().optional(),
  promo_codes: z.array(z.string()).optional(),
})

/**
 * Schema for CreateOrderWorkflowInput
 */
export const createOrderWorkflowInputSchema = createOrderDTOSchema.merge(
  z.object({
    additional_data: z.record(z.unknown()).optional(),
  })
)

/**
 * Schema for OrderAddressDTO
 */
const orderAddressDTOSchema = z.object({
  id: z.string(),
  first_name: z.string().optional(),
  last_name: z.string().optional(),
  phone: z.string().optional(),
  company: z.string().optional(),
  address_1: z.string().optional(),
  address_2: z.string().optional(),
  city: z.string().optional(),
  country_code: z.string().optional(),
  province: z.string().optional(),
  postal_code: z.string().optional(),
  metadata: z.record(z.unknown()).nullable().optional(),
  created_at: z.union([z.string(), z.date()]),
  updated_at: z.union([z.string(), z.date()]),
})

/**
 * Schema for OrderDTO (simplified for create workflow)
 */
export const orderDTOSchema = z.object({
  id: z.string(),
  version: z.number(),
  display_id: z.number(),
  status: orderStatusSchema,
  region_id: z.string().optional(),
  customer_id: z.string().optional(),
  sales_channel_id: z.string().optional(),
  email: z.string().optional(),
  currency_code: z.string(),
  shipping_address: orderAddressDTOSchema.optional(),
  billing_address: orderAddressDTOSchema.optional(),
  items: z.array(z.any()).optional(),
  shipping_methods: z.array(z.any()).optional(),
  transactions: z.array(z.any()).optional(),
  credit_lines: z.array(z.any()).optional(),
  summary: z.any().optional(),
  is_draft_order: z.boolean().optional(),
  metadata: z.record(z.unknown()).nullable().optional(),
  canceled_at: z.union([z.string(), z.date()]).optional(),
  created_at: z.union([z.string(), z.date()]),
  updated_at: z.union([z.string(), z.date()]),
  deleted_at: z.union([z.string(), z.date()]).optional(),
  order_change: z.any().optional(),
  // All the total fields
  original_item_total: bigNumberValueSchema,
  original_item_subtotal: bigNumberValueSchema,
  original_item_tax_total: bigNumberValueSchema,
  item_total: bigNumberValueSchema,
  item_subtotal: bigNumberValueSchema,
  item_tax_total: bigNumberValueSchema,
  original_total: bigNumberValueSchema,
  original_subtotal: bigNumberValueSchema,
  original_tax_total: bigNumberValueSchema,
  total: bigNumberValueSchema,
  subtotal: bigNumberValueSchema,
  tax_total: bigNumberValueSchema,
  discount_subtotal: bigNumberValueSchema,
  discount_total: bigNumberValueSchema,
  discount_tax_total: bigNumberValueSchema,
  credit_line_total: bigNumberValueSchema,
  gift_card_total: bigNumberValueSchema,
  gift_card_tax_total: bigNumberValueSchema,
  shipping_total: bigNumberValueSchema,
  shipping_subtotal: bigNumberValueSchema,
  shipping_tax_total: bigNumberValueSchema,
  original_shipping_total: bigNumberValueSchema,
  original_shipping_subtotal: bigNumberValueSchema,
  original_shipping_tax_total: bigNumberValueSchema,
  // Raw values
  raw_original_item_total: bigNumberRawValueSchema,
  raw_original_item_subtotal: bigNumberRawValueSchema,
  raw_original_item_tax_total: bigNumberRawValueSchema,
  raw_item_total: bigNumberRawValueSchema,
  raw_item_subtotal: bigNumberRawValueSchema,
  raw_item_tax_total: bigNumberRawValueSchema,
  raw_original_total: bigNumberRawValueSchema,
  raw_original_subtotal: bigNumberRawValueSchema,
  raw_original_tax_total: bigNumberRawValueSchema,
  raw_total: bigNumberRawValueSchema,
  raw_subtotal: bigNumberRawValueSchema,
  raw_tax_total: bigNumberRawValueSchema,
  raw_discount_total: bigNumberRawValueSchema,
  raw_discount_tax_total: bigNumberRawValueSchema,
  raw_credit_line_total: bigNumberRawValueSchema,
  raw_gift_card_total: bigNumberRawValueSchema,
  raw_gift_card_tax_total: bigNumberRawValueSchema,
  raw_shipping_total: bigNumberRawValueSchema,
  raw_shipping_subtotal: bigNumberRawValueSchema,
  raw_shipping_tax_total: bigNumberRawValueSchema,
  raw_original_shipping_total: bigNumberRawValueSchema,
  raw_original_shipping_subtotal: bigNumberRawValueSchema,
  raw_original_shipping_tax_total: bigNumberRawValueSchema,
})

/**
 * Schema for CreateOrderWorkflowOutput
 */
export const createOrderWorkflowOutputSchema = orderDTOSchema

/**
 * Schema for CreateOrderCreditLinesWorkflowInput
 */
export const createOrderCreditLinesWorkflowInputSchema = z.object({
  id: z.string(),
  credit_lines: z.array(
    createOrderCreditLineDTOSchema.omit({ order_id: true })
  ),
})

/**
 * Schema for OrderCreditLineDTO (simplified for workflow output)
 */
export const orderCreditLineDTOSchema = z.object({
  id: z.string(),
  order_id: z.string(),
  order: orderDTOSchema,
  amount: bigNumberValueSchema,
  reference: z.string().nullable(),
  reference_id: z.string().nullable(),
  metadata: z.record(z.unknown()).nullable(),
  created_at: z.date(),
  updated_at: z.date(),
})

/**
 * Schema for CreateOrderCreditLinesWorkflowOutput
 */
export const createOrderCreditLinesWorkflowOutputSchema = z.array(
  orderCreditLineDTOSchema
)

/**
 * Schema for CancelOrderWorkflowInput
 */
export const cancelOrderWorkflowInputSchema = z.object({
  order_id: z.string(),
  no_notification: z.boolean().optional(),
  canceled_by: z.string().optional(),
})

/**
 * Schema for CancelOrderWorkflowOutput
 */
export const cancelOrderWorkflowOutputSchema = z.void()

/**
 * Schema for ArchiveOrdersWorkflowInput
 */
export const archiveOrdersWorkflowInputSchema = z.object({
  orderIds: z.array(z.string()),
})

/**
 * Schema for ArchiveOrdersWorkflowOutput
 */
export const archiveOrdersWorkflowOutputSchema = z.array(orderDTOSchema)

/**
 * Schema for CompleteOrdersWorkflowInput
 */
export const completeOrdersWorkflowInputSchema = z.object({
  orderIds: z.array(z.string()),
  additional_data: z.record(z.unknown()).optional(),
})

/**
 * Schema for CompleteOrdersWorkflowOutput
 */
export const completeOrdersWorkflowOutputSchema = z.array(orderDTOSchema)

// Type exports
export type CreateOrderWorkflowInput = z.infer<
  typeof createOrderWorkflowInputSchema
>
export type CreateOrderWorkflowOutput = z.infer<
  typeof createOrderWorkflowOutputSchema
>
export type CreateOrderCreditLinesWorkflowInput = z.infer<
  typeof createOrderCreditLinesWorkflowInputSchema
>
export type CreateOrderCreditLinesWorkflowOutput = z.infer<
  typeof createOrderCreditLinesWorkflowOutputSchema
>
export type CancelOrderWorkflowInput = z.infer<
  typeof cancelOrderWorkflowInputSchema
>
export type CancelOrderWorkflowOutput = z.infer<
  typeof cancelOrderWorkflowOutputSchema
>
export type ArchiveOrdersWorkflowInput = z.infer<
  typeof archiveOrdersWorkflowInputSchema
>
export type ArchiveOrdersWorkflowOutput = z.infer<
  typeof archiveOrdersWorkflowOutputSchema
>
export type CompleteOrdersWorkflowInput = z.infer<
  typeof completeOrdersWorkflowInputSchema
>
export type CompleteOrdersWorkflowOutput = z.infer<
  typeof completeOrdersWorkflowOutputSchema
>

/**
 * Schema for line item adjustment
 */
const orderLineItemAdjustmentDTOSchema = z.object({
  id: z.string(),
  code: z.string().optional(),
  amount: bigNumberValueSchema,
  order_id: z.string(),
  description: z.string().optional(),
  promotion_id: z.string().optional(),
  provider_id: z.string().optional(),
  created_at: z.union([z.date(), z.string()]),
  updated_at: z.union([z.date(), z.string()]),
  item: z.lazy(() => orderLineItemDTOSchema),
  item_id: z.string(),
})

/**
 * Schema for line item tax line
 */
const orderLineItemTaxLineDTOSchema = z.object({
  id: z.string(),
  description: z.string().optional(),
  tax_rate_id: z.string().optional(),
  code: z.string(),
  rate: z.number(),
  provider_id: z.string().optional(),
  created_at: z.union([z.date(), z.string()]),
  updated_at: z.union([z.date(), z.string()]),
  item: z.lazy(() => orderLineItemDTOSchema),
  item_id: z.string(),
  total: bigNumberValueSchema,
  subtotal: bigNumberValueSchema,
  raw_total: bigNumberRawValueSchema,
  raw_subtotal: bigNumberRawValueSchema,
})

/**
 * Schema for OrderLineItemTotalsDTO
 */
const orderLineItemTotalsDTOSchema = z.object({
  original_total: bigNumberValueSchema,
  original_subtotal: bigNumberValueSchema,
  original_tax_total: bigNumberValueSchema,
  item_total: bigNumberValueSchema,
  item_subtotal: bigNumberValueSchema,
  item_tax_total: bigNumberValueSchema,
  total: bigNumberValueSchema,
  subtotal: bigNumberValueSchema,
  tax_total: bigNumberValueSchema,
  discount_total: bigNumberValueSchema,
  discount_tax_total: bigNumberValueSchema,
  refundable_total: bigNumberValueSchema,
  refundable_total_per_unit: bigNumberValueSchema,
  raw_original_total: bigNumberRawValueSchema,
  raw_original_subtotal: bigNumberRawValueSchema,
  raw_original_tax_total: bigNumberRawValueSchema,
  raw_item_total: bigNumberRawValueSchema,
  raw_item_subtotal: bigNumberRawValueSchema,
  raw_item_tax_total: bigNumberRawValueSchema,
  raw_total: bigNumberRawValueSchema,
  raw_subtotal: bigNumberRawValueSchema,
  raw_tax_total: bigNumberRawValueSchema,
  raw_discount_total: bigNumberRawValueSchema,
  raw_discount_tax_total: bigNumberRawValueSchema,
  raw_refundable_total: bigNumberRawValueSchema,
  raw_refundable_total_per_unit: bigNumberRawValueSchema,
})

/**
 * Schema for OrderLineItemDTO
 */
export const orderLineItemDTOSchema = orderLineItemTotalsDTOSchema.extend({
  id: z.string(),
  title: z.string(),
  subtitle: z.string().nullable().optional(),
  thumbnail: z.string().nullable().optional(),
  variant_id: z.string().nullable().optional(),
  product_id: z.string().nullable().optional(),
  product_title: z.string().nullable().optional(),
  product_description: z.string().nullable().optional(),
  product_subtitle: z.string().nullable().optional(),
  product_type_id: z.string().nullable().optional(),
  product_type: z.string().nullable().optional(),
  product_collection: z.string().nullable().optional(),
  product_handle: z.string().nullable().optional(),
  variant_sku: z.string().nullable().optional(),
  variant_barcode: z.string().nullable().optional(),
  variant_title: z.string().nullable().optional(),
  variant_option_values: z.record(z.unknown()).nullable().optional(),
  requires_shipping: z.boolean().optional(),
  is_discountable: z.boolean().optional(),
  is_tax_inclusive: z.boolean().optional(),
  is_giftcard: z.boolean().optional(),
  compare_at_unit_price: bigNumberValueSchema.nullable().optional(),
  raw_compare_at_unit_price: bigNumberRawValueSchema.nullable().optional(),
  unit_price: bigNumberValueSchema,
  raw_unit_price: bigNumberRawValueSchema,
  quantity: bigNumberValueSchema,
  raw_quantity: bigNumberRawValueSchema,
  tax_lines: z.array(orderLineItemTaxLineDTOSchema).optional(),
  adjustments: z.array(orderLineItemAdjustmentDTOSchema).optional(),
  item: z.any().optional(), // Related to return/claim items
  detail: z.any().optional(), // OrderItemDetail
  metadata: z.record(z.unknown()).nullable().optional(),
  order_id: z.string().optional(),
  original_item_id: z.string().nullable().optional(),
  order_version: z.number().nullable().optional(),
  created_at: z.union([z.date(), z.string()]).optional(),
  updated_at: z.union([z.date(), z.string()]).optional(),
  deleted_at: z.union([z.date(), z.string()]).nullable().optional(),
})

/**
 * Schema for NewItem input
 */
const newItemSchema = z.object({
  variant_id: z.string().optional(),
  title: z.string().optional(),
  quantity: bigNumberInputSchema,
  unit_price: bigNumberInputSchema.nullable().optional(),
  compare_at_unit_price: bigNumberInputSchema.nullable().optional(),
  internal_note: z.string().nullable().optional(),
  metadata: z.record(z.any()).nullable().optional(),
  is_tax_inclusive: z.boolean().optional(),
  tax_lines: z
    .array(
      z.object({
        description: z.string().optional(),
        tax_rate_id: z.string().optional(),
        code: z.string(),
        rate: z.number(),
        provider_id: z.string().optional(),
      })
    )
    .optional(),
  adjustments: z
    .array(
      z.object({
        code: z.string().optional(),
        amount: bigNumberInputSchema,
        description: z.string().optional(),
        promotion_id: z.string().optional(),
        provider_id: z.string().optional(),
      })
    )
    .optional(),
})

/**
 * Schema for OrderAddLineItemWorkflowInput
 */
export const orderAddLineItemWorkflowInputSchema = z.object({
  order_id: z.string(),
  items: z.array(newItemSchema),
  additional_data: z.record(z.unknown()).optional(),
})

/**
 * Schema for OrderAddLineItemWorkflowOutput
 */
export const orderAddLineItemWorkflowOutputSchema = z.array(
  orderLineItemDTOSchema
)

// Type exports
export type OrderAddLineItemWorkflowInput = z.infer<
  typeof orderAddLineItemWorkflowInputSchema
>
export type OrderAddLineItemWorkflowOutput = z.infer<
  typeof orderAddLineItemWorkflowOutputSchema
>

/**
 * Schema for ChangeActionType enum
 */
const changeActionTypeSchema = z.enum([
  "CANCEL_RETURN_ITEM",
  "FULFILL_ITEM",
  "DELIVER_ITEM",
  "CANCEL_ITEM_FULFILLMENT",
  "ITEM_ADD",
  "ITEM_REMOVE",
  "ITEM_UPDATE",
  "RECEIVE_DAMAGED_RETURN_ITEM",
  "RECEIVE_RETURN_ITEM",
  "RETURN_ITEM",
  "SHIPPING_ADD",
  "SHIPPING_REMOVE",
  "SHIPPING_UPDATE",
  "SHIP_ITEM",
  "WRITE_OFF_ITEM",
  "REINSTATE_ITEM",
  "TRANSFER_CUSTOMER",
  "UPDATE_ORDER_PROPERTIES",
  "CREDIT_LINE_ADD",
  "PROMOTION_ADD",
  "PROMOTION_REMOVE",
])

/**
 * Schema for CreateOrderChangeActionDTO
 */
const createOrderChangeActionDTOSchema = z.object({
  order_change_id: z.string().optional(),
  order_id: z.string().optional(),
  return_id: z.string().optional(),
  claim_id: z.string().optional(),
  exchange_id: z.string().optional(),
  version: z.number().optional(),
  reference: z.string().optional(),
  reference_id: z.string().optional(),
  action: changeActionTypeSchema,
  internal_note: z.string().nullable().optional(),
  amount: bigNumberInputSchema.optional(),
  raw_amount: z
    .object({
      value: z.union([z.string(), z.number()]).optional(),
      precision: z.number().optional(),
    })
    .optional(),
  details: z.record(z.unknown()).optional(),
  next: z.any().optional(),
})

const orderChangeDTOBaseSchema = z.object({
  id: z.string(),
  order_id: z.string(),
  return_id: z.string().nullable(),
  claim_id: z.string().nullable(),
  exchange_id: z.string().nullable(),
  change_type: z.string().nullable().optional(),
  status: z.string(),
  requested_by: z.string().nullable(),
  requested_at: z.union([z.string(), z.date()]).nullable(),
  confirmed_by: z.string().nullable(),
  confirmed_at: z.union([z.string(), z.date()]).nullable(),
  declined_by: z.string().nullable(),
  declined_at: z.union([z.string(), z.date()]).nullable(),
  canceled_by: z.string().nullable(),
  canceled_at: z.union([z.string(), z.date()]).nullable(),
  created_by: z.string().nullable().optional(),
  description: z.string().nullable().optional(),
  internal_note: z.string().nullable().optional(),
  metadata: z.record(z.unknown()).nullable().optional(),
  version: z.number(),
  order_version: z.number().optional(),
  created_at: z.union([z.string(), z.date()]).optional(),
  updated_at: z.union([z.string(), z.date()]).optional(),
  deleted_at: z.union([z.string(), z.date()]).nullable().optional(),
})

/**
 * Schema for CreateOrderChangeWorkflowOutput (OrderChangeDTO)
 */

/**
 * Schema for OrderChangeActionDTO
 */
const orderChangeActionDTOSchema = z.object({
  id: z.string(),
  order_change_id: z.string().nullable(),
  order_change: orderChangeDTOBaseSchema.nullable(),
  order_id: z.string().nullable(),
  return_id: z.string().nullable(),
  claim_id: z.string().nullable(),
  exchange_id: z.string().nullable(),
  order: orderDTOSchema.nullable(),
  reference: z.string(),
  reference_id: z.string(),
  action: changeActionTypeSchema,
  details: z.record(z.unknown()).nullable(),
  internal_note: z.string().nullable(),
  created_at: z.union([z.date(), z.string()]),
  updated_at: z.union([z.date(), z.string()]),
})

const orderChangeDTOSchema = orderChangeDTOBaseSchema.extend({
  actions: z.array(orderChangeActionDTOSchema).optional(),
})

/**
 * Schema for CreateOrderChangeActionsWorkflowInput
 */
export const createOrderChangeActionsWorkflowInputSchema = z.array(
  createOrderChangeActionDTOSchema
)

/**
 * Schema for CreateOrderChangeActionsWorkflowOutput
 */
export const createOrderChangeActionsWorkflowOutputSchema = z.array(
  orderChangeActionDTOSchema
)

// Type exports
export type CreateOrderChangeActionsWorkflowInput = z.infer<
  typeof createOrderChangeActionsWorkflowInputSchema
>
export type CreateOrderChangeActionsWorkflowOutput = z.infer<
  typeof createOrderChangeActionsWorkflowOutputSchema
>

/**
 * Schema for DeleteOrderChangeActionsWorkflowInput
 */
export const deleteOrderChangeActionsWorkflowInputSchema = z.object({
  ids: z.array(z.string()),
})

/**
 * Schema for DeleteOrderChangeActionsWorkflowOutput
 */
export const deleteOrderChangeActionsWorkflowOutputSchema = z.void()

// Type exports
export type DeleteOrderChangeActionsWorkflowInput = z.infer<
  typeof deleteOrderChangeActionsWorkflowInputSchema
>
export type DeleteOrderChangeActionsWorkflowOutput = z.infer<
  typeof deleteOrderChangeActionsWorkflowOutputSchema
>

/**
 * Schema for UpdateOrderChangeActionDTO
 */
const updateOrderChangeActionDTOSchema = z.object({
  id: z.string(),
  internal_note: z.string().nullable().optional(),
})

/**
 * Schema for UpdateOrderChangeActionsWorkflowInput
 */
export const updateOrderChangeActionsWorkflowInputSchema = z.array(
  updateOrderChangeActionDTOSchema
)

/**
 * Schema for UpdateOrderChangeActionsWorkflowOutput
 */
export const updateOrderChangeActionsWorkflowOutputSchema = z.array(
  orderChangeActionDTOSchema
)

// Type exports
export type UpdateOrderChangeActionsWorkflowInput = z.infer<
  typeof updateOrderChangeActionsWorkflowInputSchema
>
export type UpdateOrderChangeActionsWorkflowOutput = z.infer<
  typeof updateOrderChangeActionsWorkflowOutputSchema
>

/**
 * Schema for CancelOrderChangeWorkflowInput
 */
export const cancelOrderChangeWorkflowInputSchema = z.object({
  id: z.string(),
  canceled_by: z.string().optional(),
})

/**
 * Schema for CancelOrderChangeWorkflowOutput
 */
export const cancelOrderChangeWorkflowOutputSchema = z.void()

export type CancelOrderChangeWorkflowInput = z.infer<
  typeof cancelOrderChangeWorkflowInputSchema
>
export type CancelOrderChangeWorkflowOutput = z.infer<
  typeof cancelOrderChangeWorkflowOutputSchema
>

/**
 * Schema for CancelOrderFulfillmentWorkflowInput
 */
export const cancelOrderFulfillmentWorkflowInputSchema = z
  .object({
    order_id: z.string(),
    fulfillment_id: z.string(),
    no_notification: z.boolean().optional(),
  })
  .and(
    z.object({
      additional_data: z.record(z.unknown()).optional(),
    })
  )

/**
 * Schema for CancelOrderFulfillmentWorkflowOutput
 */
export const cancelOrderFulfillmentWorkflowOutputSchema = z.void()

export type CancelOrderFulfillmentWorkflowInput = z.infer<
  typeof cancelOrderFulfillmentWorkflowInputSchema
>
export type CancelOrderFulfillmentWorkflowOutput = z.infer<
  typeof cancelOrderFulfillmentWorkflowOutputSchema
>

/**
 * Schema for BeginOrderExchangeWorkflowInput
 */
export const beginOrderExchangeWorkflowInputSchema = z.object({
  order_id: z.string(),
  created_by: z.string().nullable().optional(),
  internal_note: z.string().optional(),
  description: z.string().optional(),
  metadata: z.record(z.unknown()).nullable().optional(),
})

/**
 * Schema for BeginOrderExchangeWorkflowOutput (OrderChangeDTO)
 */
export const beginOrderExchangeWorkflowOutputSchema = orderChangeDTOSchema

export type BeginOrderExchangeWorkflowInput = z.infer<
  typeof beginOrderExchangeWorkflowInputSchema
>
export type BeginOrderExchangeWorkflowOutput = z.infer<
  typeof beginOrderExchangeWorkflowOutputSchema
>

/**
 * Schema for CancelBeginOrderExchangeWorkflowInput
 */
export const cancelBeginOrderExchangeWorkflowInputSchema = z.object({
  exchange_id: z.string(),
})

/**
 * Schema for CancelBeginOrderExchangeWorkflowOutput - returns void
 */
export const cancelBeginOrderExchangeWorkflowOutputSchema = z.void()

export type CancelBeginOrderExchangeWorkflowInput = z.infer<
  typeof cancelBeginOrderExchangeWorkflowInputSchema
>
export type CancelBeginOrderExchangeWorkflowOutput = z.infer<
  typeof cancelBeginOrderExchangeWorkflowOutputSchema
>

/**
 * Schema for CancelOrderExchangeWorkflowInput
 */
export const cancelOrderExchangeWorkflowInputSchema = z.object({
  exchange_id: z.string(),
  no_notification: z.boolean().optional(),
  canceled_by: z.string().optional(),
})

/**
 * Schema for CancelOrderExchangeWorkflowOutput
 */
export const cancelOrderExchangeWorkflowOutputSchema = z.void()

export type CancelOrderExchangeWorkflowInput = z.infer<
  typeof cancelOrderExchangeWorkflowInputSchema
>
export type CancelOrderExchangeWorkflowOutput = z.infer<
  typeof cancelOrderExchangeWorkflowOutputSchema
>

/**
 * Schema for BeginOrderReturnWorkflowInput
 */
export const beginOrderReturnWorkflowInputSchema = z.object({
  order_id: z.string(),
  location_id: z.string().optional(),
  created_by: z.string().nullable().optional(),
  internal_note: z.string().optional(),
  description: z.string().optional(),
  metadata: z.record(z.unknown()).nullable().optional(),
})

/**
 * Schema for BeginOrderReturnWorkflowOutput (OrderChangeDTO)
 */
export const beginOrderReturnWorkflowOutputSchema = orderChangeDTOSchema

export type BeginOrderReturnWorkflowInput = z.infer<
  typeof beginOrderReturnWorkflowInputSchema
>
export type BeginOrderReturnWorkflowOutput = z.infer<
  typeof beginOrderReturnWorkflowOutputSchema
>

/**
 * Schema for BeginOrderClaimWorkflowInput
 */
export const beginOrderClaimWorkflowInputSchema = z.object({
  order_id: z.string(),
  type: z.enum(["replace", "refund"]),
  created_by: z.string().nullable().optional(),
  internal_note: z.string().optional(),
  description: z.string().optional(),
  metadata: z.record(z.unknown()).nullable().optional(),
})

/**
 * Schema for BeginOrderClaimWorkflowOutput (OrderChangeDTO)
 */
export const beginOrderClaimWorkflowOutputSchema = orderChangeDTOSchema

export type BeginOrderClaimWorkflowInput = z.infer<
  typeof beginOrderClaimWorkflowInputSchema
>
export type BeginOrderClaimWorkflowOutput = z.infer<
  typeof beginOrderClaimWorkflowOutputSchema
>

/**
 * Schema for CancelBeginOrderClaimWorkflowInput
 */
export const cancelBeginOrderClaimWorkflowInputSchema = z.object({
  claim_id: z.string(),
})

/**
 * Schema for CancelBeginOrderClaimWorkflowOutput - returns void
 */
export const cancelBeginOrderClaimWorkflowOutputSchema = z.void()

export type CancelBeginOrderClaimWorkflowInput = z.infer<
  typeof cancelBeginOrderClaimWorkflowInputSchema
>
export type CancelBeginOrderClaimWorkflowOutput = z.infer<
  typeof cancelBeginOrderClaimWorkflowOutputSchema
>

/**
 * Schema for CancelOrderClaimWorkflowInput
 */
export const cancelOrderClaimWorkflowInputSchema = z.object({
  claim_id: z.string(),
  no_notification: z.boolean().optional(),
  canceled_by: z.string().optional(),
})

/**
 * Schema for CancelOrderClaimWorkflowOutput
 */
export const cancelOrderClaimWorkflowOutputSchema = z.void()

export type CancelOrderClaimWorkflowInput = z.infer<
  typeof cancelOrderClaimWorkflowInputSchema
>
export type CancelOrderClaimWorkflowOutput = z.infer<
  typeof cancelOrderClaimWorkflowOutputSchema
>

/**
 * Schema for OrderShippingMethodDTO
 */
const orderShippingMethodDTOSchema = z.object({
  id: z.string(),
  order_id: z.string(),
  name: z.string(),
  description: z.string().optional(),
  amount: bigNumberValueSchema,
  raw_amount: bigNumberRawValueSchema,
  is_tax_inclusive: z.boolean(),
  shipping_option_id: z.string().optional(),
  data: z.record(z.unknown()).optional(),
  metadata: z.record(z.unknown()).nullable().optional(),
  tax_lines: z.array(z.any()).optional(),
  adjustments: z.array(z.any()).optional(),
  created_at: z.union([z.date(), z.string()]),
  updated_at: z.union([z.date(), z.string()]),
  original_total: bigNumberValueSchema,
  original_subtotal: bigNumberValueSchema,
  original_tax_total: bigNumberValueSchema,
  total: bigNumberValueSchema,
  subtotal: bigNumberValueSchema,
  tax_total: bigNumberValueSchema,
  discount_total: bigNumberValueSchema,
  discount_tax_total: bigNumberValueSchema,
  raw_original_total: bigNumberRawValueSchema,
  raw_original_subtotal: bigNumberRawValueSchema,
  raw_original_tax_total: bigNumberRawValueSchema,
  raw_total: bigNumberRawValueSchema,
  raw_subtotal: bigNumberRawValueSchema,
  raw_tax_total: bigNumberRawValueSchema,
  raw_discount_total: bigNumberRawValueSchema,
  raw_discount_tax_total: bigNumberRawValueSchema,
})

/**
 * Schema for OrderPreviewDTO
 */
const orderPreviewDTOSchema = orderDTOSchema
  .omit({ items: true, shipping_methods: true })
  .extend({
    order_change: orderChangeDTOSchema,
    items: z.array(
      orderLineItemDTOSchema.extend({
        actions: z.array(orderChangeActionDTOSchema).optional(),
      })
    ),
    shipping_methods: z.array(
      orderShippingMethodDTOSchema.extend({
        actions: z.array(orderChangeActionDTOSchema).optional(),
      })
    ),
    return_requested_total: z.number(),
  })

/**
 * Schema for OrderClaimAddNewItemWorkflowInput
 */
export const orderClaimAddNewItemWorkflowInputSchema = z.object({
  claim_id: z.string(),
  items: z.array(newItemSchema),
})

/**
 * Schema for OrderClaimAddNewItemWorkflowOutput (OrderPreviewDTO)
 */
export const orderClaimAddNewItemWorkflowOutputSchema = orderPreviewDTOSchema

export type OrderClaimAddNewItemWorkflowInput = z.infer<
  typeof orderClaimAddNewItemWorkflowInputSchema
>
export type OrderClaimAddNewItemWorkflowOutput = z.infer<
  typeof orderClaimAddNewItemWorkflowOutputSchema
>

/**
 * Schema for OrderClaimItemWorkflowInput
 */
export const orderClaimItemWorkflowInputSchema = z.object({
  claim_id: z.string(),
  items: z.array(
    z.object({
      id: z.string(),
      quantity: bigNumberInputSchema,
      internal_note: z.string().nullable().optional(),
      reason: z
        .enum(["missing_item", "wrong_item", "production_failure", "other"])
        .optional(),
    })
  ),
})

/**
 * Schema for OrderClaimItemWorkflowOutput (OrderPreviewDTO)
 */
export const orderClaimItemWorkflowOutputSchema = orderPreviewDTOSchema

export type OrderClaimItemWorkflowInput = z.infer<
  typeof orderClaimItemWorkflowInputSchema
>
export type OrderClaimItemWorkflowOutput = z.infer<
  typeof orderClaimItemWorkflowOutputSchema
>

/**
 * Schema for OrderClaimRequestItemReturnWorkflowInput
 */
export const orderClaimRequestItemReturnWorkflowInputSchema = z.object({
  claim_id: z.string(),
  return_id: z.string(),
  items: z.array(
    z.object({
      id: z.string(),
      quantity: bigNumberInputSchema,
      metadata: z.record(z.any()).nullable().optional(),
      reason_id: z.string().nullable().optional(),
      internal_note: z.string().nullable().optional(),
    })
  ),
})

/**
 * Schema for OrderClaimRequestItemReturnWorkflowOutput (OrderPreviewDTO)
 */
export const orderClaimRequestItemReturnWorkflowOutputSchema =
  orderPreviewDTOSchema

export type OrderClaimRequestItemReturnWorkflowInput = z.infer<
  typeof orderClaimRequestItemReturnWorkflowInputSchema
>
export type OrderClaimRequestItemReturnWorkflowOutput = z.infer<
  typeof orderClaimRequestItemReturnWorkflowOutputSchema
>

/**
 * Schema for RefreshClaimShippingWorkflowInput
 */
export const refreshClaimShippingWorkflowInputSchema = z.object({
  order_change_id: z.string(),
  claim_id: z.string(),
  order_id: z.string(),
})

/**
 * Schema for RefreshClaimShippingWorkflowOutput
 */
export const refreshClaimShippingWorkflowOutputSchema = z.void()

export type RefreshClaimShippingWorkflowInput = z.infer<
  typeof refreshClaimShippingWorkflowInputSchema
>
export type RefreshClaimShippingWorkflowOutput = z.infer<
  typeof refreshClaimShippingWorkflowOutputSchema
>

/**
 * Schema for CreateOrderPaymentCollectionWorkflowInput
 */
export const createOrderPaymentCollectionWorkflowInputSchema = z.object({
  order_id: z.string(),
  amount: z.number(),
})

/**
 * Schema for CreateOrderPaymentCollectionWorkflowOutput
 */
export const createOrderPaymentCollectionWorkflowOutputSchema = z.any() // PaymentCollectionDTO

export type CreateOrderPaymentCollectionWorkflowInput = z.infer<
  typeof createOrderPaymentCollectionWorkflowInputSchema
>
export type CreateOrderPaymentCollectionWorkflowOutput = z.infer<
  typeof createOrderPaymentCollectionWorkflowOutputSchema
>

/**
 * Schema for DeleteOrderPaymentCollectionsInput
 */
export const deleteOrderPaymentCollectionsInputSchema = z.object({
  id: z.string(),
})

/**
 * Schema for DeleteOrderPaymentCollectionsOutput
 */
export const deleteOrderPaymentCollectionsOutputSchema = z.void()

export type DeleteOrderPaymentCollectionsInput = z.infer<
  typeof deleteOrderPaymentCollectionsInputSchema
>
export type DeleteOrderPaymentCollectionsOutput = z.infer<
  typeof deleteOrderPaymentCollectionsOutputSchema
>

/**
 * Schema for MarkPaymentCollectionAsPaidInput
 */
export const markPaymentCollectionAsPaidInputSchema = z.object({
  payment_collection_id: z.string(),
  captured_by: z.string().optional(),
  order_id: z.string(),
})

/**
 * Schema for MarkPaymentCollectionAsPaidOutput
 */
export const markPaymentCollectionAsPaidOutputSchema = z.any() // PaymentCollectionDTO

export type MarkPaymentCollectionAsPaidInput = z.infer<
  typeof markPaymentCollectionAsPaidInputSchema
>
export type MarkPaymentCollectionAsPaidOutput = z.infer<
  typeof markPaymentCollectionAsPaidOutputSchema
>

/**
 * Schema for CalculateShippingItems
 */
const calculateShippingItemsSchema = z.object({
  id: z.string(),
  quantity: bigNumberInputSchema,
})

/**
 * Schema for CalculatedRMAShippingContext
 */
const calculatedRMAShippingContextSchema = z.union([
  z.object({
    return_id: z.string(),
    return_items: z.array(calculateShippingItemsSchema),
  }),
  z.object({
    exchange_id: z.string(),
    exchange_items: z.array(calculateShippingItemsSchema),
  }),
  z.object({
    claim_id: z.string(),
    claim_items: z.array(calculateShippingItemsSchema),
  }),
])

/**
 * Schema for MaybeRefreshShippingMethodsWorkflowInput
 */
export const maybeRefreshShippingMethodsWorkflowInputSchema = z.object({
  shipping_method_id: z.string(),
  order_id: z.string(),
  action_id: z.string(),
  context: calculatedRMAShippingContextSchema,
})

/**
 * Schema for MaybeRefreshShippingMethodsWorkflowOutput
 */
export const maybeRefreshShippingMethodsWorkflowOutputSchema = z.void()

export type MaybeRefreshShippingMethodsWorkflowInput = z.infer<
  typeof maybeRefreshShippingMethodsWorkflowInputSchema
>
export type MaybeRefreshShippingMethodsWorkflowOutput = z.infer<
  typeof maybeRefreshShippingMethodsWorkflowOutputSchema
>

/**
 * Schema for CancelReturnWorkflowInput
 */
export const cancelReturnWorkflowInputSchema = z.object({
  return_id: z.string(),
  no_notification: z.boolean().optional(),
  canceled_by: z.string().optional(),
})

/**
 * Schema for CancelReturnWorkflowOutput
 */
export const cancelReturnWorkflowOutputSchema = z.void()

export type CancelReturnWorkflowInput = z.infer<
  typeof cancelReturnWorkflowInputSchema
>
export type CancelReturnWorkflowOutput = z.infer<
  typeof cancelReturnWorkflowOutputSchema
>

/**
 * Schema for UpdateOrderTaxLinesWorkflowInput
 */
export const updateOrderTaxLinesWorkflowInputSchema = z.object({
  order_id: z.string(),
  item_ids: z.array(z.string()).optional(),
  shipping_method_ids: z.array(z.string()).optional(),
  force_tax_calculation: z.boolean().optional(),
  is_return: z.boolean().optional(),
  shipping_address: orderAddressDTOSchema.optional(),
})

/**
 * Schema for UpdateOrderTaxLinesWorkflowOutput
 */
export const updateOrderTaxLinesWorkflowOutputSchema = z.void()

export type UpdateOrderTaxLinesWorkflowInput = z.infer<
  typeof updateOrderTaxLinesWorkflowInputSchema
>
export type UpdateOrderTaxLinesWorkflowOutput = z.infer<
  typeof updateOrderTaxLinesWorkflowOutputSchema
>

/**
 * Schema for ConfirmExchangeRequestWorkflowInput
 */
export const confirmExchangeRequestWorkflowInputSchema = z.object({
  exchange_id: z.string(),
  confirmed_by: z.string().optional(),
})

/**
 * Schema for ConfirmExchangeRequestWorkflowOutput (OrderPreviewDTO)
 */
export const confirmExchangeRequestWorkflowOutputSchema = orderPreviewDTOSchema

export type ConfirmExchangeRequestWorkflowInput = z.infer<
  typeof confirmExchangeRequestWorkflowInputSchema
>
export type ConfirmExchangeRequestWorkflowOutput = z.infer<
  typeof confirmExchangeRequestWorkflowOutputSchema
>

/**
 * Schema for CreateOrUpdateOrderPaymentCollectionWorkflowInput
 */
export const createOrUpdateOrderPaymentCollectionWorkflowInputSchema = z.object(
  {
    order_id: z.string(),
    amount: z.number().optional(),
  }
)

/**
 * Schema for CreateOrUpdateOrderPaymentCollectionWorkflowOutput (PaymentCollectionDTO[])
 */
export const createOrUpdateOrderPaymentCollectionWorkflowOutputSchema = z.any() // PaymentCollectionDTO[]

export type CreateOrUpdateOrderPaymentCollectionWorkflowInput = z.infer<
  typeof createOrUpdateOrderPaymentCollectionWorkflowInputSchema
>
export type CreateOrUpdateOrderPaymentCollectionWorkflowOutput = z.infer<
  typeof createOrUpdateOrderPaymentCollectionWorkflowOutputSchema
>

/**
 * Schema for ConfirmClaimRequestWorkflowInput
 */
export const confirmClaimRequestWorkflowInputSchema = z.object({
  claim_id: z.string(),
  confirmed_by: z.string().optional(),
})

/**
 * Schema for ConfirmClaimRequestWorkflowOutput (OrderPreviewDTO)
 */
export const confirmClaimRequestWorkflowOutputSchema = orderPreviewDTOSchema

export type ConfirmClaimRequestWorkflowInput = z.infer<
  typeof confirmClaimRequestWorkflowInputSchema
>
export type ConfirmClaimRequestWorkflowOutput = z.infer<
  typeof confirmClaimRequestWorkflowOutputSchema
>

/**
 * Schema for CreateClaimShippingMethodWorkflowInput
 */
export const createClaimShippingMethodWorkflowInputSchema = z.object({
  return_id: z.string().optional(),
  claim_id: z.string().optional(),
  shipping_option_id: z.string(),
  custom_amount: bigNumberInputSchema.nullable().optional(),
})

/**
 * Schema for CreateClaimShippingMethodWorkflowOutput (OrderPreviewDTO)
 */
export const createClaimShippingMethodWorkflowOutputSchema =
  orderPreviewDTOSchema

export type CreateClaimShippingMethodWorkflowInput = z.infer<
  typeof createClaimShippingMethodWorkflowInputSchema
>
export type CreateClaimShippingMethodWorkflowOutput = z.infer<
  typeof createClaimShippingMethodWorkflowOutputSchema
>

/**
 * Schema for CreateExchangeShippingMethodWorkflowInput
 */
export const createExchangeShippingMethodWorkflowInputSchema = z.object({
  return_id: z.string().optional(),
  exchange_id: z.string().optional(),
  shipping_option_id: z.string(),
  custom_amount: bigNumberInputSchema.nullable().optional(),
})

/**
 * Schema for CreateExchangeShippingMethodWorkflowOutput (OrderPreviewDTO)
 */
export const createExchangeShippingMethodWorkflowOutputSchema =
  orderPreviewDTOSchema

export type CreateExchangeShippingMethodWorkflowInput = z.infer<
  typeof createExchangeShippingMethodWorkflowInputSchema
>
export type CreateExchangeShippingMethodWorkflowOutput = z.infer<
  typeof createExchangeShippingMethodWorkflowOutputSchema
>

/**
 * Schema for FetchShippingOptionForOrderWorkflowInput
 */
export const fetchShippingOptionForOrderWorkflowInputSchema = z
  .object({
    shipping_option_id: z.string(),
    custom_amount: bigNumberInputSchema.nullable().optional(),
    currency_code: z.string(),
    order_id: z.string(),
    context: z.union([
      z.object({
        return_id: z.string(),
        return_items: z.array(
          z.object({
            id: z.string(),
            quantity: bigNumberInputSchema,
          })
        ),
      }),
      z.object({
        exchange_id: z.string(),
        exchange_items: z.array(
          z.object({
            id: z.string(),
            quantity: bigNumberInputSchema,
          })
        ),
      }),
      z.object({
        claim_id: z.string(),
        claim_items: z.array(
          z.object({
            id: z.string(),
            quantity: bigNumberInputSchema,
          })
        ),
      }),
    ]),
  })
  .and(
    z.object({
      additional_data: z.record(z.unknown()).optional(),
    })
  )

const shippingProfileDTOSchema = z.object({
  id: z.string(),
  name: z.string(),
  type: z.string(),
  shipping_options: z.array(z.any()),
  created_at: z.date(),
  updated_at: z.date(),
  deleted_at: z.date().nullable(),
  metadata: z.record(z.unknown()).nullable(),
})

const fulfillmentProviderDTOSchema = z.object({
  id: z.string(),
  name: z.string(),
  shipping_options: z.array(z.any()).optional(),
  created_at: z.date(),
  updated_at: z.date(),
  deleted_at: z.date().nullable(),
  metadata: z.record(z.unknown()).nullable(),
})

const fulfillmentSetDTOSchema = z.object({
  id: z.string(),
  type: z.string(),
  name: z.string(),
  service_zones: z.array(z.any()),
  // location: z.object({ -- removed for fetch-shipping-option incompat
  //   id: z.string(),
  //   address: z.record(z.unknown()),
  // }).optional(),
  created_at: z.date(),
  updated_at: z.date(),
  deleted_at: z.date().nullable(),
  metadata: z.record(z.unknown()).nullable(),
})

const serviceZoneDTOSchema = z.object({
  id: z.string(),
  name: z.string(),
  metadata: z.record(z.unknown()).nullable(),
  geo_zones: z.array(z.any()),
  shipping_options: z.array(z.any()),
  fulfillment_set_id: z.string(),
  fulfillment_set: fulfillmentSetDTOSchema,
  created_at: z.date(),
  updated_at: z.date(),
  deleted_at: z.date().nullable(),
})

const shippingOptionTypeDTOSchema = z.object({
  id: z.string(),
  label: z.string(),
  description: z.string(),
  code: z.string(),
  created_at: z.date(),
  updated_at: z.date(),
  deleted_at: z.date().nullable(),
  // metadata: z.record(z.unknown()).nullable(), -- removed because of incompat in fetch-shipping-option
})

/**
 * Schema for ShippingOptionDTO with calculated price
 * Based on the ShippingOptionDTO type with additional fields needed for order workflows
 */
export const shippingOptionDTOSchema = z.object({
  id: z.string(),
  name: z.string(),
  price_type: z.enum(["calculated", "flat"]),
  service_zone_id: z.string(),
  shipping_profile_id: z.string(),
  provider_id: z.string(),
  data: z.record(z.unknown()).nullable(),
  metadata: z.record(z.unknown()).nullable(),
  shipping_option_type_id: z.string().nullable(),
  shipping_profile: shippingProfileDTOSchema,
  fulfillment_provider: fulfillmentProviderDTOSchema,
  fulfillments: z.array(fulfillmentDTOSchema),
  type: shippingOptionTypeDTOSchema,
  rules: z.array(shippingOptionRuleDTOSchema),
  service_zone: serviceZoneDTOSchema,
  calculated_price: z
    .object({
      calculated_amount: bigNumberValueSchema,
      is_calculated_price_tax_inclusive: z.boolean(),
    })
    .optional(),
  created_at: z.date(),
  updated_at: z.date(),
  deleted_at: z.date().nullable(),
})

/**
 * Schema for FetchShippingOptionForOrderWorkflowOutput
 */
export const fetchShippingOptionForOrderWorkflowOutputSchema =
  shippingOptionDTOSchema.and(
    z.object({
      calculated_price: z.object({
        calculated_amount: bigNumberValueSchema,
        is_calculated_price_tax_inclusive: z.boolean(),
      }),
    })
  )

export type FetchShippingOptionForOrderWorkflowInput = z.infer<
  typeof fetchShippingOptionForOrderWorkflowInputSchema
>
export type FetchShippingOptionForOrderWorkflowOutput = z.infer<
  typeof fetchShippingOptionForOrderWorkflowOutputSchema
>

/**
 * Schema for RemoveClaimShippingMethodWorkflowInput
 */
export const removeClaimShippingMethodWorkflowInputSchema = z.object({
  claim_id: z.string(),
  action_id: z.string(),
})

/**
 * Schema for RemoveClaimShippingMethodWorkflowOutput (OrderPreviewDTO)
 */
export const removeClaimShippingMethodWorkflowOutputSchema =
  orderPreviewDTOSchema

export type RemoveClaimShippingMethodWorkflowInput = z.infer<
  typeof removeClaimShippingMethodWorkflowInputSchema
>
export type RemoveClaimShippingMethodWorkflowOutput = z.infer<
  typeof removeClaimShippingMethodWorkflowOutputSchema
>

/**
 * Schema for RemoveAddItemClaimActionWorkflowInput
 */
export const removeAddItemClaimActionWorkflowInputSchema = z.object({
  claim_id: z.string(),
  action_id: z.string(),
})

/**
 * Schema for RemoveAddItemClaimActionWorkflowOutput (OrderPreviewDTO)
 */
export const removeAddItemClaimActionWorkflowOutputSchema =
  orderPreviewDTOSchema

export type RemoveAddItemClaimActionWorkflowInput = z.infer<
  typeof removeAddItemClaimActionWorkflowInputSchema
>
export type RemoveAddItemClaimActionWorkflowOutput = z.infer<
  typeof removeAddItemClaimActionWorkflowOutputSchema
>

/**
 * Schema for RemoveItemClaimActionWorkflowInput
 */
export const removeItemClaimActionWorkflowInputSchema = z.object({
  claim_id: z.string(),
  action_id: z.string(),
})

/**
 * Schema for RemoveItemClaimActionWorkflowOutput (OrderPreviewDTO)
 */
export const removeItemClaimActionWorkflowOutputSchema = orderPreviewDTOSchema

export type RemoveItemClaimActionWorkflowInput = z.infer<
  typeof removeItemClaimActionWorkflowInputSchema
>
export type RemoveItemClaimActionWorkflowOutput = z.infer<
  typeof removeItemClaimActionWorkflowOutputSchema
>

/**
 * Schema for UpdateClaimAddItemWorkflowInput
 */
export const updateClaimAddItemWorkflowInputSchema = z.object({
  claim_id: z.string(),
  action_id: z.string(),
  data: z.object({
    quantity: bigNumberInputSchema.optional(),
    internal_note: z.string().optional(),
  }),
})

/**
 * Schema for UpdateClaimAddItemWorkflowOutput (OrderPreviewDTO)
 */
export const updateClaimAddItemWorkflowOutputSchema = orderPreviewDTOSchema

export type UpdateClaimAddItemWorkflowInput = z.infer<
  typeof updateClaimAddItemWorkflowInputSchema
>
export type UpdateClaimAddItemWorkflowOutput = z.infer<
  typeof updateClaimAddItemWorkflowOutputSchema
>

/**
 * Schema for UpdateClaimItemWorkflowInput
 */
export const updateClaimItemWorkflowInputSchema = z.object({
  claim_id: z.string(),
  action_id: z.string(),
  data: z.object({
    quantity: bigNumberInputSchema.optional(),
    internal_note: z.string().optional(),
  }),
})

/**
 * Schema for UpdateClaimItemWorkflowOutput (OrderPreviewDTO)
 */
export const updateClaimItemWorkflowOutputSchema = orderPreviewDTOSchema

export type UpdateClaimItemWorkflowInput = z.infer<
  typeof updateClaimItemWorkflowInputSchema
>
export type UpdateClaimItemWorkflowOutput = z.infer<
  typeof updateClaimItemWorkflowOutputSchema
>

/**
 * Schema for UpdateClaimShippingMethodWorkflowInput
 */
export const updateClaimShippingMethodWorkflowInputSchema = z
  .object({
    claim_id: z.string(),
    action_id: z.string(),
    data: z.object({
      custom_amount: z.union([bigNumberInputSchema, z.null()]).optional(),
      internal_note: z.string().nullable().optional(),
      metadata: z.record(z.any()).nullable().optional(),
    }),
  })
  .and(additionalDataSchema)

/**
 * Schema for UpdateClaimShippingMethodWorkflowOutput (OrderPreviewDTO)
 */
export const updateClaimShippingMethodWorkflowOutputSchema =
  orderPreviewDTOSchema

export type UpdateClaimShippingMethodWorkflowInput = z.infer<
  typeof updateClaimShippingMethodWorkflowInputSchema
>
export type UpdateClaimShippingMethodWorkflowOutput = z.infer<
  typeof updateClaimShippingMethodWorkflowOutputSchema
>

/**
 * Schema for CreateOrderFulfillmentWorkflowInput
 */
export const createOrderFulfillmentWorkflowInputSchema = z
  .object({
    order_id: z.string(),
    items: z.array(
      z.object({
        id: z.string(),
        quantity: bigNumberInputSchema,
      })
    ),
    items_list: z.array(orderLineItemDTOSchema).optional(),
    location_id: z.string().nullable().optional(),
    no_notification: z.boolean().optional(),
    metadata: z.record(z.unknown()).nullable().optional(),
    labels: z
      .array(
        z.object({
          tracking_number: z.string(),
          tracking_url: z.string(),
          label_url: z.string(),
        })
      )
      .optional(),
    created_by: z.string().optional(),
    shipping_option_id: z.string().optional(),
  })
  .and(additionalDataSchema)

/**
 * Schema for CreateOrderFulfillmentWorkflowOutput (FulfillmentDTO)
 */
export const createOrderFulfillmentWorkflowOutputSchema = fulfillmentDTOSchema

export type CreateOrderFulfillmentWorkflowInput = z.infer<
  typeof createOrderFulfillmentWorkflowInputSchema
>
export type CreateOrderFulfillmentWorkflowOutput = z.infer<
  typeof createOrderFulfillmentWorkflowOutputSchema
>

/**
 * Schema for OrderChangeType enum
 */
const orderChangeTypeSchema = z.enum([
  "return_request",
  "return_receive",
  "exchange",
  "claim",
  "edit",
  "credit_line",
])

/**
 * Schema for CreateOrderChangeDTO
 */
const createOrderChangeDTOSchema = z.object({
  order_id: z.string(),
  return_id: z.string().optional(),
  claim_id: z.string().optional(),
  exchange_id: z.string().optional(),
  change_type: orderChangeTypeSchema.optional(),
  description: z.string().optional(),
  internal_note: z.string().nullable().optional(),
  requested_by: z.string().optional(),
  requested_at: z.date().optional(),
  created_by: z.string().nullable().optional(),
})

/**
 * Schema for CreateOrderChangeWorkflowInput
 */
export const createOrderChangeWorkflowInputSchema = createOrderChangeDTOSchema

/**
 * Schema for CreateOrderChangeWorkflowOutput (OrderChangeDTO)
 */
export const createOrderChangeWorkflowOutputSchema = orderChangeDTOSchema

export type CreateOrderChangeWorkflowInput = z.infer<
  typeof createOrderChangeWorkflowInputSchema
>
export type CreateOrderChangeWorkflowOutput = z.infer<
  typeof createOrderChangeWorkflowOutputSchema
>

/**
 * Schema for CreateOrderShipmentWorkflowInput
 */
export const createOrderShipmentWorkflowInputSchema = z
  .object({
    order_id: z.string(),
    fulfillment_id: z.string(),
    items: z.array(
      z.object({
        id: z.string(),
        quantity: bigNumberInputSchema,
      })
    ),
    labels: z
      .array(
        z.object({
          tracking_number: z.string(),
          tracking_url: z.string(),
          label_url: z.string(),
        })
      )
      .optional(),
    no_notification: z.boolean().optional(),
    created_by: z.string().optional(),
  })
  .and(additionalDataSchema)

/**
 * Schema for CreateOrderShipmentWorkflowOutput (void)
 */
export const createOrderShipmentWorkflowOutputSchema = z.void()

export type CreateOrderShipmentWorkflowInput = z.infer<
  typeof createOrderShipmentWorkflowInputSchema
>
export type CreateOrderShipmentWorkflowOutput = z.infer<
  typeof createOrderShipmentWorkflowOutputSchema
>

/**
 * Schema for DeclineOrderChangeDTO
 */
const declineOrderChangeDTOSchema = z.object({
  id: z.string(),
  declined_by: z.string().optional(),
})

/**
 * Schema for DeclineOrderChangeWorkflowInput
 */
export const declineOrderChangeWorkflowInputSchema = declineOrderChangeDTOSchema

/**
 * Schema for DeclineOrderChangeWorkflowOutput (void)
 */
export const declineOrderChangeWorkflowOutputSchema = z.void()

export type DeclineOrderChangeWorkflowInput = z.infer<
  typeof declineOrderChangeWorkflowInputSchema
>
export type DeclineOrderChangeWorkflowOutput = z.infer<
  typeof declineOrderChangeWorkflowOutputSchema
>

/**
 * Schema for DeleteOrderChangeWorkflowInput
 */
export const deleteOrderChangeWorkflowInputSchema = z.object({
  ids: z.array(z.string()),
})

/**
 * Schema for DeleteOrderChangeWorkflowOutput (void)
 */
export const deleteOrderChangeWorkflowOutputSchema = z.void()

export type DeleteOrderChangeWorkflowInput = z.infer<
  typeof deleteOrderChangeWorkflowInputSchema
>
export type DeleteOrderChangeWorkflowOutput = z.infer<
  typeof deleteOrderChangeWorkflowOutputSchema
>

/**
 * Schema for RefreshExchangeShippingWorkflowInput
 */
export const refreshExchangeShippingWorkflowInputSchema = z.object({
  order_change_id: z.string(),
  exchange_id: z.string(),
  order_id: z.string(),
})

/**
 * Schema for RefreshExchangeShippingWorkflowOutput (void)
 */
export const refreshExchangeShippingWorkflowOutputSchema = z.void()

/**
 * Schema for OrderExchangeAddNewItemWorkflowInput
 */
export const orderExchangeAddNewItemWorkflowInputSchema = z.object({
  exchange_id: z.string(),
  items: z.array(
    z.object({
      variant_id: z.string(),
      quantity: bigNumberInputSchema,
      unit_price: bigNumberInputSchema.optional(),
      internal_note: z.string().optional(),
      allow_backorder: z.boolean().optional(),
      metadata: z.record(z.unknown()).nullable().optional(),
    })
  ),
})

/**
 * Schema for OrderExchangeAddNewItemWorkflowOutput
 */
export const orderExchangeAddNewItemWorkflowOutputSchema = orderPreviewDTOSchema

/**
 * Schema for OrderExchangeRequestItemReturnWorkflowInput
 */
export const orderExchangeRequestItemReturnWorkflowInputSchema = z.object({
  return_id: z.string(),
  exchange_id: z.string(),
  items: z.array(
    z.object({
      id: z.string(),
      quantity: bigNumberInputSchema,
      description: z.string().optional(),
      internal_note: z.string().optional(),
      reason_id: z.string().nullable().optional(),
      metadata: z.record(z.unknown()).nullable().optional(),
    })
  ),
})

/**
 * Schema for OrderExchangeRequestItemReturnWorkflowOutput
 */
export const orderExchangeRequestItemReturnWorkflowOutputSchema =
  orderPreviewDTOSchema

/**
 * Schema for DeleteExchangeShippingMethodWorkflowInput
 */
export const deleteExchangeShippingMethodWorkflowInputSchema = z.object({
  exchange_id: z.string(),
  action_id: z.string(),
})

/**
 * Schema for DeleteExchangeShippingMethodWorkflowOutput
 */
export const deleteExchangeShippingMethodWorkflowOutputSchema =
  orderPreviewDTOSchema

/**
 * Schema for DeleteOrderExchangeItemActionWorkflowInput
 */
export const deleteOrderExchangeItemActionWorkflowInputSchema = z.object({
  exchange_id: z.string(),
  action_id: z.string(),
})

/**
 * Schema for DeleteOrderExchangeItemActionWorkflowOutput
 */
export const deleteOrderExchangeItemActionWorkflowOutputSchema =
  orderPreviewDTOSchema

/**
 * Schema for UpdateExchangeAddNewItemWorkflowInput
 */
export const updateExchangeAddNewItemWorkflowInputSchema = z.object({
  exchange_id: z.string(),
  action_id: z.string(),
  data: z.object({
    quantity: bigNumberInputSchema.optional(),
    internal_note: z.string().nullable().optional(),
  }),
})

/**
 * Schema for UpdateExchangeAddNewItemWorkflowOutput
 */
export const updateExchangeAddNewItemWorkflowOutputSchema =
  orderPreviewDTOSchema

/**
 * Schema for UpdateExchangeShippingMethodWorkflowInput
 */
export const updateExchangeShippingMethodWorkflowInputSchema = z
  .object({
    exchange_id: z.string(),
    action_id: z.string(),
    data: z.object({
      custom_amount: bigNumberInputSchema.nullable().optional(),
      internal_note: z.string().nullable().optional(),
      metadata: z.record(z.unknown()).nullable().optional(),
    }),
  })
  .and(additionalDataSchema)

/**
 * Schema for UpdateExchangeShippingMethodWorkflowOutput
 */
export const updateExchangeShippingMethodWorkflowOutputSchema =
  orderPreviewDTOSchema

export type RefreshExchangeShippingWorkflowInput = z.infer<
  typeof refreshExchangeShippingWorkflowInputSchema
>
export type RefreshExchangeShippingWorkflowOutput = z.infer<
  typeof refreshExchangeShippingWorkflowOutputSchema
>
export type OrderExchangeAddNewItemWorkflowInput = z.infer<
  typeof orderExchangeAddNewItemWorkflowInputSchema
>
export type OrderExchangeAddNewItemWorkflowOutput = z.infer<
  typeof orderExchangeAddNewItemWorkflowOutputSchema
>
export type OrderExchangeRequestItemReturnWorkflowInput = z.infer<
  typeof orderExchangeRequestItemReturnWorkflowInputSchema
>
export type OrderExchangeRequestItemReturnWorkflowOutput = z.infer<
  typeof orderExchangeRequestItemReturnWorkflowOutputSchema
>
export type DeleteExchangeShippingMethodWorkflowInput = z.infer<
  typeof deleteExchangeShippingMethodWorkflowInputSchema
>
export type DeleteExchangeShippingMethodWorkflowOutput = z.infer<
  typeof deleteExchangeShippingMethodWorkflowOutputSchema
>
export type DeleteOrderExchangeItemActionWorkflowInput = z.infer<
  typeof deleteOrderExchangeItemActionWorkflowInputSchema
>
export type DeleteOrderExchangeItemActionWorkflowOutput = z.infer<
  typeof deleteOrderExchangeItemActionWorkflowOutputSchema
>
export type UpdateExchangeAddNewItemWorkflowInput = z.infer<
  typeof updateExchangeAddNewItemWorkflowInputSchema
>
export type UpdateExchangeAddNewItemWorkflowOutput = z.infer<
  typeof updateExchangeAddNewItemWorkflowOutputSchema
>
export type UpdateExchangeShippingMethodWorkflowInput = z.infer<
  typeof updateExchangeShippingMethodWorkflowInputSchema
>
export type UpdateExchangeShippingMethodWorkflowOutput = z.infer<
  typeof updateExchangeShippingMethodWorkflowOutputSchema
>

/**
 * Schema for GetOrderDetailWorkflowInput
 */
export const getOrderDetailWorkflowInputSchema = z.object({
  filters: z
    .object({
      is_draft_order: z.boolean().optional(),
      customer_id: z.string().optional(),
    })
    .optional(),
  fields: z.array(z.string()),
  order_id: z.string(),
  version: z.number().optional(),
})

/**
 * Schema for OrderDetailDTO (extending OrderDTO)
 */
export const orderDetailDTOSchema = orderDTOSchema.extend({
  payment_status: z.string(),
  fulfillment_status: z.string(),
})

/**
 * Schema for GetOrderDetailWorkflowOutput
 */
export const getOrderDetailWorkflowOutputSchema = orderDetailDTOSchema

export type GetOrderDetailWorkflowInput = z.infer<
  typeof getOrderDetailWorkflowInputSchema
>
export type GetOrderDetailWorkflowOutput = z.infer<
  typeof getOrderDetailWorkflowOutputSchema
>

/**
 * Schema for GetOrdersListWorkflowInput
 */
export const getOrdersListWorkflowInputSchema = z.object({
  fields: z.array(z.string()),
  variables: z
    .record(z.unknown())
    .and(
      z.object({
        skip: z.number().optional(),
        take: z.number().optional(),
        order: z.record(z.string()).optional(),
      })
    )
    .optional(),
})

/**
 * Schema for GetOrdersListWorkflowOutput
 */
export const getOrdersListWorkflowOutputSchema = z.union([
  z.array(orderDTOSchema),
  z.object({
    rows: z.array(orderDTOSchema),
    metadata: z.object({
      count: z.number(),
      skip: z.number(),
      take: z.number(),
    }),
  }),
])

export type GetOrdersListWorkflowInput = z.infer<
  typeof getOrdersListWorkflowInputSchema
>
export type GetOrdersListWorkflowOutput = z.infer<
  typeof getOrdersListWorkflowOutputSchema
>

/**
 * Schema for MarkOrderFulfillmentAsDeliveredWorkflowInput
 */
export const markOrderFulfillmentAsDeliveredWorkflowInputSchema = z.object({
  orderId: z.string(),
  fulfillmentId: z.string(),
})

/**
 * Schema for MarkOrderFulfillmentAsDeliveredWorkflowOutput (void)
 */
export const markOrderFulfillmentAsDeliveredWorkflowOutputSchema = z.void()

export type MarkOrderFulfillmentAsDeliveredWorkflowInput = z.infer<
  typeof markOrderFulfillmentAsDeliveredWorkflowInputSchema
>
export type MarkOrderFulfillmentAsDeliveredWorkflowOutput = z.infer<
  typeof markOrderFulfillmentAsDeliveredWorkflowOutputSchema
>

/**
 * Schema for BeginorderEditWorkflowInput
 */
export const beginorderEditWorkflowInputSchema = z.object({
  order_id: z.string(),
  created_by: z.string().optional(),
  description: z.string().optional(),
  internal_note: z.string().optional(),
})

/**
 * Schema for BeginorderEditWorkflowOutput (OrderChangeDTO)
 */
export const beginorderEditWorkflowOutputSchema = orderChangeDTOSchema

export type BeginorderEditWorkflowInput = z.infer<
  typeof beginorderEditWorkflowInputSchema
>
export type BeginorderEditWorkflowOutput = z.infer<
  typeof beginorderEditWorkflowOutputSchema
>

/**
 * Schema for CancelBeginOrderEditWorkflowInput
 */
export const cancelBeginOrderEditWorkflowInputSchema = z.object({
  order_id: z.string(),
})

/**
 * Schema for CancelBeginOrderEditWorkflowOutput (void)
 */
export const cancelBeginOrderEditWorkflowOutputSchema = z.void()

export type CancelBeginOrderEditWorkflowInput = z.infer<
  typeof cancelBeginOrderEditWorkflowInputSchema
>
export type CancelBeginOrderEditWorkflowOutput = z.infer<
  typeof cancelBeginOrderEditWorkflowOutputSchema
>

/**
 * Schema for ConfirmOrderEditRequestWorkflowInput
 */
export const confirmOrderEditRequestWorkflowInputSchema = z.object({
  order_id: z.string(),
  confirmed_by: z.string().optional(),
})

/**
 * Schema for ConfirmOrderEditRequestWorkflowOutput
 */
export const confirmOrderEditRequestWorkflowOutputSchema = orderPreviewDTOSchema

export type ConfirmOrderEditRequestWorkflowInput = z.infer<
  typeof confirmOrderEditRequestWorkflowInputSchema
>
export type ConfirmOrderEditRequestWorkflowOutput = z.infer<
  typeof confirmOrderEditRequestWorkflowOutputSchema
>

/**
 * Schema for CreateOrderEditShippingMethodWorkflowInput
 */
export const createOrderEditShippingMethodWorkflowInputSchema = z
  .object({
    order_id: z.string(),
    shipping_option_id: z.string(),
    custom_amount: bigNumberInputSchema.nullable().optional(),
  })
  .and(additionalDataSchema)

/**
 * Schema for CreateOrderEditShippingMethodWorkflowOutput
 */
export const createOrderEditShippingMethodWorkflowOutputSchema =
  orderPreviewDTOSchema

export type CreateOrderEditShippingMethodWorkflowInput = z.infer<
  typeof createOrderEditShippingMethodWorkflowInputSchema
>
export type CreateOrderEditShippingMethodWorkflowOutput = z.infer<
  typeof createOrderEditShippingMethodWorkflowOutputSchema
>

/**
 * Schema for OrderEditAddNewItemWorkflowInput
 */
export const orderEditAddNewItemWorkflowInputSchema = z.object({
  order_id: z.string(),
  items: z.array(
    z.object({
      variant_id: z.string(),
      quantity: bigNumberInputSchema,
      unit_price: bigNumberInputSchema.optional(),
      compare_at_unit_price: bigNumberInputSchema.optional(),
      internal_note: z.string().optional(),
      allow_backorder: z.boolean().optional(),
      metadata: z.record(z.unknown()).nullable().optional(),
    })
  ),
})

/**
 * Schema for OrderEditAddNewItemWorkflowOutput
 */
export const orderEditAddNewItemWorkflowOutputSchema = orderPreviewDTOSchema

export type OrderEditAddNewItemWorkflowInput = z.infer<
  typeof orderEditAddNewItemWorkflowInputSchema
>
export type OrderEditAddNewItemWorkflowOutput = z.infer<
  typeof orderEditAddNewItemWorkflowOutputSchema
>

/**
 * Schema for OrderEditUpdateItemQuantityWorkflowInput
 */
export const orderEditUpdateItemQuantityWorkflowInputSchema = z.object({
  order_id: z.string(),
  items: z.array(
    z.object({
      id: z.string(),
      quantity: bigNumberInputSchema,
      unit_price: bigNumberInputSchema.nullable().optional(),
      compare_at_unit_price: bigNumberInputSchema.nullable().optional(),
      internal_note: z.string().nullable().optional(),
    })
  ),
})

/**
 * Schema for OrderEditUpdateItemQuantityWorkflowOutput
 */
export const orderEditUpdateItemQuantityWorkflowOutputSchema =
  orderPreviewDTOSchema

export type OrderEditUpdateItemQuantityWorkflowInput = z.infer<
  typeof orderEditUpdateItemQuantityWorkflowInputSchema
>
export type OrderEditUpdateItemQuantityWorkflowOutput = z.infer<
  typeof orderEditUpdateItemQuantityWorkflowOutputSchema
>

/**
 * Schema for DeleteOrderEditItemActionWorkflowInput
 */
export const deleteOrderEditItemActionWorkflowInputSchema = z.object({
  order_id: z.string(),
  action_id: z.string(),
})

/**
 * Schema for DeleteOrderEditItemActionWorkflowOutput
 */
export const deleteOrderEditItemActionWorkflowOutputSchema =
  orderPreviewDTOSchema

export type DeleteOrderEditItemActionWorkflowInput = z.infer<
  typeof deleteOrderEditItemActionWorkflowInputSchema
>
export type DeleteOrderEditItemActionWorkflowOutput = z.infer<
  typeof deleteOrderEditItemActionWorkflowOutputSchema
>

/**
 * Schema for DeleteOrderEditShippingMethodWorkflowInput
 */
export const deleteOrderEditShippingMethodWorkflowInputSchema = z.object({
  order_id: z.string(),
  action_id: z.string(),
})

/**
 * Schema for DeleteOrderEditShippingMethodWorkflowOutput
 */
export const deleteOrderEditShippingMethodWorkflowOutputSchema =
  orderPreviewDTOSchema

export type DeleteOrderEditShippingMethodWorkflowInput = z.infer<
  typeof deleteOrderEditShippingMethodWorkflowInputSchema
>
export type DeleteOrderEditShippingMethodWorkflowOutput = z.infer<
  typeof deleteOrderEditShippingMethodWorkflowOutputSchema
>

/**
 * Schema for OrderEditRequestWorkflowInput
 */
export const orderEditRequestWorkflowInputSchema = z.object({
  order_id: z.string(),
  requested_by: z.string().optional(),
})

/**
 * Schema for OrderEditRequestWorkflowOutput
 */
export const orderEditRequestWorkflowOutputSchema = orderPreviewDTOSchema

export type OrderEditRequestWorkflowInput = z.infer<
  typeof orderEditRequestWorkflowInputSchema
>
export type OrderEditRequestWorkflowOutput = z.infer<
  typeof orderEditRequestWorkflowOutputSchema
>

/**
 * Schema for UpdateOrderEditAddNewItemWorkflowInput
 */
export const updateOrderEditAddNewItemWorkflowInputSchema = z.object({
  order_id: z.string(),
  action_id: z.string(),
  data: z.object({
    quantity: bigNumberInputSchema.optional(),
    unit_price: bigNumberInputSchema.nullable().optional(),
    compare_at_unit_price: bigNumberInputSchema.nullable().optional(),
    internal_note: z.string().nullable().optional(),
  }),
})

/**
 * Schema for UpdateOrderEditAddNewItemWorkflowOutput
 */
export const updateOrderEditAddNewItemWorkflowOutputSchema =
  orderPreviewDTOSchema

export type UpdateOrderEditAddNewItemWorkflowInput = z.infer<
  typeof updateOrderEditAddNewItemWorkflowInputSchema
>
export type UpdateOrderEditAddNewItemWorkflowOutput = z.infer<
  typeof updateOrderEditAddNewItemWorkflowOutputSchema
>

/**
 * Schema for UpdateOrderEditItemQuantityWorkflowInput (extends UpdateOrderEditAddNewItemWorkflowInput)
 */
export const updateOrderEditItemQuantityWorkflowInputSchema =
  updateOrderEditAddNewItemWorkflowInputSchema

/**
 * Schema for UpdateOrderEditItemQuantityWorkflowOutput
 */
export const updateOrderEditItemQuantityWorkflowOutputSchema =
  orderPreviewDTOSchema

export type UpdateOrderEditItemQuantityWorkflowInput = z.infer<
  typeof updateOrderEditItemQuantityWorkflowInputSchema
>
export type UpdateOrderEditItemQuantityWorkflowOutput = z.infer<
  typeof updateOrderEditItemQuantityWorkflowOutputSchema
>

/**
 * Schema for UpdateOrderEditShippingMethodWorkflowInput
 */
export const updateOrderEditShippingMethodWorkflowInputSchema = z
  .object({
    order_id: z.string(),
    action_id: z.string(),
    data: z.object({
      custom_amount: bigNumberInputSchema.nullable().optional(),
      internal_note: z.string().nullable().optional(),
      metadata: z.record(z.any()).nullable().optional(),
    }),
  })
  .and(additionalDataSchema)

/**
 * Schema for UpdateOrderEditShippingMethodWorkflowOutput
 */
export const updateOrderEditShippingMethodWorkflowOutputSchema =
  orderPreviewDTOSchema

export type UpdateOrderEditShippingMethodWorkflowInput = z.infer<
  typeof updateOrderEditShippingMethodWorkflowInputSchema
>
export type UpdateOrderEditShippingMethodWorkflowOutput = z.infer<
  typeof updateOrderEditShippingMethodWorkflowOutputSchema
>

/**
 * Schema for BeginReceiveOrderReturnWorkflowInput
 */
export const beginReceiveOrderReturnWorkflowInputSchema = z.object({
  return_id: z.string(),
  created_by: z.string().optional(),
  description: z.string().optional(),
  internal_note: z.string().optional(),
})

/**
 * Schema for CreateAndCompleteReturnOrderWorkflowOutput
 */
export const createAndCompleteReturnOrderWorkflowOutputSchema = z.any() // ReturnDTO

export type CreateAndCompleteReturnOrderWorkflowOutput = z.infer<
  typeof createAndCompleteReturnOrderWorkflowOutputSchema
>

/**
 * Schema for BeginReceiveOrderReturnWorkflowOutput
 */
export const beginReceiveOrderReturnWorkflowOutputSchema = orderChangeDTOSchema

export type BeginReceiveOrderReturnWorkflowInput = z.infer<
  typeof beginReceiveOrderReturnWorkflowInputSchema
>
export type BeginReceiveOrderReturnWorkflowOutput = z.infer<
  typeof beginReceiveOrderReturnWorkflowOutputSchema
>

/**
 * Schema for CreateReturnItem
 */
const createReturnItemSchema = z.object({
  id: z.string(),
  quantity: bigNumberInputSchema,
  internal_note: z.string().nullable().optional(),
  reason_id: z.string().nullable().optional(),
  note: z.string().nullable().optional(),
  metadata: z.record(z.any()).nullable().optional(),
})

/**
 * Schema for ReceiveReturnItem
 */
const receiveReturnItemSchema = z.object({
  id: z.string(),
  quantity: bigNumberInputSchema,
  internal_note: z.string().optional(),
  metadata: z.record(z.any()).nullable().optional(),
})

/**
 * Schema for CreateOrderReturnWorkflowInput
 */
export const createOrderReturnWorkflowInputSchema = z.object({
  order_id: z.string(),
  created_by: z.string().nullable().optional(),
  items: z.array(createReturnItemSchema),
  return_shipping: z
    .object({
      option_id: z.string(),
      price: z.number().optional(),
      labels: z
        .array(
          z.object({
            tracking_number: z.string(),
            tracking_url: z.string(),
            label_url: z.string(),
          })
        )
        .optional(),
    })
    .optional(),
  note: z.string().nullable().optional(),
  receive_now: z.boolean().optional(),
  refund_amount: z.number().optional(),
  location_id: z.string().nullable().optional(),
})

/**
 * Schema for CreateOrderReturnWorkflowOutput (OrderPreviewDTO)
 */
export const createOrderReturnWorkflowOutputSchema = orderPreviewDTOSchema

export type CreateOrderReturnWorkflowInput = z.infer<
  typeof createOrderReturnWorkflowInputSchema
>
export type CreateOrderReturnWorkflowOutput = z.infer<
  typeof createOrderReturnWorkflowOutputSchema
>

/**
 * Schema for ReceiveOrderReturnItemsWorkflowInput
 */
export const receiveOrderReturnItemsWorkflowInputSchema = z.object({
  return_id: z.string(),
  items: z.array(receiveReturnItemSchema),
})

/**
 * Schema for ReceiveOrderReturnItemsWorkflowOutput (OrderPreviewDTO)
 */
export const receiveOrderReturnItemsWorkflowOutputSchema = orderPreviewDTOSchema

export type ReceiveOrderReturnItemsWorkflowInput = z.infer<
  typeof receiveOrderReturnItemsWorkflowInputSchema
>
export type ReceiveOrderReturnItemsWorkflowOutput = z.infer<
  typeof receiveOrderReturnItemsWorkflowOutputSchema
>

/**
 * Schema for ReceiveCompleteOrderReturnWorkflowInput
 */
export const receiveCompleteOrderReturnWorkflowInputSchema = z.object({
  return_id: z.string(),
  created_by: z.string().optional(),
  items: z.array(receiveReturnItemSchema),
  description: z.string().optional(),
  internal_note: z.string().optional(),
  metadata: z.record(z.any()).nullable().optional(),
})

/**
 * Schema for ReturnDTO (simplified for receive and complete return)
 */
export const returnDTOSchema = z.object({
  id: z.string(),
  status: z.string(),
  order_id: z.string(),
  items: z.array(z.any()).optional(),
  created_at: z.union([z.string(), z.date()]),
  updated_at: z.union([z.string(), z.date()]),
})

/**
 * Schema for ReceiveCompleteOrderReturnWorkflowOutput
 */
export const receiveCompleteOrderReturnWorkflowOutputSchema =
  returnDTOSchema.optional()

export type ReceiveCompleteOrderReturnWorkflowInput = z.infer<
  typeof receiveCompleteOrderReturnWorkflowInputSchema
>
export type ReceiveCompleteOrderReturnWorkflowOutput = z.infer<
  typeof receiveCompleteOrderReturnWorkflowOutputSchema
>

/**
 * Schema for DismissItemReturnRequestWorkflowInput
 */
export const dismissItemReturnRequestWorkflowInputSchema =
  receiveOrderReturnItemsWorkflowInputSchema
export const dismissItemReturnRequestWorkflowOutputSchema =
  orderPreviewDTOSchema

export type DismissItemReturnRequestWorkflowInput = z.infer<
  typeof dismissItemReturnRequestWorkflowInputSchema
>
export type DismissItemReturnRequestWorkflowOutput = z.infer<
  typeof dismissItemReturnRequestWorkflowOutputSchema
>

/**
 * Schema for ReceiveItemReturnRequestWorkflowInput
 */
export const receiveItemReturnRequestWorkflowInputSchema =
  receiveOrderReturnItemsWorkflowInputSchema
export const receiveItemReturnRequestWorkflowOutputSchema =
  orderPreviewDTOSchema

export type ReceiveItemReturnRequestWorkflowInput = z.infer<
  typeof receiveItemReturnRequestWorkflowInputSchema
>
export type ReceiveItemReturnRequestWorkflowOutput = z.infer<
  typeof receiveItemReturnRequestWorkflowOutputSchema
>

/**
 * Schema for ReceiveAndCompleteReturnOrderWorkflowOutput
 */
export const receiveAndCompleteReturnOrderWorkflowOutputSchema = z.any() // ReturnDTO | undefined

export type ReceiveAndCompleteReturnOrderWorkflowOutput = z.infer<
  typeof receiveAndCompleteReturnOrderWorkflowOutputSchema
>

/**
 * Schema for ConfirmReturnRequestWorkflowInput
 */
export const confirmReturnRequestWorkflowInputSchema = z.object({
  return_id: z.string(),
  confirmed_by: z.string().optional(),
})

/**
 * Schema for ConfirmReturnRequestWorkflowOutput (OrderPreviewDTO)
 */
export const confirmReturnRequestWorkflowOutputSchema = orderPreviewDTOSchema

export type ConfirmReturnRequestWorkflowInput = z.infer<
  typeof confirmReturnRequestWorkflowInputSchema
>
export type ConfirmReturnRequestWorkflowOutput = z.infer<
  typeof confirmReturnRequestWorkflowOutputSchema
>

/**
 * Schema for ConfirmReceiveReturnRequestWorkflowInput
 */
export const confirmReceiveReturnRequestWorkflowInputSchema = z.object({
  return_id: z.string(),
  confirmed_by: z.string().optional(),
})

/**
 * Schema for ConfirmReceiveReturnRequestWorkflowOutput (OrderPreviewDTO)
 */
export const confirmReceiveReturnRequestWorkflowOutputSchema =
  orderPreviewDTOSchema

export type ConfirmReceiveReturnRequestWorkflowInput = z.infer<
  typeof confirmReceiveReturnRequestWorkflowInputSchema
>
export type ConfirmReceiveReturnRequestWorkflowOutput = z.infer<
  typeof confirmReceiveReturnRequestWorkflowOutputSchema
>

/**
 * Schema for CreateReturnShippingMethodWorkflowInput
 */
export const createReturnShippingMethodWorkflowInputSchema = z.object({
  return_id: z.string(),
  claim_id: z.string().optional(),
  exchange_id: z.string().optional(),
  shipping_option_id: z.string(),
  custom_amount: bigNumberInputSchema.nullable().optional(),
})

/**
 * Schema for CreateReturnShippingMethodWorkflowOutput (OrderPreviewDTO)
 */
export const createReturnShippingMethodWorkflowOutputSchema =
  orderPreviewDTOSchema

export type CreateReturnShippingMethodWorkflowInput = z.infer<
  typeof createReturnShippingMethodWorkflowInputSchema
>
export type CreateReturnShippingMethodWorkflowOutput = z.infer<
  typeof createReturnShippingMethodWorkflowOutputSchema
>

/**
 * Schema for UpdateReturnWorkflowInput
 */
export const updateReturnWorkflowInputSchema = z.object({
  return_id: z.string(),
  location_id: z.string().nullable().optional(),
  no_notification: z.boolean().optional(),
  metadata: z.record(z.any()).nullable().optional(),
})

/**
 * Schema for UpdateReturnWorkflowOutput (OrderPreviewDTO)
 */
export const updateReturnWorkflowOutputSchema = orderPreviewDTOSchema

export type UpdateReturnWorkflowInput = z.infer<
  typeof updateReturnWorkflowInputSchema
>
export type UpdateReturnWorkflowOutput = z.infer<
  typeof updateReturnWorkflowOutputSchema
>

/**
 * Schema for UpdateReturnShippingMethodWorkflowInput
 */
export const updateReturnShippingMethodWorkflowInputSchema = z.object({
  return_id: z.string(),
  action_id: z.string(),
  data: z.object({
    custom_amount: bigNumberInputSchema.nullable().optional(),
    internal_note: z.string().nullable().optional(),
    metadata: z.record(z.any()).nullable().optional(),
  }),
})

/**
 * Schema for UpdateReturnShippingMethodWorkflowOutput (OrderPreviewDTO)
 */
export const updateReturnShippingMethodWorkflowOutputSchema =
  orderPreviewDTOSchema

export type UpdateReturnShippingMethodWorkflowInput = z.infer<
  typeof updateReturnShippingMethodWorkflowInputSchema
>
export type UpdateReturnShippingMethodWorkflowOutput = z.infer<
  typeof updateReturnShippingMethodWorkflowOutputSchema
>

/**
 * Schema for DeleteReturnShippingMethodWorkflowInput
 */
export const deleteReturnShippingMethodWorkflowInputSchema = z.object({
  return_id: z.string(),
  action_id: z.string(),
})

/**
 * Schema for DeleteReturnShippingMethodWorkflowOutput (OrderPreviewDTO)
 */
export const deleteReturnShippingMethodWorkflowOutputSchema =
  orderPreviewDTOSchema

export type DeleteReturnShippingMethodWorkflowInput = z.infer<
  typeof deleteReturnShippingMethodWorkflowInputSchema
>
export type DeleteReturnShippingMethodWorkflowOutput = z.infer<
  typeof deleteReturnShippingMethodWorkflowOutputSchema
>

/**
 * Schema for RequestItemReturnWorkflowInput
 */
export const requestItemReturnWorkflowInputSchema = z.object({
  return_id: z.string(),
  claim_id: z.string().optional(),
  exchange_id: z.string().optional(),
  items: z.array(createReturnItemSchema),
})

/**
 * Schema for RequestItemReturnWorkflowOutput (OrderPreviewDTO)
 */
export const requestItemReturnWorkflowOutputSchema = orderPreviewDTOSchema

export type RequestItemReturnWorkflowInput = z.infer<
  typeof requestItemReturnWorkflowInputSchema
>
export type RequestItemReturnWorkflowOutput = z.infer<
  typeof requestItemReturnWorkflowOutputSchema
>

/**
 * Schema for UpdateRequestItemReturnWorkflowInput
 */
export const updateRequestItemReturnWorkflowInputSchema = z.object({
  return_id: z.string(),
  claim_id: z.string().optional(),
  exchange_id: z.string().optional(),
  action_id: z.string(),
  data: z.object({
    quantity: bigNumberInputSchema.optional(),
    internal_note: z.string().nullable().optional(),
    reason_id: z.string().nullable().optional(),
  }),
})

/**
 * Schema for UpdateRequestItemReturnWorkflowOutput (OrderPreviewDTO)
 */
export const updateRequestItemReturnWorkflowOutputSchema = orderPreviewDTOSchema

export type UpdateRequestItemReturnWorkflowInput = z.infer<
  typeof updateRequestItemReturnWorkflowInputSchema
>
export type UpdateRequestItemReturnWorkflowOutput = z.infer<
  typeof updateRequestItemReturnWorkflowOutputSchema
>

/**
 * Schema for UpdateReceiveItemReturnRequestWorkflowInput
 */
export const updateReceiveItemReturnRequestWorkflowInputSchema = z.object({
  return_id: z.string(),
  action_id: z.string(),
  data: z.object({
    quantity: bigNumberInputSchema.optional(),
    internal_note: z.string().nullable().optional(),
  }),
})

/**
 * Schema for UpdateReceiveItemReturnRequestWorkflowOutput (OrderPreviewDTO)
 */
export const updateReceiveItemReturnRequestWorkflowOutputSchema =
  orderPreviewDTOSchema

export type UpdateReceiveItemReturnRequestWorkflowInput = z.infer<
  typeof updateReceiveItemReturnRequestWorkflowInputSchema
>
export type UpdateReceiveItemReturnRequestWorkflowOutput = z.infer<
  typeof updateReceiveItemReturnRequestWorkflowOutputSchema
>

/**
 * Schema for DeleteRequestItemReturnWorkflowInput
 */
export const deleteRequestItemReturnWorkflowInputSchema = z.object({
  return_id: z.string(),
  action_id: z.string(),
})

/**
 * Schema for DeleteRequestItemReturnWorkflowOutput (OrderPreviewDTO)
 */
export const deleteRequestItemReturnWorkflowOutputSchema = orderPreviewDTOSchema

export type DeleteRequestItemReturnWorkflowInput = z.infer<
  typeof deleteRequestItemReturnWorkflowInputSchema
>
export type DeleteRequestItemReturnWorkflowOutput = z.infer<
  typeof deleteRequestItemReturnWorkflowOutputSchema
>

/**
 * Schema for DeleteRequestItemReceiveReturnWorkflowInput
 */
export const deleteRequestItemReceiveReturnWorkflowInputSchema =
  deleteRequestItemReturnWorkflowInputSchema

/**
 * Schema for DeleteRequestItemReceiveReturnWorkflowOutput (OrderPreviewDTO)
 */
export const deleteRequestItemReceiveReturnWorkflowOutputSchema =
  orderPreviewDTOSchema

export type DeleteRequestItemReceiveReturnWorkflowInput = z.infer<
  typeof deleteRequestItemReceiveReturnWorkflowInputSchema
>
export type DeleteRequestItemReceiveReturnWorkflowOutput = z.infer<
  typeof deleteRequestItemReceiveReturnWorkflowOutputSchema
>

/**
 * Schema for RefreshReturnShippingWorkflowInput
 */
export const refreshReturnShippingWorkflowInputSchema = z.object({
  order_change_id: z.string(),
  return_id: z.string(),
  order_id: z.string(),
})

/**
 * Schema for RefreshReturnShippingWorkflowOutput (void)
 */
export const refreshReturnShippingWorkflowOutputSchema = z.void()

export type RefreshReturnShippingWorkflowInput = z.infer<
  typeof refreshReturnShippingWorkflowInputSchema
>
export type RefreshReturnShippingWorkflowOutput = z.infer<
  typeof refreshReturnShippingWorkflowOutputSchema
>

/**
 * Schema for AcceptOrderTransferWorkflowInput
 */
export const acceptOrderTransferWorkflowInputSchema = z.object({
  order_id: z.string(),
  token: z.string(),
})

/**
 * Schema for AcceptOrderTransferWorkflowOutput (OrderPreviewDTO)
 */
export const acceptOrderTransferWorkflowOutputSchema = orderPreviewDTOSchema

export type AcceptOrderTransferWorkflowInput = z.infer<
  typeof acceptOrderTransferWorkflowInputSchema
>
export type AcceptOrderTransferWorkflowOutput = z.infer<
  typeof acceptOrderTransferWorkflowOutputSchema
>

/**
 * Schema for CancelTransferOrderRequestWorkflowInput
 */
export const cancelTransferOrderRequestWorkflowInputSchema = z.object({
  order_id: z.string(),
  logged_in_user_id: z.string(),
  actor_type: z.enum(["customer", "user"]),
})

/**
 * Schema for CancelTransferOrderRequestWorkflowOutput (void)
 */
export const cancelTransferOrderRequestWorkflowOutputSchema = z.void()

export type CancelTransferOrderRequestWorkflowInput = z.infer<
  typeof cancelTransferOrderRequestWorkflowInputSchema
>
export type CancelTransferOrderRequestWorkflowOutput = z.infer<
  typeof cancelTransferOrderRequestWorkflowOutputSchema
>

/**
 * Schema for DeclineTransferOrderRequestWorkflowInput
 */
export const declineTransferOrderRequestWorkflowInputSchema = z.object({
  order_id: z.string(),
  token: z.string(),
})

/**
 * Schema for DeclineTransferOrderRequestWorkflowOutput (void)
 */
export const declineTransferOrderRequestWorkflowOutputSchema = z.void()

export type DeclineTransferOrderRequestWorkflowInput = z.infer<
  typeof declineTransferOrderRequestWorkflowInputSchema
>
export type DeclineTransferOrderRequestWorkflowOutput = z.infer<
  typeof declineTransferOrderRequestWorkflowOutputSchema
>

/**
 * Schema for RequestOrderTransferWorkflowInput
 */
export const requestOrderTransferWorkflowInputSchema = z.object({
  order_id: z.string(),
  customer_id: z.string(),
  logged_in_user: z.string(),
  description: z.string().optional(),
  internal_note: z.string().optional(),
})

/**
 * Schema for RequestOrderTransferWorkflowOutput (OrderDTO)
 */
export const requestOrderTransferWorkflowOutputSchema = orderDTOSchema

export type RequestOrderTransferWorkflowInput = z.infer<
  typeof requestOrderTransferWorkflowInputSchema
>
export type RequestOrderTransferWorkflowOutput = z.infer<
  typeof requestOrderTransferWorkflowOutputSchema
>

/**
 * Schema for CancelReturnReceiveWorkflowInput
 */
export const cancelReturnReceiveWorkflowInputSchema = z.object({
  return_id: z.string(),
})

/**
 * Schema for CancelReturnReceiveWorkflowOutput (void)
 */
export const cancelReturnReceiveWorkflowOutputSchema = z.void()

export type CancelReturnReceiveWorkflowInput = z.infer<
  typeof cancelReturnReceiveWorkflowInputSchema
>
export type CancelReturnReceiveWorkflowOutput = z.infer<
  typeof cancelReturnReceiveWorkflowOutputSchema
>

/**
 * Schema for CancelReturnRequestWorkflowInput
 */
export const cancelReturnRequestWorkflowInputSchema = z.object({
  return_id: z.string(),
})

/**
 * Schema for CancelReturnRequestWorkflowOutput (void)
 */
export const cancelReturnRequestWorkflowOutputSchema = z.void()

export type CancelReturnRequestWorkflowInput = z.infer<
  typeof cancelReturnRequestWorkflowInputSchema
>
export type CancelReturnRequestWorkflowOutput = z.infer<
  typeof cancelReturnRequestWorkflowOutputSchema
>

/**
 * Schema for UpsertOrderAddressDTO
 */
export const upsertOrderAddressDTOSchema = z.object({
  customer_id: z.string().optional(),
  company: z.string().optional(),
  first_name: z.string().optional(),
  last_name: z.string().optional(),
  address_1: z.string().optional(),
  address_2: z.string().optional(),
  city: z.string().optional(),
  country_code: z.string().optional(),
  province: z.string().optional(),
  postal_code: z.string().optional(),
})

/**
 * Schema for UpdateOrderWorkflowInput
 */
export const updateOrderWorkflowInputSchema = z.object({
  id: z.string(),
  user_id: z.string(),
  shipping_address: upsertOrderAddressDTOSchema.optional(),
  billing_address: upsertOrderAddressDTOSchema.optional(),
  email: z.string().optional(),
  metadata: z.record(z.unknown()).nullable().optional(),
})

export const updateOrderWorkflowOutputSchema = orderPreviewDTOSchema

export type UpdateOrderWorkflowInput = z.infer<
  typeof updateOrderWorkflowInputSchema
>
export type UpdateOrderWorkflowOutput = z.infer<
  typeof updateOrderWorkflowOutputSchema
>

/**
 * Schema for UpdateOrderChangesWorkflow
 */
export const updateOrderChangesWorkflowInputSchema = z.array(
  updateOrderChangeActionDTOSchema
)
export const updateOrderChangesWorkflowOutputSchema =
  z.array(orderChangeDTOSchema)

export type UpdateOrderChangesWorkflowInput = z.infer<
  typeof updateOrderChangesWorkflowInputSchema
>
export type UpdateOrderChangesWorkflowOutput = z.infer<
  typeof updateOrderChangesWorkflowOutputSchema
>
