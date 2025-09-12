import { MedusaModule } from "@medusajs/framework/modules-sdk"
import { GraphQLUtils } from "@medusajs/framework/utils"
import { InternalModuleDeclaration, Logger } from "@medusajs/types"
import { EntityManager } from "@mikro-orm/core"
import { CachingDefaultProvider } from "@types"
import CachingProviderService from "./cache-provider"

type InjectedDependencies = {
  manager: EntityManager
  cachingProviderService: CachingProviderService
  logger?: Logger
  [CachingDefaultProvider]: string
}

export default class CachingModuleService {
  protected manager: EntityManager
  protected providerService_: CachingProviderService
  protected defaultProviderId: string

  constructor(
    container: InjectedDependencies,
    protected readonly moduleDeclaration: InternalModuleDeclaration
  ) {
    this.manager = container.manager
    this.providerService_ = container.cachingProviderService
    // this.defaultProviderId = container[CachingDefaultProvider]
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
}
