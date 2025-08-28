import {
  WorkflowResponse,
  createHook,
  createWorkflow,
} from "@medusajs/framework/workflows-sdk"

import {
  CreateStockLocationInput,
  StockLocationDTO,
} from "@medusajs/framework/types"
import { createStockLocations } from "../steps"
import {
  createStockLocationsWorkflowInputSchema,
  createStockLocationsWorkflowOutputSchema,
  type CreateStockLocationsWorkflowInput as SchemaInput,
  type CreateStockLocationsWorkflowOutput as SchemaOutput,
} from "../utils/schemas"

export {
  type CreateStockLocationsWorkflowInput,
  type CreateStockLocationsWorkflowOutput,
} from "../utils/schemas"

// Type verification - CORRECT ORDER!
const schemaInput = {} as SchemaInput
const schemaOutput = {} as SchemaOutput

// Check 1: New input can go into old input (schema accepts all valid inputs)
const existingInput: {
  locations: CreateStockLocationInput[]
} = schemaInput

// Check 2: Old output can go into new output (schema produces compatible outputs)
const existingOutput: SchemaOutput = {} as StockLocationDTO[]

console.log(existingInput, existingOutput, schemaOutput)

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
