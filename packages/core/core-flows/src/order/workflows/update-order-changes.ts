import {
  WorkflowResponse,
  createWorkflow,
} from "@medusajs/framework/workflows-sdk"
import { updateOrderChangesStep } from "../steps"
import {
  updateOrderChangesWorkflowInputSchema,
  updateOrderChangesWorkflowOutputSchema,
} from "../utils/schemas"

export type {
  UpdateOrderChangesWorkflowInput,
  UpdateOrderChangesWorkflowOutput,
} from "../utils/schemas"


export const updateOrderChangesWorkflowId = "update-order-change"

/**
 * This workflow updates one or more order changes.
 *
 * You can use this workflow within your customizations or your own custom workflows, allowing you to wrap custom logic around
 * updating order changes.
 *
 * @summary
 *
 * Update one or more order changes.
 */
export const updateOrderChangesWorkflow = createWorkflow(
  {
    name: updateOrderChangesWorkflowId,
    description: "Update one or more order changes",
    inputSchema: updateOrderChangesWorkflowInputSchema,
    outputSchema: updateOrderChangesWorkflowOutputSchema,
  },
  (input) => {
    return new WorkflowResponse(updateOrderChangesStep(input))
  }
)
