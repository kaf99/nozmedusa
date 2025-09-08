import { moduleProviderLoader } from "@medusajs/framework/modules-sdk"
import {
  LoaderOptions,
  ModuleProvider,
  ModulesSdkTypes,
} from "@medusajs/framework/types"
import {
  ContainerRegistrationKeys,
  getProviderRegistrationKey,
} from "@medusajs/framework/utils"
import { CacheingProviderService } from "@services"
import {
  CacheingDefaultProvider,
  CacheingIdentifiersRegistrationName,
  CacheingProviderRegistrationPrefix,
} from "@types"
import { aliasTo, asValue } from "awilix"
// import { InMemoryCacheingProvider } from "../providers/in-memory"

const registrationFn = async (klass, container, { id }) => {
  const key = CacheingProviderService.getRegistrationIdentifier(klass)

  if (!id) {
    throw new Error(`No "id" provided for provider ${key}`)
  }

  const regKey = getProviderRegistrationKey({
    providerId: id,
    providerIdentifier: key,
  })

  container.register({
    [CacheingProviderRegistrationPrefix + id]: aliasTo(regKey),
  })

  container.registerAdd(CacheingIdentifiersRegistrationName, asValue(key))
}

export default async ({
  container,
  options,
}: LoaderOptions<
  (
    | ModulesSdkTypes.ModuleServiceInitializeOptions
    | ModulesSdkTypes.ModuleServiceInitializeCustomDataLayerOptions
  ) & { providers: ModuleProvider[] }
>): Promise<void> => {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  container.registerAdd(CacheingIdentifiersRegistrationName, asValue(undefined))

  // InMemoryCacheingProvider - default provider
  // container.register({
  //   [CacheingProviderRegistrationPrefix + InMemoryCacheingProvider.identifier]:
  //     asFunction((cradle) => new InMemoryCacheingProvider(), {
  //       lifetime: Lifetime.SINGLETON,
  //     }),
  // })
  // container.registerAdd(
  //   CacheingIdentifiersRegistrationName,
  //   asValue(InMemoryCacheingProvider.identifier)
  // )
  // container.register(
  //   CacheingDefaultProvider,
  //   asValue(InMemoryCacheingProvider.identifier)
  // )

  // Load other providers
  await moduleProviderLoader({
    container,
    providers: options?.providers || [],
    registerServiceFn: registrationFn,
  })

  const isSingleProvider = options?.providers?.length === 1
  let hasDefaultProvider = false
  for (const provider of options?.providers || []) {
    if (provider.is_default || isSingleProvider) {
      if (provider.is_default) {
        hasDefaultProvider = true
      }
      container.register(CacheingDefaultProvider, asValue(provider.id))
    }
  }

  if (!hasDefaultProvider) {
    logger.info(
      `Cacheing module: Using "${container.resolve(
        CacheingDefaultProvider
      )}" as default.`
    )
  }
}
