import {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"
import { AdminCreateViewConfigurationType } from "./validators"
import { HttpTypes } from "@medusajs/framework/types"
import { MedusaError, Modules } from "@medusajs/framework/utils"

export const GET = async (
  req: AuthenticatedMedusaRequest<HttpTypes.AdminGetViewConfigurationsParams>,
  res: MedusaResponse<HttpTypes.AdminViewConfigurationListResponse>
) => {
  const settingsService: any = req.scope.resolve(Modules.SETTINGS)

  const filters = {
    ...req.filterableFields,
    entity: req.params.entity,
    $or: [{ user_id: req.auth_context.actor_id }, { is_system_default: true }],
  }

  const [viewConfigurations, count] =
    await settingsService.listAndCountViewConfigurations(
      filters,
      req.queryConfig
    )

  res.json({
    view_configurations: viewConfigurations,
    count,
    offset: req.queryConfig.pagination?.skip || 0,
    limit: req.queryConfig.pagination?.take || 20,
  })
}

export const POST = async (
  req: AuthenticatedMedusaRequest<AdminCreateViewConfigurationType>,
  res: MedusaResponse<HttpTypes.AdminViewConfigurationResponse>
) => {
  const settingsService: any = req.scope.resolve(Modules.SETTINGS)

  // Validate: name is required unless creating a system default
  if (!req.body.name && !req.body.is_system_default) {
    throw new MedusaError(
      MedusaError.Types.INVALID_DATA,
      "Name is required unless creating a system default view"
    )
  }

  const { set_active, ...bodyWithoutSetActive } = req.body

  const input = {
    ...bodyWithoutSetActive,
    entity: req.params.entity,
    user_id: req.body.is_system_default ? null : req.auth_context.actor_id,
  }

  const viewConfiguration = await settingsService.createViewConfigurations(
    input
  )

  if (set_active) {
    await settingsService.setActiveViewConfiguration(
      viewConfiguration.entity,
      req.auth_context.actor_id,
      viewConfiguration.id
    )
  }

  return res.json({ view_configuration: viewConfiguration })
}
