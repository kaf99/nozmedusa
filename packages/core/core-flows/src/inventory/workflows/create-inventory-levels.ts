import { InventoryLevelDTO, InventoryTypes } from "@medusajs/framework/types"
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
  type CreateInventoryLevelsWorkflowInput as SchemaInput,
  type CreateInventoryLevelsWorkflowOutput as SchemaOutput,
} from "../utils/schemas"
export {
  type CreateInventoryLevelsWorkflowInput,
  type CreateInventoryLevelsWorkflowOutput,
} from "../utils/schemas"

/**
 * The data to create the inventory levels.
 */
interface OldCreateInventoryLevelsWorkflowInput {
  /**
   * The inventory levels to create.
   */
  inventory_levels: InventoryTypes.CreateInventoryLevelInput[]
}

// Type verification
const schemaInput = {} as SchemaInput
const schemaOutput = {} as SchemaOutput
const existingInput: OldCreateInventoryLevelsWorkflowInput = schemaInput
const existingOutput: InventoryLevelDTO[] = schemaOutput

// Check reverse too
const oldInput = {} as OldCreateInventoryLevelsWorkflowInput
const oldOutput = {} as InventoryLevelDTO[]
const newInput: SchemaInput = oldInput
const newOutput: SchemaOutput = oldOutput

console.log(existingInput, existingOutput, newInput, newOutput)
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
