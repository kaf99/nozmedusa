import { ModuleProvider, Modules } from "@medusajs/framework/utils"
import { LocalFeatureFlagService } from "./services/local-feature-flag"

const services = [LocalFeatureFlagService]

export default ModuleProvider(Modules.FEATURE_FLAG, {
  services,
})
