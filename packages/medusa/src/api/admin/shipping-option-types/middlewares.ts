import * as QueryConfig from "./query-config"
import { MiddlewareRoute } from "@medusajs/framework/http"
import {
  validateAndTransformBody,
  validateAndTransformQuery,
} from "@medusajs/framework"
import {
  AdminCreateShippingOptionType,
  AdminGetShippingOptionTypeParams,
  AdminGetShippingOptionTypesParams,
  AdminUpdateShippingOptionType,
} from "./validators"

export const adminShippingOptionTypeRoutesMiddlewares: MiddlewareRoute[] = [
  {
    method: ["GET"],
    matcher: "/admin/product-types",
    middlewares: [
      validateAndTransformQuery(
        AdminGetShippingOptionTypesParams,
        QueryConfig.listShippingOptionTypesTransformQueryConfig
      ),
    ],
  },
  {
    method: ["GET"],
    matcher: "/admin/product-types/:id",
    middlewares: [
      validateAndTransformQuery(
        AdminGetShippingOptionTypeParams,
        QueryConfig.retrieveShippingOptionTypeTransformQueryConfig
      ),
    ],
  },
  // Create/update/delete methods are new in v2
  {
    method: ["POST"],
    matcher: "/admin/product-types",
    middlewares: [
      validateAndTransformBody(AdminCreateShippingOptionType),
      validateAndTransformQuery(
        AdminGetShippingOptionTypeParams,
        QueryConfig.retrieveShippingOptionTypeTransformQueryConfig
      ),
    ],
  },
  {
    method: ["POST"],
    matcher: "/admin/product-types/:id",
    middlewares: [
      validateAndTransformBody(AdminUpdateShippingOptionType),
      validateAndTransformQuery(
        AdminGetShippingOptionTypeParams,
        QueryConfig.retrieveShippingOptionTypeTransformQueryConfig
      ),
    ],
  },
  {
    method: ["DELETE"],
    matcher: "/admin/product-types/:id",
    middlewares: [],
  },
]
