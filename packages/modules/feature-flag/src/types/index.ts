import {
  ModuleProviderExports,
  ModuleServiceInitializeOptions,
} from "@medusajs/framework/types"

export type FeatureFlagModuleOptions =
  Partial<ModuleServiceInitializeOptions> & {
    /**
     * If true, the feature flag check will be skipped.
     * This is useful for local development where we don't want to be rate limited by the feature flag provider.
     */
    skipCheck?: boolean
    /**
     * Providers to be registered
     */
    provider?: {
      /**
       * The module provider to be registered
       */
      resolve: string | ModuleProviderExports
      /**
       * The id of the provider
       */
      id: string
      /**
       * key value pair of the configuration to be passed to the provider constructor
       */
      options?: Record<string, unknown>
    }
  }
