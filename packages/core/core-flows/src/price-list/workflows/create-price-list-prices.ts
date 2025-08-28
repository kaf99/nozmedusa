import {
  CreatePriceListPricesWorkflowDTO,
  PricingTypes,
} from "@medusajs/framework/types"
import {
  WorkflowResponse,
  createWorkflow,
  parallelize,
} from "@medusajs/framework/workflows-sdk"
import { createPriceListPricesStep } from "../steps/create-price-list-prices"
import { validatePriceListsStep } from "../steps/validate-price-lists"
import { validateVariantPriceLinksStep } from "../steps/validate-variant-price-links"
import {
  createPriceListPricesWorkflowInputSchema,
  createPriceListPricesWorkflowOutputSchema,
  type CreatePriceListPricesWorkflowInput as SchemaInput,
  type CreatePriceListPricesWorkflowOutput as SchemaOutput,
} from "../utils/schemas"

export {
  type CreatePriceListPricesWorkflowInput,
  type CreatePriceListPricesWorkflowOutput,
} from "../utils/schemas"

// Type verification - CORRECT ORDER!
const schemaInput = {} as SchemaInput
const schemaOutput = {} as SchemaOutput

// Check 1: New input can go into old input (schema accepts all valid inputs)
const existingInput: {
  data: CreatePriceListPricesWorkflowDTO[]
} = schemaInput

// Check 2: Old output can go into new output (schema produces compatible outputs)
const existingOutput: SchemaOutput = {} as PricingTypes.PriceDTO[]

console.log(existingInput, existingOutput, schemaOutput)

// Legacy types for backward compatibility  
export type { CreatePriceListPricesWorkflowInput as LegacyCreatePriceListPricesWorkflowInput } from "../utils/schemas"
export type { CreatePriceListPricesWorkflowOutput as LegacyCreatePriceListPricesWorkflowOutput } from "../utils/schemas"

export const createPriceListPricesWorkflowId = "create-price-list-prices"
/**
 * This workflow creates prices in price lists. It's used by other workflows, such as 
 * {@link batchPriceListPricesWorkflow}.
 * 
 * You can use this workflow within your customizations or your own custom workflows, allowing you to
 * create prices in price lists in your custom flows.
 * 
 * @example
 * const { result } = await createPriceListPricesWorkflow(container)
 * .run({
 *   input: {
 *     data: [{
 *       id: "plist_123",
 *       prices: [
 *         {
 *           amount: 10,
 *           currency_code: "usd",
 *           variant_id: "variant_123"
 *         }
 *       ],
 *     }]
 *   }
 * })
 * 
 * @summary
 * 
 * Create prices in price lists.
 */
export const createPriceListPricesWorkflow = createWorkflow(
  {
    name: createPriceListPricesWorkflowId,
    description: "Create prices in price lists",
    inputSchema: createPriceListPricesWorkflowInputSchema,
    outputSchema: createPriceListPricesWorkflowOutputSchema,
  },
  (input) => {
    const [_, variantPriceMap] = parallelize(
      validatePriceListsStep(input.data),
      validateVariantPriceLinksStep(input.data)
    )

    return new WorkflowResponse(
      createPriceListPricesStep({
        data: input.data,
        variant_price_map: variantPriceMap,
      })
    )
  }
)
