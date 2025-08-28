import {
  WorkflowData,
  WorkflowResponse,
  createWorkflow,
} from "@medusajs/framework/workflows-sdk"
import { dismissRemoteLinkStep } from "../steps/dismiss-remote-links"
import {
  dismissLinksWorkflowInputSchema,
  dismissLinksWorkflowOutputSchema,
  type DismissLinksWorkflowInput,
  type DismissLinksWorkflowOutput,
} from "../utils/batch-links-schemas"

export const dismissLinksWorkflowId = "dismiss-link"
/**
 * This workflow dismisses one or more links between records.
 * 
 * You can use this workflow within your customizations or your own custom workflows, allowing you to
 * dismiss links within your custom flows.
 * 
 * Learn more about links in [this documentation](https://docs.medusajs.com/learn/fundamentals/module-links/link).
 * 
 * @example
 * const { result } = await dismissLinksWorkflow(container)
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
 *     }
 *   ]
 * })
 * 
 * @summary
 * 
 * Dismiss links between two records of linked data models.
 */
export const dismissLinksWorkflow = createWorkflow(
  {
    name: dismissLinksWorkflowId,
    description: "Dismiss links between two records of linked data models",
    inputSchema: dismissLinksWorkflowInputSchema,
    outputSchema: dismissLinksWorkflowOutputSchema,
  },
  (input: WorkflowData<DismissLinksWorkflowInput>): WorkflowResponse<DismissLinksWorkflowOutput> => {
    dismissRemoteLinkStep(input)
    return new WorkflowResponse(void 0)
  }
)
