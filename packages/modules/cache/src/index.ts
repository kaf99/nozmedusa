import { Module, Modules } from "@medusajs/framework/utils"
import { default as loadProviders } from "./loaders/providers"
import CachingModuleService from "./services/cache-module"

export default Module(Modules.CACHING, {
  service: CachingModuleService,
  loaders: [loadProviders],
})

// Module options types
export { CachingModuleOptions } from "./types"
