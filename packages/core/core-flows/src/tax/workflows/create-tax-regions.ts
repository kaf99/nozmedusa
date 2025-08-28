import { CreateTaxRegionDTO, TaxRegionDTO } from "@medusajs/framework/types"
import {
  WorkflowResponse,
  createWorkflow,
} from "@medusajs/framework/workflows-sdk"
import { createTaxRegionsStep } from "../steps"
import {
  createTaxRegionsWorkflowInputSchema,
  createTaxRegionsWorkflowOutputSchema,
  type CreateTaxRegionsWorkflowInput as SchemaInput,
  type CreateTaxRegionsWorkflowOutput as SchemaOutput,
} from "../utils/schemas"

export {
  type CreateTaxRegionsWorkflowInput,
  type CreateTaxRegionsWorkflowOutput,
} from "../utils/schemas"

// Type verification - CORRECT ORDER!
const schemaInput = {} as SchemaInput
const schemaOutput = {} as SchemaOutput

// Check 1: New input can go into old input (schema accepts all valid inputs)
const existingInput: CreateTaxRegionDTO[] = schemaInput

// Check 2: Old output can go into new output (schema produces compatible outputs)
const existingOutput: SchemaOutput = {} as TaxRegionDTO[]

console.log(existingInput, existingOutput, schemaOutput)

export const createTaxRegionsWorkflowId = "create-tax-regions"
/**
 * This workflow creates one or more tax regions. It's used by the
 * [Create Tax Region Admin API Route](https://docs.medusajs.com/api/admin#tax-regions_posttaxregions).
 * 
 * You can use this workflow within your own customizations or custom workflows, allowing you
 * to create tax regions in your custom flows.
 * 
 * @example
 * const { result } = await createTaxRegionsWorkflow(container)
 * .run({
 *   input: [
 *     {
 *       country_code: "us",
 *     }
 *   ]
 * })
 * 
 * @summary
 * 
 * Create one or more tax regions.
 */
export const createTaxRegionsWorkflow = createWorkflow(
  {
    name: createTaxRegionsWorkflowId,
    description: "Create one or more tax regions",
    inputSchema: createTaxRegionsWorkflowInputSchema,
    outputSchema: createTaxRegionsWorkflowOutputSchema,
  },
  (input) => {
    return new WorkflowResponse(createTaxRegionsStep(input))
  }
)
