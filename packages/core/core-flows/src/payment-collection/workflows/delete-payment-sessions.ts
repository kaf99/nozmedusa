import {
  WorkflowResponse,
  createWorkflow,
} from "@medusajs/framework/workflows-sdk"
import {
  deletePaymentSessionsStep,
  validateDeletedPaymentSessionsStep,
} from "../steps"
import {
  deletePaymentSessionsWorkflowInputSchema,
  deletePaymentSessionsWorkflowOutputSchema,
} from "../utils/schemas"

export const deletePaymentSessionsWorkflowId = "delete-payment-sessions"
/**
 * This workflow deletes one or more payment sessions. It's used by other workflows, like
 * {@link refreshPaymentCollectionForCartWorkflow} to delete payment sessions when the cart's total changes.
 * 
 * You can use this workflow within your own customizations or custom workflows, allowing you
 * to delete payment sessions in your custom flows.
 * 
 * @example
 * const { result } = await deletePaymentSessionsWorkflow(container)
 * .run({
 *   input: {
 *     ids: ["payses_123"]
 *   }
 * })
 * 
 * @summary
 * 
 * Delete payment sessions.
 */
export const deletePaymentSessionsWorkflow = createWorkflow(
  {
    name: deletePaymentSessionsWorkflowId,
    description: "Delete payment sessions",
    inputSchema: deletePaymentSessionsWorkflowInputSchema,
    outputSchema: deletePaymentSessionsWorkflowOutputSchema,
  },
  (input) => {
    const idsDeleted = deletePaymentSessionsStep({ ids: input.ids })

    validateDeletedPaymentSessionsStep({
      idsToDelete: input.ids,
      idsDeleted,
    })

    return new WorkflowResponse(idsDeleted)
  }
)
