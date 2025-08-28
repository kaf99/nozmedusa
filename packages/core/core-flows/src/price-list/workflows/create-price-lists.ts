import {
  CreatePriceListWorkflowInputDTO,
  PriceListDTO,
} from "@medusajs/framework/types"
import {
  WorkflowResponse,
  createWorkflow,
} from "@medusajs/framework/workflows-sdk"
import { createPriceListsStep, validateVariantPriceLinksStep } from "../steps"
import {
  createPriceListsWorkflowInputSchema,
  createPriceListsWorkflowOutputSchema,
  type CreatePriceListsWorkflowInput as SchemaInput,
  type CreatePriceListsWorkflowOutput as SchemaOutput,
} from "../utils/schemas"

export {
  type CreatePriceListsWorkflowInput,
  type CreatePriceListsWorkflowOutput,
} from "../utils/schemas"

// Type verification - CORRECT ORDER!
const schemaInput = {} as SchemaInput
const schemaOutput = {} as SchemaOutput

// Check 1: New input can go into old input (schema accepts all valid inputs)
const existingInput: {
  price_lists_data: CreatePriceListWorkflowInputDTO[]
} = schemaInput

// Check 2: Old output can go into new output (schema produces compatible outputs)
const existingOutput: SchemaOutput = {} as PriceListDTO[]

console.log(existingInput, existingOutput, schemaOutput)

// Legacy types for backward compatibility  
export type { CreatePriceListsWorkflowInput as LegacyCreatePriceListsWorkflowInput } from "../utils/schemas"
export type { CreatePriceListsWorkflowOutput as LegacyCreatePriceListsWorkflowOutput } from "../utils/schemas"

export const createPriceListsWorkflowId = "create-price-lists"
/**
 * This workflow creates one or more price lists. It's used by the
 * [Create Price List Admin API Route](https://docs.medusajs.com/api/admin#price-lists_postpricelists).
 * 
 * You can use this workflow within your customizations or your own custom workflows, allowing you to
 * create price lists in your custom flows.
 * 
 * @example
 * const { result } = await createPriceListsWorkflow(container)
 * .run({
 *   input: {
 *     price_lists_data: [
 *       {
 *         title: "Price List 1",
 *         description: "Price List 1 Description",
 *       }
 *     ]
 *   }
 * })
 * 
 * @summary
 * 
 * Create one or more price lists.
 */
export const createPriceListsWorkflow = createWorkflow(
  {
    name: createPriceListsWorkflowId,
    description: "Create one or more price lists",
    inputSchema: createPriceListsWorkflowInputSchema,
    outputSchema: createPriceListsWorkflowOutputSchema,
  },
  (input) => {
    const variantPriceMap = validateVariantPriceLinksStep(
      input.price_lists_data
    )

    return new WorkflowResponse(
      createPriceListsStep({
        data: input.price_lists_data,
        variant_price_map: variantPriceMap,
      })
    )
  }
)
