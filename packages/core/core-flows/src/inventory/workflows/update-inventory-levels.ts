import { InventoryLevelDTO, InventoryTypes } from "@medusajs/framework/types"
import {
  WorkflowResponse,
  createWorkflow,
} from "@medusajs/framework/workflows-sdk"

import { updateInventoryLevelsStep } from "../steps/update-inventory-levels"
import {
  updateInventoryLevelsWorkflowInputSchema,
  updateInventoryLevelsWorkflowOutputSchema,
  type UpdateInventoryLevelsWorkflowInput as SchemaInput,
  type UpdateInventoryLevelsWorkflowOutput as SchemaOutput,
} from "../utils/schemas"
export {
  type UpdateInventoryLevelsWorkflowInput,
  type UpdateInventoryLevelsWorkflowOutput,
} from "../utils/schemas"

/**
 * The data to update the inventory levels.
 */
interface OldUpdateInventoryLevelsWorkflowInput {
  /**
   * The inventory levels to update.
   */
  updates: InventoryTypes.UpdateInventoryLevelInput[]
}

/**
 * The updated inventory levels.
 */
type OldUpdateInventoryLevelsWorkflowOutput = InventoryLevelDTO[]

// Type verification
const schemaInput = {} as SchemaInput
const schemaOutput = {} as SchemaOutput
const existingInput: OldUpdateInventoryLevelsWorkflowInput = schemaInput
const existingOutput: OldUpdateInventoryLevelsWorkflowOutput = schemaOutput

// Check reverse too
const oldInput = {} as OldUpdateInventoryLevelsWorkflowInput
const oldOutput = {} as OldUpdateInventoryLevelsWorkflowOutput
const newInput: SchemaInput = oldInput
const newOutput: SchemaOutput = oldOutput

console.log(existingInput, existingOutput, newInput, newOutput)

export const updateInventoryLevelsWorkflowId =
  "update-inventory-levels-workflow"
/**
 * This workflow updates one or more inventory levels. It's used by the
 * [Update Inventory Level Admin API Route](https://docs.medusajs.com/api/admin#inventory-items_postinventoryitemsidlocationlevelslocation_id).
 *
 * You can use this workflow within your own customizations or custom workflows, allowing you
 * to update inventory levels in your custom flows.
 *
 * @example
 * const { result } = await updateInventoryLevelsWorkflow(container)
 * .run({
 *   input: {
 *     updates: [
 *       {
 *         id: "iilev_123",
 *         inventory_item_id: "iitem_123",
 *         location_id: "sloc_123",
 *         stocked_quantity: 10,
 *       }
 *     ]
 *   }
 * })
 *
 * @summary
 *
 * Update one or more inventory levels.
 */
export const updateInventoryLevelsWorkflow = createWorkflow(
  {
    name: updateInventoryLevelsWorkflowId,
    inputSchema: updateInventoryLevelsWorkflowInputSchema,
    outputSchema: updateInventoryLevelsWorkflowOutputSchema,
  },
  (input) => {
    return new WorkflowResponse(updateInventoryLevelsStep(input.updates))
  }
)
