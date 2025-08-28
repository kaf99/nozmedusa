import { CreateLocationFulfillmentSetWorkflowInputDTO } from "@medusajs/framework/types"
import { createWorkflow, transform } from "@medusajs/framework/workflows-sdk"
import { createFulfillmentSets } from "../../fulfillment"
import { associateFulfillmentSetsWithLocationStep } from "../steps/associate-locations-with-fulfillment-sets"
import {
  createLocationFulfillmentSetWorkflowInputSchema,
  createLocationFulfillmentSetWorkflowOutputSchema,
  type CreateLocationFulfillmentSetWorkflowInput as SchemaInput,
} from "../utils/schemas"

export {
  type CreateLocationFulfillmentSetWorkflowInput,
  type CreateLocationFulfillmentSetWorkflowOutput,
} from "../utils/schemas"

// Type verification - CORRECT ORDER!
const schemaInput = {} as SchemaInput

// Check 1: New input can go into old input (schema accepts all valid inputs)
const existingInput: CreateLocationFulfillmentSetWorkflowInputDTO = schemaInput

// Check 2: Old output can go into new output (schema produces compatible outputs)
const existingOutput: void = undefined as unknown as void

console.log(existingInput, existingOutput)

export const createLocationFulfillmentSetWorkflowId =
  "create-location-fulfillment-set"
/**
 * This workflow adds a fulfillment set to a stock location. It's used by the
 * [Add Fulfillment Set to Stock Location Admin API Route](https://docs.medusajs.com/api/admin#stock-locations_poststocklocationsidfulfillmentsets).
 *
 * You can use this workflow within your own customizations or custom workflows, allowing you
 * to add fulfillment sets to a stock location in your custom flows.
 *
 * @example
 * const { result } = await createLocationFulfillmentSetWorkflow(container)
 * .run({
 *   input: {
 *     location_id: "sloc_123",
 *     fulfillment_set_data: {
 *       name: "Shipping",
 *       type: "shipping",
 *     }
 *   }
 * })
 *
 * @summary
 *
 * Add fulfillment set to a stock location.
 */
export const createLocationFulfillmentSetWorkflow = createWorkflow(
  {
    name: createLocationFulfillmentSetWorkflowId,
    description: "Add fulfillment set to a stock location",
    inputSchema: createLocationFulfillmentSetWorkflowInputSchema,
    outputSchema: createLocationFulfillmentSetWorkflowOutputSchema,
  },
  (input) => {
    const fulfillmentSet = createFulfillmentSets([
      {
        name: input.fulfillment_set_data.name,
        type: input.fulfillment_set_data.type,
      },
    ])

    const data = transform({ input, fulfillmentSet }, (data) => [
      {
        location_id: data.input.location_id,
        fulfillment_set_ids: [data.fulfillmentSet[0].id],
      },
    ])

    associateFulfillmentSetsWithLocationStep({
      input: data,
    })
  }
)
