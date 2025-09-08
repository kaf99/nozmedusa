import { GraphQLUtils, MedusaService } from "@medusajs/framework/utils"
import { InternalModuleDeclaration, Logger } from "@medusajs/types"
import { EntityManager } from "@mikro-orm/core"
import { CacheingDefaultProvider } from "@types"
import CacheingProviderService from "./cache-provider"
import { MedusaModule } from "@medusajs/framework/modules-sdk"

type InjectedDependencies = {
  manager: EntityManager
  cacheingProviderService: CacheingProviderService
  logger?: Logger
  [CacheingDefaultProvider]: string
}

export default class CacheingModuleService extends MedusaService({}) {
  protected manager: EntityManager
  protected providerService_: CacheingProviderService
  protected defaultProviderId: string

  constructor(
    container: InjectedDependencies,
    protected readonly moduleDeclaration: InternalModuleDeclaration
  ) {
    super(...arguments)
    this.manager = container.manager
    this.providerService_ = container.cacheingProviderService
    this.defaultProviderId = container[CacheingDefaultProvider]
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

    console.log(entitiesMap)
  }
}
