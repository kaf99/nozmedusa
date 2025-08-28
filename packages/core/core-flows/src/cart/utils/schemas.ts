import { z } from "zod"
import {
  bigNumberValueSchema,
  bigNumberRawValueSchema,
  bigNumberInputSchema,
} from "../../common/utils/schemas"

export const pricingContextResult = z.record(z.string(), z.any()).optional()

const dateSchema = z.union([z.string(), z.date()])

/**
 * Schema for AdditionalData
 */
const additionalDataSchema = z.object({
  additional_data: z.record(z.string(), z.unknown()).optional(),
})

/**
 * Schema for AddressDTO
 */
const createdAddressDTOSchema = z.object({
  id: z.string(),
  customer_id: z.string().optional(),
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
  created_at: dateSchema,
  updated_at: dateSchema,
})

/**
 * Schema for CreateCartAddressDTO (without nullable fields)
 */
const createCartAddressDTOSchema = z.object({
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
  metadata: z.record(z.unknown()).optional(),
})

/**
 * Schema for UpdateCartAddressDTO
 */
const updateCartAddressDTOSchema = z.object({
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
  metadata: z.record(z.unknown()).optional(),
})

// Note: Adjustment DTOs not needed for upsert-tax-lines since we use z.any() for items/shipping_methods

// Note: Tax line schemas not needed - tax lines are outputs of this workflow

// Note: Tax line DTOs not needed - they are outputs of this workflow, not inputs

/**
 * Schema for LineItemDTO
 */
const lineItemDTOSchema = z.object({
  // Required fields
  id: z.string(),
  cart_id: z.string(),
  title: z.string(),
  quantity: bigNumberValueSchema,
  requires_shipping: z.boolean(),
  is_discountable: z.boolean(),
  is_tax_inclusive: z.boolean(),
  is_giftcard: z.boolean(),
  is_custom_price: z.boolean(),
  unit_price: bigNumberValueSchema,
  cart: z.any(), // Required - CartDTO
  // Optional fields
  subtitle: z.string().optional(),
  thumbnail: z.string().optional(),
  product_id: z.string().optional(),
  product_title: z.string().optional(),
  product_description: z.string().optional(),
  product_subtitle: z.string().optional(),
  product_type: z.string().optional(),
  product_type_id: z.string().optional(),
  product_collection: z.string().optional(),
  product_handle: z.string().optional(),
  variant_id: z.string().optional(),
  variant_sku: z.string().optional(),
  variant_barcode: z.string().optional(),
  variant_title: z.string().optional(),
  variant_option_values: z.record(z.unknown()).optional(),
  compare_at_unit_price: bigNumberValueSchema.optional(),
  tax_lines: z.array(z.any()).optional(), // Circular ref: LineItemTaxLineDTO contains item
  adjustments: z.array(z.any()).optional(), // Circular ref: LineItemAdjustmentDTO contains item
  metadata: z.record(z.unknown()).nullable().optional(),
  created_at: z.date().optional(),
  updated_at: z.date().optional(),
  deleted_at: z.date().nullable().optional(),
  // Required totals fields from CartLineItemTotalsDTO
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
})

/**
 * Schema for ShippingMethodDTO
 */
const shippingMethodDTOSchema = z.object({
  // Required fields
  id: z.string(),
  cart_id: z.string(),
  name: z.string(),
  amount: bigNumberValueSchema,
  is_tax_inclusive: z.boolean(),
  created_at: z.union([z.string(), z.date()]), // Required in CartShippingMethodDTO
  updated_at: z.union([z.string(), z.date()]), // Required in CartShippingMethodDTO
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
  // Optional fields
  description: z.string().optional(),
  shipping_option_id: z.string().optional(),
  data: z.record(z.unknown()).optional(),
  metadata: z.record(z.unknown()).nullable().optional(),
  tax_lines: z.array(z.any()).optional(), // ShippingMethodTaxLineDTO[]
  adjustments: z.array(z.any()).optional(), // ShippingMethodAdjustmentDTO[]
})

