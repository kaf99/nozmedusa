// TODO: Remove this workflow in a future release.

import { InventoryLevelDTO, InventoryTypes } from "@medusajs/framework/types"
import {
  createWorkflow,
  when,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk"
import { createInventoryLevelsStep } from "../steps"
import { deleteInventoryLevelsWorkflow } from "./delete-inventory-levels"
import {
  bulkCreateDeleteLevelsWorkflowInputSchema,
  bulkCreateDeleteLevelsWorkflowOutputSchema,
  type BulkCreateDeleteLevelsWorkflowInput as SchemaInput,
  type BulkCreateDeleteLevelsWorkflowOutput as SchemaOutput,
} from "../utils/schemas"

export {
  type BulkCreateDeleteLevelsWorkflowInput,
  type BulkCreateDeleteLevelsWorkflowOutput,
} from "../utils/schemas"

// Type verification - CORRECT ORDER!
const schemaInput = {} as SchemaInput
const schemaOutput = {} as SchemaOutput

// Check 1: New input can go into old input (schema accepts all valid inputs)
const existingInput: {
  creates: InventoryTypes.CreateInventoryLevelInput[]
  deletes: { inventory_item_id: string; location_id: string }[]
} = schemaInput

// Check 2: Old output can go into new output (schema produces compatible outputs)
const existingOutput: SchemaOutput = {} as InventoryLevelDTO[]

console.log(existingInput, existingOutput, schemaOutput)

export const bulkCreateDeleteLevelsWorkflowId =
  "bulk-create-delete-levels-workflow"
/**
 * This workflow creates and deletes inventory levels.
 *
 * @deprecated Use `batchInventoryItemLevels` instead.
 */
export const bulkCreateDeleteLevelsWorkflow = createWorkflow(
  {
    name: bulkCreateDeleteLevelsWorkflowId,
    description: "Create and delete inventory levels",
    inputSchema: bulkCreateDeleteLevelsWorkflowInputSchema,
    outputSchema: bulkCreateDeleteLevelsWorkflowOutputSchema,
  },
  (input) => {
    when({ input }, ({ input }) => {
      return !!input.deletes?.length
    }).then(() => {
      deleteInventoryLevelsWorkflow.runAsStep({
        input: {
          $or: input.deletes,
        },
      })
    })

    const created = when({ input }, ({ input }) => {
      return !!input.creates?.length
    }).then(() => {
      return createInventoryLevelsStep(input.creates)
    })

    return new WorkflowResponse(created || [])
  }
)
