import {
  FilterableStockLocationProps,
  RemoteQueryFilters,
  StockLocationDTO,
  UpdateStockLocationInput,
  UpsertStockLocationAddressInput,
} from "@medusajs/framework/types"
import {
  WorkflowResponse,
  createWorkflow,
  transform,
} from "@medusajs/framework/workflows-sdk"

import { useQueryGraphStep } from "../../common"
import { updateStockLocationsStep } from "../steps"
import { upsertStockLocationAddressesStep } from "../steps/upsert-stock-location-addresses"
import {
  updateStockLocationsWorkflowInputSchema,
  updateStockLocationsWorkflowOutputSchema,
  type UpdateStockLocationsWorkflowInput as SchemaInput,
  type UpdateStockLocationsWorkflowOutput as SchemaOutput,
} from "../utils/schemas"

export {
  type UpdateStockLocationsWorkflowInput,
  type UpdateStockLocationsWorkflowOutput,
} from "../utils/schemas"

// Type verification - CORRECT ORDER!
const schemaInput = {} as SchemaInput
const schemaOutput = {} as SchemaOutput

// Check 1: New input can go into old input (schema accepts all valid inputs)
const existingInput: {
  selector: FilterableStockLocationProps
  update: UpdateStockLocationInput
} = schemaInput

// Check 2: Old output can go into new output (schema produces compatible outputs)
const existingOutput: SchemaOutput = {} as StockLocationDTO[]

console.log(existingInput, existingOutput, schemaOutput)
export const updateStockLocationsWorkflowId = "update-stock-locations-workflow"
/**
 * This workflow updates stock locations matching the specified filters. It's used by the
 * [Update Stock Location Admin API Route](https://docs.medusajs.com/api/admin#stock-locations_poststocklocationsid).
 *
 * You can use this workflow within your own customizations or custom workflows, allowing you
 * to update stock locations in your custom flows.
 *
 * @example
 * const { result } = await updateStockLocationsWorkflow(container)
 * .run({
 *   input: {
 *     selector: {
 *       id: "sloc_123"
 *     },
 *     update: {
 *       name: "European Warehouse"
 *     }
 *   }
 * })
 *
 * @summary
 *
 * Update stock locations.
 */
export const updateStockLocationsWorkflow = createWorkflow(
  {
    name: updateStockLocationsWorkflowId,
    description: "Update stock locations matching specified filters",
    inputSchema: updateStockLocationsWorkflowInputSchema,
    outputSchema: updateStockLocationsWorkflowOutputSchema,
  },
  (input) => {
    const stockLocationsQuery = useQueryGraphStep({
      entity: "stock_location",
      filters: input.selector as RemoteQueryFilters<"stock_location">,
      fields: ["id", "address.id"],
    }).config({ name: "get-stock-location" })

    const stockLocations = transform(
      { stockLocationsQuery },
      ({ stockLocationsQuery }) => stockLocationsQuery.data
    )

    const normalizedData = transform(
      { input, stockLocations },
      ({ input, stockLocations }) => {
        const { address, address_id, ...stockLocationInput } = input.update
        const addressesInput: UpsertStockLocationAddressInput[] = []

        if (address) {
          for (const stockLocation of stockLocations) {
            if (stockLocation.address?.id) {
              addressesInput.push({
                id: stockLocation.address?.id!,
                ...address,
              })
            } else {
              addressesInput.push(address)
            }
          }
        }

        return {
          stockLocationInput: {
            selector: input.selector,
            update: stockLocationInput,
          },
          addressesInput,
        }
      }
    )

    upsertStockLocationAddressesStep(normalizedData.addressesInput)

    return new WorkflowResponse(
      updateStockLocationsStep(normalizedData.stockLocationInput)
    )
  }
)
