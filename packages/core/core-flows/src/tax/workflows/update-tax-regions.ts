import {
  WorkflowResponse,
  createWorkflow,
} from "@medusajs/framework/workflows-sdk"
import { updateTaxRegionsStep } from "../steps/update-tax-regions"
import {
  updateTaxRegionsWorkflowInputSchema,
  updateTaxRegionsWorkflowOutputSchema,
} from "../utils/schemas"

export {
  type UpdateTaxRegionsWorkflowInput,
  type UpdateTaxRegionsWorkflowOutput,

} from "../utils/schemas"

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
