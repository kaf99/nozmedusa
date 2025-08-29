import {
  WorkflowResponse,
  createWorkflow,
} from "@medusajs/framework/workflows-sdk"
import { deleteTaxRateRulesStep } from "../steps"
import {
  deleteTaxRateRulesWorkflowInputSchema,
  deleteTaxRateRulesWorkflowOutputSchema,
} from "../utils/schemas"

export const deleteTaxRateRulesWorkflowId = "delete-tax-rate-rules"
/**
 * This workflow deletes one or more tax rate rules. It's used by the
 * [Remove Rule of Tax Rate Admin API Route](https://docs.medusajs.com/api/admin#tax-rates_deletetaxratesidrulesrule_id).
 *
 * You can use this workflow within your own customizations or custom workflows, allowing you
 * to delete tax rate rules in your custom flows.
 *
 * @example
 * const { result } = await deleteTaxRateRulesWorkflow(container)
 * .run({
 *   input: {
 *     ids: ["txrr_123"]
 *   }
 * })
 *
 * @summary
 *
 * Delete one or more tax rate rules.
 */
export const deleteTaxRateRulesWorkflow = createWorkflow(
  {
    name: deleteTaxRateRulesWorkflowId,
    description: "Delete one or more tax rate rules",
    inputSchema: deleteTaxRateRulesWorkflowInputSchema,
    outputSchema: deleteTaxRateRulesWorkflowOutputSchema,
  },
  (input) => {
    return new WorkflowResponse(deleteTaxRateRulesStep(input.ids))
  }
)
