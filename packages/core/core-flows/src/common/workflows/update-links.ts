import {
  WorkflowData,
  WorkflowResponse,
  createWorkflow,
} from "@medusajs/framework/workflows-sdk"
import { updateRemoteLinksStep } from "../steps/update-remote-links"
import {
  updateLinksWorkflowInputSchema,
  updateLinksWorkflowOutputSchema,
  type UpdateLinksWorkflowInput,
  type UpdateLinksWorkflowOutput,
} from "../utils/batch-links-schemas"

export const updateLinksWorkflowId = "update-link"
/**
 * This workflow updates one or more links between records.
 * 
 * You can use this workflow within your customizations or your own custom workflows, allowing you to
 * update links within your custom flows.
 * 
 * Learn more about links in [this documentation](https://docs.medusajs.com/learn/fundamentals/module-links/link).
 * 
 * @example
 * const { result } = await updateLinksWorkflow(container)
 * .run({
 *   input: [
 *     {
 *       // import { Modules } from "@medusajs/framework/utils"
 *       [Modules.PRODUCT]: {
 *         product_id: "prod_123",
 *       },
 *       "helloModuleService": {
 *         my_custom_id: "mc_123",
 *       },
 *       data: {
 *         metadata: {
 *           test: false,
 *         },
 *       }
 *     }
 *   ]
 * })
 * 
 * @summary
 * 
 * Update links between two records of linked data models.
 */
export const updateLinksWorkflow = createWorkflow(
  {
    name: updateLinksWorkflowId,
    description: "Update links between two records of linked data models",
    inputSchema: updateLinksWorkflowInputSchema,
    outputSchema: updateLinksWorkflowOutputSchema,
  },
  (input: WorkflowData<UpdateLinksWorkflowInput>): WorkflowResponse<UpdateLinksWorkflowOutput> => {
    return new WorkflowResponse(updateRemoteLinksStep(input))
  }
)
