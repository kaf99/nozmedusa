import { TaxRegionDTO, UpdateTaxRegionDTO } from "@medusajs/framework/types"
import {
  WorkflowResponse,
  createWorkflow,
} from "@medusajs/framework/workflows-sdk"
import { updateTaxRegionsStep } from "../steps/update-tax-regions"
import {
  updateTaxRegionsWorkflowInputSchema,
  updateTaxRegionsWorkflowOutputSchema,
  type UpdateTaxRegionsWorkflowInput as SchemaInput,
  type UpdateTaxRegionsWorkflowOutput as SchemaOutput,
} from "../utils/schemas"

export {
  type UpdateTaxRegionsWorkflowInput,
  type UpdateTaxRegionsWorkflowOutput,
} from "../utils/schemas"

// Type verification - CORRECT ORDER!
const schemaInput = {} as SchemaInput
const schemaOutput = {} as SchemaOutput

// Check 1: New input can go into old input (schema accepts all valid inputs)
const existingInput: UpdateTaxRegionDTO[] = schemaInput

// Check 2: Old output can go into new output (schema produces compatible outputs)
const existingOutput: SchemaOutput = {} as TaxRegionDTO[]

console.log(existingInput, existingOutput, schemaOutput)

export const updateTaxRegionsWorkflowId = "update-tax-regions"
/**
 * This workflow updates one or more tax regions. It's used by the
 * [Update Tax Regions Admin API Route](https://docs.medusajs.com/api/admin#tax-regions_posttaxregionsid).
 *
 * You can use this workflow within your own customizations or custom workflows, allowing you
 * to update tax regions in your custom flows.
 *
 * @example
 * const { result } = await updateTaxRegionsWorkflow(container)
 * .run({
 *   input: [
 *     {
 *       id: "txreg_123",
 *       province_code: "CA",
 *     }
 *   ]
 * })
 *
 * @summary
 *
 * Update one or more tax regions.
 */
export const updateTaxRegionsWorkflow = createWorkflow(
  {
    name: updateTaxRegionsWorkflowId,
    description: "Update one or more tax regions",
    inputSchema: updateTaxRegionsWorkflowInputSchema,
    outputSchema: updateTaxRegionsWorkflowOutputSchema,
  },
  (input) => {
    return new WorkflowResponse(updateTaxRegionsStep(input))
  }
)
