import { OrderDetailDTO } from "@medusajs/framework/types"
import { deduplicate } from "@medusajs/framework/utils"
import {
  WorkflowResponse,
  createWorkflow,
  transform,
} from "@medusajs/framework/workflows-sdk"
import { useRemoteQueryStep } from "../../common"
import {
  getLastFulfillmentStatus,
  getLastPaymentStatus,
} from "../utils/aggregate-status"
import {
  getOrdersListWorkflowInputSchema,
  getOrdersListWorkflowOutputSchema,
} from "../utils/schemas"


export const getOrdersListWorkflowId = "get-orders-list"
/**
 * This workflow retrieves a list of orders. It's used by the 
 * [List Orders Admin API Route](https://docs.medusajs.com/api/admin#orders_getorders), and the
 * [List Orders Store API Route](https://docs.medusajs.com/api/store#orders_getorders).
 * 
 * You can use this workflow within your customizations or your own custom workflows, allowing you to retrieve a list of
 * orders in your custom flows. For example, you can retrieve the list of orders to export them
 * to a third-party system.
 * 
 * @example
 * To retrieve the list of orders:
 * 
 * ```ts
 * const { result } = await getOrdersListWorkflow(container)
 * .run({
 *   input: {
 *     fields: ["id", "status", "items"],
 *   }
 * })
 * ```
 * 
 * To retrieve the list of orders with pagination:
 * 
 * ```ts
 * const { result } = await getOrdersListWorkflow(container)
 * .run({
 *   input: {
 *     fields: ["id", "status", "items"],
 *     variables: {
 *       skip: 0,
 *       take: 15,
 *     }
 *   }
 * })
 * ```
 * 
 * @summary
 * 
 * Retrieve a list of orders.
 */
export const getOrdersListWorkflow = createWorkflow(
  {
    name: getOrdersListWorkflowId,
    inputSchema: getOrdersListWorkflowInputSchema,
    outputSchema: getOrdersListWorkflowOutputSchema,
  },
  (input) => {
    const fields = transform(input, ({ fields }) => {
      return deduplicate([
        ...fields,
        "id",
        "status",
        "version",
        "items.*",
        "payment_collections.status",
        "payment_collections.amount",
        "payment_collections.captured_amount",
        "payment_collections.refunded_amount",
        "fulfillments.packed_at",
        "fulfillments.shipped_at",
        "fulfillments.delivered_at",
        "fulfillments.canceled_at",
      ])
    })

    const orders = useRemoteQueryStep({
      entry_point: "orders",
      fields,
      variables: input.variables,
      list: true,
    })

    const aggregatedOrders = transform(
      { orders, input },
      ({ orders, input }) => {
        const fields = input.fields
        const requiredPaymentFields = fields.some((f) =>
          f.includes("payment_collections")
        )
        const requiredFulfillmentFields = fields.some((f) =>
          f.includes("fulfillments")
        )

        const orders_ = orders as any
        const data = orders_.rows ? orders_.rows : orders_

        for (const order of data) {
          const order_ = order as OrderDetailDTO

          order_.payment_status = getLastPaymentStatus(
            order_
          ) as OrderDetailDTO["payment_status"]
          order_.fulfillment_status = getLastFulfillmentStatus(
            order_
          ) as OrderDetailDTO["fulfillment_status"]

          if (!requiredPaymentFields) {
            // @ts-ignore
            delete order_.payment_collections
          }
          if (!requiredFulfillmentFields) {
            // @ts-ignore
            delete order_.fulfillments
          }
        }

        return orders
      }
    )

    return new WorkflowResponse(aggregatedOrders)
  }
)
