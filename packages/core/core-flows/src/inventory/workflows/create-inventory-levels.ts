import {
  WorkflowResponse,
  createWorkflow,
} from "@medusajs/framework/workflows-sdk"
import {
  createInventoryLevelsStep,
  validateInventoryLocationsStep,
} from "../steps"
import {
  createInventoryLevelsWorkflowInputSchema,
  createInventoryLevelsWorkflowOutputSchema,
} from "../utils/schemas"

export type {
  CreateInventoryLevelsWorkflowInput,
  CreateInventoryLevelsWorkflowOutput,
} from "../utils/schemas"
export const createInventoryLevelsWorkflowId =
  "create-inventory-levels-workflow"
/**
 * This workflow creates one or more inventory levels. It's used by the
 * [Create Inventory Level API Route](https://docs.medusajs.com/api/admin#inventory-items_postinventoryitemsidlocationlevels).
 * 
 * You can use this workflow within your own customizations or custom workflows, allowing you
 * to create inventory levels in your custom flows.
 * 
 * @example
 * const { result } = await createInventoryLevelsWorkflow(container)
 * .run({
 *   input: {
 *     inventory_levels: [
 *       {
 *         inventory_item_id: "iitem_123",
 *         location_id: "sloc_123",
 *       }
 *     ]
 *   }
 * })
 * 
 * @summary
 * 
 * Create one or more inventory levels.
 */
export const createInventoryLevelsWorkflow = createWorkflow(
  {
    name: createInventoryLevelsWorkflowId,
    inputSchema: createInventoryLevelsWorkflowInputSchema,
    outputSchema: createInventoryLevelsWorkflowOutputSchema,
  },
  (input) => {
    validateInventoryLocationsStep(input.inventory_levels)

    return new WorkflowResponse(
      createInventoryLevelsStep(input.inventory_levels)
    )
  }
)
