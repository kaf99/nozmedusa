import {
  createWorkflow,
  WorkflowData,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk"
import { Modules } from "@medusajs/framework/utils"

import { deleteInventoryItemStep, validateInventoryDeleteStep } from "../steps"
import { removeRemoteLinkStep } from "../../common/steps/remove-remote-links"
import { useQueryGraphStep } from "../../common"
import {
  deleteInventoryItemsWorkflowInputSchema,
  deleteInventoryItemsWorkflowOutputSchema,
  // type DeleteInventoryItemsWorkflowInput as SchemaInput,
  // type DeleteInventoryItemsWorkflowOutput as SchemaOutput,
} from "../utils/schemas"
// import { expectTypeOf } from "expect-type"

/**
 * The data to delete inventory items.
 */
export type DeleteInventoryItemWorkflowInput = {
  /**
   * The IDs of the inventory items to delete.
   */
  ids: string[]
}

/**
 * No response is returned.
 */
export type DeleteInventoryItemWorkflowOutput = void

// Type verification
// TODO: Type verification disabled temporarily
// expectTypeOf<SchemaInput>().toEqualTypeOf<DeleteInventoryItemWorkflowInput>()
// expectTypeOf<SchemaOutput>().toEqualTypeOf<DeleteInventoryItemWorkflowOutput>()

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
  (input: WorkflowData<DeleteInventoryItemWorkflowInput>): WorkflowResponse<
    DeleteInventoryItemWorkflowOutput
  > => {
    const { data: inventoryItemsToDelete } = useQueryGraphStep({
      entity: "inventory",
      fields: ["id", "reserved_quantity"],
      filters: {
        id: input.ids,
      },
    })

    validateInventoryDeleteStep({ inventory_items: inventoryItemsToDelete })

    deleteInventoryItemStep(input.ids)
    removeRemoteLinkStep({
      [Modules.INVENTORY]: { inventory_item_id: input.ids },
    })
    return new WorkflowResponse(void 0)
  }
)
