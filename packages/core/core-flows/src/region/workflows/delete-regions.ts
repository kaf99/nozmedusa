import { Modules, RegionWorkflowEvents } from "@medusajs/framework/utils"
import { createWorkflow, transform } from "@medusajs/framework/workflows-sdk"
import { emitEventStep } from "../../common/steps/emit-event"
import { removeRemoteLinkStep } from "../../common/steps/remove-remote-links"
import { deleteRegionsStep } from "../steps"
import {
  deleteRegionsWorkflowInputSchema,
  deleteRegionsWorkflowOutputSchema,
  type DeleteRegionsWorkflowInput as SchemaInput,
} from "../utils/schemas"

// Re-export workflow types from schemas
export type DeleteRegionsWorkflowInput = SchemaInput
export type DeleteRegionsWorkflowOutput = void

export const deleteRegionsWorkflowId = "delete-regions"
/**
 * This workflow deletes one or more regions. It's used by the
 * [Delete Region Admin API Route](https://docs.medusajs.com/api/admin#regions_deleteregionsid).
 *
 * You can use this workflow within your own customizations or custom workflows, allowing you
 * to delete regions in your custom flows.
 *
 * @example
 * const { result } = await deleteRegionsWorkflow(container)
 * .run({
 *   input: {
 *     ids: ["reg_123"]
 *   }
 * })
 *
 * @summary
 *
 * Delete one or more regions.
 */
export const deleteRegionsWorkflow = createWorkflow(
  {
    name: deleteRegionsWorkflowId,
    description: "Delete one or more regions",
    inputSchema: deleteRegionsWorkflowInputSchema,
    outputSchema: deleteRegionsWorkflowOutputSchema,
  },
  (input) => {
    deleteRegionsStep(input.ids)

    const regionIdEvents = transform({ input }, ({ input }) => {
      return input.ids?.map((id) => {
        return { id }
      })
    })

    removeRemoteLinkStep({
      [Modules.REGION]: {
        region_id: input.ids,
      },
    })

    emitEventStep({
      eventName: RegionWorkflowEvents.DELETED,
      data: regionIdEvents,
    })
  }
)
