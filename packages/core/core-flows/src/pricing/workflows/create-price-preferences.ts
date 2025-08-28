import { PricingWorkflow, PricePreferenceDTO } from "@medusajs/framework/types"
import {
  WorkflowResponse,
  createWorkflow,
} from "@medusajs/framework/workflows-sdk"
import { createPricePreferencesStep } from "../steps"
import {
  createPricePreferencesWorkflowInputSchema,
  createPricePreferencesWorkflowOutputSchema,
  type CreatePricePreferencesWorkflowInput as SchemaInput,
  type CreatePricePreferencesWorkflowOutput as SchemaOutput,
} from "../utils/schemas"
export {
  type CreatePricePreferencesWorkflowInput,
  type CreatePricePreferencesWorkflowOutput,
} from "../utils/schemas"

/**
 * The price preferences to create.
 */
type OldCreatePricePreferencesWorkflowInput = PricingWorkflow.CreatePricePreferencesWorkflowInput[]

// Type verification
const schemaInput = {} as SchemaInput
const schemaOutput = {} as SchemaOutput
const existingInput: OldCreatePricePreferencesWorkflowInput = schemaInput
const existingOutput: PricePreferenceDTO[] = schemaOutput

// Check reverse too
const oldInput = {} as OldCreatePricePreferencesWorkflowInput
const oldOutput = {} as PricePreferenceDTO[]
const newInput: SchemaInput = oldInput
const newOutput: SchemaOutput = oldOutput

console.log(existingInput, existingOutput, newInput, newOutput)

export const createPricePreferencesWorkflowId = "create-price-preferences"
/**
 * This workflow creates one or more price preferences. It's used by the
 * [Create Price Preferences Admin API Route](https://docs.medusajs.com/api/admin#price-preferences_postpricepreferences).
 * 
 * You can use this workflow within your customizations or your own custom workflows, allowing you to 
 * create price preferences in your custom flows.
 * 
 * @example
 * const { result } = await createPricePreferencesWorkflow(container)
 * .run({
 *   input: [
 *     {
 *       attribute: "region_id",
 *       value: "reg_123",
 *       is_tax_inclusive: true
 *     }
 *   ]
 * })
 * 
 * @summary
 * 
 * Create one or more price preferences.
 */
export const createPricePreferencesWorkflow = createWorkflow(
  {
    name: createPricePreferencesWorkflowId,
    inputSchema: createPricePreferencesWorkflowInputSchema,
    outputSchema: createPricePreferencesWorkflowOutputSchema,
  },
  (input) => {
    return new WorkflowResponse(createPricePreferencesStep(input))
  }
)
