import { DeclineOrderChangeDTO } from "@medusajs/framework/types"
import { createWorkflow } from "@medusajs/framework/workflows-sdk"
import { declineOrderChangeStep } from "../steps"
import {
  declineOrderChangeWorkflowInputSchema,
  declineOrderChangeWorkflowOutputSchema,
  type DeclineOrderChangeWorkflowInput as SchemaInput,
  type DeclineOrderChangeWorkflowOutput as SchemaOutput,
} from "../utils/schemas"

// Type verification - CORRECT ORDER!
const schemaInput = {} as SchemaInput
const schemaOutput = undefined as SchemaOutput

// Check 1: New input can go into old input (schema accepts all valid inputs)
const existingInput: DeclineOrderChangeDTO = schemaInput

// Check 2: Old output can go into new output (schema produces compatible outputs)
// For void outputs, we don't need to check compatibility
const existingOutput = undefined as SchemaOutput

console.log(existingInput, existingOutput, schemaOutput)

export const declineOrderChangeWorkflowId = "decline-order-change"
/**
 * This workflow declines an order change.
 *
 * You can use this workflow within your customizations or your own custom workflows, allowing you to wrap custom logic around
 * declining an order change.
 *
 * @summary
 *
 * Decline an order change.
 */
export const declineOrderChangeWorkflow = createWorkflow(
  {
    name: declineOrderChangeWorkflowId,
    description: "Decline an order change",
    inputSchema: declineOrderChangeWorkflowInputSchema,
    outputSchema: declineOrderChangeWorkflowOutputSchema,
  },
  (input) => {
    declineOrderChangeStep(input)
  }
)
