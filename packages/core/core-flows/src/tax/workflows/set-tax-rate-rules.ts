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
} from "../utils/schemas"

export {
  type SetTaxRatesRulesWorkflowInput,
  type SetTaxRatesRulesWorkflowOutput,

} from "../utils/schemas"

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
