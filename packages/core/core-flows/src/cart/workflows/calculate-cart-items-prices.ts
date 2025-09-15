import { filterObjectByKeys, MedusaError } from "@medusajs/framework/utils"
import {
  createWorkflow,
  transform,
  WorkflowData,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk"
import { CartDTO, CustomerDTO, RegionDTO } from "@medusajs/types"
import {
  cartFieldsForPricingContext,
  productVariantsFields,
} from "../utils/fields"
import { useQueryGraphStep } from "../../common"
import { getVariantPriceSetsStep } from "../steps"
import {
  prepareLineItemData,
  PrepareLineItemDataInput,
} from "../utils/prepare-line-item-data"

interface PrepareCartItemsWithPricesWorkflowInput {
  cart: Partial<CartDTO> & {
    region?: Partial<RegionDTO>
    region_id?: string
    customer?: Partial<CustomerDTO>
    customer_id?: string
  }
  setPricingContextResult: Record<string, unknown>
}

export const prepareCartItemsWithPricesId =
  "prepare-cart-items-with-prices-workflow"
export const prepareCartItemsWithPricesWorkflow = createWorkflow(
  prepareCartItemsWithPricesId,
  (input: WorkflowData<PrepareCartItemsWithPricesWorkflowInput>) => {
    const variantIds = transform({ cart: input.cart }, (data) => {
      return Array.from(
        new Set(
          (data.cart.items ?? []).map((i) => i.variant_id).filter(Boolean)
        )
      )
    })

    const cartPricingContext = transform(
      {
        cart: input.cart,
        setPricingContextResult: input.setPricingContextResult,
      },
      (
        data
      ): {
        id: string
        variantId: string
        context: Record<string, unknown>
      }[] => {
        const cart = data.cart
        const baseContext = {
          ...filterObjectByKeys(cart, cartFieldsForPricingContext),
          ...(data.setPricingContextResult ? data.setPricingContextResult : {}),
          currency_code: cart.currency_code,
          region_id: cart.region_id,
          region: cart.region,
          customer_id: cart.customer_id,
          customer: cart.customer,
        }

        return (cart.items ?? [])
          .filter((i) => i.variant_id)
          .map((item) => {
            return {
              id: item.id,
              variantId: item.variant_id!,
              context: {
                ...baseContext,
                quantity: item.quantity,
              },
            }
          })
      }
    )

    const { data: variantsData } = useQueryGraphStep({
      entity: "variants",
      fields: productVariantsFields,
      filters: {
        id: variantIds,
      },
    }).config({ name: "fetch-variants" })

    const calculatedPriceSets = getVariantPriceSetsStep({
      data: cartPricingContext,
    })

    const lineItems = transform(
      { cart: input.cart, variantsData, calculatedPriceSets },
      ({ cart, variantsData, calculatedPriceSets }) => {
        const priceNotFound: string[] = []

        const items = (cart.items ?? []).map((item) => {
          let calculatedPriceSet = calculatedPriceSets[item.id]
          if (!calculatedPriceSet) {
            calculatedPriceSet = calculatedPriceSets[item.variant_id!]
          }

          if (!calculatedPriceSet) {
            priceNotFound.push(item.variant_id!)
          }

          const variant = variantsData.find((v) => v.id === item.variant_id)

          const input: PrepareLineItemDataInput = {
            item,
            variant: variant,
            cartId: cart.id,
            unitPrice: item.unit_price,
            isTaxInclusive: item.is_tax_inclusive,
          }

          if (variant && !item.is_custom_price) {
            input.unitPrice = calculatedPriceSet.calculated_amount
            input.isTaxInclusive =
              calculatedPriceSet.is_calculated_price_tax_inclusive
          }

          const preparedItem = prepareLineItemData(input)

          return {
            selector: { id: item.id },
            data: preparedItem,
          }
        })

        if (priceNotFound.length > 0) {
          throw new MedusaError(
            MedusaError.Types.INVALID_DATA,
            `Variants with IDs ${priceNotFound.join(", ")} do not have a price`
          )
        }

        return items
      }
    )

    return new WorkflowResponse(lineItems)
  }
)
