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
import { CachingProviderService } from "@services"
import {
  CachingDefaultProvider,
  CachingIdentifiersRegistrationName,
  CachingProviderRegistrationPrefix,
} from "@types"
import { aliasTo, asValue } from "awilix"
// import { InMemoryCachingProvider } from "../providers/in-memory"

const registrationFn = async (klass, container, { id }) => {
  const key = CachingProviderService.getRegistrationIdentifier(klass)

  if (!id) {
    throw new Error(`No "id" provided for provider ${key}`)
  }

  const regKey = getProviderRegistrationKey({
    providerId: id,
    providerIdentifier: key,
  })

  container.register({
    [CachingProviderRegistrationPrefix + id]: aliasTo(regKey),
  })

  container.registerAdd(CachingIdentifiersRegistrationName, asValue(key))
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
  container.registerAdd(CachingIdentifiersRegistrationName, asValue(undefined))

  // InMemoryCachingProvider - default provider
  // container.register({
  //   [CachingProviderRegistrationPrefix + InMemoryCachingProvider.identifier]:
  //     asFunction((cradle) => new InMemoryCachingProvider(), {
  //       lifetime: Lifetime.SINGLETON,
  //     }),
  // })
  // container.registerAdd(
  //   CachingIdentifiersRegistrationName,
  //   asValue(InMemoryCachingProvider.identifier)
  // )
  // container.register(
  //   CachingDefaultProvider,
  //   asValue(InMemoryCachingProvider.identifier)
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
      container.register(CachingDefaultProvider, asValue(provider.id))
    }
  }

  if (!hasDefaultProvider) {
    logger.info(`Caching module: Using "default_provider" as default.`)
  }
}
