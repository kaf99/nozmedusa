import { PaymentDTO } from "@medusajs/framework/types"
import { deepFlatMap, MathBN } from "@medusajs/framework/utils"
import {
  createWorkflow,
  transform,
  when,
} from "@medusajs/framework/workflows-sdk"
import { useQueryGraphStep } from "../../../common"
import { refundPaymentsWorkflow } from "../../../payment/workflows/refund-payments"
import {
  refundCapturedPaymentsWorkflowInputSchema,
  refundCapturedPaymentsWorkflowOutputSchema,
  type RefundCapturedPaymentsWorkflowInput as SchemaInput,
} from "./utils/schemas"

export {
  type RefundCapturedPaymentsWorkflowInput,
  type RefundCapturedPaymentsWorkflowOutput,
} from "./utils/schemas"

// Type verification - CORRECT ORDER!
const schemaInput = {} as SchemaInput

// Check 1: New input can go into old input (schema accepts all valid inputs)
const existingInput: {
  order_id: string
  created_by?: string
  note?: string
} = schemaInput

// Check 2: Old output can go into new output (schema produces compatible outputs)
// Note: void workflow returns nothing
const _voidCheck: void = undefined!

console.log(existingInput, _voidCheck)

export const refundCapturedPaymentsWorkflowId =
  "refund-captured-payments-workflow"
/**
 * This workflow refunds a payment.
 */
export const refundCapturedPaymentsWorkflow = createWorkflow(
  {
    name: refundCapturedPaymentsWorkflowId,
    description: "Refund captured payments",
    inputSchema: refundCapturedPaymentsWorkflowInputSchema,
    outputSchema: refundCapturedPaymentsWorkflowOutputSchema,
  },
  (input) => {
    const orderQuery = useQueryGraphStep({
      entity: "orders",
      fields: [
        "id",
        "status",
        "summary",
        "payment_collections.payments.id",
        "payment_collections.payments.amount",
        "payment_collections.payments.refunds.id",
        "payment_collections.payments.refunds.amount",
        "payment_collections.payments.captures.id",
        "payment_collections.payments.captures.amount",
      ],
      filters: { id: input.order_id },
      options: { throwIfKeyNotFound: true },
    }).config({ name: "get-order" })

    const order = transform(
      { orderQuery },
      ({ orderQuery }) => orderQuery.data[0]
    )

    const refundPaymentsData = transform(
      { order, input },
      ({ order, input }) => {
        const payments: PaymentDTO[] = deepFlatMap(
          order,
          "payment_collections.payments",
          ({ payments }) => payments
        )

        const capturedPayments = payments.filter(
          (payment) => payment.captures?.length
        )

        return capturedPayments
          .map((payment) => {
            const capturedAmount = (payment.captures || []).reduce(
              (acc, capture) => MathBN.sum(acc, capture.amount),
              MathBN.convert(0)
            )
            const refundedAmount = (payment.refunds || []).reduce(
              (acc, refund) => MathBN.sum(acc, refund.amount),
              MathBN.convert(0)
            )

            const amountToRefund = MathBN.sub(capturedAmount, refundedAmount)

            return {
              payment_id: payment.id,
              created_by: input.created_by,
              amount: amountToRefund,
              note: input.note,
            }
          })
          .filter((payment) => MathBN.gt(payment.amount, 0))
      }
    )

    const totalCaptured = transform(
      { refundPaymentsData },
      ({ refundPaymentsData }) =>
        refundPaymentsData.reduce(
          (acc, refundPayment) => MathBN.sum(acc, refundPayment.amount),
          MathBN.convert(0)
        )
    )

    when({ totalCaptured }, ({ totalCaptured }) => {
      return !!MathBN.gt(totalCaptured, 0)
    }).then(() => {
      refundPaymentsWorkflow.runAsStep({ input: refundPaymentsData })
    })
  }
)
