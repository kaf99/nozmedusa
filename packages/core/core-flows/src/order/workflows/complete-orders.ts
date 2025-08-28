import { AdditionalData, OrderDTO } from "@medusajs/framework/types"
import { OrderWorkflowEvents } from "@medusajs/framework/utils"
import {
  WorkflowResponse,
  createHook,
  createWorkflow,
  transform,
} from "@medusajs/framework/workflows-sdk"
import { emitEventStep } from "../../common/steps/emit-event"
import { completeOrdersStep } from "../steps"
import {
  completeOrdersWorkflowInputSchema,
  completeOrdersWorkflowOutputSchema,
  type CompleteOrdersWorkflowInput as SchemaInput,
  type CompleteOrdersWorkflowOutput as SchemaOutput,
} from "../utils/schemas"
export {
  type CompleteOrdersWorkflowInput,
  type CompleteOrdersWorkflowOutput,
} from "../utils/schemas"

/**
 * The orders to complete, along with custom data that's passed to the workflow's hooks.
 */
type OldCompleteOrdersWorkflowInput = {
  /**
   * The IDs of the orders to complete.
   */
  orderIds: string[]
} & AdditionalData

// Type verification
const schemaInput = {} as SchemaInput
const schemaOutput = {} as SchemaOutput
const existingInput: OldCompleteOrdersWorkflowInput = schemaInput
const existingOutput: OrderDTO[] = schemaOutput

// Check reverse too
const oldInput = {} as OldCompleteOrdersWorkflowInput
const oldOutput = {} as OrderDTO[]
const newInput: SchemaInput = oldInput
const newOutput: SchemaOutput = oldOutput

console.log(existingInput, existingOutput, newInput, newOutput)

export const completeOrderWorkflowId = "complete-order-workflow"
/**
 * This workflow marks one or more orders as completed. It's used by the [Complete Cart Admin API Route](https://docs.medusajs.com/api/admin#orders_postordersidcomplete).
 * 
 * This workflow has a hook that allows you to perform custom actions on the completed orders. For example, you can pass under `additional_data` custom data that 
 * allows you to update custom data models linked to the orders.
 * 
 * You can also use this workflow within your customizations or your own custom workflows, allowing you to wrap custom logic around order completion.
 * 
 * @example
 * const { result } = await completeOrderWorkflow(container)
 * .run({
 *   input: {
 *     orderIds: ["order_1", "order_2"],
 *     additional_data: {
 *       send_webhook: true,
 *     }
 *   }
 * })
 * 
 * @summary
 * 
 * Complete one or more orders.
 * 
 * @property hooks.ordersCompleted - This hook is executed after the orders are completed. You can consume this hook to perform custom actions on the completed orders.
 */
export const completeOrderWorkflow = createWorkflow(
  {
    name: completeOrderWorkflowId,
    inputSchema: completeOrdersWorkflowInputSchema,
    outputSchema: completeOrdersWorkflowOutputSchema,
  },
  (input) => {
    const completedOrders = completeOrdersStep(input)

    const eventData = transform({ input }, (data) => {
      return data.input.orderIds.map((id) => ({ id }))
    })

    emitEventStep({
      eventName: OrderWorkflowEvents.COMPLETED,
      data: eventData,
    })

    const ordersCompleted = createHook("ordersCompleted", {
      orders: completedOrders,
      additional_data: input.additional_data,
    })

    return new WorkflowResponse(completedOrders, {
      hooks: [ordersCompleted],
    })
  }
)
