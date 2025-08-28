import { SalesChannelWorkflowEvents } from "@medusajs/framework/utils"
import {
  WorkflowResponse,
  createWorkflow,
  transform,
} from "@medusajs/framework/workflows-sdk"
import { emitEventStep } from "../../common/steps/emit-event"
import { createSalesChannelsStep } from "../steps/create-sales-channels"
import {
  createSalesChannelsWorkflowInputSchema,
  createSalesChannelsWorkflowOutputSchema,
  type CreateSalesChannelsWorkflowInput as SchemaInput,
  type CreateSalesChannelsWorkflowOutput as SchemaOutput,
} from "../utils/schemas"

// Re-export workflow types from schemas
export type CreateSalesChannelsWorkflowInput = SchemaInput
export type CreateSalesChannelsWorkflowOutput = SchemaOutput

// Type verification - CORRECT ORDER!
const schemaInput = {} as SchemaInput
const schemaOutput = {} as SchemaOutput

// Check 1: New input can go into old input (schema accepts all valid inputs)
const existingInput: {
  salesChannelsData: Array<{
    name: string
    description?: string | null
    is_disabled?: boolean
  }>
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

export const createSalesChannelsWorkflowId = "create-sales-channels"
/**
 * This workflow creates one or more sales channels. It's used by the
 * [Create Sales Channel Admin API Route](https://docs.medusajs.com/api/admin#sales-channels_postsaleschannels).
 * 
 * You can use this workflow within your customizations or your own custom workflows, allowing you to
 * create sales channels within your custom flows.
 * 
 * @example
 * const { result } = await createSalesChannelsWorkflow(container)
 * .run({
 *   input: {
 *     salesChannelsData: [
 *       {
 *         name: "Webshop"
 *       }
 *     ]
 *   }
 * })
 * 
 * @summary
 * 
 * Create sales channels.
 */
export const createSalesChannelsWorkflow = createWorkflow(
  {
    name: createSalesChannelsWorkflowId,
    description: "Create sales channels",
    inputSchema: createSalesChannelsWorkflowInputSchema,
    outputSchema: createSalesChannelsWorkflowOutputSchema,
  },
  (input) => {
    const createdSalesChannels = createSalesChannelsStep({
      data: input.salesChannelsData,
    })

    const salesChannelsIdEvents = transform(
      { createdSalesChannels },
      ({ createdSalesChannels }) => {
        return createdSalesChannels.map((v) => {
          return { id: v.id }
        })
      }
    )

    emitEventStep({
      eventName: SalesChannelWorkflowEvents.CREATED,
      data: salesChannelsIdEvents,
    })

    return new WorkflowResponse(createdSalesChannels)
  }
)
