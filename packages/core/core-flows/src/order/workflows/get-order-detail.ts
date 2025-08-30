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
  getOrderDetailWorkflowInputSchema,
  getOrderDetailWorkflowOutputSchema,
} from "../utils/schemas"


export const getOrderDetailWorkflowId = "get-order-detail"
/**
 * This workflow retrieves an order's details. It's used by many API routes, including
 * [Get an Order Admin API Route](https://docs.medusajs.com/api/admin#orders_getordersid), and
 * [Get an Order Store API Route](https://docs.medusajs.com/api/store#orders_getordersid).
 *
 * You can use this workflow within your customizations or your own custom workflows, allowing you to retrieve an
 * order's details in your custom flows.
 *
 * @example
 * const { result } = await getOrderDetailWorkflow(container)
 * .run({
 *   input: {
 *     order_id: "order_123",
 *     fields: ["id", "status", "items"]
 *   }
 * })
 *
 * @summary
 *
 * Retrieve an order's details.
 */
export const getOrderDetailWorkflow = createWorkflow(
  {
    name: getOrderDetailWorkflowId,
    inputSchema: getOrderDetailWorkflowInputSchema,
    outputSchema: getOrderDetailWorkflowOutputSchema,
  },
  (input) => {
    const fields = transform(input, ({ fields }) => {
      return deduplicate([
        ...fields,
        "id",
        "status",
        "version",
        "payment_collections.*",
        "fulfillments.*",
      ])
    })

    const variables = transform({ input }, ({ input }) => {
      return { ...input.filters, id: input.order_id, version: input.version }
    })

    const order = useRemoteQueryStep({
      entry_point: "orders",
      fields,
      variables,
      list: false,
      throw_if_key_not_found: true,
    })

    const aggregatedOrder = transform({ order }, ({ order }) => {
      const order_ = order as OrderDetailDTO

      order_.payment_status = getLastPaymentStatus(
        order_
      ) as OrderDetailDTO["payment_status"]
      order_.fulfillment_status = getLastFulfillmentStatus(
        order_
      ) as OrderDetailDTO["fulfillment_status"]
      return order_
    })

    return new WorkflowResponse(aggregatedOrder)
  }
)
