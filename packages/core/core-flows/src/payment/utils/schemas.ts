import { z } from "zod"
import {
  bigNumberInputSchema,
  bigNumberValueSchema,
} from "../../common/utils/schemas"

/**
 * Schema for CapturePaymentWorkflowInput
 */
export const capturePaymentWorkflowInputSchema = z.object({
  payment_id: z.string(),
  captured_by: z.string().optional(),
  amount: bigNumberInputSchema.optional(),
})

/**
 * Schema for CapturePaymentWorkflowOutput (PaymentDTO)
 */
export const capturePaymentWorkflowOutputSchema = z.object({
  id: z.string(),
  amount: z.any(), // BigNumber
  raw_amount: z.any().optional(),
  authorized_amount: z.any().nullable().optional(),
  currency_code: z.string(),
  provider_id: z.string(),
  cart_id: z.string().nullable().optional(),
  order_id: z.string().nullable().optional(),
  order_edit_id: z.string().nullable().optional(),
  customer_id: z.string().nullable().optional(),
  data: z.any().nullable().optional(),
  created_at: z.union([z.string(), z.date()]).optional(),
  updated_at: z.union([z.string(), z.date()]).optional(),
  captured_at: z.union([z.string(), z.date()]).nullable().optional(),
  canceled_at: z.union([z.string(), z.date()]).nullable().optional(),
  payment_collection_id: z.string().optional(),
  payment_session: z.any().optional(),
  captures: z.array(z.any()).optional(),
  refunds: z.array(z.any()).optional(),
})

export type CapturePaymentWorkflowInput = z.infer<
  typeof capturePaymentWorkflowInputSchema
>
export type CapturePaymentWorkflowOutput = z.infer<
  typeof capturePaymentWorkflowOutputSchema
>

/**
 * Schema for RefundPaymentWorkflowInput (single refund)
 */
export const refundPaymentWorkflowInputSchema = z.object({
  payment_id: z.string(),
  created_by: z.string().optional(),
  amount: bigNumberInputSchema.optional(),
})

/**
 * Schema for RefundPaymentWorkflowOutput (PaymentDTO)
 */
export const refundPaymentWorkflowOutputSchema =
  capturePaymentWorkflowOutputSchema

export type RefundPaymentWorkflowInput = z.infer<
  typeof refundPaymentWorkflowInputSchema
>
export type RefundPaymentWorkflowOutput = z.infer<
  typeof refundPaymentWorkflowOutputSchema
>

/**
 * Schema for RefundPaymentsWorkflowInput item
 */
const refundPaymentItemSchema = z.object({
  payment_id: z.string(),
  amount: bigNumberInputSchema,
  created_by: z.string().optional(),
  note: z.string().optional(),
})

/**
 * Schema for RefundPaymentsWorkflowInput
 */
export const refundPaymentsWorkflowInputSchema = z.array(
  refundPaymentItemSchema
)

/**
 * Schema for PaymentDTO (minimal for refund)
 */
const paymentDTOSchema = z.object({
  id: z.string(),
  amount: bigNumberValueSchema,
  raw_amount: bigNumberValueSchema.optional(),
  authorized_amount: bigNumberValueSchema.optional(),
  raw_authorized_amount: bigNumberValueSchema.optional(),
  currency_code: z.string(),
  provider_id: z.string(),
  cart_id: z.string().optional(),
  order_id: z.string().optional(),
  customer_id: z.string().optional(),
  data: z.record(z.unknown()).optional(),
  created_at: z.union([z.string(), z.date()]).optional(),
  updated_at: z.union([z.string(), z.date()]).optional(),
  captured_at: z.union([z.string(), z.date()]).optional(),
  canceled_at: z.union([z.string(), z.date()]).optional(),
  captured_amount: bigNumberValueSchema.optional(),
  raw_captured_amount: bigNumberValueSchema.optional(),
  refunded_amount: bigNumberValueSchema.optional(),
  raw_refunded_amount: bigNumberValueSchema.optional(),
  captures: z.array(z.any()).optional(),
  refunds: z.array(z.any()).optional(),
  payment_collection_id: z.string(),
  payment_collection: z.any().optional(),
  payment_session: z.any().optional(),
})

/**
 * Schema for RefundPaymentsWorkflowOutput
 */
export const refundPaymentsWorkflowOutputSchema = z.array(paymentDTOSchema)

export type RefundPaymentsWorkflowInput = z.infer<
  typeof refundPaymentsWorkflowInputSchema
>
export type RefundPaymentsWorkflowOutput = z.infer<
  typeof refundPaymentsWorkflowOutputSchema
>

/**
 * Schema for ProcessPaymentWorkflowInput (WebhookActionResult)
 */
export const processPaymentWorkflowInputSchema = z.object({
  action: z.enum([
    "authorized",
    "captured",
    "failed",
    "pending",
    "requires_more",
    "canceled",
    "not_supported",
  ]),
  data: z
    .object({
      session_id: z.string(),
      amount: bigNumberValueSchema,
    })
    .optional(),
})

/**
 * Schema for ProcessPaymentWorkflowOutput
 */
export const processPaymentWorkflowOutputSchema = z.void()

export type ProcessPaymentWorkflowInput = z.infer<
  typeof processPaymentWorkflowInputSchema
>
export type ProcessPaymentWorkflowOutput = z.infer<
  typeof processPaymentWorkflowOutputSchema
>
