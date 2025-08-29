import {
  WorkflowResponse,
  createWorkflow,
} from "@medusajs/framework/workflows-sdk"
import { createTaxRegionsStep } from "../steps"
import {
  createTaxRegionsWorkflowInputSchema,
  createTaxRegionsWorkflowOutputSchema,
} from "../utils/schemas"

export {
  type CreateTaxRegionsWorkflowInput,
  type CreateTaxRegionsWorkflowOutput,

} from "../utils/schemas"

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
