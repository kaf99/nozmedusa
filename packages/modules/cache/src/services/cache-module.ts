import { MedusaService } from "@medusajs/framework/utils"
import { InternalModuleDeclaration, Logger } from "@medusajs/types"
import { EntityManager } from "@mikro-orm/core"
import { CacheingDefaultProvider } from "@types"
import CacheingProviderService from "./cache-provider"

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
}
