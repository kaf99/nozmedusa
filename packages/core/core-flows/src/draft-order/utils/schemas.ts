import { z } from "zod"
import {
  bigNumberInputSchema,
  bigNumberValueSchema,
} from "../../common/utils/schemas"
import {
  orderDTOSchema,
  orderLineItemDTOSchema,
  orderCreditLineDTOSchema,
} from "../../order/utils/schemas"
import { PromotionActions } from "@medusajs/framework/utils"

/**
 * Schema for NewItem
 */
const newItemSchema = z.object({
  variant_id: z.string().optional(),
  title: z.string().optional(),
  quantity: bigNumberInputSchema,
  unit_price: bigNumberInputSchema.nullable().optional(),
  compare_at_unit_price: bigNumberInputSchema.nullable().optional(),
  internal_note: z.string().nullable().optional(),
  metadata: z.record(z.any()).nullable().optional(),
})

/**
 * Schema for OrderEditAddNewItemWorkflowInput
 */
export const orderEditAddNewItemWorkflowInputSchema = z.object({
  order_id: z.string(),
  items: z.array(newItemSchema),
})

/**
 * Schema for OrderShippingMethodDTO in preview
 */
const orderShippingMethodDTOSchema = z.object({
  id: z.string(),
  order_id: z.string(),
  shipping_option_id: z.string().optional(),
  shipping_option: z.any().optional(),
  name: z.string(),
  amount: bigNumberValueSchema,
  raw_amount: z.any().optional(),
  is_tax_inclusive: z.boolean().optional(),
  data: z.record(z.unknown()).optional(),
  metadata: z.record(z.unknown()).nullable().optional(),
  created_at: z.union([z.string(), z.date()]).optional(),
  updated_at: z.union([z.string(), z.date()]).optional(),
})

/**
 * Schema for OrderChangeActionDTO
 */
const orderChangeActionDTOSchema = z.object({
  id: z.string(),
  order_change_id: z.string().nullable().optional(),
  order_id: z.string().nullable().optional(),
  reference: z.string().optional(),
  reference_id: z.string().optional(),
  action: z.string(),
  details: z.record(z.unknown()).nullable().optional(),
  internal_note: z.string().nullable().optional(),
  created_at: z.union([z.string(), z.date()]).optional(),
  updated_at: z.union([z.string(), z.date()]).optional(),
})

/**
 * Schema for OrderChangeDTO in preview
 */
const orderChangeDTOSchema = z.object({
  id: z.string(),
  version: z.number(),
  order_id: z.string(),
  return_id: z.string().nullable().optional(),
  exchange_id: z.string().nullable().optional(),
  claim_id: z.string().nullable().optional(),
  description: z.string().nullable().optional(),
  internal_note: z.string().nullable().optional(),
  status: z.string(),
  requested_by: z.string().nullable().optional(),
  requested_at: z.union([z.string(), z.date()]).nullable().optional(),
  confirmed_by: z.string().nullable().optional(),
  confirmed_at: z.union([z.string(), z.date()]).nullable().optional(),
  declined_by: z.string().nullable().optional(),
  declined_at: z.union([z.string(), z.date()]).nullable().optional(),
  declined_reason: z.string().nullable().optional(),
  canceled_by: z.string().nullable().optional(),
  canceled_at: z.union([z.string(), z.date()]).nullable().optional(),
  created_by: z.string().nullable().optional(),
  created_at: z.union([z.string(), z.date()]).optional(),
  updated_at: z.union([z.string(), z.date()]).optional(),
})

/**
 * Schema for OrderPreviewDTO (output)
 */
const orderPreviewDTOSchema = z.object({
  // Base OrderDTO fields that are commonly used in preview
  id: z.string(),
  order_id: z.string().optional(), // sometimes returned as order_id instead of id
  version: z.number(),
  status: z.string().optional(),
  region_id: z.string().optional(),
  customer_id: z.string().optional(),
  sales_channel_id: z.string().optional(),
  email: z.string().optional(),
  currency_code: z.string().optional(),

  // Items with actions
  items: z.array(
    orderLineItemDTOSchema.extend({
      actions: z.array(orderChangeActionDTOSchema).optional(),
    })
  ),

  // Shipping methods with actions
  shipping_methods: z.array(
    orderShippingMethodDTOSchema.extend({
      actions: z.array(orderChangeActionDTOSchema).optional(),
    })
  ),

  // Credit lines
  credit_lines: z.array(orderCreditLineDTOSchema).optional(),

  // Order change details
  order_change: orderChangeDTOSchema.optional(),

  // Totals
  shipping_total: bigNumberValueSchema,
  gift_card_total: bigNumberValueSchema,
  discount_subtotal: bigNumberValueSchema,
  discount_total: bigNumberValueSchema,
  tax_total: bigNumberValueSchema,
  subtotal: bigNumberValueSchema,
  total: bigNumberValueSchema,
  return_requested_total: z.number().optional(),

  // Additional fields that might be present
  change_type: z.string().optional(),
  metadata: z.record(z.unknown()).nullable().optional(),
  created_at: z.union([z.string(), z.date()]).optional(),
  updated_at: z.union([z.string(), z.date()]).optional(),
})