/**
 * Schema for CartDTO
 */
const cartDTOSchema = z.object({
  id: z.string(),
  region_id: z.string().optional(),
  customer_id: z.string().nullable().optional(),
  sales_channel_id: z.string().nullable().optional(),
  email: z.string().nullable().optional(),
  currency_code: z.string(),
  shipping_address_id: z.string().nullable().optional(),
  billing_address_id: z.string().nullable().optional(),
  shipping_address: createdAddressDTOSchema.optional(),
  billing_address: createdAddressDTOSchema.optional(),
  items: z.array(lineItemDTOSchema).optional(),
  credit_lines: z.array(z.any()).optional(), // CartCreditLineDTO[]
  shipping_methods: z.array(shippingMethodDTOSchema).optional(),
  payment_collection: z.any().nullable().optional(),
  metadata: z.record(z.unknown()).nullable().optional(),
  created_at: z.union([z.string(), z.date()]).optional(),
  updated_at: z.union([z.string(), z.date()]).optional(),
  promo_codes: z.array(z.string()).optional(),
  completed_at: z.union([z.string(), z.date()]).nullable().optional(),
  idempotency_key: z.string().nullable().optional(),
  context: z.record(z.unknown()).nullable().optional(),
  salesperson_id: z.string().nullable().optional(),
  draft_order_id: z.string().nullable().optional(),
  customer: z.any().nullable().optional(),
  sales_channel: z.any().nullable().optional(),
  promotions: z.array(z.any()).optional(),
  region: z.any().nullable().optional(),
  // All BigNumberValue totals fields
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
  discount_total: bigNumberValueSchema,
  discount_tax_total: bigNumberValueSchema,
  gift_card_total: bigNumberValueSchema,
  gift_card_tax_total: bigNumberValueSchema,
  shipping_total: bigNumberValueSchema,
  shipping_subtotal: bigNumberValueSchema,
  shipping_tax_total: bigNumberValueSchema,
  original_shipping_total: bigNumberValueSchema,
  original_shipping_subtotal: bigNumberValueSchema,
  original_shipping_tax_total: bigNumberValueSchema,
  credit_line_total: bigNumberValueSchema,
  // All BigNumberRawValue raw totals fields
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
  raw_gift_card_total: bigNumberRawValueSchema,
  raw_gift_card_tax_total: bigNumberRawValueSchema,
  raw_shipping_total: bigNumberRawValueSchema,
  raw_shipping_subtotal: bigNumberRawValueSchema,
  raw_shipping_tax_total: bigNumberRawValueSchema,
  raw_original_shipping_total: bigNumberRawValueSchema,
  raw_original_shipping_subtotal: bigNumberRawValueSchema,
  raw_original_shipping_tax_total: bigNumberRawValueSchema,
  raw_credit_line_total: bigNumberRawValueSchema,
})

/**
 * Schema for CreateLineItemForCartInput
 */
const createLineItemForCartInputSchema = z.object({
  quantity: bigNumberInputSchema,
  variant_id: z.string().optional(),
  title: z.string().optional(),
  subtitle: z.string().optional(),
  thumbnail: z.string().optional(),
  product_id: z.string().optional(),
  product_title: z.string().optional(),
  product_description: z.string().optional(),
  product_subtitle: z.string().optional(),
  product_type: z.string().optional(),
  product_type_id: z.string().optional(),
  product_collection: z.string().optional(),
  product_handle: z.string().optional(),
  variant_sku: z.string().optional(),
  variant_barcode: z.string().optional(),
  variant_title: z.string().optional(),
  variant_option_values: z.record(z.unknown()).optional(),
  requires_shipping: z.boolean().optional(),
  is_discountable: z.boolean().optional(),
  is_tax_inclusive: z.boolean().optional(),
  is_giftcard: z.boolean().optional(),
  is_custom_price: z.boolean().optional(),
  compare_at_unit_price: bigNumberInputSchema.optional(),
  unit_price: bigNumberInputSchema.optional(),
  metadata: z.record(z.unknown()).nullable().optional(),
})

