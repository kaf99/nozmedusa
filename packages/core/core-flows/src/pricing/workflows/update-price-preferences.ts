import { PricingWorkflow, PricePreferenceDTO } from "@medusajs/framework/types"
import {
  WorkflowResponse,
  createWorkflow,
} from "@medusajs/framework/workflows-sdk"
import { updatePricePreferencesStep } from "../steps"
import {
  updatePricePreferencesWorkflowInputSchema,
  updatePricePreferencesWorkflowOutputSchema,
  type UpdatePricePreferencesWorkflowInput as SchemaInput,
  type UpdatePricePreferencesWorkflowOutput as SchemaOutput,
} from "../utils/schemas"
export {
  type UpdatePricePreferencesWorkflowInput,
  type UpdatePricePreferencesWorkflowOutput,
} from "../utils/schemas"

// Type verification
type OldUpdatePricePreferencesWorkflowInput = PricingWorkflow.UpdatePricePreferencesWorkflowInput

const schemaInput = {} as SchemaInput
const schemaOutput = {} as SchemaOutput
const existingInput: OldUpdatePricePreferencesWorkflowInput = schemaInput
const existingOutput: PricePreferenceDTO[] = schemaOutput

// Check reverse too
const oldInput = {} as OldUpdatePricePreferencesWorkflowInput
const oldOutput = {} as PricePreferenceDTO[]
const newInput: SchemaInput = oldInput
const newOutput: SchemaOutput = oldOutput

console.log(existingInput, existingOutput, newInput, newOutput)

export const updatePricePreferencesWorkflowId = "update-price-preferences"
/**
 * This workflow updates one or more price preferences. It's used by the
 * [Update Price Preference Admin API Route](https://docs.medusajs.com/api/admin#price-preferences_postpricepreferencesid).
 * 
 * You can use this workflow within your customizations or your own custom workflows, allowing you to
 * update price preferences in your custom flows.
 * 
 * @example
 * const { result } = await updatePricePreferencesWorkflow(container)
 * .run({
 *   input: {
 *     selector: {
 *       id: ["pp_123"]
 *     },
 *     update: {
 *       is_tax_inclusive: true
 *     }
 *   }
 * })
 * 
 * @summary
 * 
 * Update one or more price preferences.
 */
export const updatePricePreferencesWorkflow = createWorkflow(
  {
    name: updatePricePreferencesWorkflowId,
    inputSchema: updatePricePreferencesWorkflowInputSchema,
    outputSchema: updatePricePreferencesWorkflowOutputSchema,
  },
  (input) => {
    return new WorkflowResponse(updatePricePreferencesStep(input))
  }
)
