import { createWorkflow } from "@medusajs/framework/workflows-sdk"
import { deleteOrderChangeActionsStep } from "../steps"
import {
  deleteOrderChangeActionsWorkflowInputSchema,
  deleteOrderChangeActionsWorkflowOutputSchema,
  type DeleteOrderChangeActionsWorkflowInput as SchemaInput,
  type DeleteOrderChangeActionsWorkflowOutput as SchemaOutput,
} from "../utils/schemas"

export {
  type DeleteOrderChangeActionsWorkflowInput,
  type DeleteOrderChangeActionsWorkflowOutput,
} from "../utils/schemas"

// Type verification - CORRECT ORDER!
const schemaInput = {} as SchemaInput
const schemaOutput = undefined as unknown as SchemaOutput

// Check 1: New input can go into old input (schema accepts all valid inputs)
const existingInput: { ids: string[] } = schemaInput

// Check 2: Old output can go into new output (schema produces compatible outputs)
const existingOutput: SchemaOutput = undefined as unknown as void

console.log(existingInput, existingOutput, schemaOutput)

export const deleteOrderChangeActionsWorkflowId = "delete-order-change-actions"
/**
 * This workflow deletes one or more order change actions.
 * 
 * You can use this workflow within your customizations or your own custom workflows, allowing you to wrap custom logic around
 * deleting an order change action.
 * 
 * @summary
 * 
 * Delete one or more order change actions.
 */
export const deleteOrderChangeActionsWorkflow = createWorkflow(
  {
    name: deleteOrderChangeActionsWorkflowId,
    description: "Delete one or more order change actions",
    inputSchema: deleteOrderChangeActionsWorkflowInputSchema,
    outputSchema: deleteOrderChangeActionsWorkflowOutputSchema,
  },
  (input) => {
    deleteOrderChangeActionsStep(input)
  }
)
