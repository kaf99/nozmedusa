import {
  WorkflowResponse,
  createWorkflow,
  parallelize,
} from "@medusajs/framework/workflows-sdk"
import { createRemoteLinkStep } from "../steps/create-remote-links"
import { dismissRemoteLinkStep } from "../steps/dismiss-remote-links"
import { updateRemoteLinksStep } from "../steps/update-remote-links"
import {
  batchLinksWorkflowInputSchema,
  batchLinksWorkflowOutputSchema,
} from "../utils/batch-links-schemas"

export type {
  BatchLinksWorkflowInput,
  BatchLinksWorkflowOutput,
} from "../utils/batch-links-schemas"

export const batchLinksWorkflowId = "batch-links"
/**
 * This workflow manages one or more links to create, update, or dismiss them.
 * 
 * You can use this workflow within your customizations or your own custom workflows, allowing you to
 * manage links within your custom flows.
 * 
 * Learn more about links in [this documentation](https://docs.medusajs.com/learn/fundamentals/module-links/link).
 * 
 * @example
 * const { result } = await batchLinksWorkflow(container)
 * .run({
 *   input: {
 *     create: [
 *       {
 *         // import { Modules } from "@medusajs/framework/utils"
 *         [Modules.PRODUCT]: {
 *           product_id: "prod_123",
 *         },
 *         "helloModuleService": {
 *           my_custom_id: "mc_123",
 *         },
 *       }
 *     ],
 *     update: [
 *       {
 *         // import { Modules } from "@medusajs/framework/utils"
 *         [Modules.PRODUCT]: {
 *           product_id: "prod_321",
 *         },
 *         "helloModuleService": {
 *           my_custom_id: "mc_321",
 *         },
 *         data: {
 *           metadata: {
 *             test: false
 *           }
 *         }
 *       }
 *     ],
 *     delete: [
 *       {
 *         // import { Modules } from "@medusajs/framework/utils"
 *         [Modules.PRODUCT]: {
 *           product_id: "prod_321",
 *         },
 *       }
 *     ]
 *   }
 * })
 * 
 * @summary
 * 
 * Manage links between two records of linked data models.
 */
export const batchLinksWorkflow = createWorkflow(
  {
    name: batchLinksWorkflowId,
    description: "Manage links between two records of linked data models",
    inputSchema: batchLinksWorkflowInputSchema,
    outputSchema: batchLinksWorkflowOutputSchema,
  },
  (input) => {
    const [created, updated, deleted] = parallelize(
      createRemoteLinkStep(input.create || []),
      updateRemoteLinksStep(input.update || []),
      dismissRemoteLinkStep(input.delete || [])
    )

    return new WorkflowResponse({
      created,
      updated,
      deleted,
    })
  }
)
