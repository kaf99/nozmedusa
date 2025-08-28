import { WorkflowTypes } from "@medusajs/framework/types"
import { RegionWorkflowEvents } from "@medusajs/framework/utils"
import {
  WorkflowResponse,
  createWorkflow,
  parallelize,
  transform,
} from "@medusajs/framework/workflows-sdk"
import { emitEventStep } from "../../common/steps/emit-event"
import { createPricePreferencesWorkflow } from "../../pricing"
import { createRegionsStep } from "../steps"
import { setRegionsPaymentProvidersStep } from "../steps/set-regions-payment-providers"
import {
  createRegionsWorkflowInputSchema,
  createRegionsWorkflowOutputSchema,
  type CreateRegionsWorkflowInput as SchemaInput,
  type CreateRegionsWorkflowOutput as SchemaOutput,
} from "../utils/schemas"

// Re-export workflow types from schemas
export type CreateRegionsWorkflowInput = SchemaInput
export type CreateRegionsWorkflowOutput = SchemaOutput

// Type verification - CORRECT ORDER!
const schemaInput = {} as SchemaInput
const schemaOutput = {} as SchemaOutput

// Check 1: New input can go into old input (schema accepts all valid inputs)
const existingInput: WorkflowTypes.RegionWorkflow.CreateRegionsWorkflowInput = schemaInput

// Check 2: Old output can go into new output (schema produces compatible outputs)
const existingOutput: SchemaOutput = {} as WorkflowTypes.RegionWorkflow.CreateRegionsWorkflowOutput

console.log(existingInput, existingOutput, schemaOutput)

export const createRegionsWorkflowId = "create-regions"
/**
 * This workflow creates one or more regions. It's used by the
 * [Create Region Admin API Route](https://docs.medusajs.com/api/admin#regions_postregions).
 * 
 * You can use this workflow within your own customizations or custom workflows, allowing you
 * to create regions in your custom flows.
 * 
 * @example
 * const { result } = await createRegionsWorkflow(container)
 * .run({
 *   input: {
 *     regions: [
 *       {
 *         currency_code: "usd",
 *         name: "United States",
 *         countries: ["us"],
 *       }
 *     ]
 *   }
 * })
 * 
 * @summary
 * 
 * Create one or more regions.
 */
export const createRegionsWorkflow = createWorkflow(
  {
    name: createRegionsWorkflowId,
    description: "Create one or more regions",
    inputSchema: createRegionsWorkflowInputSchema,
    outputSchema: createRegionsWorkflowOutputSchema,
  },
  (input) => {
    const data = transform(input, (data) => {
      const regionIndexToAdditionalData = data.regions.map((region, index) => {
        return {
          region_index: index,
          payment_providers: region.payment_providers,
          is_tax_inclusive: region.is_tax_inclusive,
        }
      })

      return {
        regions: data.regions.map((r) => {
          const resp = { ...r }
          delete resp.is_tax_inclusive
          delete resp.payment_providers
          return resp
        }),
        regionIndexToAdditionalData,
      }
    })

    const regions = createRegionsStep(data.regions)

    const normalizedRegionProviderData = transform(
      {
        regionIndexToAdditionalData: data.regionIndexToAdditionalData,
        regions,
      },
      (data) => {
        return data.regionIndexToAdditionalData.map(
          ({ region_index, payment_providers }) => {
            return {
              id: data.regions[region_index].id,
              payment_providers,
            }
          }
        )
      }
    )

    const normalizedRegionPricePreferencesData = transform(
      {
        regionIndexToAdditionalData: data.regionIndexToAdditionalData,
        regions,
      },
      (data) => {
        return data.regionIndexToAdditionalData.map(
          ({ region_index, is_tax_inclusive }) => {
            return {
              attribute: "region_id",
              value: data.regions[region_index].id,
              is_tax_inclusive,
            } as WorkflowTypes.PricingWorkflow.CreatePricePreferencesWorkflowInput
          }
        )
      }
    )

    const regionsIdEvents = transform({ regions }, ({ regions }) => {
      return regions.map((v) => {
        return { id: v.id }
      })
    })

    parallelize(
      setRegionsPaymentProvidersStep({
        input: normalizedRegionProviderData,
      }),
      createPricePreferencesWorkflow.runAsStep({
        input: normalizedRegionPricePreferencesData,
      }),
      emitEventStep({
        eventName: RegionWorkflowEvents.CREATED,
        data: regionsIdEvents,
      })
    )

    return new WorkflowResponse(regions)
  }
)
