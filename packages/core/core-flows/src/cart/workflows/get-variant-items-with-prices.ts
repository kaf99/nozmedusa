import {
  BigNumberInput,
  CartDTO,
  CartLineItemDTO,
  CreateCartCreateLineItemDTO,
  CustomerDTO,
  OrderWorkflow,
  RegionDTO,
  UpdateLineItemDTO,
  UpdateLineItemWithSelectorDTO,
} from "@medusajs/framework/types"
import {
  filterObjectByKeys,
  isDefined,
  MedusaError,
  simpleHash,
} from "@medusajs/framework/utils"
import {
  createWorkflow,
  transform,
  WorkflowData,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk"
import { useQueryGraphStep } from "../../common"
import { getVariantPriceSetsStep } from "../steps"
import {
  cartFieldsForPricingContext,
  productVariantsFields,
} from "../utils/fields"
import {
  prepareLineItemData,
  PrepareLineItemDataInput,
} from "../utils/prepare-line-item-data"

interface GetVariantItemsWithPricesWorkflowInput {
  cart: Partial<CartDTO> & {
    region?: Partial<RegionDTO>
    region_id?: string
    customer?: Partial<CustomerDTO>
    customer_id?: string
  }
  items?: Partial<
    | CreateCartCreateLineItemDTO
    | CartLineItemDTO
    | OrderWorkflow.OrderAddLineItemWorkflowInput["items"][number]
  >[]
  setPricingContextResult: object
  variants?: {
    id?: string[]
    fields?: string[]
  }
}

type GetVariantItemsWithPricesWorkflowOutput = [
  // The variant can depend on the requested fields and therefore the caller will know better
  (object & {
    calculated_price: {
      calculated_price: {
        price_list_type: string
      }
      is_calculated_price_tax_inclusive: boolean
      original_amount: BigNumberInput
      calculated_amount: BigNumberInput
    }
  })[],
  UpdateLineItemWithSelectorDTO[]
]

export const getVariantItemsWithPricesId =
  "get-variant-items-with-prices-workflow"
export const prepareCartItemsWithPricesWorkflow = createWorkflow(
  getVariantItemsWithPricesId,
  (
    input: WorkflowData<GetVariantItemsWithPricesWorkflowInput>
  ): WorkflowResponse<GetVariantItemsWithPricesWorkflowOutput> => {
    const variantIds = transform(
      { cart: input.cart, variantIds: input.variants?.id },
      (data): string[] => {
        if (data.variantIds) {
          return data.variantIds
        }

        return Array.from(
          new Set((data.cart.items ?? []).map((i) => i.variant_id))
        ).filter((v): v is string => !!v)
      }
    )

    const cartPricingContext = transform(
      {
        cart: input.cart,
        items: input.items,
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

        return (data.items ?? cart.items ?? [])
          .filter((i) => i.variant_id)
          .map((item) => {
            const idLike =
              (item as CartLineItemDTO).id ?? simpleHash(JSON.stringify(item))
            return {
              id: idLike,
              variantId: item.variant_id!,
              context: {
                ...baseContext,
                quantity: item.quantity,
              },
            }
          })
      }
    )

    const variantQueryFields = transform(
      { variants: input.variants },
      (data) => {
        return data.variants?.fields ?? productVariantsFields
      }
    )

    const { data: variantsData } = useQueryGraphStep({
      entity: "variants",
      fields: variantQueryFields,
      filters: {
        id: variantIds,
      },
    }).config({ name: "fetch-variants" })

    const calculatedPriceSets = getVariantPriceSetsStep({
      data: cartPricingContext,
    })

    const variantsItemsWithPrices = transform(
      { cart: input.cart, variantsData, calculatedPriceSets },
      ({
        cart,
        variantsData,
        calculatedPriceSets,
      }): GetVariantItemsWithPricesWorkflowOutput => {
        const priceNotFound: string[] = []

        const items = (cart.items ?? []).map((item) => {
          const idLike =
            (item as CartLineItemDTO).id ?? simpleHash(JSON.stringify(item))
          let calculatedPriceSet = calculatedPriceSets[idLike]
          if (!calculatedPriceSet) {
            calculatedPriceSet = calculatedPriceSets[item.variant_id!]
          }

          if (!calculatedPriceSet) {
            priceNotFound.push(item.variant_id!)
          }

          const variant = variantsData.find((v) => v.id === item.variant_id)

          variant.calculated_price = calculatedPriceSet

          const input: PrepareLineItemDataInput = {
            item,
            variant: variant,
            cartId: cart.id,
            unitPrice: item.unit_price,
            isTaxInclusive:
              item.is_tax_inclusive ??
              calculatedPriceSet?.is_calculated_price_tax_inclusive,
            isCustomPrice: isDefined(item?.unit_price),
          }

          if (variant && !isDefined(input.unitPrice)) {
            input.unitPrice = calculatedPriceSet.calculated_amount
          }

          const preparedItem = prepareLineItemData(input)

          return {
            selector: { id: item.id },
            data: preparedItem as Partial<UpdateLineItemDTO>,
          }
        })

        if (priceNotFound.length > 0) {
          throw new MedusaError(
            MedusaError.Types.INVALID_DATA,
            `Variants with IDs ${priceNotFound.join(", ")} do not have a price`
          )
        }

        return [variantsData, items]
      }
    )

    return new WorkflowResponse(variantsItemsWithPrices)
  }
)
