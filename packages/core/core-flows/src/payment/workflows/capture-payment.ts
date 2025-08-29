import { PaymentEvents } from "@medusajs/framework/utils"
import {
  WorkflowResponse,
  createWorkflow,
  transform,
  when,
} from "@medusajs/framework/workflows-sdk"
import { emitEventStep, useRemoteQueryStep } from "../../common"
import { addOrderTransactionStep } from "../../order/steps/add-order-transaction"
import { capturePaymentStep } from "../steps/capture-payment"
import {
  capturePaymentWorkflowInputSchema,
  capturePaymentWorkflowOutputSchema,
} from "../utils/schemas"
export {
  type CapturePaymentWorkflowInput,
  type CapturePaymentWorkflowOutput,

} from "../utils/schemas"

export const capturePaymentWorkflowId = "capture-payment-workflow"
/**
 * This workflow captures a payment. It's used by the
 * [Capture Payment Admin API Route](https://docs.medusajs.com/api/admin#payments_postpaymentsidcapture).
 *
 * You can use this workflow within your own customizations or custom workflows, allowing you
 * to capture a payment in your custom flows.
 *
 * @example
 * const { result } = await capturePaymentWorkflow(container)
 * .run({
 *   input: {
 *     payment_id: "pay_123"
 *   }
 * })
 *
 * @summary
 *
 * Capture a payment.
 */
export const capturePaymentWorkflow = createWorkflow(
  {
    name: capturePaymentWorkflowId,
    description: "Capture a payment",
    inputSchema: capturePaymentWorkflowInputSchema,
    outputSchema: capturePaymentWorkflowOutputSchema,
  },
  (input) => {
    const payment = capturePaymentStep(input)

    const orderPayment = useRemoteQueryStep({
      entry_point: "order_payment_collection",
      fields: ["order.id"],
      variables: { payment_collection_id: payment.payment_collection_id },
      list: false,
    })

    when({ orderPayment }, ({ orderPayment }) => {
      return !!orderPayment?.order?.id
    }).then(() => {
      const orderTransactionData = transform(
        { input, payment, orderPayment },
        ({ input, payment, orderPayment }) => {
          return payment.captures?.map((capture) => {
            return {
              order_id: orderPayment.order.id,
              amount: input.amount ?? capture.raw_amount ?? capture.amount,
              currency_code: payment.currency_code,
              reference_id: capture.id,
              reference: "capture",
            }
          })
        }
      )

      addOrderTransactionStep(orderTransactionData)
    })

    emitEventStep({
      eventName: PaymentEvents.CAPTURED,
      data: { id: payment.id },
    })

    return new WorkflowResponse(payment)
  }
)
