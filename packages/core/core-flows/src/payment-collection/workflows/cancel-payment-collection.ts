import { PaymentCollectionDTO } from "@medusajs/framework/types"
import { MedusaError, PaymentCollectionStatus } from "@medusajs/framework/utils"
import {
  WorkflowResponse,
  createStep,
  createWorkflow,
  transform,
} from "@medusajs/framework/workflows-sdk"
import {
  cancelPaymentCollectionWorkflowInputSchema,
  cancelPaymentCollectionWorkflowOutputSchema,
} from "../utils/schemas"
import { useQueryGraphStep } from "../../common"
import { updatePaymentCollectionStep } from "../steps/update-payment-collection"
import { cancelPaymentStep } from "../steps/cancel-payment"
export {
  type CancelPaymentCollectionWorkflowInput,
  type CancelPaymentCollectionWorkflowOutput,

} from "../utils/schemas"

const validatePaymentCollectionCancellationStep = createStep(
  "validate-payment-collection-cancellation",
  async (input: { paymentCollection: PaymentCollectionDTO }) => {
    const { paymentCollection } = input

    if (paymentCollection.status === PaymentCollectionStatus.COMPLETED) {
      throw new MedusaError(
        MedusaError.Types.NOT_ALLOWED,
        "Cannot cancel a completed payment collection"
      )
    }

    if (paymentCollection.status == PaymentCollectionStatus.CANCELED) {
      throw new MedusaError(
        MedusaError.Types.NOT_ALLOWED,
        "Payment collection is already canceled"
      )
    }
  }
)

export const cancelPaymentCollectionWorkflowId = "cancel-payment-collection"
/**
 * This workflow cancels a payment collection that is either not paid or authorized.
 *
 * Payment colelction that is completed or already canceled cannot be canceled.
 *
 * @example
 * const data = cancelPaymentCollectionStep({
 *   payment_collection_id: "paycol_123",
 * })
 */
export const cancelPaymentCollectionWorkflow = createWorkflow(
  {
    name: cancelPaymentCollectionWorkflowId,
    description: "Cancel a payment collection",
    inputSchema: cancelPaymentCollectionWorkflowInputSchema,
    outputSchema: cancelPaymentCollectionWorkflowOutputSchema,
  },
  (input) => {
    const paymentCollectionQuery = useQueryGraphStep({
      entity: "payment_collection",
      fields: [
        "id",
        "status",
        "payments.id",
        "payments.captured_at",
        "captured_amount",
      ],
      filters: { id: input.payment_collection_id },
    }).config({ name: "get-payment-collection" })

    const paymentCollection = transform(
      { paymentCollectionQuery },
      ({ paymentCollectionQuery }) => paymentCollectionQuery.data[0]
    )

    validatePaymentCollectionCancellationStep({
      paymentCollection,
    })

    /**
     * Only cancel authorized payments, not captured payments.
     */
    const authorizedPaymentIds = transform(
      { paymentCollection },
      ({ paymentCollection }) =>
        paymentCollection.payments
          ?.filter((p) => !p.captured_at)
          .map((p) => p.id) ?? []
    )

    const status = transform({ paymentCollection }, ({ paymentCollection }) =>
      paymentCollection.captured_amount > 0
        ? PaymentCollectionStatus.PARTIALLY_CAPTURED
        : PaymentCollectionStatus.CANCELED
    )

    const updatedPaymentCollections = updatePaymentCollectionStep({
      selector: { id: paymentCollection.id },
      update: {
        status: status,
      },
    })

    cancelPaymentStep({
      ids: authorizedPaymentIds,
    })

    const resultPaymentCollection = transform(
      { updatedPaymentCollections },
      ({ updatedPaymentCollections }) => updatedPaymentCollections[0]
    )

    return new WorkflowResponse(resultPaymentCollection)
  }
)