/**
 * Schema for AddDraftOrderItemsWorkflowOutput
 */
export const addDraftOrderItemsWorkflowOutputSchema = orderPreviewDTOSchema

export type OrderEditAddNewItemWorkflowInput = z.infer<
  typeof orderEditAddNewItemWorkflowInputSchema
>
export type AddDraftOrderItemsWorkflowOutput = z.infer<
  typeof addDraftOrderItemsWorkflowOutputSchema
>

/**
 * Schema for RemoveDraftOrderShippingMethodWorkflowInput
 */
export const removeDraftOrderShippingMethodWorkflowInputSchema = z.object({
  order_id: z.string(),
  shipping_method_id: z.string(),
})

export const removeDraftOrderShippingMethodWorkflowOutputSchema =
  orderPreviewDTOSchema

export type RemoveDraftOrderShippingMethodWorkflowInput = z.infer<
  typeof removeDraftOrderShippingMethodWorkflowInputSchema
>
export type RemoveDraftOrderShippingMethodWorkflowOutput = z.infer<
  typeof removeDraftOrderShippingMethodWorkflowOutputSchema
>

/**
 * Schema for ConfirmDraftOrderEditWorkflowInput
 */
export const confirmDraftOrderEditWorkflowInputSchema = z.object({
  order_id: z.string(),
  confirmed_by: z.string(),
})

export const confirmDraftOrderEditWorkflowOutputSchema = orderPreviewDTOSchema

export type ConfirmDraftOrderEditWorkflowInput = z.infer<
  typeof confirmDraftOrderEditWorkflowInputSchema
>
export type ConfirmDraftOrderEditWorkflowOutput = z.infer<
  typeof confirmDraftOrderEditWorkflowOutputSchema
>

/**
 * Schema for RemoveDraftOrderPromotionsWorkflowInput
 */
export const removeDraftOrderPromotionsWorkflowInputSchema = z.object({
  order_id: z.string(),
  code: z.array(z.string()),
})

export const removeDraftOrderPromotionsWorkflowOutputSchema =
  orderPreviewDTOSchema

export type RemoveDraftOrderPromotionsWorkflowInput = z.infer<
  typeof removeDraftOrderPromotionsWorkflowInputSchema
>
export type RemoveDraftOrderPromotionsWorkflowOutput = z.infer<
  typeof removeDraftOrderPromotionsWorkflowOutputSchema
>

/**
 * Schema for UpdateDraftOrderShippingMethodWorkflowInput
 */
export const updateDraftOrderShippingMethodWorkflowInputSchema = z.object({
  order_id: z.string(),
  data: z.object({
    shipping_method_id: z.string(),
    shipping_option_id: z.string().optional(),
    custom_amount: bigNumberInputSchema.optional(),
    internal_note: z.string().nullable().optional(),
  }),
})

export const updateDraftOrderShippingMethodWorkflowOutputSchema =
  orderPreviewDTOSchema

export type UpdateDraftOrderShippingMethodWorkflowInput = z.infer<
  typeof updateDraftOrderShippingMethodWorkflowInputSchema
>
export type UpdateDraftOrderShippingMethodWorkflowOutput = z.infer<
  typeof updateDraftOrderShippingMethodWorkflowOutputSchema
>

/**
 * Schema for UpdateDraftOrderWorkflowInput
 */
export const updateDraftOrderWorkflowInputSchema = z.object({
  order_id: z.string(),
  no_notification: z.boolean().optional(),
  region_id: z.string().optional(),
  customer_id: z.string().optional(),
  billing_address: z.record(z.any()).optional(),
  shipping_address: z.record(z.any()).optional(),
  sales_channel_id: z.string().optional(),
  email: z.string().optional(),
  metadata: z.record(z.unknown()).nullable().optional(),
})

