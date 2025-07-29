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

  const { set_active, ...bodyWithoutSetActive } = req.body

  const input = {
    ...bodyWithoutSetActive,
    // If setting as system default, remove user_id to make it available to everyone
    user_id: req.body.is_system_default ? null : existing.user_id,
  }

  // If configuration is provided, we need to handle it specially because
  // MikroORM merges JSON fields by default. We ensure all fields are explicitly set.
  if (input.configuration) {
    // Retrieve the full existing view to get current configuration
    const fullExisting = await settingsService.retrieveViewConfiguration(
      req.params.id,
      { select: ["id", "configuration"] }
    )
    
    // Create a complete configuration object
    // If a field is explicitly provided (even as null/empty), use it
    // Otherwise, keep the existing value
    input.configuration = {
      visible_columns: input.configuration.visible_columns !== undefined 
        ? input.configuration.visible_columns 
        : (fullExisting.configuration.visible_columns || []),
      column_order: input.configuration.column_order !== undefined 
        ? input.configuration.column_order 
        : (fullExisting.configuration.column_order || []),
      column_widths: input.configuration.column_widths !== undefined 
        ? input.configuration.column_widths 
        : (fullExisting.configuration.column_widths || {}),
      filters: input.configuration.filters !== undefined 
        ? input.configuration.filters 
        : (fullExisting.configuration.filters || {}),
      sorting: input.configuration.sorting !== undefined 
        ? input.configuration.sorting 
        : (fullExisting.configuration.sorting || null),
      search: input.configuration.search !== undefined 
        ? input.configuration.search 
        : (fullExisting.configuration.search || ""),
    }
  }

  const viewConfiguration = await settingsService.updateViewConfigurations(
    req.params.id,
    input
  )

  // If set_active is true, set this view as the active one
  if (set_active) {
    await settingsService.setActiveViewConfiguration(
      existing.entity,
      req.auth_context.actor_id,
      viewConfiguration.id
    )
  }

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