/**
 * Schema for CreateCartWorkflowInputDTO
 */
const createCartWorkflowInputDTOSchema = z.object({
  region_id: z.string().optional(),
  customer_id: z.string().optional(),
  sales_channel_id: z.string().optional(),
  email: z.string().optional(),
  currency_code: z.string().optional(),
  shipping_address_id: z.string().optional(),
  billing_address_id: z.string().optional(),
  shipping_address: z
    .union([z.string(), createCartAddressDTOSchema])
    .optional(),
  billing_address: z.union([z.string(), createCartAddressDTOSchema]).optional(),
  metadata: z.record(z.unknown()).nullable().optional(),
  idempotency_key: z.string().optional(),
  context: z.record(z.unknown()).optional(),
  salesperson_id: z.string().optional(),
  promo_codes: z.array(z.string()).optional(),
  items: z.array(createLineItemForCartInputSchema).optional(),
})

/**
 * Schema for CreateCartWorkflowInput
 */
export const createCartWorkflowInputSchema =
  createCartWorkflowInputDTOSchema.extend({
    additional_data: z.record(z.unknown()).optional(),
  })

/**
 * Schema for CreateCartWorkflowOutput
 */
export const createCartWorkflowOutputSchema = cartDTOSchema

/**
 * Schema for UpdateCartWorkflowInput
 */
export const updateCartWorkflowInputSchema = z.object({
  id: z.string(),
  region_id: z.string().optional(),
  customer_id: z.string().nullable().optional(),
  sales_channel_id: z.string().nullable().optional(),
  email: z.string().nullable().optional(),
  currency_code: z.string().optional(),
  metadata: z.record(z.unknown()).nullable().optional(),
  shipping_address_id: z.string().nullable().optional(),
  billing_address_id: z.string().nullable().optional(),
  shipping_address: z
    .union([updateCartAddressDTOSchema, createCartAddressDTOSchema])
    .nullable()
    .optional(),
  billing_address: z
    .union([updateCartAddressDTOSchema, createCartAddressDTOSchema])
    .nullable()
    .optional(),
  promo_codes: z.array(z.string()).optional(),
  additional_data: z.record(z.unknown()).optional(),
})

/**
 * Schema for UpdateCartWorkflowOutput
 */
export const updateCartWorkflowOutputSchema = z.void()

/**
 * Schema for AddToCartWorkflowInput
 */
export const addToCartWorkflowInputSchema = z.object({
  cart_id: z.string(),
  items: z.array(createLineItemForCartInputSchema),
  additional_data: z.record(z.unknown()).optional(),
})

/**
 * Schema for AddToCartWorkflowOutput
 */
export const addToCartWorkflowOutputSchema = z.void()

/**
 * Schema for UpdateLineItemInCartWorkflowInput
 */
export const updateLineItemInCartWorkflowInputSchema = z
  .object({
    cart_id: z.string(),
    item_id: z.string(),
    update: z.object({
      quantity: bigNumberInputSchema.optional(),
      unit_price: z.number().optional(),
      metadata: z.record(z.unknown()).nullable().optional(),
    }),
  })
  .and(additionalDataSchema)

/**
 * Schema for UpdateLineItemInCartWorkflowOutput
 */
export const updateLineItemInCartWorkflowOutputSchema = z.void()

/**
 * Schema for CompleteCartWorkflowInput
 */
export const completeCartWorkflowInputSchema = z.object({
  id: z.string(),
})

/**
 * Schema for CompleteCartWorkflowOutput
 */
export const completeCartWorkflowOutputSchema = z.object({
  id: z.string(),
})

