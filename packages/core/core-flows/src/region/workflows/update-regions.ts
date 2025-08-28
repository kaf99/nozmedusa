import { WorkflowTypes } from "@medusajs/framework/types"
import { RegionWorkflowEvents } from "@medusajs/framework/utils"
import {
  createWorkflow,
  parallelize,
  transform,
  when,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk"
import { emitEventStep } from "../../common/steps/emit-event"
import { updatePricePreferencesWorkflow } from "../../pricing"
import { updateRegionsStep } from "../steps"
import { setRegionsPaymentProvidersStep } from "../steps/set-regions-payment-providers"
import {
  updateRegionsWorkflowInputSchema,
  updateRegionsWorkflowOutputSchema,
  type UpdateRegionsWorkflowInput as SchemaInput,
  type UpdateRegionsWorkflowOutput as SchemaOutput,
} from "../utils/schemas"

// Re-export workflow types from schemas
export type UpdateRegionsWorkflowInput = SchemaInput
export type UpdateRegionsWorkflowOutput = SchemaOutput

// Type verification - CORRECT ORDER!
const schemaInput = {} as SchemaInput
const schemaOutput = {} as SchemaOutput

// Check 1: New input can go into old input (schema accepts all valid inputs)
const existingInput: WorkflowTypes.RegionWorkflow.UpdateRegionsWorkflowInput = schemaInput

// Check 2: Old output can go into new output (schema produces compatible outputs)
const existingOutput: SchemaOutput = {} as WorkflowTypes.RegionWorkflow.UpdateRegionsWorkflowOutput

console.log(existingInput, existingOutput, schemaOutput)

export const updateRegionsWorkflowId = "update-regions"
/**
 * This workflow updates regions matching the specified filters. It's used by the
 * [Update Region Admin API Route](https://docs.medusajs.com/api/admin#regions_postregionsid).
 * 
 * You can use this workflow within your own customizations or custom workflows, allowing you
 * to update regions in your custom flows.
 * 
 * @example
 * const { result } = await updateRegionsWorkflow(container)
 * .run({
 *   input: {
 *     selector: {
 *       id: "reg_123"
 *     },
 *     update: {
 *       name: "United States"
 *     }
 *   }
 * })
 * 
 * @summary
 * 
 * Update regions.
 */
export const updateRegionsWorkflow = createWorkflow(
  {
    name: updateRegionsWorkflowId,
    description: "Update regions",
    inputSchema: updateRegionsWorkflowInputSchema,
    outputSchema: updateRegionsWorkflowOutputSchema,
  },
  (input) => {
    const normalizedInput = transform(input, (data) => {
      const { selector, update } = data
      const { payment_providers = [], is_tax_inclusive, ...rest } = update
      return {
        selector,
        update: rest,
        payment_providers,
        is_tax_inclusive,
      }
    })

    const regions = updateRegionsStep(normalizedInput)

    const upsertProvidersNormalizedInput = transform(
      { normalizedInput, regions },
      (data) => {
        return data.regions.map((region) => {
          return {
            id: region.id,
            payment_providers: data.normalizedInput.payment_providers,
          }
        })
      }
    )

    when({ normalizedInput }, (data) => {
      return data.normalizedInput.is_tax_inclusive !== undefined
    }).then(() => {
      const updatePricePreferencesInput = transform(
        { normalizedInput, regions },
        (data) => {
          return {
            selector: {
              $or: data.regions.map((region) => {
                return {
                  attribute: "region_id",
                  value: region.id,
                }
              }),
            },
            update: {
              is_tax_inclusive: data.normalizedInput.is_tax_inclusive,
            },
          } as WorkflowTypes.PricingWorkflow.UpdatePricePreferencesWorkflowInput
        }
      )

      updatePricePreferencesWorkflow.runAsStep({
        input: updatePricePreferencesInput,
      })
    })

    const regionIdEvents = transform({ regions }, ({ regions }) => {
      return regions?.map((region) => {
        return { id: region.id }
      })
    })

    parallelize(
      setRegionsPaymentProvidersStep({
        input: upsertProvidersNormalizedInput,
      }),
      emitEventStep({
        eventName: RegionWorkflowEvents.UPDATED,
        data: regionIdEvents,
      })
    )

    return new WorkflowResponse(regions)
  }
)
