import { MedusaContainer } from "@medusajs/framework/types"
import {
  ContainerRegistrationKeys,
  remoteQueryObjectFromString,
} from "@medusajs/framework/utils"

export const refetchShippingOptionType = async (
  shippingOptionTypeId: string,
  scope: MedusaContainer,
  fields: string[]
) => {
  const remoteQuery = scope.resolve(ContainerRegistrationKeys.REMOTE_QUERY)
  const queryObject = remoteQueryObjectFromString({
    entryPoint: "shipping_option_type",
    variables: {
      filters: { id: shippingOptionTypeId },
    },
    fields: fields,
  })

  const shippingOptionTypes = await remoteQuery(queryObject)
  return shippingOptionTypes[0]
}
