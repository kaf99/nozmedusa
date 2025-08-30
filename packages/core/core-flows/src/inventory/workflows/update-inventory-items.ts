import {
  WorkflowResponse,
  createWorkflow,
} from "@medusajs/framework/workflows-sdk"

import { updateInventoryItemsStep } from "../steps"
import {
  updateInventoryItemsWorkflowInputSchema,
  updateInventoryItemsWorkflowOutputSchema,
} from "../utils/schemas"

export type {
  UpdateInventoryItemsWorkflowInput,
  UpdateInventoryItemsWorkflowOutput,
} from "../utils/schemas"

export const updateInventoryItemsWorkflowId = "update-inventory-items-workflow"
/**
 * This workflow updates one or more inventory items. It's used by the
 * [Update an Inventory Item Admin API Route](https://docs.medusajs.com/api/admin#inventory-items_postinventoryitemsid).
 * 
 * You can use this workflow within your own customizations or custom workflows, allowing you
 * to update inventory items in your custom flows.
 * 
 * @example
 * const { result } = await updateInventoryItemsWorkflow(container)
 * .run({
 *   input: {
 *     updates: [
 *       {
 *         id: "iitem_123",
 *         sku: "shirt",
 *       }
 *     ]
 *   }
 * })
 * 
 * @summary
 * 
 * Update one or more inventory items.
 */
export const updateInventoryItemsWorkflow = createWorkflow(
  {
    name: updateInventoryItemsWorkflowId,
    description: "Update one or more inventory items",
    inputSchema: updateInventoryItemsWorkflowInputSchema,
    outputSchema: updateInventoryItemsWorkflowOutputSchema,
  },
  (input) => {
    return new WorkflowResponse(updateInventoryItemsStep(input.updates))
  }
)
