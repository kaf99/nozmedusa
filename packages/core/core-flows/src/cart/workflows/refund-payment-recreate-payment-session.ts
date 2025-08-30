import {
  createWorkflow,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk"
import { createPaymentSessionsWorkflow } from "../../payment-collection/workflows/create-payment-session"
import { refundPaymentsWorkflow } from "../../payment/workflows/refund-payments"
import {
  refundPaymentAndRecreatePaymentSessionWorkflowInputSchema,
  refundPaymentAndRecreatePaymentSessionWorkflowOutputSchema,
} from "../utils/schemas"
export type {
  RefundPaymentAndRecreatePaymentSessionWorkflowInput,
  RefundPaymentAndRecreatePaymentSessionWorkflowOutput,
} from "../utils/schemas"

export const refundPaymentAndRecreatePaymentSessionWorkflowId =
  "refund-payment-and-recreate-payment-session"
/**
 * This workflow refunds a payment and creates a new payment session.
 *
 * @summary
 *
 * Refund a payment and create a new payment session.
 */
export const refundPaymentAndRecreatePaymentSessionWorkflow = createWorkflow(
  {
    name: refundPaymentAndRecreatePaymentSessionWorkflowId,
    inputSchema: refundPaymentAndRecreatePaymentSessionWorkflowInputSchema,
    outputSchema: refundPaymentAndRecreatePaymentSessionWorkflowOutputSchema,
  },
  (input) => {
    refundPaymentsWorkflow.runAsStep({
      input: [
        {
          payment_id: input.payment_id,
          note: input.note,
          amount: input.amount,
        },
      ],
    })

    const paymentSession = createPaymentSessionsWorkflow.runAsStep({
      input: {
        payment_collection_id: input.payment_collection_id,
        provider_id: input.provider_id,
        customer_id: input.customer_id,
        data: input.data,
      },
    })

    return new WorkflowResponse(paymentSession)
  }
)
