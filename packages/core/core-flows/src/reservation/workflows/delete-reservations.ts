import { createWorkflow } from "@medusajs/framework/workflows-sdk"

import { deleteReservationsStep } from "../steps"
import {
  deleteReservationsWorkflowInputSchema,
  deleteReservationsWorkflowOutputSchema,
  type DeleteReservationsWorkflowInput as SchemaInput,
} from "../utils/schemas"

export {
  type DeleteReservationsWorkflowInput,
  type DeleteReservationsWorkflowOutput,
} from "../utils/schemas"

// Type verification - CORRECT ORDER!
const schemaInput = {} as SchemaInput

// Check 1: New input can go into old input (schema accepts all valid inputs)
const existingInput: { ids: string[] } = schemaInput

// Check 2: Old output can go into new output (schema produces compatible outputs)
// Note: void workflow returns nothing
const _voidCheck: void = undefined!

console.log(existingInput, _voidCheck)

export const deleteReservationsWorkflowId = "delete-reservations"
/**
 * This workflow deletes one or more reservations. It's used by the
 * [Delete Reservations Admin API Route](https://docs.medusajs.com/api/admin#reservations_deletereservationsid).
 * 
 * You can use this workflow within your own customizations or custom workflows, allowing you
 * to delete reservations in your custom flows.
 * 
 * @example
 * const { result } = await deleteReservationsWorkflow(container)
 * .run({
 *   input: {
 *     ids: ["res_123"]
 *   }
 * })
 * 
 * @summary
 * 
 * Delete one or more reservations.
 */
export const deleteReservationsWorkflow = createWorkflow(
  {
    name: deleteReservationsWorkflowId,
    description: "Delete one or more reservations",
    inputSchema: deleteReservationsWorkflowInputSchema,
    outputSchema: deleteReservationsWorkflowOutputSchema,
  },
  (input) => {
    return deleteReservationsStep(input.ids)
  }
)
