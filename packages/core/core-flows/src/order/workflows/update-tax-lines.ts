import {
  createWorkflow,
  transform,
  when,
} from "@medusajs/framework/workflows-sdk"
import {
  updateOrderTaxLinesWorkflowInputSchema,
  updateOrderTaxLinesWorkflowOutputSchema,
} from "../utils/schemas"
import { useRemoteQueryStep } from "../../common"
import { getItemTaxLinesStep } from "../../tax/steps/get-item-tax-lines"
import { setOrderTaxLinesForItemsStep } from "../steps"

const completeOrderFields = [
  "id",
  "currency_code",
  "email",
  "region.id",
  "region.automatic_taxes",
  "items.id",
  "items.is_tax_inclusive",
  "items.is_giftcard",
  "items.variant_id",
  "items.product_id",
  "items.product_title",
  "items.product_description",
  "items.product_subtitle",
  "items.product_type",
  "items.product_type_id",
  "items.product_collection",
  "items.product_handle",
  "items.variant_sku",
  "items.variant_barcode",
  "items.variant_title",
  "items.title",
  "items.quantity",
  "items.unit_price",
  "items.tax_lines.id",
  "items.tax_lines.description",
  "items.tax_lines.code",
  "items.tax_lines.rate",
  "items.tax_lines.provider_id",
  "shipping_methods.id",
  "shipping_methods.is_tax_inclusive",
  "shipping_methods.shipping_option_id",
  "shipping_methods.amount",
  "shipping_methods.tax_lines.id",
  "shipping_methods.tax_lines.description",
  "shipping_methods.tax_lines.code",
  "shipping_methods.tax_lines.rate",
  "shipping_methods.tax_lines.provider_id",
  "customer.id",
  "customer.email",
  "customer.groups.id",
  "shipping_address.id",
  "shipping_address.address_1",
  "shipping_address.address_2",
  "shipping_address.city",
  "shipping_address.postal_code",
  "shipping_address.country_code",
  "shipping_address.region_code",
  "shipping_address.province",
]

const orderFields = [
  "id",
  "currency_code",
  "email",
  "region.id",
  "region.automatic_taxes",
  "shipping_methods.tax_lines.id",
  "shipping_methods.tax_lines.description",
  "shipping_methods.tax_lines.code",
  "shipping_methods.tax_lines.rate",
  "shipping_methods.tax_lines.provider_id",
  "shipping_methods.shipping_option_id",
  "shipping_methods.amount",
  "customer.id",
  "customer.email",
  "customer.groups.id",
  "shipping_address.id",
  "shipping_address.address_1",
  "shipping_address.address_2",
  "shipping_address.city",
  "shipping_address.postal_code",
  "shipping_address.country_code",
  "shipping_address.region_code",
  "shipping_address.province",
]

const shippingMethodFields = [
  "id",
  "shipping_option_id",
  "is_tax_inclusive",
  "amount",
  "tax_lines.id",
  "tax_lines.description",
  "tax_lines.code",
  "tax_lines.rate",
  "tax_lines.provider_id",
]

const lineItemFields = [
  "id",
  "variant_id",
  "product_id",
  "is_tax_inclusive",
  "is_giftcard",
  "product_title",
  "product_description",
  "product_subtitle",
  "product_type",
  "product_type_id",
  "product_collection",
  "product_handle",
  "variant_sku",
  "variant_barcode",
  "variant_title",
  "title",
  "quantity",
  "unit_price",
  "tax_lines.id",
  "tax_lines.description",
  "tax_lines.code",
  "tax_lines.rate",
  "tax_lines.provider_id",
]
export type {
  UpdateOrderTaxLinesWorkflowInput,
  UpdateOrderTaxLinesWorkflowOutput,
} from "../utils/schemas"

export const updateOrderTaxLinesWorkflowId = "update-order-tax-lines"
/**
 * This workflow updates the tax lines of items and shipping methods in an order. It's used by
 * other order-related workflows, such as the {@link createOrderWorkflow} to set the order's
 * tax lines.
 *
 * You can use this workflow within your customizations or your own custom workflows, allowing you to update an
 * order's tax lines in your custom flows.
 *
 * @example
 * const { result } = await updateOrderTaxLinesWorkflow(container)
 * .run({
 *   input: {
 *     order_id: "order_123",
 *     item_ids: ["orli_123", "orli_456"],
 *   }
 * })
 *
 * @summary
 *
 * Update the tax lines of items and shipping methods in an order.
 */

export const updateOrderTaxLinesWorkflow = createWorkflow(
  {
    name: updateOrderTaxLinesWorkflowId,
    description: "Update the tax lines of items and shipping methods in an order",
    inputSchema: updateOrderTaxLinesWorkflowInputSchema,
    outputSchema: updateOrderTaxLinesWorkflowOutputSchema,
  },
  (input) => {
    const isFullOrder = transform(input, (data) => {
      return !data.item_ids && !data.shipping_method_ids
    })

    const fetchOrderFields = transform(isFullOrder, (isFullOrder) => {
      return isFullOrder ? completeOrderFields : orderFields
    })

    const order = useRemoteQueryStep({
      entry_point: "order",
      fields: fetchOrderFields,
      variables: { id: input.order_id },
      list: false,
    })

    const items = when({ input }, ({ input }) => {
      return input.item_ids!?.length > 0
    }).then(() => {
      return useRemoteQueryStep({
        entry_point: "order_line_item",
        fields: lineItemFields,
        variables: { id: input.item_ids },
      }).config({ name: "query-order-line-items" })
    })

    const shippingMethods = when({ input }, ({ input }) => {
      return input.shipping_method_ids!?.length > 0
    }).then(() => {
      return useRemoteQueryStep({
        entry_point: "order_shipping_method",
        fields: shippingMethodFields,
        variables: { id: input.shipping_method_ids },
      }).config({ name: "query-order-shipping-methods" })
    })

    const taxLineItems = getItemTaxLinesStep(
      transform(
        { input, order, items, shippingMethods, isFullOrder },
        (data) => {
          const shippingMethods = data.isFullOrder
            ? data.order.shipping_methods
            : data.shippingMethods ?? []

          const lineItems = data.isFullOrder
            ? data.order.items
            : data.items ?? []

          return {
            orderOrCart: data.order,
            items: lineItems,
            shipping_methods: shippingMethods,
            force_tax_calculation: data.input.force_tax_calculation,
            is_return: data.input.is_return ?? false,
            shipping_address: data.input.shipping_address,
          }
        }
      )
    )

    setOrderTaxLinesForItemsStep({
      order,
      item_tax_lines: taxLineItems.lineItemTaxLines,
      shipping_tax_lines: taxLineItems.shippingMethodsTaxLines,
    })
  }
)
