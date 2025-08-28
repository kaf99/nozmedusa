import {
  CreateOrderReturnReasonDTO,
  OrderReturnReasonDTO,
} from "@medusajs/framework/types"
import {
  WorkflowResponse,
  createWorkflow,
} from "@medusajs/framework/workflows-sdk"
import { createReturnReasonsStep } from "../steps"
import {
  createReturnReasonsWorkflowInputSchema,
  createReturnReasonsWorkflowOutputSchema,
  type CreateReturnReasonsWorkflowInput as SchemaInput,
  type CreateReturnReasonsWorkflowOutput as SchemaOutput,
} from "../utils/schemas"

export {
  type CreateReturnReasonsWorkflowInput,
  type CreateReturnReasonsWorkflowOutput,
} from "../utils/schemas"

// Type verification - CORRECT ORDER!
const schemaInput = {} as SchemaInput
const schemaOutput = {} as SchemaOutput

// Check 1: New input can go into old input (schema accepts all valid inputs)
const existingInput: {
  data: CreateOrderReturnReasonDTO[]
} = schemaInput

// Check 2: Old output can go into new output (schema produces compatible outputs)
const existingOutput: SchemaOutput = {} as OrderReturnReasonDTO[]

console.log(existingInput, existingOutput, schemaOutput)

// Legacy types for backward compatibility  
export type { CreateReturnReasonsWorkflowInput as LegacyCreateReturnReasonsWorkflowInput } from "../utils/schemas"
export type { CreateReturnReasonsWorkflowOutput as LegacyCreateReturnReasonsWorkflowOutput } from "../utils/schemas"

export const createReturnReasonsWorkflowId = "create-return-reasons"
/**
 * This workflow creates one or more return reasons. It's used by the
 * [Create Return Reason Admin API Route](https://docs.medusajs.com/api/admin#return-reasons_postreturnreasons).
 * 
 * You can use this workflow within your customizations or your own custom workflows, allowing you to
 * create return reasons within your custom flows.
 * 
 * @example
 * const { result } = await createReturnReasonsWorkflow(container)
 * .run({
 *   input: {
 *     data: [
 *       {
 *         label: "Damaged",
 *         value: "damaged",
 *       }
 *     ]
 *   }
 * })
 * 
 * @summary
 * 
 * Create return reasons.
 */
export const createReturnReasonsWorkflow = createWorkflow(
  {
    name: createReturnReasonsWorkflowId,
    description: "Create return reasons",
    inputSchema: createReturnReasonsWorkflowInputSchema,
    outputSchema: createReturnReasonsWorkflowOutputSchema,
  },
  (input) => {
    return new WorkflowResponse(createReturnReasonsStep(input.data))
  }
)
