import { CreateOrderChangeDTO, OrderChangeDTO } from "@medusajs/framework/types"
import {
  WorkflowResponse,
  createWorkflow,
} from "@medusajs/framework/workflows-sdk"
import { createOrderChangeStep } from "../steps"
import {
  createOrderChangeWorkflowInputSchema,
  createOrderChangeWorkflowOutputSchema,
  type CreateOrderChangeWorkflowInput as SchemaInput,
  type CreateOrderChangeWorkflowOutput as SchemaOutput,
} from "../utils/schemas"

// Type verification - CORRECT ORDER!
const schemaInput = {} as SchemaInput
const schemaOutput = {} as SchemaOutput

// Check 1: New input can go into old input (schema accepts all valid inputs)
const existingInput: CreateOrderChangeDTO = schemaInput

// Check 2: Old output can go into new output (schema produces compatible outputs)
const existingOutput: SchemaOutput = {} as OrderChangeDTO

console.log(existingInput, existingOutput, schemaOutput)

export const createOrderChangeWorkflowId = "create-order-change"
/**
 * This workflow creates an order change.
 * 
 * You can use this workflow within your customizations or your own custom workflows, allowing you to wrap custom logic around 
 * creating an order change.
 * 
 * @summary
 * 
 * Create an order change.
 */
export const createOrderChangeWorkflow = createWorkflow(
  {
    name: createOrderChangeWorkflowId,
    description: "Create an order change",
    inputSchema: createOrderChangeWorkflowInputSchema,
    outputSchema: createOrderChangeWorkflowOutputSchema,
  },
  (
    input
  ): WorkflowResponse<OrderChangeDTO> => {
    return new WorkflowResponse(createOrderChangeStep(input))
  }
)
