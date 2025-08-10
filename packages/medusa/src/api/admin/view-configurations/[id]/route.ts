import {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"
import { AdminUpdateViewConfigurationType } from "../validators"
import { HttpTypes, ISettingsModuleService } from "@medusajs/framework/types"
import { MedusaError, Modules } from "@medusajs/framework/utils"

export const GET = async (
  req: AuthenticatedMedusaRequest<HttpTypes.AdminGetViewConfigurationParams>,
  res: MedusaResponse<HttpTypes.AdminViewConfigurationResponse>
) => {
  const settingsService: ISettingsModuleService = req.scope.resolve(
    Modules.SETTINGS
  )

  const viewConfiguration = await settingsService.retrieveViewConfiguration(
    req.params.id,
    req.queryConfig
  )

  if (
    viewConfiguration.user_id &&
    viewConfiguration.user_id !== req.auth_context.actor_id &&
    !req.auth_context.app_metadata?.admin
  ) {
    throw new MedusaError(
      MedusaError.Types.NOT_ALLOWED,
      "You don't have access to this view configuration"
    )
  }

  res.json({ view_configuration: viewConfiguration })
}

export const POST = async (
  req: AuthenticatedMedusaRequest<AdminUpdateViewConfigurationType>,
  res: MedusaResponse<HttpTypes.AdminViewConfigurationResponse>
) => {
  const settingsService: ISettingsModuleService = req.scope.resolve(
    Modules.SETTINGS
  )

  // Single retrieval for permission check and entity info
  const existing = await settingsService.retrieveViewConfiguration(
    req.params.id,
    { select: ["id", "user_id", "is_system_default", "entity"] }
  )

  if (existing.user_id && existing.user_id !== req.auth_context.actor_id) {
    throw new MedusaError(
      MedusaError.Types.NOT_ALLOWED,
      "You can only update your own view configurations"
    )
  }

  const { set_active, ...payload } = req.validatedBody

  // Let the service handle the update (it already handles configuration properly)
  const viewConfiguration = await settingsService.updateViewConfigurations(
    req.params.id,
    payload
  )

  // Handle set_active if requested
  if (set_active) {
    await settingsService.setActiveViewConfiguration(
      existing.entity,
      req.auth_context.actor_id,
      req.params.id
    )
  }

  res.json({ view_configuration: viewConfiguration })
}

export const DELETE = async (
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse<HttpTypes.AdminViewConfigurationDeleteResponse>
) => {
  const settingsService: ISettingsModuleService = req.scope.resolve(
    Modules.SETTINGS
  )

  // Retrieve existing to check permissions
  const existing = await settingsService.retrieveViewConfiguration(
    req.params.id,
    { select: ["id", "user_id", "is_system_default", "entity", "name"] }
  )

  if (existing.user_id && existing.user_id !== req.auth_context.actor_id) {
    throw new MedusaError(
      MedusaError.Types.NOT_ALLOWED,
      "You can only delete your own view configurations"
    )
  }

  await settingsService.deleteViewConfigurations(req.params.id)

  res.status(200).json({
    id: req.params.id,
    object: "view_configuration",
    deleted: true,
  })
}
