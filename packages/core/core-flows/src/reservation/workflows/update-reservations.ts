import {
  WorkflowResponse,
  createWorkflow,
} from "@medusajs/framework/workflows-sdk"

import { WorkflowTypes } from "@medusajs/framework/types"
import { updateReservationsStep } from "../steps"
import {
  updateReservationsWorkflowInputSchema,
  updateReservationsWorkflowOutputSchema,
  type UpdateReservationsWorkflowInput as SchemaInput,
  type UpdateReservationsWorkflowOutput as SchemaOutput,
} from "../utils/schemas"

export {
  type UpdateReservationsWorkflowInput,
  type UpdateReservationsWorkflowOutput,
} from "../utils/schemas"

// Type verification - CORRECT ORDER!
const schemaInput = {} as SchemaInput
const schemaOutput = {} as SchemaOutput

// Check 1: New input can go into old input (schema accepts all valid inputs)
const existingInput: WorkflowTypes.ReservationWorkflow.UpdateReservationsWorkflowInput = schemaInput

// Check 2: Old output can go into new output (schema produces compatible outputs)
const existingOutput: SchemaOutput = {} as WorkflowTypes.ReservationWorkflow.UpdateReservationsWorkflowOutput

console.log(existingInput, existingOutput, schemaOutput)

export const updateReservationsWorkflowId = "update-reservations-workflow"
/**
 * This workflow updates one or more reservations. It's used by the 
 * [Update Reservations Admin API Route](https://docs.medusajs.com/api/admin#reservations_postreservationsid).
 * 
 * You can use this workflow within your own customizations or custom workflows, allowing you
 * to update reservations in your custom flows.
 * 
 * @example
 * const { result } = await updateReservationsWorkflow(container)
 * .run({
 *   input: {
 *     updates: [
 *       {
 *         id: "res_123",
 *         quantity: 1,
 *       }
 *     ]
 *   }
 * })
 * 
 * @summary
 * 
 * Update one or more reservations.
 */
export const updateReservationsWorkflow = createWorkflow(
  {
    name: updateReservationsWorkflowId,
    description: "Update one or more reservations",
    inputSchema: updateReservationsWorkflowInputSchema,
    outputSchema: updateReservationsWorkflowOutputSchema,
  },
  (input) => {
    return new WorkflowResponse(updateReservationsStep(input.updates))
  }
)
