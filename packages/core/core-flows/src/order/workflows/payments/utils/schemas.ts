import { z } from "zod"

/**
 * BigNumberInput schema
 */
const bigNumberInputSchema = z.union([
  z.string(),
  z.number(),
  z.object({
    value: z.string(),
    precision: z.number(),
  }),
])

/**
 * Schema for CreateOrderRefundCreditLinesWorkflowInput
 */
export const createOrderRefundCreditLinesWorkflowInputSchema = z.object({
  order_id: z.string(),
  created_by: z.string().optional(),
  amount: bigNumberInputSchema,
})

/**
 * Schema for CreateOrderRefundCreditLinesWorkflowOutput
 */
export const createOrderRefundCreditLinesWorkflowOutputSchema = z.void()

export type CreateOrderRefundCreditLinesWorkflowInput = z.infer<
  typeof createOrderRefundCreditLinesWorkflowInputSchema
>
export type CreateOrderRefundCreditLinesWorkflowOutput = z.infer<
  typeof createOrderRefundCreditLinesWorkflowOutputSchema
>

/**
 * Schema for RefundCapturedPaymentsWorkflowInput
 */
export const refundCapturedPaymentsWorkflowInputSchema = z.object({
  order_id: z.string(),
  created_by: z.string().optional(),
  note: z.string().optional(),
})

/**
 * Schema for RefundCapturedPaymentsWorkflowOutput
 */
export const refundCapturedPaymentsWorkflowOutputSchema = z.void()

export type RefundCapturedPaymentsWorkflowInput = z.infer<
  typeof refundCapturedPaymentsWorkflowInputSchema
>
export type RefundCapturedPaymentsWorkflowOutput = z.infer<
  typeof refundCapturedPaymentsWorkflowOutputSchema
>
