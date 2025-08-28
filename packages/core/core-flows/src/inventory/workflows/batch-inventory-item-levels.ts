import {
  createWorkflow,
  parallelize,
  transform,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk"
import { BatchWorkflowInput, BatchWorkflowOutput, InventoryLevelDTO, InventoryTypes } from "@medusajs/types"
import { createInventoryLevelsStep, updateInventoryLevelsStep } from "../steps"
import { deleteInventoryLevelsWorkflow } from "./delete-inventory-levels"
import {
  batchInventoryItemLevelsWorkflowInputSchema,
  batchInventoryItemLevelsWorkflowOutputSchema,
  type BatchInventoryItemLevelsWorkflowInput as SchemaInput,
  type BatchInventoryItemLevelsWorkflowOutput as SchemaOutput,
} from "../utils/schemas"

export {
  type BatchInventoryItemLevelsWorkflowInput,
  type BatchInventoryItemLevelsWorkflowOutput,
} from "../utils/schemas"

// Type verification - CORRECT ORDER!
const schemaInput = {} as SchemaInput
const schemaOutput = {} as SchemaOutput

// Check 1: New input can go into old input (schema accepts all valid inputs)
const existingInput: BatchWorkflowInput<
  InventoryTypes.CreateInventoryLevelInput,
  InventoryTypes.UpdateInventoryLevelInput
> & { force?: boolean } = schemaInput

// Check 2: Old output can go into new output (schema produces compatible outputs)
const existingOutput: SchemaOutput = {} as BatchWorkflowOutput<InventoryLevelDTO>

console.log(existingInput, existingOutput, schemaOutput)

export const batchInventoryItemLevelsWorkflowId =
  "batch-inventory-item-levels-workflow"

/**
 * This workflow creates, updates and deletes inventory levels in bulk.
 * 
 * You can use this workflow within your own customizations or custom workflows, allowing you
 * to manage inventory levels in your custom flows.
 * 
 * @example
 * const { result } = await batchInventoryItemLevelsWorkflow(container)
 * .run({
 *   input: {
 *     create: [
 *       {
 *         inventory_item_id: "iitem_123",
 *         location_id: "sloc_123"
 *       }
 *     ],
 *     update: [
 *       {
 *         id: "iilev_123",
 *         inventory_item_id: "iitem_123",
 *         location_id: "sloc_123",
 *         stocked_quantity: 10
 *       }
 *     ],
 *     delete: ["iilev_321"]
 *   }
 * })
 * 
 * @summary
 * 
 * Manage inventory levels in bulk.
 */
export const batchInventoryItemLevelsWorkflow = createWorkflow(
  {
    name: batchInventoryItemLevelsWorkflowId,
    description: "Manage inventory levels in bulk",
    inputSchema: batchInventoryItemLevelsWorkflowInputSchema,
    outputSchema: batchInventoryItemLevelsWorkflowOutputSchema,
  },
  (input) => {
    const { createInput, updateInput, deleteInput } = transform(
      input,
      (data) => {
        return {
          createInput: data.create || [],
          updateInput: data.update || [],
          deleteInput: {
            id: data.delete || [],
            force: data.force ?? false,
          },
        }
      }
    )

    const res = parallelize(
      createInventoryLevelsStep(createInput),
      updateInventoryLevelsStep(updateInput),
      deleteInventoryLevelsWorkflow.runAsStep({
        input: deleteInput,
      })
    )

    return new WorkflowResponse(
      transform({ res, input }, (data) => {
        return {
          created: data.res[0],
          updated: data.res[1],
          deleted: data.input.delete,
        } as SchemaOutput
      })
    )
  }
)
