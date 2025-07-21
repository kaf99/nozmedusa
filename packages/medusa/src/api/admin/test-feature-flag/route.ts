import {
  MedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import ViewConfigurationsFeatureFlag from "../../../loaders/feature-flags/view-configurations"

export const GET = async (
  req: MedusaRequest,
  res: MedusaResponse
) => {
  const featureFlagRouter = req.scope.resolve(
    ContainerRegistrationKeys.FEATURE_FLAG_ROUTER
  ) as any
  
  const isEnabled = featureFlagRouter.isFeatureEnabled(ViewConfigurationsFeatureFlag.key)
  
  res.json({
    feature: ViewConfigurationsFeatureFlag.key,
    enabled: isEnabled,
    env_var: process.env.MEDUSA_FF_VIEW_CONFIGURATIONS,
    all_flags: featureFlagRouter.listFlags()
  })
}