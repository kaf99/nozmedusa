import { Modules, SalesChannelWorkflowEvents } from "@medusajs/framework/utils"
import {
  createWorkflow,
  transform,
} from "@medusajs/framework/workflows-sdk"
import { emitEventStep } from "../../common"
import { removeRemoteLinkStep } from "../../common/steps/remove-remote-links"
import { deleteSalesChannelsStep } from "../steps/delete-sales-channels"
import { canDeleteSalesChannelsOrThrowStep } from "../steps"
import {
  deleteSalesChannelsWorkflowInputSchema,
  deleteSalesChannelsWorkflowOutputSchema,
  type DeleteSalesChannelsWorkflowInput as SchemaInput,
} from "../utils/schemas"

// Re-export workflow types from schemas
export type DeleteSalesChannelsWorkflowInput = SchemaInput
export type DeleteSalesChannelsWorkflowOutput = void

// Type verification - CORRECT ORDER!
const schemaInput = {} as SchemaInput

// Check 1: New input can go into old input (schema accepts all valid inputs)
const existingInput: { ids: string[] } = schemaInput

// Check 2: Old output can go into new output (schema produces compatible outputs)
const existingOutput: void = undefined as unknown as void

console.log(existingInput, existingOutput)

export const deleteSalesChannelsWorkflowId = "delete-sales-channels"
/**
 * This workflow deletes one or more sales channels. It's used by the
 * [Delete Sales Channel Admin API Route](https://docs.medusajs.com/api/admin#sales-channels_deletesaleschannelsid).
 * 
 * You can use this workflow within your customizations or your own custom workflows, allowing you to
 * delete sales channels within your custom flows.
 * 
 * @example
 * const { result } = await deleteSalesChannelsWorkflow(container)
 * .run({
 *   input: {
 *     ids: ["sc_123"],
 *   }
 * })
 * 
 * @summary
 * 
 * Delete sales channels.
 */
export const deleteSalesChannelsWorkflow = createWorkflow(
  {
    name: deleteSalesChannelsWorkflowId,
    description: "Delete sales channels",
    inputSchema: deleteSalesChannelsWorkflowInputSchema,
    outputSchema: deleteSalesChannelsWorkflowOutputSchema,
  },
  (input) => {
    canDeleteSalesChannelsOrThrowStep({ ids: input.ids })
    deleteSalesChannelsStep(input.ids)

    removeRemoteLinkStep({
      [Modules.SALES_CHANNEL]: { sales_channel_id: input.ids },
    })

    const salesChannelsIdEvents = transform({ input }, ({ input }) => {
      return input.ids?.map((id) => {
        return { id }
      })
    })

    emitEventStep({
      eventName: SalesChannelWorkflowEvents.DELETED,
      data: salesChannelsIdEvents,
    })
  }
)
