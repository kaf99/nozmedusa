import { CreateTaxRateRuleDTO, TaxRateRuleDTO } from "@medusajs/framework/types"
import {
  WorkflowResponse,
  createWorkflow,
  transform,
} from "@medusajs/framework/workflows-sdk"
import {
  createTaxRateRulesStep,
  deleteTaxRateRulesStep,
  listTaxRateRuleIdsStep,
} from "../steps"
import {
  setTaxRateRulesWorkflowInputSchema,
  setTaxRateRulesWorkflowOutputSchema,
  type SetTaxRatesRulesWorkflowInput as SchemaInput,
  type SetTaxRatesRulesWorkflowOutput as SchemaOutput,
} from "../utils/schemas"

export {
  type SetTaxRatesRulesWorkflowInput,
  type SetTaxRatesRulesWorkflowOutput,
} from "../utils/schemas"

// Type verification - CORRECT ORDER!
const schemaInput = {} as SchemaInput
const schemaOutput = {} as SchemaOutput

// Check 1: New input can go into old input (schema accepts all valid inputs)
const existingInput: {
  tax_rate_ids: string[]
  rules: Omit<CreateTaxRateRuleDTO, "tax_rate_id">[]
} = schemaInput

// Check 2: Old output can go into new output (schema produces compatible outputs)
const existingOutput: SchemaOutput = {} as TaxRateRuleDTO[]

console.log(existingInput, existingOutput, schemaOutput)

export const setTaxRateRulesWorkflowId = "set-tax-rate-rules"
/**
 * This workflow sets the rules of tax rates.
 * 
 * You can use this workflow within your own customizations or custom workflows, allowing you
 * to set the rules of tax rates in your custom flows.
 * 
 * @example
 * const { result } = await setTaxRateRulesWorkflow(container)
 * .run({
 *   input: {
 *     tax_rate_ids: ["txr_123"],
 *     rules: [
 *       {
 *         reference: "product_type",
 *         reference_id: "ptyp_123"
 *       }
 *     ]
 *   }
 * })
 * 
 * @summary
 * 
 * Set the rules of tax rates.
 */
export const setTaxRateRulesWorkflow = createWorkflow(
  {
    name: setTaxRateRulesWorkflowId,
    description: "Set the rules of tax rates",
    inputSchema: setTaxRateRulesWorkflowInputSchema,
    outputSchema: setTaxRateRulesWorkflowOutputSchema,
  },
  (input) => {
    const ruleIds = listTaxRateRuleIdsStep({
      selector: { tax_rate_id: input.tax_rate_ids },
    })

    deleteTaxRateRulesStep(ruleIds)

    const rulesWithRateId = transform(
      { rules: input.rules, rateIds: input.tax_rate_ids },
      ({ rules, rateIds }) => {
        return rules
          .map((r) => {
            return rateIds.map((id) => {
              return {
                ...r,
                tax_rate_id: id,
              }
            })
          })
          .flat()
      }
    )

    return new WorkflowResponse(createTaxRateRulesStep(rulesWithRateId))
  }
)