// Type exports for workflow input/output types
export type CreateCartWorkflowInput = z.infer<
  typeof createCartWorkflowInputSchema
>
export type CreateCartWorkflowOutput = z.infer<
  typeof createCartWorkflowOutputSchema
>
export type UpdateCartWorkflowInput = z.infer<
  typeof updateCartWorkflowInputSchema
>
export type UpdateCartWorkflowOutput = z.infer<
  typeof updateCartWorkflowOutputSchema
>
export type AddToCartWorkflowInput = z.infer<
  typeof addToCartWorkflowInputSchema
>
export type AddToCartWorkflowOutput = z.infer<
  typeof addToCartWorkflowOutputSchema
>
export type UpdateLineItemInCartWorkflowInput = z.infer<
  typeof updateLineItemInCartWorkflowInputSchema
>
export type UpdateLineItemInCartWorkflowOutput = z.infer<
  typeof updateLineItemInCartWorkflowOutputSchema
>
export type CompleteCartWorkflowInput = z.infer<
  typeof completeCartWorkflowInputSchema
>
export type CompleteCartWorkflowOutput = z.infer<
  typeof completeCartWorkflowOutputSchema
>

/**
 * Schema for ListShippingOptionsForCartWithPricingWorkflowInput
 */
export const listShippingOptionsForCartWithPricingWorkflowInputSchema =
  z.object({
    cart_id: z.string(),
    options: z
      .array(
        z.object({
          id: z.string(),
          data: z.record(z.unknown()).optional(),
        })
      )
      .optional(),
    is_return: z.boolean().optional(),
    enabled_in_store: z.boolean().optional(),
  })

/**
 * Schema for ListShippingOptionsForCartWithPricingWorkflowOutput item
 */
const shippingOptionWithPricingSchema = z.object({
  id: z.string(),
  name: z.string(),
  price_type: z.enum(["calculated", "flat"]),
  service_zone_id: z.string(),
  service_zone: z.object({
    fulfillment_set_id: z.string(),
    fulfillment_set: z
      .object({
        type: z.string(),
        location: z
          .object({
            address: z.any(),
          })
          .optional(),
      })
      .optional(),
  }),
  shipping_profile_id: z.string(),
  provider_id: z.string(),
  data: z.record(z.unknown()).nullable().optional(),
  type: z
    .object({
      id: z.string(),
      label: z.string(),
      description: z.string().nullable(),
      code: z.string(),
    })
    .nullable()
    .optional(),
  provider: z.object({
    id: z.string(),
    is_enabled: z.boolean(),
  }),
  rules: z
    .array(
      z.object({
        attribute: z.string(),
        value: z.union([
          z.string(),
          z.array(z.string()),
          z.record(z.unknown()),
        ]),
        operator: z.string(),
      })
    )
    .optional(),
  amount: z.number().optional(),
  is_tax_inclusive: z.boolean(),
  calculated_price: z
    .object({
      calculated_amount: z.number(),
      is_calculated_price_tax_inclusive: z.boolean(),
    })
    .optional(),
  prices: z.array(z.any()).optional(),
  stock_location: z
    .object({
      id: z.string(),
      name: z.string(),
      address: z.any(),
      fulfillment_set_id: z.string(),
    })
    .optional(),
})

/**
 * Schema for ListShippingOptionsForCartWithPricingWorkflowOutput
 */
export const listShippingOptionsForCartWithPricingWorkflowOutputSchema =
  z.array(shippingOptionWithPricingSchema)

export type ListShippingOptionsForCartWithPricingWorkflowInput = z.infer<
  typeof listShippingOptionsForCartWithPricingWorkflowInputSchema
>
export type ListShippingOptionsForCartWithPricingWorkflowOutput = z.infer<
  typeof listShippingOptionsForCartWithPricingWorkflowOutputSchema
>

/**
 * Schema for RefreshCartShippingMethodsWorkflowInput
 */
