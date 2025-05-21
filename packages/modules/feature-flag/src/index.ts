import { Module, Modules } from "@medusajs/framework/utils"
import FeatureFlagService from "./services/feature-flag-service"
import loadProviders from "./loaders/providers"

export default Module(Modules.FEATURE_FLAG, {
  service: FeatureFlagService,
  loaders: [loadProviders],
})
