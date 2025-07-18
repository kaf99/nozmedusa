import { validateAndTransformBody, validateAndTransformQuery } from "@medusajs/framework"
import { MiddlewareRoute } from "@medusajs/framework/http"
import * as QueryConfig from "./query-config"
import {
  AdminCreateViewConfiguration,
  AdminUpdateViewConfiguration,
  AdminSetActiveViewConfiguration,
  AdminGetViewConfigurationParams,
  AdminGetActiveViewConfigurationParams,
  AdminGetViewConfigurationsParams,
} from "./validators"

export const viewConfigurationRoutesMiddlewares: MiddlewareRoute[] = [
  {
    method: ["GET"],
    matcher: "/admin/view-configurations",
    middlewares: [
      validateAndTransformQuery(
        AdminGetViewConfigurationsParams,
        QueryConfig.retrieveViewConfigurationList
      ),
    ],
  },
  {
    method: ["POST"],
    matcher: "/admin/view-configurations",
    middlewares: [
      validateAndTransformBody(AdminCreateViewConfiguration),
    ],
  },
  {
    method: ["GET"],
    matcher: "/admin/view-configurations/:id",
    middlewares: [
      validateAndTransformQuery(
        AdminGetViewConfigurationParams,
        QueryConfig.retrieveViewConfiguration
      ),
    ],
  },
  {
    method: ["POST"],
    matcher: "/admin/view-configurations/:id",
    middlewares: [
      validateAndTransformBody(AdminUpdateViewConfiguration),
    ],
  },
  {
    method: ["GET"],
    matcher: "/admin/view-configurations/active",
    middlewares: [
      validateAndTransformQuery(
        AdminGetActiveViewConfigurationParams,
        QueryConfig.retrieveViewConfiguration
      ),
    ],
  },
  {
    method: ["POST"],
    matcher: "/admin/view-configurations/active",
    middlewares: [
      validateAndTransformBody(AdminSetActiveViewConfiguration),
    ],
  },
]