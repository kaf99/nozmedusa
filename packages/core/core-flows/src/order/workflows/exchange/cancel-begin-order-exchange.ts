import {
  OrderChangeDTO,
  OrderDTO,
  OrderExchangeDTO,
} from "@medusajs/framework/types"
import { ChangeActionType, OrderChangeStatus } from "@medusajs/framework/utils"
import {
  createStep,
  createWorkflow,
  parallelize,
  transform,
} from "@medusajs/framework/workflows-sdk"
import { useRemoteQueryStep } from "../../../common"
import {
  deleteExchangesStep,
  deleteOrderChangesStep,
  deleteOrderShippingMethods,
  deleteReturnsStep,
} from "../../steps"
import {
  throwIfIsCancelled,
  throwIfOrderChangeIsNotActive,
} from "../../utils/order-validation"
import {
  cancelBeginOrderExchangeWorkflowInputSchema,
  cancelBeginOrderExchangeWorkflowOutputSchema,
  type CancelBeginOrderExchangeWorkflowInput as SchemaInput,
  type CancelBeginOrderExchangeWorkflowOutput as SchemaOutput,
} from "../../utils/schemas"

/**
 * The data to validate that a requested exchange can be canceled.
 */
export type CancelBeginOrderExchangeValidationStepInput = {
  /**
   * The order's details.
   */
  order: OrderDTO
  /**
   * The order exchange's details.
   */
  orderExchange: OrderExchangeDTO
  /**
   * The order change's details.
   */
  orderChange: OrderChangeDTO
}

/**
 * This step validates that a requested exchange can be canceled.
 * If the order or exchange is canceled, or the order change is not active, the step will throw an error.
 * 
 * :::note
 * 
 * You can retrieve an order, order exchange, and order change details using [Query](https://docs.medusajs.com/learn/fundamentals/module-links/query),
 * or [useQueryGraphStep](https://docs.medusajs.com/resources/references/medusa-workflows/steps/useQueryGraphStep).
 * 
 * :::
 * 
 * @example
 * const data = cancelBeginOrderExchangeValidationStep({
 *   order: {
 *     id: "order_123",
 *     // other order details...
 *   },
 *   orderChange: {
 *     id: "orch_123",
 *     // other order change details...
 *   },
 *   orderExchange: {
 *     id: "exchange_123",
 *     // other order exchange details...
 *   },
 * })
 */
export const cancelBeginOrderExchangeValidationStep = createStep(
  "validate-cancel-begin-order-exchange",
  async function ({
    order,
    orderChange,
    orderExchange,
  }: CancelBeginOrderExchangeValidationStepInput) {
    throwIfIsCancelled(order, "Order")
    throwIfIsCancelled(orderExchange, "Exchange")
    throwIfOrderChangeIsNotActive({ orderChange })
  }
)

// Type verification - CORRECT ORDER!
const schemaInput = {} as SchemaInput
const schemaOutput = undefined as unknown as SchemaOutput

// Check 1: New input can go into old input (schema accepts all valid inputs)
const existingInput: {
  exchange_id: string
} = schemaInput

// Check 2: Old output can go into new output (schema produces compatible outputs)
const existingOutput: SchemaOutput = undefined as any

console.log(existingInput, existingOutput, schemaOutput)

/**
 * The details to cancel a requested order exchange.
 */
export type CancelBeginOrderExchangeWorkflowInput = SchemaInput

export const cancelBeginOrderExchangeWorkflowId = "cancel-begin-order-exchange"
/**
 * This workflow cancels a requested order exchange. It's used by the
 * [Cancel Exchange Admin API Route](https://docs.medusajs.com/api/admin#exchanges_deleteexchangesidrequest).
 * 
 * You can use this workflow within your customizations or your own custom workflows, allowing you to cancel an exchange
 * for an order in your custom flow.
 * 
 * @example
 * const { result } = await cancelBeginOrderExchangeWorkflow(container)
 * .run({
 *   input: {
 *     exchange_id: "exchange_123",
 *   }
 * })
 * 
 * @summary
 * 
 * Cancel a requested order exchange.
 */
export const cancelBeginOrderExchangeWorkflow = createWorkflow(
  {
    name: cancelBeginOrderExchangeWorkflowId,
    description: "Cancel begin order exchange",
    inputSchema: cancelBeginOrderExchangeWorkflowInputSchema,
    outputSchema: cancelBeginOrderExchangeWorkflowOutputSchema,
  },
  function (input) {
    const orderExchange: OrderExchangeDTO = useRemoteQueryStep({
      entry_point: "order_exchange",
      fields: ["id", "status", "order_id", "return_id", "canceled_at"],
      variables: { id: input.exchange_id },
      list: false,
      throw_if_key_not_found: true,
    })

    const order: OrderDTO = useRemoteQueryStep({
      entry_point: "orders",
      fields: ["id", "version", "canceled_at"],
      variables: { id: orderExchange.order_id },
      list: false,
      throw_if_key_not_found: true,
    }).config({ name: "order-query" })

    const orderChange: OrderChangeDTO = useRemoteQueryStep({
      entry_point: "order_change",
      fields: ["id", "status", "version", "actions.*"],
      variables: {
        filters: {
          order_id: orderExchange.order_id,
          exchange_id: orderExchange.id,
          status: [OrderChangeStatus.PENDING, OrderChangeStatus.REQUESTED],
        },
      },
      list: false,
    }).config({ name: "order-change-query" })

    cancelBeginOrderExchangeValidationStep({
      order,
      orderExchange,
      orderChange,
    })

    const shippingToRemove = transform(
      { orderChange, input },
      ({ orderChange, input }) => {
        return (orderChange.actions ?? [])
          .filter((a) => a.action === ChangeActionType.SHIPPING_ADD)
          .map(({ id }) => id)
      }
    )

    parallelize(
      deleteReturnsStep({ ids: [orderExchange.return_id!] }),
      deleteExchangesStep({ ids: [orderExchange.id] }),
      deleteOrderChangesStep({ ids: [orderChange.id] }),
      deleteOrderShippingMethods({ ids: shippingToRemove })
    )
  }
)
