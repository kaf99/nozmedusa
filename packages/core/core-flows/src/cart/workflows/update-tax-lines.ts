import {
  createWorkflow,
  transform,
  when,
} from "@medusajs/framework/workflows-sdk"
import { useRemoteQueryStep } from "../../common"
import { getItemTaxLinesStep } from "../../tax/steps/get-item-tax-lines"
import { setTaxLinesForItemsStep } from "../steps"
import {
  updateTaxLinesWorkflowInputSchema,
  updateTaxLinesWorkflowOutputSchema,
} from "../utils/schemas"

const cartFields = [
  "id",
  "currency_code",
  "email",
  "region.id",
  "region.automatic_taxes",
  "items.id",
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
  "shipping_methods.tax_lines.id",
  "shipping_methods.tax_lines.description",
  "shipping_methods.tax_lines.code",
  "shipping_methods.tax_lines.rate",
  "shipping_methods.tax_lines.provider_id",
  "shipping_methods.shipping_option_id",
  "shipping_methods.amount",
  "customer.id",
  "customer.email",
  "customer.metadata",
  "customer.groups.id",
  "shipping_address.id",
  "shipping_address.address_1",
  "shipping_address.address_2",
  "shipping_address.city",
  "shipping_address.postal_code",
  "shipping_address.country_code",
  "shipping_address.region_code",
  "shipping_address.province",
  "shipping_address.metadata",
]

export const updateTaxLinesWorkflowId = "update-tax-lines"
/**
 * This workflow updates a cart's tax lines that are applied on line items and shipping methods. You can update the line item's quantity, unit price, and more. This workflow is executed
 * by the [Calculate Taxes Store API Route](https://docs.medusajs.com/api/store#carts_postcartsidtaxes).
 *
 * You can use this workflow within your own customizations or custom workflows, allowing you to update a cart's tax lines in your custom flows.
 *
 * @example
 * const { result } = await updateTaxLinesWorkflow(container)
 * .run({
 *   input: {
 *     cart_id: "cart_123",
 *   }
 * })
 *
 * @summary
 *
 * Update a cart's tax lines.
 */
export const updateTaxLinesWorkflow = createWorkflow(
  {
    name: updateTaxLinesWorkflowId,
    description: "Update a cart's tax lines",
    inputSchema: updateTaxLinesWorkflowInputSchema,
    outputSchema: updateTaxLinesWorkflowOutputSchema,
  },
  (input) => {
    const fetchCart = when({ input }, ({ input }) => {
      return !input.cart
    }).then(() => {
      return useRemoteQueryStep({
        entry_point: "cart",
        fields: cartFields,
        variables: { id: input.cart_id },
        throw_if_key_not_found: true,
        list: false,
      })
    })

    const cart = transform({ fetchCart, input }, ({ fetchCart, input }) => {
      return input.cart ?? fetchCart
    })

    const taxLineItems = getItemTaxLinesStep(
      transform({ input, cart }, (data) => ({
        orderOrCart: data.cart,
        items: data.cart.items,
        shipping_methods: data.cart.shipping_methods,
        force_tax_calculation: data.input.force_tax_calculation,
      }))
    )

    setTaxLinesForItemsStep({
      cart,
      item_tax_lines: taxLineItems.lineItemTaxLines,
      shipping_tax_lines: taxLineItems.shippingMethodsTaxLines,
    })
  }
)