export const refreshCartShippingMethodsWorkflowInputSchema = z.object({
  cart_id: z.string().optional(),
  cart: z.any().optional(),
})

/**
 * Schema for RefreshCartShippingMethodsWorkflowOutput
 */
export const refreshCartShippingMethodsWorkflowOutputSchema = z.void()

export type RefreshCartShippingMethodsWorkflowInput = z.infer<
  typeof refreshCartShippingMethodsWorkflowInputSchema
>
export type RefreshCartShippingMethodsWorkflowOutput = z.infer<
  typeof refreshCartShippingMethodsWorkflowOutputSchema
>

/**
 * Schema for AddShippingMethodToCartWorkflowInput
 */
export const addShippingMethodToCartWorkflowInputSchema = z.object({
  cart_id: z.string(),
  options: z.array(
    z.object({
      id: z.string(),
      data: z.record(z.unknown()).optional(),
    })
  ),
})

/**
 * Schema for AddShippingMethodToCartWorkflowOutput
 */
export const addShippingMethodToCartWorkflowOutputSchema = z.void()

export type AddShippingMethodToCartWorkflowInput = z.infer<
  typeof addShippingMethodToCartWorkflowInputSchema
>
export type AddShippingMethodToCartWorkflowOutput = z.infer<
  typeof addShippingMethodToCartWorkflowOutputSchema
>

/**
 * Schema for RefundPaymentAndRecreatePaymentSessionWorkflowInput
 */
export const refundPaymentAndRecreatePaymentSessionWorkflowInputSchema =
  z.object({
    payment_collection_id: z.string(),
    provider_id: z.string(),
    customer_id: z.string().optional(),
    data: z.record(z.unknown()).optional(),
    context: z.record(z.unknown()).optional(),
    payment_id: z.string(),
    amount: z.union([z.number(), z.string()]),
    note: z.string().optional(),
  })

/**
 * Schema for RefundPaymentAndRecreatePaymentSessionWorkflowOutput
 * (PaymentSessionDTO)
 */
export const refundPaymentAndRecreatePaymentSessionWorkflowOutputSchema =
  z.object({
    id: z.string(),
    amount: bigNumberValueSchema,
    currency_code: z.string(),
    provider_id: z.string(),
    payment_collection_id: z.string(),
    data: z.record(z.unknown()),
    status: z.enum([
      "authorized",
      "captured",
      "pending",
      "requires_more",
      "error",
      "canceled",
    ]),
    created_at: z.union([z.string(), z.date()]),
    updated_at: z.union([z.string(), z.date()]),
    context: z.record(z.unknown()).optional(),
    authorized_at: z.date().optional(),
    payment_collection: z.any().optional(),
    payment: z.any().optional(),
    metadata: z.record(z.unknown()).optional(),
  })

export type RefundPaymentAndRecreatePaymentSessionWorkflowInput = z.infer<
  typeof refundPaymentAndRecreatePaymentSessionWorkflowInputSchema
>
export type RefundPaymentAndRecreatePaymentSessionWorkflowOutput = z.infer<
  typeof refundPaymentAndRecreatePaymentSessionWorkflowOutputSchema
>

/**
 * Schema for RefreshPaymentCollectionForCartWorkflowInput
 */
export const refreshPaymentCollectionForCartWorkflowInputSchema = z.object({
  cart_id: z.string().optional(),
  cart: z.any().optional(),
})

/**
 * Schema for RefreshPaymentCollectionForCartWorkflowOutput
 */
export const refreshPaymentCollectionForCartWorkflowOutputSchema = z.void()

export type RefreshPaymentCollectionForCartWorkflowInput = z.infer<
  typeof refreshPaymentCollectionForCartWorkflowInputSchema
>
export type RefreshPaymentCollectionForCartWorkflowOutput = z.infer<
  typeof refreshPaymentCollectionForCartWorkflowOutputSchema
>

