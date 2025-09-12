import type {
  ModulesSdkTypes,
  InternalModuleDeclaration,
  LoaderOptions,
} from "@medusajs/framework/types"
import NodeCache from "node-cache"
import type { MemoryCacheModuleOptions } from "@types"

export default async (
  {
    container,
    logger,
  }: LoaderOptions<
    (
      | ModulesSdkTypes.ModuleServiceInitializeOptions
      | ModulesSdkTypes.ModuleServiceInitializeCustomDataLayerOptions
    ) & { logger?: any }
  >,
  moduleDeclaration?: InternalModuleDeclaration
): Promise<void> => {
  const logger_ = logger || console

  const moduleOptions = (moduleDeclaration?.options ??
    {}) as MemoryCacheModuleOptions

  const cacheClient = new NodeCache({
    stdTTL: moduleOptions.ttl ?? 3600, // 1 hour default
    maxKeys: moduleOptions.maxKeys ?? 10000,
    checkperiod: moduleOptions.checkPeriod ?? 600, // 10 minutes
    useClones: moduleOptions.useClones ?? false, // Default to false for speed, true would be slower but safer. we can discuss
  })

  logger_.info("Memory cache initialized successfully")

  container.register({
    cacheClient: {
      resolve: () => cacheClient,
    },
    cacheOptions: {
      resolve: () => moduleOptions,
    },
  })
}
