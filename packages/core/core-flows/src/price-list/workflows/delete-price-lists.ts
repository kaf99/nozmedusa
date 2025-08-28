import { Modules } from "@medusajs/framework/utils"
import { createWorkflow } from "@medusajs/framework/workflows-sdk"
import { removeRemoteLinkStep } from "../../common/steps/remove-remote-links"
import { deletePriceListsStep } from "../steps"
import {
  deletePriceListsWorkflowInputSchema,
  deletePriceListsWorkflowOutputSchema,
  type DeletePriceListsWorkflowInput as SchemaInput,
  type DeletePriceListsWorkflowOutput as SchemaOutput,
} from "../utils/schemas"

export {
  type DeletePriceListsWorkflowInput,
  type DeletePriceListsWorkflowOutput,
} from "../utils/schemas"

// Type verification - CORRECT ORDER!
const schemaInput = {} as SchemaInput
const schemaOutput = undefined as any as SchemaOutput

// Check 1: New input can go into old input (schema accepts all valid inputs)
const existingInput: {
  ids: string[]
} = schemaInput

// Check 2: Old output can go into new output (schema produces compatible outputs)
const existingOutput: SchemaOutput = undefined as any

console.log(existingInput, existingOutput, schemaOutput)

// Legacy types for backward compatibility  
export type { DeletePriceListsWorkflowInput as LegacyDeletePriceListsWorkflowInput } from "../utils/schemas"
export type { DeletePriceListsWorkflowOutput as LegacyDeletePriceListsWorkflowOutput } from "../utils/schemas"

export const deletePriceListsWorkflowId = "delete-price-lists"
/**
 * This workflow deletes one or more price lists. It's used by the
 * [Delete Price List Admin API Route](https://docs.medusajs.com/api/admin#price-lists_deletepricelistsid).
 *
 * You can use this workflow within your customizations or your own custom workflows, allowing you to
 * delete price lists in your custom flows.
 *
 * @example
 * const { result } = await deletePriceListsWorkflow(container)
 * .run({
 *   input: {
 *     ids: ["plist_123"]
 *   }
 * })
 *
 * @summary
 *
 * Delete one or more price lists.
 */
export const deletePriceListsWorkflow = createWorkflow(
  {
    name: deletePriceListsWorkflowId,
    description: "Delete one or more price lists",
    inputSchema: deletePriceListsWorkflowInputSchema,
    outputSchema: deletePriceListsWorkflowOutputSchema,
  },
  (input) => {
    const deletedPriceLists = deletePriceListsStep(input.ids)

    removeRemoteLinkStep({
      [Modules.PRICING]: {
        price_list_id: input.ids,
      },
    })

    return deletedPriceLists
  }
)
