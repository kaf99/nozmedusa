// TODO: Remove this workflow in a future release.

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
} from "../utils/schemas"

export type {
  BulkCreateDeleteLevelsWorkflowInput,
  BulkCreateDeleteLevelsWorkflowOutput,
} from "../utils/schemas"


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
