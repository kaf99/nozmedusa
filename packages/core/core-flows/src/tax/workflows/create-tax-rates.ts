import { CreateTaxRateDTO, TaxRateDTO } from "@medusajs/framework/types"
import {
  WorkflowResponse,
  createWorkflow,
} from "@medusajs/framework/workflows-sdk"
import { createTaxRatesStep } from "../steps"
import {
  createTaxRatesWorkflowInputSchema,
  createTaxRatesWorkflowOutputSchema,
  type CreateTaxRatesWorkflowInput as SchemaInput,
  type CreateTaxRatesWorkflowOutput as SchemaOutput,
} from "../utils/schemas"

/**
 * The tax rates to create.
 */
export type CreateTaxRatesWorkflowInput = CreateTaxRateDTO[]

/**
 * The created tax rates.
 */
export type CreateTaxRatesWorkflowOutput = TaxRateDTO[]

// Type verification - CORRECT ORDER!
const _in: SchemaInput = {} as CreateTaxRatesWorkflowInput
const _out: SchemaOutput = {} as CreateTaxRatesWorkflowOutput
void _in, _out

export const createTaxRatesWorkflowId = "create-tax-rates"
/**
 * This workflow creates one or more tax rates. It's used by the
 * [Create Tax Rates Admin API Route](https://docs.medusajs.com/api/admin#tax-rates_posttaxrates).
 *
 * You can use this workflow within your own customizations or custom workflows, allowing you
 * to create tax rates in your custom flows.
 *
 * @example
 * const { result } = await createTaxRatesWorkflow(container)
 * .run({
 *   input: [
 *     {
 *       tax_region_id: "txreg_123",
 *       name: "Default"
 *     }
 *   ]
 * })
 *
 * @summary
 *
 * Create one or more tax rates.
 */
export const createTaxRatesWorkflow = createWorkflow(
  {
    name: createTaxRatesWorkflowId,
    description: "Create one or more tax rates",
    inputSchema: createTaxRatesWorkflowInputSchema,
    outputSchema: createTaxRatesWorkflowOutputSchema,
  },
  (input) => {
    return new WorkflowResponse(createTaxRatesStep(input))
  }
)
