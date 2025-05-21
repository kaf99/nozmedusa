import { ModuleProvider, Modules } from "@medusajs/framework/utils"
import { PosthogFeatureFlagService } from "./services/posthog-feature-flag"

const services = [PosthogFeatureFlagService]

export default ModuleProvider(Modules.FEATURE_FLAG, {
  services,
})
