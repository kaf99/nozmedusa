import {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"
import {
  AdminSetActiveViewConfigurationType,
  AdminGetActiveViewConfigurationParamsType,
} from "../validators"
import { HttpTypes } from "@medusajs/framework/types"
import { Modules } from "@medusajs/framework/utils"

export const GET = async (
  req: AuthenticatedMedusaRequest<AdminGetActiveViewConfigurationParamsType>,
  res: MedusaResponse<HttpTypes.AdminViewConfigurationResponse>
) => {
  const settingsService: any = req.scope.resolve(Modules.SETTINGS)

  const viewConfiguration = await settingsService.getActiveViewConfiguration(
    req.query.entity,
    req.auth_context.actor_id
  )

  res.json({ view_configuration: viewConfiguration })
}

export const POST = async (
  req: AuthenticatedMedusaRequest<AdminSetActiveViewConfigurationType>,
  res: MedusaResponse<{ success: boolean }>
) => {
  const settingsService: any = req.scope.resolve(Modules.SETTINGS)

  await settingsService.setActiveViewConfiguration(
    req.body.entity,
    req.auth_context.actor_id,
    req.body.view_configuration_id
  )

  res.json({ success: true })
}