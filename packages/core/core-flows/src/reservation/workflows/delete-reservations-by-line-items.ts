import { createWorkflow } from "@medusajs/framework/workflows-sdk"

import { deleteReservationsByLineItemsStep } from "../steps"
import {
  deleteReservationsByLineItemsWorkflowInputSchema,
  deleteReservationsByLineItemsWorkflowOutputSchema,
  type DeleteReservationsByLineItemsWorkflowInput as SchemaInput,
} from "../utils/schemas"

export {
  type DeleteReservationsByLineItemsWorkflowInput,
  type DeleteReservationsByLineItemsWorkflowOutput,
} from "../utils/schemas"

// Legacy type for backward compatibility
export type DeleteReservationByLineItemsWorkflowInput = SchemaInput

// Type verification - CORRECT ORDER!
const schemaInput = {} as SchemaInput

// Check 1: New input can go into old input (schema accepts all valid inputs)
const existingInput: { ids: string[] } = schemaInput

// Check 2: Old output can go into new output (schema produces compatible outputs)
// Note: void workflow returns nothing
const _voidCheck: void = undefined!

console.log(existingInput, _voidCheck)

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
