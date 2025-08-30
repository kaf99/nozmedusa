import {
  WorkflowResponse,
  createWorkflow,
} from "@medusajs/framework/workflows-sdk"
import { createRemoteLinkStep } from "../steps/create-remote-links"
import {
  createLinksWorkflowInputSchema,
  createLinksWorkflowOutputSchema,
} from "../utils/batch-links-schemas"

export type {
  CreateLinksWorkflowInput,
  CreateLinksWorkflowOutput,
} from "../utils/batch-links-schemas"

export const createLinksWorkflowId = "create-link"
/**
 * This workflow creates one or more links between records.
 * 
 * You can use this workflow within your customizations or your own custom workflows, allowing you to
 * create links within your custom flows.
 * 
 * Learn more about links in [this documentation](https://docs.medusajs.com/learn/fundamentals/module-links/link).
 * 
 * @example
 * const { result } = await createLinksWorkflow(container)
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
 * Create links between two records of linked data models.
 */
export const createLinksWorkflow = createWorkflow(
  {
    name: createLinksWorkflowId,
    description: "Create links between two records of linked data models",
    inputSchema: createLinksWorkflowInputSchema,
    outputSchema: createLinksWorkflowOutputSchema,
  },
  (input) => {
    return new WorkflowResponse(createRemoteLinkStep(input))
  }
)
