import { OrderWorkflowEvents } from "@medusajs/framework/utils"
import {
  WorkflowResponse,
  createWorkflow,
  transform,
} from "@medusajs/framework/workflows-sdk"
import { emitEventStep } from "../../common/steps/emit-event"
import { archiveOrdersStep } from "../steps"
import {
  archiveOrdersWorkflowInputSchema,
  archiveOrdersWorkflowOutputSchema,
} from "../utils/schemas"
export type {
  ArchiveOrdersWorkflowInput,
  ArchiveOrdersWorkflowOutput,
} from "../utils/schemas"


export const archiveOrderWorkflowId = "archive-order-workflow"
/**
 * This workflow archives one or more orders. It's used by the 
 * [Archive Order Admin API Route](https://docs.medusajs.com/api/admin#orders_postordersidarchive).
 * 
 * You can use this workflow within your customizations or your own custom workflows, allowing you to wrap custom logic around archiving orders.
 * 
 * @example
 * const { result } = await archiveOrderWorkflow(container)
 * .run({
 *   input: {
 *     orderIds: ["order_123"]
 *   }
 * })
 * 
 * @summary
 * 
 * Archive one or more orders.
 */
export const archiveOrderWorkflow = createWorkflow(
  {
    name: archiveOrderWorkflowId,
    inputSchema: archiveOrdersWorkflowInputSchema,
    outputSchema: archiveOrdersWorkflowOutputSchema,
  },
  (input) => {
    const eventData = transform({ input }, (data) => {
      return data.input.orderIds.map((id) => ({ id }))
    })

    emitEventStep({
      eventName: OrderWorkflowEvents.ARCHIVED,
      data: eventData,
    })

    return new WorkflowResponse(archiveOrdersStep(input))
  }
)
