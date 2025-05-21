import {
  FeatureFlagDTO,
  Logger,
  RetrieveFeatureFlagDTO,
} from "@medusajs/framework/types"
import FeatureFlagProviderService from "./provider-service"
import { FeatureFlagModuleOptions } from "../types"
type InjectedDependencies = {
  logger: Logger
  featureFlagProviderService: FeatureFlagProviderService
}

export default class FeatureFlagService {
  private options: FeatureFlagModuleOptions
  protected readonly featureFlagProviderService_: FeatureFlagProviderService

  constructor(
    { featureFlagProviderService }: InjectedDependencies,
    options: FeatureFlagModuleOptions
  ) {
    this.options = options
    this.featureFlagProviderService_ = featureFlagProviderService
  }

  __hooks = {
    onApplicationShutdown: async () => {
      this.featureFlagProviderService_.shutdown()
    },
  }

  getProvider() {
    return this.featureFlagProviderService_
  }

  async retrieveFeatureFlag(
    data: RetrieveFeatureFlagDTO
  ): Promise<FeatureFlagDTO> {
    if (this.options.skipCheck) {
      return {
        is_enabled: true,
      }
    }

    return this.featureFlagProviderService_.getFeatureFlag(data)
  }
}
