import { Modules } from "@medusajs/framework/utils"
import { createWorkflow } from "@medusajs/framework/workflows-sdk"
import { removeRemoteLinkStep } from "../../common/steps/remove-remote-links"
import { deletePricePreferencesStep } from "../steps"
import {
  deletePricePreferencesWorkflowInputSchema,
  deletePricePreferencesWorkflowOutputSchema,
  type DeletePricePreferencesWorkflowInput as SchemaInput,
  type DeletePricePreferencesWorkflowOutput as SchemaOutput,
} from "../utils/schemas"
export {
  type DeletePricePreferencesWorkflowInput,
  type DeletePricePreferencesWorkflowOutput,
} from "../utils/schemas"

/**
 * The IDs of price preferences to delete.
 */
type OldDeletePricePreferencesWorkflowInput = string[]

// Type verification
const schemaInput = {} as SchemaInput
const schemaOutput = undefined as SchemaOutput
const existingInput: OldDeletePricePreferencesWorkflowInput = schemaInput
const existingOutput: void = schemaOutput

// Check reverse too
const oldInput = {} as OldDeletePricePreferencesWorkflowInput
const oldOutput = undefined as void
const newInput: SchemaInput = oldInput
const newOutput: SchemaOutput = oldOutput

console.log(existingInput, existingOutput, newInput, newOutput)

export const deletePricePreferencesWorkflowId = "delete-price-preferences"
/**
 * This workflow deletes one or more price preferences. It's used by the
 * [Delete Price Preferences Admin API Route](https://docs.medusajs.com/api/admin#price-preferences_deletepricepreferencesid).
 *
 * You can use this workflow within your customizations or your own custom workflows, allowing you to
 * delete price preferences in your custom flows.
 *
 * @example
 * const { result } = await deletePricePreferencesWorkflow(container)
 * .run({
 *   input: ["pp_123"]
 * })
 *
 * @summary
 *
 * Delete one or more price preferences.
 */
export const deletePricePreferencesWorkflow = createWorkflow(
  {
    name: deletePricePreferencesWorkflowId,
    inputSchema: deletePricePreferencesWorkflowInputSchema,
    outputSchema: deletePricePreferencesWorkflowOutputSchema,
  },
  (input) => {
    const deletedPricePreferences = deletePricePreferencesStep(input)

    removeRemoteLinkStep({
      [Modules.PRICING]: {
        price_preference_id: input,
      },
    })

    return deletedPricePreferences
  }
)
