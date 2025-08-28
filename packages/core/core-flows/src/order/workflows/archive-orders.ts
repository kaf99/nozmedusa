import { OrderDTO } from "@medusajs/framework/types"
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
  type ArchiveOrdersWorkflowInput as SchemaInput,
  type ArchiveOrdersWorkflowOutput as SchemaOutput,
} from "../utils/schemas"
export {
  type ArchiveOrdersWorkflowInput,
  type ArchiveOrdersWorkflowOutput,
} from "../utils/schemas"

/**
 * The details of the orders to archive.
 */
type OldArchiveOrdersWorkflowInput = {
  /**
   * The IDs of the orders to archive.
   */
  orderIds: string[]
}

/**
 * The archived orders.
 */
type OldArchiveOrdersWorkflowOutput = OrderDTO[]

// Type verification
const schemaInput = {} as SchemaInput
const schemaOutput = {} as SchemaOutput
const existingInput: OldArchiveOrdersWorkflowInput = schemaInput
const existingOutput: OldArchiveOrdersWorkflowOutput = schemaOutput

// Check reverse too
const oldInput = {} as OldArchiveOrdersWorkflowInput
const oldOutput = {} as OldArchiveOrdersWorkflowOutput
const newInput: SchemaInput = oldInput
const newOutput: SchemaOutput = oldOutput

console.log(existingInput, existingOutput, newInput, newOutput)

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