/**
 * Schema for UpdateCartPromotionsWorkflowInput
 */
export const updateCartPromotionsWorkflowInputSchema = z.object({
  cart_id: z.string().optional(),
  cart: z.any().optional(),
  promo_codes: z.array(z.string()).optional(),
  action: z.enum(["add", "remove", "replace"]).optional(),
})

/**
 * Schema for UpdateCartPromotionsWorkflowOutput
 */
export const updateCartPromotionsWorkflowOutputSchema = z.void()

export type UpdateCartPromotionsWorkflowInput = z.infer<
  typeof updateCartPromotionsWorkflowInputSchema
>
export type UpdateCartPromotionsWorkflowOutput = z.infer<
  typeof updateCartPromotionsWorkflowOutputSchema
>

/**
 * Schema for UpdateTaxLinesWorkflowInput
 */
export const updateTaxLinesWorkflowInputSchema = z.object({
  cart_id: z.string().optional(),
  cart: z.any().optional(),
  items: z.array(lineItemDTOSchema).optional(),
  shipping_methods: z.array(shippingMethodDTOSchema).optional(),
  force_tax_calculation: z.boolean().optional(),
})

/**
 * Schema for UpdateTaxLinesWorkflowOutput
 */
export const updateTaxLinesWorkflowOutputSchema = z.void()

export type UpdateTaxLinesWorkflowInput = z.infer<
  typeof updateTaxLinesWorkflowInputSchema
>
export type UpdateTaxLinesWorkflowOutput = z.infer<
  typeof updateTaxLinesWorkflowOutputSchema
>

// Note: orderLineItemDTOSchema with tax_lines not needed - we use orderLineItemForTaxSchema instead

// Note: orderShippingMethodDTOSchema with tax_lines not needed - we use orderShippingMethodForTaxSchema instead

/**
 * Schema for UpsertTaxLinesWorkflowInput
 */
// Schema for cart object in upsert tax lines workflow
const cartForTaxLinesSchema = z
  .object({
    id: z.string(),
    currency_code: z.string(),
    email: z.string().optional(),
    region: z
      .object({
        id: z.string(),
        automatic_taxes: z.boolean().optional(),
      })
      .optional(),
    items: z
      .array(
        z.object({
          id: z.string(),
          variant_id: z.string().optional(),
          product_id: z.string().optional(),
          product: z
            .object({
              is_giftcard: z.boolean().optional(),
            })
            .optional(),
          product_title: z.string().optional(),
          product_description: z.string().optional(),
          product_subtitle: z.string().optional(),
          product_type: z.string().optional(),
          product_type_id: z.string().optional(),
          product_collection: z.string().optional(),
          product_handle: z.string().optional(),
          variant_sku: z.string().optional(),
          variant_barcode: z.string().optional(),
          variant_title: z.string().optional(),
          title: z.string(),
          quantity: bigNumberValueSchema,
          unit_price: bigNumberValueSchema,
          tax_lines: z
            .array(
              z.object({
                id: z.string(),
                description: z.string().optional(),
                code: z.string(),
                rate: z.number(),
                provider_id: z.string().optional(),
              })
            )
            .optional(),
        })
      )
      .optional(),
    shipping_methods: z
      .array(
        z.object({
          tax_lines: z
            .array(
              z.object({
                id: z.string(),
                description: z.string().optional(),
                code: z.string(),
                rate: z.number(),
                provider_id: z.string().optional(),
              })
            )
            .optional(),
          shipping_option_id: z.string().optional(),
          amount: bigNumberValueSchema,
        })
      )
      .optional(),
    customer: z
      .object({
        id: z.string(),
        email: z.string().optional(),
        metadata: z.record(z.unknown()).nullable().optional(),
        groups: z
          .array(
            z.object({
              id: z.string(),
            })
          )
          .optional(),
      })
      .optional(),
    shipping_address: z
      .object({
        id: z.string().optional(),
        address_1: z.string().optional(),
        address_2: z.string().optional(),
        city: z.string().optional(),
        postal_code: z.string().optional(),
        country_code: z.string().optional(),
        region_code: z.string().optional(),
        province: z.string().optional(),
        metadata: z.record(z.unknown()).nullable().optional(),
      })
      .optional(),
  })
  .optional()

