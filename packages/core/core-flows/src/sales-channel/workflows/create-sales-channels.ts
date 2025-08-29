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
} from "../utils/schemas"

export {
  type CreateSalesChannelsWorkflowInput,
  type CreateSalesChannelsWorkflowOutput,

} from "../utils/schemas"

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
