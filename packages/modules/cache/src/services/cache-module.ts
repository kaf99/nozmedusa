import { MedusaModule } from "@medusajs/framework/modules-sdk"
import { GraphQLUtils, MedusaError } from "@medusajs/framework/utils"
import { CachingDefaultProvider, InjectedDependencies } from "@types"
import type CachingProviderService from "./cache-provider"
import type { ICachingModuleService } from "@medusajs/framework/types"
import { DefaultCacheStrategy } from "../utils/strategy"

const ONE_HOUR_IN_SECOND = 60 * 60 * 100

export default class CachingModuleService implements ICachingModuleService {
  #container: InjectedDependencies
  #providerService: CachingProviderService
  #defaultStrategy: DefaultCacheStrategy
  #defaultProviderId: string

  #ttl: number

  constructor(
    container: InjectedDependencies,
    protected readonly moduleDeclaration:
      | { options: { ttl?: number } }
      | { ttl?: number }
  ) {
    this.#container = container
    this.#providerService = container.cachingProviderService
    this.#defaultProviderId = container[CachingDefaultProvider]

    const moduleOptions =
      "options" in moduleDeclaration
        ? moduleDeclaration.options
        : moduleDeclaration

    this.#ttl = moduleOptions.ttl ?? ONE_HOUR_IN_SECOND
  }

  __hooks = {
    onApplicationStart: async () => {
      this.#onApplicationStart()
    },
  }

  #onApplicationStart() {
    const loadedSchema = MedusaModule.getAllJoinerConfigs()
      .map((joinerConfig) => joinerConfig?.schema ?? "")
      .join("\n")

    const defaultMedusaSchema = `
    scalar DateTime
    scalar JSON
    directive @enumValue(value: String) on ENUM_VALUE
  `

    const { schema: cleanedSchema } = GraphQLUtils.cleanGraphQLSchema(
      defaultMedusaSchema + loadedSchema
    )
    const mergedSchema = GraphQLUtils.mergeTypeDefs(cleanedSchema)
    const schema = GraphQLUtils.makeExecutableSchema({
      typeDefs: mergedSchema,
    })

    this.#defaultStrategy = new DefaultCacheStrategy(
      this.#container,
      schema,
      this
    )
  }

  #normalizeProviders(
    providers:
      | string[]
      | { id: string; ttl?: number }
      | { id: string; ttl?: number }[]
  ): { id: string; ttl?: number }[] {
    const providers_ = Array.isArray(providers) ? providers : [providers]
    return providers_.map((provider) => {
      return typeof provider === "string" ? { id: provider } : provider
    })
  }

  async get({
    key,
    tags,
    provider,
  }: {
    key?: string
    tags?: string[]
    provider?: string
  }) {
    if (!key && !tags) {
      throw new MedusaError(
        MedusaError.Types.INVALID_ARGUMENT,
        "Either key or tags must be provided"
      )
    }

    const provider_ = this.#providerService.retrieveProvider(
      provider ?? this.#defaultProviderId
    )
    return await provider_.get({ key, tags })
  }

  async set({
    key,
    data,
    ttl,
    tags,
    providers,
    options,
  }: {
    key: string
    data: object
    tags?: string[]
    ttl?: number
    providers?:
      | string[]
      | {
          id: string
          ttl?: number
        }
      | { id: string; ttl?: number }[]
    options?: {
      noAutoInvalidation?: boolean
    }
  }) {
    const key_ = key ?? this.#defaultStrategy.computeCacheKey(data)
    const tags_ = tags ?? (await this.#defaultStrategy.computeTags(data))

    let providers_: string[] | { id: string; ttl?: number }[] = [
      { id: this.#defaultProviderId },
    ]
    providers_ = this.#normalizeProviders(providers ?? providers_)

    for (const providerOptions of providers_) {
      const ttl_ = providerOptions.ttl ?? ttl ?? this.#ttl
      const provider = this.#providerService.retrieveProvider(
        providerOptions.id
      )
      await provider.set({
        key: key_,
        tags: tags_,
        data,
        ttl: ttl_,
        options,
      })
    }
  }

  async clear({
    key,
    tags,
    options,
    providers,
  }: {
    key?: string
    tags?: string[]
    options?: {
      noAutoInvalidation?: boolean
    }
    providers?: string | string[]
  }) {
    if (!key && !tags) {
      throw new MedusaError(
        MedusaError.Types.INVALID_ARGUMENT,
        "Either key or tags must be provided"
      )
    }

    let providerIds_: string[] = [this.#defaultProviderId]
    if (providers) {
      providerIds_ = Array.isArray(providers) ? providers : [providers]
    }

    for (const providerId of providerIds_) {
      const provider = this.#providerService.retrieveProvider(providerId)
      await provider.clear({ key, tags, options })
    }
  }

  // TODO: add compute tags and compute key methods
}
