import {
  PricingTypes,
  UpdatePriceListPricesWorkflowDTO,
} from "@medusajs/framework/types"
import {
  WorkflowResponse,
  createWorkflow,
  parallelize,
} from "@medusajs/framework/workflows-sdk"
import { updatePriceListPricesStep } from "../steps/update-price-list-prices"
import { validatePriceListsStep } from "../steps/validate-price-lists"
import { validateVariantPriceLinksStep } from "../steps/validate-variant-price-links"
import {
  updatePriceListPricesWorkflowInputSchema,
  updatePriceListPricesWorkflowOutputSchema,
  type UpdatePriceListPricesWorkflowInput as SchemaInput,
  type UpdatePriceListPricesWorkflowOutput as SchemaOutput,
} from "../utils/schemas"

export {
  type UpdatePriceListPricesWorkflowInput,
  type UpdatePriceListPricesWorkflowOutput,
} from "../utils/schemas"

// Type verification - CORRECT ORDER!
const schemaInput = {} as SchemaInput
const schemaOutput = {} as SchemaOutput

// Check 1: New input can go into old input (schema accepts all valid inputs)
const existingInput: {
  data: UpdatePriceListPricesWorkflowDTO[]
} = schemaInput

// Check 2: Old output can go into new output (schema produces compatible outputs) 
const existingOutput: SchemaOutput = {} as PricingTypes.PriceDTO[]

console.log(existingInput, existingOutput, schemaOutput)

// Legacy types for backward compatibility  
export type { UpdatePriceListPricesWorkflowInput as LegacyUpdatePriceListPricesWorkflowInput } from "../utils/schemas"
export type { UpdatePriceListPricesWorkflowOutput as LegacyUpdatePriceListPricesWorkflowOutput } from "../utils/schemas"

export const updatePriceListPricesWorkflowId = "update-price-list-prices"
/**
 * This workflow update price lists' prices. It's used by other workflows, such
 * as {@link batchPriceListPricesWorkflow}.
 * 
 * You can use this workflow within your customizations or your own custom workflows, allowing you to
 * update prices in price lists in your custom flows.
 * 
 * @example
 * const { result } = await updatePriceListPricesWorkflow(container)
 * .run({
 *   input: {
 *     data: [
 *       {
 *         id: "price_123",
 *         prices: [
 *           {
 *             id: "price_123",
 *             amount: 10,
 *             currency_code: "usd",
 *             variant_id: "variant_123"
 *           }
 *         ]
 *       }
 *     ]
 *   }
 * })
 * 
 * @summary
 * 
 * Update price lists' prices.
 */
export const updatePriceListPricesWorkflow = createWorkflow(
  {
    name: updatePriceListPricesWorkflowId,
    description: "Update price lists' prices",
    inputSchema: updatePriceListPricesWorkflowInputSchema,
    outputSchema: updatePriceListPricesWorkflowOutputSchema,
  },
  (input) => {
    const [_, variantPriceMap] = parallelize(
      validatePriceListsStep(input.data),
      validateVariantPriceLinksStep(input.data)
    )

    return new WorkflowResponse(
      updatePriceListPricesStep({
        data: input.data,
        variant_price_map: variantPriceMap,
      })
    )
  }
)