export const updateDraftOrderWorkflowOutputSchema = orderPreviewDTOSchema

export type UpdateDraftOrderWorkflowInput = z.infer<
  typeof updateDraftOrderWorkflowInputSchema
>
export type UpdateDraftOrderWorkflowOutput = z.infer<
  typeof updateDraftOrderWorkflowOutputSchema
>

/**
 * Schema for ConvertDraftOrderWorkflowInput
 */
export const convertDraftOrderWorkflowInputSchema = z.object({
  order_id: z.string(),
  no_notification_order: z.boolean().optional(),
  metadata: z.record(z.unknown()).nullable().optional(),
})

export const convertDraftOrderWorkflowOutputSchema = orderDTOSchema

export type ConvertDraftOrderWorkflowInput = z.infer<
  typeof convertDraftOrderWorkflowInputSchema
>
export type ConvertDraftOrderWorkflowOutput = z.infer<
  typeof convertDraftOrderWorkflowOutputSchema
>

/**
 * Schema for AddDraftOrderShippingMethodsWorkflowInput
 */
export const addDraftOrderShippingMethodsWorkflowInputSchema = z.object({
  order_id: z.string(),
  shipping_option_id: z.string(),
  custom_amount: bigNumberInputSchema.nullable().optional(),
})

export const addDraftOrderShippingMethodsWorkflowOutputSchema =
  orderPreviewDTOSchema

export type AddDraftOrderShippingMethodsWorkflowInput = z.infer<
  typeof addDraftOrderShippingMethodsWorkflowInputSchema
>
export type AddDraftOrderShippingMethodsWorkflowOutput = z.infer<
  typeof addDraftOrderShippingMethodsWorkflowOutputSchema
>

/**
 * Schema for CancelDraftOrderEditWorkflowInput
 */
export const cancelDraftOrderEditWorkflowInputSchema = z.object({
  order_id: z.string(),
})

export const cancelDraftOrderEditWorkflowOutputSchema = orderPreviewDTOSchema

export type CancelDraftOrderEditWorkflowInput = z.infer<
  typeof cancelDraftOrderEditWorkflowInputSchema
>
export type CancelDraftOrderEditWorkflowOutput = z.infer<
  typeof cancelDraftOrderEditWorkflowOutputSchema
>

/**
 * Schema for AddDraftOrderPromotionWorkflowInput
 */
export const addDraftOrderPromotionWorkflowInputSchema = z.object({
  order_id: z.string(),
  promo_codes: z.array(z.string()),
})

export const addDraftOrderPromotionWorkflowOutputSchema = orderPreviewDTOSchema

export type AddDraftOrderPromotionWorkflowInput = z.infer<
  typeof addDraftOrderPromotionWorkflowInputSchema
>
export type AddDraftOrderPromotionWorkflowOutput = z.infer<
  typeof addDraftOrderPromotionWorkflowOutputSchema
>

/**
 * Schema for DeleteDraftOrderStepInput
 */
export const deleteDraftOrderStepInputSchema = z.object({
  order_ids: z.array(z.string()),
})

export const deleteDraftOrdersWorkflowOutputSchema = z.void()

export type DeleteDraftOrderStepInput = z.infer<
  typeof deleteDraftOrderStepInputSchema
>
export type DeleteDraftOrdersWorkflowOutput = z.infer<
  typeof deleteDraftOrdersWorkflowOutputSchema
>

/**
 * Schema for RequestDraftOrderEditWorkflowInput
 */
export const requestDraftOrderEditWorkflowInputSchema = z.object({
  order_id: z.string(),
  requested_by: z.string().optional(),
})

export const requestDraftOrderEditWorkflowOutputSchema = orderPreviewDTOSchema

export type RequestDraftOrderEditWorkflowInput = z.infer<
  typeof requestDraftOrderEditWorkflowInputSchema
>
export type RequestDraftOrderEditWorkflowOutput = z.infer<
  typeof requestDraftOrderEditWorkflowOutputSchema
>

/**
 * Schema for OrderWorkflow.BeginorderEditWorkflowInput
 */
export const beginOrderEditWorkflowInputSchema = z.object({
  order_id: z.string(),
  created_by: z.string().optional(),
  description: z.string().optional(),
  internal_note: z.string().optional(),
  metadata: z.record(z.unknown()).nullable().optional(),
})

export const beginOrderEditWorkflowOutputSchema = orderPreviewDTOSchema

