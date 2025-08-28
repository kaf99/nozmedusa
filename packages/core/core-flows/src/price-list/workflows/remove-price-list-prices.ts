import {
  WorkflowResponse,
  createWorkflow,
} from "@medusajs/framework/workflows-sdk"
import { removePriceListPricesStep } from "../steps/remove-price-list-prices"
import {
  removePriceListPricesWorkflowInputSchema,
  removePriceListPricesWorkflowOutputSchema,
  type RemovePriceListPricesWorkflowInput as SchemaInput,
  type RemovePriceListPricesWorkflowOutput as SchemaOutput,
} from "../utils/schemas"

export {
  type RemovePriceListPricesWorkflowInput,
  type RemovePriceListPricesWorkflowOutput,
} from "../utils/schemas"

// Type verification - CORRECT ORDER!
const schemaInput = {} as SchemaInput
const schemaOutput = undefined as any as SchemaOutput

// Check 1: New input can go into old input (schema accepts all valid inputs)
const existingInput: {
  ids: string[]
} = schemaInput

// Check 2: Old output can go into new output (schema produces compatible outputs)
const existingOutput: SchemaOutput = {} as string[]

console.log(existingInput, existingOutput, schemaOutput)

// Legacy types for backward compatibility  
export type { RemovePriceListPricesWorkflowInput as LegacyRemovePriceListPricesWorkflowInput } from "../utils/schemas"
export type { RemovePriceListPricesWorkflowOutput as LegacyRemovePriceListPricesWorkflowOutput } from "../utils/schemas"

export const removePriceListPricesWorkflowId = "remove-price-list-prices"
/**
 * This workflow removes price lists' prices. It's used by other workflows, such
 * as {@link batchPriceListPricesWorkflow}.
 * 
 * You can use this workflow within your customizations or your own custom workflows, allowing you to
 * remove prices in price lists in your custom flows.
 * 
 * @example
 * const { result } = await removePriceListPricesWorkflow(container)
 * .run({
 *   input: {
 *     ids: ["plist_123"]
 *   }
 * })
 * 
 * @summary
 * 
 * Remove prices in price lists.
 */
export const removePriceListPricesWorkflow = createWorkflow(
  {
    name: removePriceListPricesWorkflowId,
    description: "Remove prices in price lists",
    inputSchema: removePriceListPricesWorkflowInputSchema,
    outputSchema: removePriceListPricesWorkflowOutputSchema,
  },
  (input) => {
    return new WorkflowResponse(
      removePriceListPricesStep(input.ids)
    )
  }
)
