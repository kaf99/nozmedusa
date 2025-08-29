import {
  WorkflowResponse,
  createWorkflow,
} from "@medusajs/framework/workflows-sdk"
import { createTaxRateRulesStep } from "../steps"
import {
  createTaxRateRulesWorkflowInputSchema,
  createTaxRateRulesWorkflowOutputSchema,
} from "../utils/schemas"

export {
  type CreateTaxRateRulesWorkflowInput,
  type CreateTaxRateRulesWorkflowOutput,

} from "../utils/schemas"

export const createTaxRateRulesWorkflowId = "create-tax-rate-rules"
/**
 * This workflow creates one or more tax rules for rates. It's used by the
 * [Create Tax Rules for Rates Admin API Route](https://docs.medusajs.com/api/admin#tax-rates_posttaxratesidrules).
 *
 * You can use this workflow within your own customizations or custom workflows, allowing you
 * to create tax rules for rates in your custom flows.
 *
 * @example
 * const { result } = await createTaxRateRulesWorkflow(container)
 * .run({
 *   input: {
 *     rules: [
 *       {
 *         tax_rate_id: "txr_123",
 *         reference: "product_type",
 *         reference_id: "ptyp_123"
 *       }
 *     ]
 *   }
 * })
 *
 * @summary
 *
 * Create one or more tax rules for rates.
 */
export const createTaxRateRulesWorkflow = createWorkflow(
  {
    name: createTaxRateRulesWorkflowId,
    description: "Create one or more tax rules for rates",
    inputSchema: createTaxRateRulesWorkflowInputSchema,
    outputSchema: createTaxRateRulesWorkflowOutputSchema,
  },
  (input) => {
    return new WorkflowResponse(createTaxRateRulesStep(input.rules))
  }
)
