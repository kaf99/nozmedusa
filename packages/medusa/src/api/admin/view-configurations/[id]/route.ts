import {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"
import { AdminUpdateViewConfigurationType } from "../validators"
import { HttpTypes } from "@medusajs/framework/types"
import { MedusaError, Modules } from "@medusajs/framework/utils"

export const GET = async (
  req: AuthenticatedMedusaRequest<HttpTypes.AdminGetViewConfigurationParams>,
  res: MedusaResponse<HttpTypes.AdminViewConfigurationResponse>
) => {
  const settingsService: any = req.scope.resolve(Modules.SETTINGS)

  const viewConfiguration = await settingsService.retrieveViewConfiguration(
    req.params.id,
    req.queryConfig
  )

  // Check access permissions
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
  const settingsService: any = req.scope.resolve(Modules.SETTINGS)

  // Retrieve existing to check permissions
  const existing = await settingsService.retrieveViewConfiguration(
    req.params.id,
    { select: ["id", "user_id", "is_system_default", "entity", "name"] }
  )

  // For now, any authenticated user can update system defaults
  // TODO: Add proper permission checks when permission system is implemented

  if (
    existing.user_id &&
    existing.user_id !== req.auth_context.actor_id
  ) {
    throw new MedusaError(
      MedusaError.Types.NOT_ALLOWED,
      "You can only update your own view configurations"
    )
  }

  const input = {
    ...req.body,
    // If setting as system default, remove user_id to make it available to everyone
    user_id: req.body.is_system_default ? null : existing.user_id,
  }

  const viewConfiguration = await settingsService.updateViewConfigurations(
    req.params.id,
    input
  )

  res.json({ view_configuration: viewConfiguration })
}

export const DELETE = async (
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse<HttpTypes.AdminViewConfigurationDeleteResponse>
) => {
  const settingsService: any = req.scope.resolve(Modules.SETTINGS)

  // Retrieve existing to check permissions
  const existing = await settingsService.retrieveViewConfiguration(
    req.params.id,
    { select: ["id", "user_id", "is_system_default", "entity", "name"] }
  )

  // For now, any authenticated user can delete system defaults
  // TODO: Add proper permission checks when permission system is implemented

  if (
    existing.user_id &&
    existing.user_id !== req.auth_context.actor_id
  ) {
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