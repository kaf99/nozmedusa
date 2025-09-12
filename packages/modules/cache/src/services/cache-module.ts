import { MedusaModule } from "@medusajs/framework/modules-sdk"
import { GraphQLUtils, MedusaError } from "@medusajs/framework/utils"
import { InternalModuleDeclaration } from "@medusajs/types"
import { EntityManager } from "@mikro-orm/core"
import { InjectedDependencies } from "@types"
import CachingProviderService from "./cache-provider"

const ONE_HOUR_IN_MS = 60 * 60 * 1000

type ModuleInjectedDependencies = InjectedDependencies & {
  manager: EntityManager
}

export default class CachingModuleService {
  #manager: EntityManager
  #providerService: CachingProviderService
  #defaultProviderId: string

  #ttl: number

  constructor(
    container: ModuleInjectedDependencies,
    protected readonly moduleDeclaration:
      | { options: { ttl?: number } }
      | { ttl?: number }
  ) {
    this.#manager = container.manager
    this.#providerService = container.cachingProviderService
    // this.#defaultProviderId = container[CachingDefaultProvider]

    const moduleOptions =
      "options" in moduleDeclaration
        ? moduleDeclaration.options
        : moduleDeclaration

    this.#ttl = moduleOptions.ttl ?? ONE_HOUR_IN_MS
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

    const entitiesMap = schema.getTypeMap() as unknown as Map<string, any>

    console.log(JSON.stringify(entitiesMap, null, 2))
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
    provider: string
  }) {
    if (!key && !tags) {
      throw new MedusaError(
        MedusaError.Types.INVALID_ARGUMENT,
        "Either key or tags must be provided"
      )
    }

    const provider_ = this.#providerService.retrieveProvider(provider)
    await provider_.get({ key, tags })
  }

  async set({
    key,
    data,
    ttl,
    tags,
    providers,
    noAutoInvalidation,
  }: {
    key: string
    data: unknown
    tags?: string[]
    ttl?: number
    providers?:
      | string[]
      | {
          id: string
          ttl?: number
        }
      | { id: string; ttl?: number }[]
    noAutoInvalidation?: boolean
  }) {
    if (!key || !data) {
      throw new MedusaError(
        MedusaError.Types.INVALID_ARGUMENT,
        "Key and data must be provided"
      )
    }

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
        key,
        tags,
        data,
        ttl: ttl_,
        options: { noAutoInvalidation },
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
}