export const upsertTaxLinesWorkflowInputSchema = z.object({
  cart_id: z.string().optional(),
  cart: cartForTaxLinesSchema,
  items: z.array(
    z.object({
      id: z.string(),
      product_id: z.string().optional(),
      product_type_id: z.string().optional(),
      quantity: bigNumberValueSchema,
      unit_price: bigNumberValueSchema,
      is_giftcard: z.boolean().optional(),
    })
  ),
  shipping_methods: z.array(
    z.object({
      id: z.string(),
      shipping_option_id: z.string().optional(),
      amount: bigNumberValueSchema,
    })
  ),
  force_tax_calculation: z.boolean().optional(),
})

/**
 * Schema for UpsertTaxLinesWorkflowOutput
 */
export const upsertTaxLinesWorkflowOutputSchema = z.void()

export type UpsertTaxLinesWorkflowInput = z.infer<
  typeof upsertTaxLinesWorkflowInputSchema
>
export type UpsertTaxLinesWorkflowOutput = z.infer<
  typeof upsertTaxLinesWorkflowOutputSchema
>

/**
 * Schema for RefreshCartItemsWorkflowInput
 */
export const refreshCartItemsWorkflowInputSchema = z
  .object({
    cart_id: z.string(),
    promo_codes: z.array(z.string()).optional(),
    force_refresh: z.boolean().optional(),
    items: z.any().optional(),
    shipping_methods: z.any().optional(),
    force_tax_calculation: z.boolean().optional(),
  })
  .and(additionalDataSchema)

/**
 * Schema for RefreshCartItemsWorkflowOutput
 */
export const refreshCartItemsWorkflowOutputSchema = cartDTOSchema

export type RefreshCartItemsWorkflowInput = z.infer<
  typeof refreshCartItemsWorkflowInputSchema
>
export type RefreshCartItemsWorkflowOutput = z.infer<
  typeof refreshCartItemsWorkflowOutputSchema
>

/**
 * Schema for CreateCartCreditLinesWorkflowInput
 */
export const createCartCreditLinesWorkflowInputSchema = z.array(
  z.object({
    cart_id: z.string(),
    amount: z.number(),
    reference: z.string().nullable(),
    reference_id: z.string().nullable(),
    metadata: z.record(z.unknown()).nullable(),
  })
)

/**
 * Schema for CartCreditLineDTO
 */
const cartCreditLineDTOSchema = z.object({
  id: z.string(),
  cart_id: z.string(),
  amount: bigNumberValueSchema,
  raw_amount: bigNumberRawValueSchema,
  reference: z.string().nullable(),
  reference_id: z.string().nullable(),
  metadata: z.record(z.unknown()).nullable(),
  created_at: z.date(),
  updated_at: z.date(),
})

/**
 * Schema for CreateCartCreditLinesWorkflowOutput
 */
export const createCartCreditLinesWorkflowOutputSchema = z.array(
  cartCreditLineDTOSchema
)

export type CreateCartCreditLinesWorkflowInput = z.infer<
  typeof createCartCreditLinesWorkflowInputSchema
>
export type CreateCartCreditLinesWorkflowOutput = z.infer<
  typeof createCartCreditLinesWorkflowOutputSchema
>

/**
 * Schema for CreatePaymentCollectionForCartWorkflowInput
 */
export const createPaymentCollectionForCartWorkflowInputSchema = z.object({
  cart_id: z.string(),
  metadata: z.record(z.unknown()).nullable().optional(),
})

