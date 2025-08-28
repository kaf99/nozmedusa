import { SalesChannelWorkflowEvents } from "@medusajs/framework/utils"
import {
  WorkflowResponse,
  createWorkflow,
  transform,
} from "@medusajs/framework/workflows-sdk"
import { emitEventStep } from "../../common"
import { updateSalesChannelsStep } from "../steps/update-sales-channels"
import {
  updateSalesChannelsWorkflowInputSchema,
  updateSalesChannelsWorkflowOutputSchema,
  type UpdateSalesChannelsWorkflowInput as SchemaInput,
  type UpdateSalesChannelsWorkflowOutput as SchemaOutput,
} from "../utils/schemas"

// Re-export workflow types from schemas
export type UpdateSalesChannelsWorkflowInput = SchemaInput
export type UpdateSalesChannelsWorkflowOutput = SchemaOutput

// Type verification - CORRECT ORDER!
const schemaInput = {} as SchemaInput
const schemaOutput = {} as SchemaOutput

// Check 1: New input can go into old input (schema accepts all valid inputs)
const existingInput: {
  selector: {
    q?: string
    id?: string | string[]
    name?: string | string[]
    is_disabled?: boolean
    $and?: any
    $or?: any
  }
  update: {
    name?: string
    description?: string | null
    is_disabled?: boolean
    metadata?: Record<string, unknown>
  }
} = schemaInput

// Check 2: Old output can go into new output (schema produces compatible outputs)
const existingOutput: SchemaOutput = {} as Array<{
  id: string
  name: string
  description: string | null
  is_disabled: boolean
  metadata: Record<string, unknown> | null
  locations?: any
}>

console.log(existingInput, existingOutput, schemaOutput)

export const updateSalesChannelsWorkflowId = "update-sales-channels"
/**
 * This workflow updates sales channels matching the specified conditions. It's used by the
 * [Update Sales Channel Admin API Route](https://docs.medusajs.com/api/admin#sales-channels_postsaleschannelsid).
 * 
 * You can use this workflow within your customizations or your own custom workflows, allowing you to
 * update sales channels within your custom flows.
 * 
 * @example
 * const { result } = await updateSalesChannelsWorkflow(container)
 * .run({
 *   input: {
 *     selector: {
 *       id: "sc_123"
 *     },
 *     update: {
 *       name: "Webshop"
 *     }
 *   }
 * })
 * 
 * @summary
 * 
 * Update sales channels.
 */
export const updateSalesChannelsWorkflow = createWorkflow(
  {
    name: updateSalesChannelsWorkflowId,
    description: "Update sales channels",
    inputSchema: updateSalesChannelsWorkflowInputSchema,
    outputSchema: updateSalesChannelsWorkflowOutputSchema,
  },
  (input) => {
    const updatedSalesChannels = updateSalesChannelsStep(input)

    const salesChannelIdEvents = transform(
      { updatedSalesChannels },
      ({ updatedSalesChannels }) => {
        const arr = Array.isArray(updatedSalesChannels)
          ? updatedSalesChannels
          : [updatedSalesChannels]
        return arr?.map((salesChannel) => {
          return { id: salesChannel.id }
        })
      }
    )

    emitEventStep({
      eventName: SalesChannelWorkflowEvents.UPDATED,
      data: salesChannelIdEvents,
    })

    return new WorkflowResponse(updatedSalesChannels)
  }
)
