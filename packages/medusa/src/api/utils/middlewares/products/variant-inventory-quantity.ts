import { MedusaRequest, MedusaStoreRequest } from "@medusajs/framework/http"
import {
  ContainerRegistrationKeys,
  getTotalVariantAvailability,
  getVariantAvailability,
  MedusaError,
} from "@medusajs/framework/utils"

export const wrapVariantsWithTotalInventoryQuantity = async (
  req: MedusaRequest,
  variants: VariantInput[]
) => {
  const variantIds = (variants ?? []).map((variant) => variant.id).flat(1)

  if (!variantIds.length) {
    return
  }

  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)
  const availability = await getTotalVariantAvailability(query, {
    variant_ids: variantIds,
  })

  wrapVariants(variants, availability)
}

export const wrapVariantsWithInventoryQuantityForSalesChannel = async (
  req: MedusaStoreRequest<unknown>,
  variants: VariantInput[],
  salesChannelIdFromQuery?: string | string[]
) => {
  // Comment: In our core, `req.filterableFields.sales_channel_id` will always be undefined, as we delete it in a previous middleware
  //   However, we are keeping it here for backwards compatibility
  let salesChannelIds =
    (req.filterableFields.sales_channel_id as string | string[]) ??
    salesChannelIdFromQuery

  salesChannelIds = Array.isArray(salesChannelIds)
    ? salesChannelIds
    : [salesChannelIds]

  const { sales_channel_ids: idsFromPublishableKey = [] } =
    req.publishable_key_context

  let channelToUse: string | undefined

  if (salesChannelIds.length === 1) {
    channelToUse = salesChannelIds[0]
  }

  // Sales channel from publishable key takes precedence over the sales channel id from query params
  if (idsFromPublishableKey.length === 1) {
    channelToUse = idsFromPublishableKey[0]
  }

  // At this point, we have checked two sources of sales channel id:
  // - The sales channel id(s) passed in the query params
  // - The sales channel id(s) passed in the publishable key
  // If we don't have a *single* sales channel id, we have to throw an error, as we don't know where to get the inventory quantity from
  if (!channelToUse) {
    throw new MedusaError(
      MedusaError.Types.INVALID_DATA,
      `Inventory availability cannot be calculated in the given context. Either provide a sales channel id or configure a single sales channel in the publishable key`
    )
  }

  variants ??= []
  const variantIds = variants.map((variant) => variant.id).flat(1)

  if (!variantIds.length) {
    return
  }

  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)
  const availability = await getVariantAvailability(query, {
    variant_ids: variantIds,
    sales_channel_id: channelToUse,
  })

  wrapVariants(variants, availability)
}

type VariantInput = {
  id: string
  inventory_quantity?: number
  manage_inventory?: boolean
}

type VariantAvailability = Awaited<
  ReturnType<typeof getTotalVariantAvailability>
>

const wrapVariants = (
  variants: VariantInput[],
  availability: VariantAvailability
) => {
  for (const variant of variants) {
    if (!variant.manage_inventory) {
      continue
    }

    variant.inventory_quantity = availability[variant.id].availability
  }
}
