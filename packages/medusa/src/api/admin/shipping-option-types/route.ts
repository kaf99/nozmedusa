import {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"

import {
  ContainerRegistrationKeys,
  remoteQueryObjectFromString,
} from "@medusajs/framework/utils"
import { createShippingOptionTypesWorkflow } from "@medusajs/core-flows"
import { refetchShippingOptionType } from "./helpers"
import { HttpTypes } from "@medusajs/framework/types"

export const GET = async (
  req: AuthenticatedMedusaRequest<HttpTypes.AdminShippingOptionTypeListParams>,
  res: MedusaResponse<HttpTypes.AdminShippingOptionTypeListResponse>
) => {
  const remoteQuery = req.scope.resolve(ContainerRegistrationKeys.REMOTE_QUERY)
  const queryObject = remoteQueryObjectFromString({
    entryPoint: "shipping_option_type",
    variables: {
      filters: req.filterableFields,
      ...req.queryConfig.pagination,
    },
    fields: req.queryConfig.fields,
  })

  const { rows: shipping_option_types, metadata } = await remoteQuery(
    queryObject
  )

  res.json({
    shipping_option_types: shipping_option_types,
    count: metadata.count,
    offset: metadata.skip,
    limit: metadata.take,
  })
}

export const POST = async (
  req: AuthenticatedMedusaRequest<HttpTypes.AdminCreateShippingOptionType>,
  res: MedusaResponse<HttpTypes.AdminShippingOptionTypeResponse>
) => {
  const input = [req.validatedBody]

  const { result } = await createShippingOptionTypesWorkflow(req.scope).run({
    input: { product_types: input },
  })

  const productType = await refetchShippingOptionType(
    result[0].id,
    req.scope,
    req.queryConfig.fields
  )

  res.status(200).json({ product_type: productType })
}
