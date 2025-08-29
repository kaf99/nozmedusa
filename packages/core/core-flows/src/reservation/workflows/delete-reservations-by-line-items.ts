import { createWorkflow } from "@medusajs/framework/workflows-sdk"

import { deleteReservationsByLineItemsStep } from "../steps"
import {
  deleteReservationsByLineItemsWorkflowInputSchema,
  deleteReservationsByLineItemsWorkflowOutputSchema,
} from "../utils/schemas"

export {
  type DeleteReservationsByLineItemsWorkflowInput,
  type DeleteReservationsByLineItemsWorkflowOutput,

} from "../utils/schemas"

export const deleteReservationsByLineItemsWorkflowId =
  "delete-reservations-by-line-items"
/**
 * This workflow deletes reservations by their associated line items.
 *
 * You can use this workflow within your own customizations or custom workflows, allowing you
 * to delete reservations by their associated line items within your custom flows.
 *
 * @example
 * const { result } = await deleteReservationsByLineItemsWorkflow(container)
 * .run({
 *   input: {
 *     ids: ["orli_123"]
 *   }
 * })
 *
 * @summary
 *
 * Delete reservations by their associated line items.
 */
export const deleteReservationsByLineItemsWorkflow = createWorkflow(
  {
    name: deleteReservationsByLineItemsWorkflowId,
    description: "Delete reservations by their associated line items",
    inputSchema: deleteReservationsByLineItemsWorkflowInputSchema,
    outputSchema: deleteReservationsByLineItemsWorkflowOutputSchema,
  },
  (input) => {
    return deleteReservationsByLineItemsStep(input.ids)
  }
)
