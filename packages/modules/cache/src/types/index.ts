import type {
  IEventBusModuleService,
  Logger,
  ModuleProviderExports,
  ModuleServiceInitializeOptions,
} from "@medusajs/framework/types"
import CachingProviderService from "../services/cache-provider"
import { Modules } from "@medusajs/framework/utils"

export const CachingDefaultProvider = "default_provider"
export const CachingIdentifiersRegistrationName = "caching_providers_identifier"

export const CachingProviderRegistrationPrefix = "lp_"

export type InjectedDependencies = {
  cachingProviderService: CachingProviderService
  logger?: Logger
  [CachingDefaultProvider]: string
  [Modules.EVENT_BUS]: IEventBusModuleService
}

export type CachingModuleOptions = Partial<ModuleServiceInitializeOptions> & {
  /**
   * Providers to be registered
   */
  providers?: {
    /**
     * The module provider to be registered
     */
    resolve: string | ModuleProviderExports
    /**
     * If the provider is the default
     */
    is_default?: boolean
    /**
     * The id of the provider
     */
    id: string
    /**
     * key value pair of the configuration to be passed to the provider constructor
     */
    options?: Record<string, unknown>
  }[]
}
