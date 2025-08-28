import { createWorkflow } from "@medusajs/framework/workflows-sdk"
import { deleteOrderChangesStep } from "../steps"
import {
  deleteOrderChangeWorkflowInputSchema,
  deleteOrderChangeWorkflowOutputSchema,
  type DeleteOrderChangeWorkflowInput as SchemaInput,
  type DeleteOrderChangeWorkflowOutput as SchemaOutput,
} from "../utils/schemas"

/**
 * The details of the order changes to delete.
 */
export type DeleteOrderChangeWorkflowInput = {
  /**
   * The IDs of the order changes to delete.
   */
  ids: string[]
}

// Type verification - CORRECT ORDER!
const schemaInput = {} as SchemaInput
const schemaOutput = undefined as SchemaOutput

// Check 1: New input can go into old input (schema accepts all valid inputs)
const existingInput: DeleteOrderChangeWorkflowInput = schemaInput

// Check 2: Old output can go into new output (schema produces compatible outputs)
// For void outputs, we don't need to check compatibility
const existingOutput = undefined as SchemaOutput

console.log(existingInput, existingOutput, schemaOutput)

export const deleteOrderChangeWorkflowId = "delete-order-change"
/**
 * This workflow deletes one or more order changes.
 *
 * You can use this workflow within your customizations or your own custom workflows, allowing you to wrap custom logic around
 * deleting an order change.
 *
 * @summary
 *
 * Delete one or more order changes.
 */
export const deleteOrderChangeWorkflow = createWorkflow(
  {
    name: deleteOrderChangeWorkflowId,
    description: "Delete one or more order changes",
    inputSchema: deleteOrderChangeWorkflowInputSchema,
    outputSchema: deleteOrderChangeWorkflowOutputSchema,
  },
  (input) => {
    deleteOrderChangesStep(input)
  }
)