export type BeginOrderEditWorkflowInput = z.infer<
  typeof beginOrderEditWorkflowInputSchema
>
export type BeginOrderEditWorkflowOutput = z.infer<
  typeof beginOrderEditWorkflowOutputSchema
>

/**
 * Schema for OrderWorkflow.DeleteOrderEditShippingMethodWorkflowInput
 */
export const deleteOrderEditShippingMethodWorkflowInputSchema = z.object({
  order_id: z.string(),
  action_id: z.string(),
})

export const deleteOrderEditShippingMethodWorkflowOutputSchema =
  orderPreviewDTOSchema

export type DeleteOrderEditShippingMethodWorkflowInput = z.infer<
  typeof deleteOrderEditShippingMethodWorkflowInputSchema
>
export type DeleteOrderEditShippingMethodWorkflowOutput = z.infer<
  typeof deleteOrderEditShippingMethodWorkflowOutputSchema
>

/**
 * Schema for OrderWorkflow.UpdateOrderEditAddNewItemWorkflowInput
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

export const updateOrderEditAddNewItemWorkflowOutputSchema =
  orderPreviewDTOSchema

export type UpdateOrderEditAddNewItemWorkflowInput = z.infer<
  typeof updateOrderEditAddNewItemWorkflowInputSchema
>
export type UpdateOrderEditAddNewItemWorkflowOutput = z.infer<
  typeof updateOrderEditAddNewItemWorkflowOutputSchema
>

/**
 * Schema for OrderWorkflow.UpdateOrderEditShippingMethodWorkflowInput
 */
export const updateOrderEditShippingMethodWorkflowInputSchema = z.object({
  order_id: z.string(),
  action_id: z.string(),
  data: z.object({
    custom_amount: bigNumberInputSchema.nullable().optional(),
    internal_note: z.string().nullable().optional(),
    metadata: z.record(z.any()).nullable().optional(),
  }),
})

export const updateOrderEditShippingMethodWorkflowOutputSchema =
  orderPreviewDTOSchema

export type UpdateOrderEditShippingMethodWorkflowInput = z.infer<
  typeof updateOrderEditShippingMethodWorkflowInputSchema
>
export type UpdateOrderEditShippingMethodWorkflowOutput = z.infer<
  typeof updateOrderEditShippingMethodWorkflowOutputSchema
>

/**
 * Schema for OrderWorkflow.DeleteOrderEditItemActionWorkflowInput
 */
export const deleteOrderEditItemActionWorkflowInputSchema = z.object({
  order_id: z.string(),
  action_id: z.string(),
})

export const deleteOrderEditItemActionWorkflowOutputSchema =
  orderPreviewDTOSchema

export type DeleteOrderEditItemActionWorkflowInput = z.infer<
  typeof deleteOrderEditItemActionWorkflowInputSchema
>
export type DeleteOrderEditItemActionWorkflowOutput = z.infer<
  typeof deleteOrderEditItemActionWorkflowOutputSchema
>

/**
 * Schema for OrderWorkflow.OrderEditUpdateItemQuantityWorkflowInput
 */
export const orderEditUpdateItemQuantityWorkflowInputSchema = z.object({
  order_id: z.string(),
  item_id: z.string(),
  quantity: bigNumberInputSchema,
})

export const orderEditUpdateItemQuantityWorkflowOutputSchema =
  orderPreviewDTOSchema

export type OrderEditUpdateItemQuantityWorkflowInput = z.infer<
  typeof orderEditUpdateItemQuantityWorkflowInputSchema
>
export type OrderEditUpdateItemQuantityWorkflowOutput = z.infer<
  typeof orderEditUpdateItemQuantityWorkflowOutputSchema
>

const promotionActionSchema = z.nativeEnum(PromotionActions)

/**
 * Schema for RefreshDraftOrderAdjustmentsWorkflowInput
 */
export const refreshDraftOrderAdjustmentsWorkflowInputSchema = z.object({
  order: orderDTOSchema,
  promo_codes: z.array(z.string()),
  action: promotionActionSchema,
})

export const refreshDraftOrderAdjustmentsWorkflowOutputSchema = z.void()

export type RefreshDraftOrderAdjustmentsWorkflowInput = z.infer<
  typeof refreshDraftOrderAdjustmentsWorkflowInputSchema
>
export type RefreshDraftOrderAdjustmentsWorkflowOutput = z.infer<
  typeof refreshDraftOrderAdjustmentsWorkflowOutputSchema
>
