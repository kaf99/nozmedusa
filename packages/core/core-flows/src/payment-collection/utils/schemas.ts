import { z } from "zod"
import { bigNumberValueSchema } from "../../common/utils/schemas"

/**
 * Schema for CreateRefundReasonDTO
 */
const createRefundReasonDTOSchema = z.object({
  label: z.string(),
  description: z.string().optional(),
  metadata: z.record(z.unknown()).nullable().optional(),
})

/**
 * Schema for RefundReasonDTO
 */
const refundReasonDTOSchema = z.object({
  id: z.string(),
  label: z.string(),
  description: z.string().nullable().optional(),
  metadata: z.record(z.unknown()).nullable().optional(),
  created_at: z.union([z.string(), z.date()]).optional(),
  updated_at: z.union([z.string(), z.date()]).optional(),
})

/**
 * Schema for CreateRefundReasonsWorkflowInput
 */
export const createRefundReasonsWorkflowInputSchema = z.object({
  data: z.array(createRefundReasonDTOSchema),
})

/**
 * Schema for CreateRefundReasonsWorkflowOutput
 */
export const createRefundReasonsWorkflowOutputSchema = z.array(
  refundReasonDTOSchema
)

/**
 * Schema for UpdateRefundReasonDTO
 */
const updateRefundReasonDTOSchema = z.object({
  id: z.string(),
  label: z.string().optional(),
  description: z.string().nullable().optional(),
  metadata: z.record(z.unknown()).nullable().optional(),
})

/**
 * Schema for UpdateRefundReasonsWorkflowInput
 */
export const updateRefundReasonsWorkflowInputSchema = z.array(
  updateRefundReasonDTOSchema
)

/**
 * Schema for UpdateRefundReasonsWorkflowOutput
 */
export const updateRefundReasonsWorkflowOutputSchema = z.array(
  refundReasonDTOSchema
)

// Type exports for workflow input/output types
export type CreateRefundReasonsWorkflowInput = z.infer<
  typeof createRefundReasonsWorkflowInputSchema
>
export type CreateRefundReasonsWorkflowOutput = z.infer<
  typeof createRefundReasonsWorkflowOutputSchema
>
export type UpdateRefundReasonsWorkflowInput = z.infer<
  typeof updateRefundReasonsWorkflowInputSchema
>
export type UpdateRefundReasonsWorkflowOutput = z.infer<
  typeof updateRefundReasonsWorkflowOutputSchema
>

/**
 * Schema for PaymentSessionDTO
 */
const paymentSessionDTOSchema = z.object({
  id: z.string(),
  amount: bigNumberValueSchema,
  currency_code: z.string(),
  provider_id: z.string(),
  payment_collection_id: z.string(),
  data: z.record(z.unknown()),
  context: z.record(z.unknown()).optional(),
  status: z.enum([
    "authorized",
    "captured",
    "pending",
    "requires_more",
    "error",
    "canceled",
  ]),
  authorized_at: z.date().optional(),
  created_at: z.union([z.string(), z.date()]),
  updated_at: z.union([z.string(), z.date()]),
  metadata: z.record(z.unknown()).optional(),
  payment_collection: z.any().optional(), // Expandable field
  payment: z.any().optional(), // Expandable field
})

/**
 * Schema for CreatePaymentSessionsWorkflowInput
 */
export const createPaymentSessionsWorkflowInputSchema = z.object({
  payment_collection_id: z.string(),
  provider_id: z.string(),
  customer_id: z.string().optional(),
  data: z.record(z.unknown()).optional(),
  context: z.record(z.unknown()).optional(),
})

/**
 * Schema for CreatePaymentSessionsWorkflowOutput
 */
export const createPaymentSessionsWorkflowOutputSchema = paymentSessionDTOSchema

export type CreatePaymentSessionsWorkflowInput = z.infer<
  typeof createPaymentSessionsWorkflowInputSchema
>
export type CreatePaymentSessionsWorkflowOutput = z.infer<
  typeof createPaymentSessionsWorkflowOutputSchema
>

