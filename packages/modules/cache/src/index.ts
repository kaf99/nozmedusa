import { Module, Modules } from "@medusajs/framework/utils"
import { default as loadProviders } from "./loaders/providers"
import CacheingModuleService from "./services/cache-module"

export default Module(Modules.CACHE, {
  service: CacheingModuleService,
  loaders: [loadProviders],
})

// Module options types
export { CacheingModuleOptions } from "./types"
