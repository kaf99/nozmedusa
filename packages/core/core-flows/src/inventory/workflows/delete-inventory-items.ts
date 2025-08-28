import {
  createWorkflow,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk"
import { Modules } from "@medusajs/framework/utils"

import { deleteInventoryItemStep, validateInventoryDeleteStep } from "../steps"
import { removeRemoteLinkStep } from "../../common/steps/remove-remote-links"
import { useQueryGraphStep } from "../../common"
import {
  deleteInventoryItemsWorkflowInputSchema,
  deleteInventoryItemsWorkflowOutputSchema,
} from "../utils/schemas"
export {
  type DeleteInventoryItemsWorkflowInput,
  type DeleteInventoryItemsWorkflowOutput,
} from "../utils/schemas"

export const deleteInventoryItemWorkflowId = "delete-inventory-item-workflow"
/**
 * This workflow deletes one or more inventory items. It's used by the
 * [Delete Inventory Item Admin API Route](https://docs.medusajs.com/api/admin#inventory-items_deleteinventoryitemsid).
 *
 * You can use this workflow within your own customizations or custom workflows, allowing you
 * to delete inventory items in your custom flows.
 *
 * @example
 * const { result } = await deleteInventoryItemWorkflow(container)
 * .run({
 *   input: ["iitem_123"]
 * })
 *
 * @summary
 *
 * Delete one or more inventory items.
 */
export const deleteInventoryItemWorkflow = createWorkflow(
  {
    name: deleteInventoryItemWorkflowId,
    description: "Delete one or more inventory items",
    inputSchema: deleteInventoryItemsWorkflowInputSchema,
    outputSchema: deleteInventoryItemsWorkflowOutputSchema,
  },
  (input) => {
    const { data: inventoryItemsToDelete } = useQueryGraphStep({
      entity: "inventory",
      fields: ["id", "reserved_quantity"],
      filters: {
        id: input,
      },
    })

    validateInventoryDeleteStep({ inventory_items: inventoryItemsToDelete })

    deleteInventoryItemStep(input)
    removeRemoteLinkStep({
      [Modules.INVENTORY]: { inventory_item_id: input },
    })
    return new WorkflowResponse(input)
  }
)
