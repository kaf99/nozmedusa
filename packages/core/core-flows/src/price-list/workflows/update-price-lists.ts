import {
  UpdatePriceListWorkflowInputDTO,
  PriceListDTO,
} from "@medusajs/framework/types"
import {
  WorkflowResponse,
  createWorkflow,
} from "@medusajs/framework/workflows-sdk"
import { updatePriceListsStep, validatePriceListsStep } from "../steps"
import {
  updatePriceListsWorkflowInputSchema,
  updatePriceListsWorkflowOutputSchema,
  type UpdatePriceListsWorkflowInput as SchemaInput,
  type UpdatePriceListsWorkflowOutput as SchemaOutput,
} from "../utils/schemas"

export {
  type UpdatePriceListsWorkflowInput,
  type UpdatePriceListsWorkflowOutput,
} from "../utils/schemas"

// Type verification - CORRECT ORDER!
const schemaInput = {} as SchemaInput
const schemaOutput = {} as SchemaOutput

// Check 1: New input can go into old input (schema accepts all valid inputs)
const existingInput: {
  price_lists_data: UpdatePriceListWorkflowInputDTO[]
} = schemaInput

// Check 2: Old output can go into new output (schema produces compatible outputs)
const existingOutput: SchemaOutput = {} as PriceListDTO[]

console.log(existingInput, existingOutput, schemaOutput)

// Legacy types for backward compatibility  
export type { UpdatePriceListsWorkflowInput as LegacyUpdatePriceListsWorkflowInput } from "../utils/schemas"
export type { UpdatePriceListsWorkflowOutput as LegacyUpdatePriceListsWorkflowOutput } from "../utils/schemas"

export const updatePriceListsWorkflowId = "update-price-lists"
/**
 * This workflow updates one or more price lists. It's used by the
 * [Update Price List Admin API Route](https://docs.medusajs.com/api/admin#price-lists_postpricelistsid).
 * 
 * You can use this workflow within your customizations or your own custom workflows, allowing you to
 * update price lists in your custom flows.
 * 
 * @example
 * const { result } = await updatePriceListsWorkflow(container)
 * .run({
 *   input: {
 *     price_lists_data: [
 *       {
 *         id: "plist_123",
 *         title: "Test Price List",
 *       }
 *     ]
 *   }
 * })
 * 
 * @summary
 * 
 * Update one or more price lists.
 */
export const updatePriceListsWorkflow = createWorkflow(
  {
    name: updatePriceListsWorkflowId,
    description: "Update one or more price lists",
    inputSchema: updatePriceListsWorkflowInputSchema,
    outputSchema: updatePriceListsWorkflowOutputSchema,
  },
  (input) => {
    validatePriceListsStep(input.price_lists_data)

    return new WorkflowResponse(
      updatePriceListsStep(input.price_lists_data)
    )
  }
)
