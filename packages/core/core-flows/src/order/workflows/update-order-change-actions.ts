import {
  OrderChangeActionDTO,
  UpdateOrderChangeActionDTO,
} from "@medusajs/framework/types"
import {
  WorkflowResponse,
  createWorkflow,
} from "@medusajs/framework/workflows-sdk"
import { updateOrderChangeActionsStep } from "../steps"
import {
  updateOrderChangeActionsWorkflowInputSchema,
  updateOrderChangeActionsWorkflowOutputSchema,
  type UpdateOrderChangeActionsWorkflowInput as SchemaInput,
  type UpdateOrderChangeActionsWorkflowOutput as SchemaOutput,
} from "../utils/schemas"

export {
  type UpdateOrderChangeActionsWorkflowInput,
  type UpdateOrderChangeActionsWorkflowOutput,
} from "../utils/schemas"

// Type verification - CORRECT ORDER!
const schemaInput = {} as SchemaInput
const schemaOutput = {} as SchemaOutput

// Check 1: New input can go into old input (schema accepts all valid inputs)
const existingInput: UpdateOrderChangeActionDTO[] = schemaInput

// Check 2: Old output can go into new output (schema produces compatible outputs)
const existingOutput: SchemaOutput = {} as OrderChangeActionDTO[]

console.log(existingInput, existingOutput, schemaOutput)

export const updateOrderChangeActionsWorkflowId = "update-order-change-actions"
/**
 * This workflow updates one or more order change actions.
 * 
 * You can use this workflow within your customizations or your own custom workflows, allowing you to wrap custom logic around
 * updating order change actions.
 * 
 * @summary
 * 
 * Update one or more order change actions.
 */
export const updateOrderChangeActionsWorkflow = createWorkflow(
  {
    name: updateOrderChangeActionsWorkflowId,
    description: "Update one or more order change actions",
    inputSchema: updateOrderChangeActionsWorkflowInputSchema,
    outputSchema: updateOrderChangeActionsWorkflowOutputSchema,
  },
  (input) => {
    return new WorkflowResponse(updateOrderChangeActionsStep(input))
  }
)
