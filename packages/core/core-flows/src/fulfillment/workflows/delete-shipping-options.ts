import { createWorkflow, WorkflowData } from "@medusajs/framework/workflows-sdk"
import { deleteShippingOptionsStep } from "../steps"
import { removeRemoteLinkStep } from "../../common"
import {
  deleteShippingOptionsWorkflowInputSchema,
  deleteShippingOptionsWorkflowOutputSchema,
  type DeleteShippingOptionsWorkflowInput,
  type DeleteShippingOptionsWorkflowOutput,
} from "../utils/schemas"

export const deleteShippingOptionsWorkflowId =
  "delete-shipping-options-workflow"
/**
 * This workflow deletes one or more shipping options. It's used by the
 * [Delete Shipping Options Admin API Route](https://docs.medusajs.com/api/admin#shipping-options_deleteshippingoptionsid).
 * 
 * You can use this workflow within your own customizations or custom workflows, allowing you to
 * delete shipping options within your custom flows.
 * 
 * @example
 * const { result } = await deleteShippingOptionsWorkflow(container)
 * .run({
 *   input: {
 *     ids: ["so_123"]
 *   }
 * })
 * 
 * @summary
 * 
 * Delete one or more shipping options.
 */
export const deleteShippingOptionsWorkflow = createWorkflow(
  {
    name: deleteShippingOptionsWorkflowId,
    description: "Delete one or more shipping options",
    inputSchema: deleteShippingOptionsWorkflowInputSchema,
    outputSchema: deleteShippingOptionsWorkflowOutputSchema,
  },
  (
    input: WorkflowData<DeleteShippingOptionsWorkflowInput>
  ): WorkflowData<DeleteShippingOptionsWorkflowOutput> => {
    const softDeletedEntities = deleteShippingOptionsStep(input.ids)

    removeRemoteLinkStep(softDeletedEntities)
  }
)
