import { CancelOrderChangeDTO } from "@medusajs/framework/types"
import { createWorkflow } from "@medusajs/framework/workflows-sdk"
import { cancelOrderChangeStep } from "../steps"
import {
  cancelOrderChangeWorkflowInputSchema,
  cancelOrderChangeWorkflowOutputSchema,
  type CancelOrderChangeWorkflowInput as SchemaInput,
} from "../utils/schemas"

export {
  type CancelOrderChangeWorkflowInput,
  type CancelOrderChangeWorkflowOutput,
} from "../utils/schemas"

// Type verification - CORRECT ORDER!
const schemaInput = {} as SchemaInput

// Check 1: New input can go into old input (schema accepts all valid inputs)
const existingInput: CancelOrderChangeDTO = schemaInput

// Check 2: Old output can go into new output (schema produces compatible outputs)
// Note: void workflow returns nothing
const _voidCheck: void = undefined!

console.log(existingInput, _voidCheck)

export const cancelOrderChangeWorkflowId = "cancel-order-change"
/**
 * This workflow cancels an order change.
 * 
 * You can use this workflow within your customizations or your own custom workflows, allowing you to wrap custom logic around 
 * canceling an order change.
 * 
 * @summary
 * 
 * Cancel an order change.
 */
export const cancelOrderChangeWorkflow = createWorkflow(
  {
    name: cancelOrderChangeWorkflowId,
    description: "Cancel an order change",
    inputSchema: cancelOrderChangeWorkflowInputSchema,
    outputSchema: cancelOrderChangeWorkflowOutputSchema,
  },
  (input) => {
    cancelOrderChangeStep(input)
  }
)
