import { createWorkflow } from "@medusajs/framework/workflows-sdk"

import { removeRemoteLinkStep } from "../../common/steps/remove-remote-links"
import { deleteStockLocationsStep } from "../steps"
import {
  deleteStockLocationsWorkflowInputSchema,
  deleteStockLocationsWorkflowOutputSchema,
} from "../utils/schemas"


export const deleteStockLocationsWorkflowId = "delete-stock-locations-workflow"
/**
 * This workflow deletes one or more stock locations. It's used by the
 * [Delete Stock Location Admin API Route](https://docs.medusajs.com/api/admin#stock-locations_deletestocklocationsid).
 * 
 * You can use this workflow within your own customizations or custom workflows, allowing you
 * to delete stock locations in your custom flows.
 * 
 * @example
 * const { result } = await deleteStockLocationsWorkflow(container)
 * .run({
 *   input: {
 *     ids: ["sloc_123"]
 *   }
 * })
 * 
 * @summary
 * 
 * Delete one or more stock locations.
 */
export const deleteStockLocationsWorkflow = createWorkflow(
  {
    name: deleteStockLocationsWorkflowId,
    description: "Delete one or more stock locations",
    inputSchema: deleteStockLocationsWorkflowInputSchema,
    outputSchema: deleteStockLocationsWorkflowOutputSchema,
  },
  (input) => {
    const softDeletedEntities = deleteStockLocationsStep(input.ids)
    removeRemoteLinkStep(softDeletedEntities)
  }
)