/**
 * Schema for DeletePaymentSessionsWorkflowInput
 */
export const deletePaymentSessionsWorkflowInputSchema = z.object({
  ids: z.array(z.string()),
})

/**
 * Schema for DeletePaymentSessionsWorkflowOutput
 */
export const deletePaymentSessionsWorkflowOutputSchema = z.array(z.string())

export type DeletePaymentSessionsWorkflowInput = z.infer<
  typeof deletePaymentSessionsWorkflowInputSchema
>
export type DeletePaymentSessionsWorkflowOutput = z.infer<
  typeof deletePaymentSessionsWorkflowOutputSchema
>

/**
 * Schema for PaymentProviderDTO
 */
const paymentProviderDTOSchema = z.object({
  id: z.string(),
  is_enabled: z.boolean(),
})

/**
 * Schema for PaymentDTO
 */
const paymentDTOSchema = z.object({
  id: z.string(),
  amount: bigNumberValueSchema,
  currency_code: z.string(),
  provider_id: z.string(),
  data: z.record(z.unknown()).optional(),
  cart_id: z.string().nullable().optional(),
  order_id: z.string().nullable().optional(),
  order_edit_id: z.string().nullable().optional(),
  customer_id: z.string().nullable().optional(),
  payment_collection_id: z.string(),
  payment_session_id: z.string().nullable().optional(),
  captured_at: z.union([z.string(), z.date()]).optional(),
  canceled_at: z.union([z.string(), z.date()]).optional(),
  authorized_at: z.union([z.string(), z.date()]).nullable().optional(),
  created_at: z.union([z.string(), z.date()]).optional(),
  updated_at: z.union([z.string(), z.date()]).optional(),
  deleted_at: z.union([z.string(), z.date()]).nullable().optional(),
})

/**
 * Schema for PaymentCollectionDTO
 */
export const paymentCollectionDTOSchema = z.object({
  id: z.string(),
  currency_code: z.string(),
  amount: bigNumberValueSchema,
  authorized_amount: bigNumberValueSchema.optional(),
  refunded_amount: bigNumberValueSchema.optional(),
  captured_amount: bigNumberValueSchema.optional(),
  completed_at: z.union([z.string(), z.date()]).optional(),
  created_at: z.union([z.string(), z.date()]).optional(),
  updated_at: z.union([z.string(), z.date()]).optional(),
  status: z.enum([
    "not_paid",
    "awaiting",
    "authorized",
    "partially_authorized",
    "partially_captured",
    "canceled",
    "failed",
    "completed",
  ]),
  payment_providers: z.array(paymentProviderDTOSchema),
  payment_sessions: z.array(paymentSessionDTOSchema).optional(),
  payments: z.array(paymentDTOSchema).optional(),
  metadata: z.record(z.unknown()).optional(),
})

/**
 * Schema for CancelPaymentCollectionWorkflowInput
 */
export const cancelPaymentCollectionWorkflowInputSchema = z.object({
  payment_collection_id: z.string(),
})

/**
 * Schema for CancelPaymentCollectionWorkflowOutput
 */
export const cancelPaymentCollectionWorkflowOutputSchema =
  paymentCollectionDTOSchema

export type CancelPaymentCollectionWorkflowInput = z.infer<
  typeof cancelPaymentCollectionWorkflowInputSchema
>
export type CancelPaymentCollectionWorkflowOutput = z.infer<
  typeof cancelPaymentCollectionWorkflowOutputSchema
>

/**
 * Schema for DeleteRefundReasonsWorkflowInput
 */
export const deleteRefundReasonsWorkflowInputSchema = z.object({
  ids: z.array(z.string()),
})

/**
 * Schema for DeleteRefundReasonsWorkflowOutput
 */
export const deleteRefundReasonsWorkflowOutputSchema = z.void()

export type DeleteRefundReasonsWorkflowInput = z.infer<
  typeof deleteRefundReasonsWorkflowInputSchema
>
export type DeleteRefundReasonsWorkflowOutput = z.infer<
  typeof deleteRefundReasonsWorkflowOutputSchema
>