/**
 * Schema for CreatePaymentCollectionForCartWorkflowOutput
 */
export const createPaymentCollectionForCartWorkflowOutputSchema = z.void()

export type CreatePaymentCollectionForCartWorkflowInput = z.infer<
  typeof createPaymentCollectionForCartWorkflowInputSchema
>
export type CreatePaymentCollectionForCartWorkflowOutput = z.infer<
  typeof createPaymentCollectionForCartWorkflowOutputSchema
>

/**
 * Schema for DeleteCartCreditLinesWorkflowInput
 */
export const deleteCartCreditLinesWorkflowInputSchema = z.object({
  id: z.array(z.string()),
})

/**
 * Schema for DeleteCartCreditLinesWorkflowOutput
 */
export const deleteCartCreditLinesWorkflowOutputSchema = z.void()

export type DeleteCartCreditLinesWorkflowInput = z.infer<
  typeof deleteCartCreditLinesWorkflowInputSchema
>
export type DeleteCartCreditLinesWorkflowOutput = z.infer<
  typeof deleteCartCreditLinesWorkflowOutputSchema
>

/**
 * Schema for ListShippingOptionsForCartWorkflowInput
 */
export const listShippingOptionsForCartWorkflowInputSchema = z.object({
  cart_id: z.string(),
  option_ids: z.array(z.string()).optional(),
  is_return: z.boolean().optional(),
  enabled_in_store: z.boolean().optional(),
  additional_data: z.record(z.unknown()).optional(),
})

/**
 * Schema for shipping option with pricing output
 */
const shippingOptionForCartSchema = z.object({
  id: z.string(),
  name: z.string(),
  price_type: z.enum(["calculated", "flat"]),
  service_zone_id: z.string(),
  shipping_profile_id: z.string(),
  provider_id: z.string(),
  data: z.record(z.unknown()).nullable().optional(),
  service_zone: z.object({
    fulfillment_set_id: z.string(),
    fulfillment_set: z
      .object({
        type: z.string(),
        location: z
          .object({
            id: z.string(),
            address: z.any(),
          })
          .optional(),
      })
      .optional(),
  }),
  type: z
    .object({
      id: z.string(),
      label: z.string(),
      description: z.string().nullable(),
      code: z.string(),
    })
    .nullable()
    .optional(),
  provider: z.object({
    id: z.string(),
    is_enabled: z.boolean(),
  }),
  rules: z
    .array(
      z.object({
        attribute: z.string(),
        value: z.union([
          z.string(),
          z.array(z.string()),
          z.record(z.unknown()),
        ]),
        operator: z.string(),
      })
    )
    .optional(),
  calculated_price: z.any().optional(),
  prices: z.array(z.any()).optional(),
  amount: z.number().optional(),
  is_tax_inclusive: z.boolean(),
  insufficient_inventory: z.boolean(),
})

/**
 * Schema for ListShippingOptionsForCartWorkflowOutput
 */
export const listShippingOptionsForCartWorkflowOutputSchema = z.array(
  shippingOptionForCartSchema
)

export type ListShippingOptionsForCartWorkflowInput = z.infer<
  typeof listShippingOptionsForCartWorkflowInputSchema
>
export type ListShippingOptionsForCartWorkflowOutput = z.infer<
  typeof listShippingOptionsForCartWorkflowOutputSchema
>

/**
 * Schema for TransferCartCustomerWorkflowInput
 */
export const transferCartCustomerWorkflowInputSchema = z.object({
  id: z.string(),
  customer_id: z.string(),
})

/**
 * Schema for TransferCartCustomerWorkflowOutput
 */
export const transferCartCustomerWorkflowOutputSchema = z.void()

export type TransferCartCustomerWorkflowInput = z.infer<
  typeof transferCartCustomerWorkflowInputSchema
>
export type TransferCartCustomerWorkflowOutput = z.infer<
  typeof transferCartCustomerWorkflowOutputSchema
>
