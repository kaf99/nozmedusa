import {
  WorkflowResponse,
  createWorkflow,
} from "@medusajs/framework/workflows-sdk"
import { updateOrderChangeActionsStep } from "../steps"
import {
  updateOrderChangeActionsWorkflowInputSchema,
  updateOrderChangeActionsWorkflowOutputSchema,
} from "../utils/schemas"

export type {
  UpdateOrderChangeActionsWorkflowInput,
  UpdateOrderChangeActionsWorkflowOutput,
} from "../utils/schemas"


export const updateOrderChangeActionsWorkflowId = "update-order-change-actions"
/**
 * This workflow updates one or more order change actions.
 *
 * You can use this workflow within your customizations or your own custom workflows, allowing you to wrap custom logic around
 * updating order change actions.
 *
 * @summary
 *
 * Update one or more order change actions.
 */
export const updateOrderChangeActionsWorkflow = createWorkflow(
  {
    name: updateOrderChangeActionsWorkflowId,
    description: "Update one or more order change actions",
    inputSchema: updateOrderChangeActionsWorkflowInputSchema,
    outputSchema: updateOrderChangeActionsWorkflowOutputSchema,
  },
  (input) => {
    return new WorkflowResponse(updateOrderChangeActionsStep(input))
  }
)
