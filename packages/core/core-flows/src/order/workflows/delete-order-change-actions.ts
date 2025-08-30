import { createWorkflow } from "@medusajs/framework/workflows-sdk"
import { deleteOrderChangeActionsStep } from "../steps"
import {
  deleteOrderChangeActionsWorkflowInputSchema,
  deleteOrderChangeActionsWorkflowOutputSchema,
} from "../utils/schemas"

export type {
  DeleteOrderChangeActionsWorkflowInput,
  DeleteOrderChangeActionsWorkflowOutput,
} from "../utils/schemas"


export const deleteOrderChangeActionsWorkflowId = "delete-order-change-actions"
/**
 * This workflow deletes one or more order change actions.
 * 
 * You can use this workflow within your customizations or your own custom workflows, allowing you to wrap custom logic around
 * deleting an order change action.
 * 
 * @summary
 * 
 * Delete one or more order change actions.
 */
export const deleteOrderChangeActionsWorkflow = createWorkflow(
  {
    name: deleteOrderChangeActionsWorkflowId,
    description: "Delete one or more order change actions",
    inputSchema: deleteOrderChangeActionsWorkflowInputSchema,
    outputSchema: deleteOrderChangeActionsWorkflowOutputSchema,
  },
  (input) => {
    deleteOrderChangeActionsStep(input)
  }
)
