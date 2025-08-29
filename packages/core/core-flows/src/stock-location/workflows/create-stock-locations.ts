import {
  WorkflowResponse,
  createHook,
  createWorkflow,
} from "@medusajs/framework/workflows-sdk"

import { createStockLocations } from "../steps"
import {
  createStockLocationsWorkflowInputSchema,
  createStockLocationsWorkflowOutputSchema,
} from "../utils/schemas"

export {
  type CreateStockLocationsWorkflowInput,
  type CreateStockLocationsWorkflowOutput,

} from "../utils/schemas"

export const createStockLocationsWorkflowId = "create-stock-locations-workflow"
/**
 * This workflow creates one or more stock locations. It's used by the
 * [Create Stock Location Admin API Route](https://docs.medusajs.com/api/admin#stock-locations_poststocklocations).
 *
 * You can use this workflow within your own customizations or custom workflows, allowing you
 * to create stock locations in your custom flows.
 *
 * @example
 * const { result } = await createStockLocationsWorkflow(container)
 * .run({
 *   input: {
 *     locations: [
 *       {
 *         name: "European Warehouse",
 *       }
 *     ]
 *   }
 * })
 *
 * @summary
 *
 * Create one or more stock locations.
 */
export const createStockLocationsWorkflow = createWorkflow(
  {
    name: createStockLocationsWorkflowId,
    description: "Create one or more stock locations",
    inputSchema: createStockLocationsWorkflowInputSchema,
    outputSchema: createStockLocationsWorkflowOutputSchema,
  },
  (input) => {
    const stockLocations = createStockLocations(input.locations)

    const stockLocationsCreated = createHook("stockLocationsCreated", {
      stockLocations,
    })

    return new WorkflowResponse(stockLocations, {
      hooks: [stockLocationsCreated],
    })
  }
)
