import {
  LocalFeatureFlagServiceOptions,
  Logger,
  ProviderFeatureFlagDTO,
  ProviderRetrieveFeatureFlagDTO,
} from "@medusajs/framework/types"
import { AbstractFeatureFlagProviderService } from "@medusajs/framework/utils"

type InjectedDependencies = {
  logger: Logger
}

//Note: The current implementation is quite limiting, but would suffice for the current needs.
// We could extend the feature flag module to support CRUD, in which case we can use a database for the local provider.
export class LocalFeatureFlagService extends AbstractFeatureFlagProviderService {
  static identifier = "feature-flag-local"
  protected config_: LocalFeatureFlagServiceOptions
  protected logger_: Logger

  constructor(
    { logger }: InjectedDependencies,
    options: LocalFeatureFlagServiceOptions
  ) {
    super()
    this.config_ = options
    this.logger_ = logger
  }
  async retrieveFeatureFlag(
    data: ProviderRetrieveFeatureFlagDTO
  ): Promise<ProviderFeatureFlagDTO> {
    this.logger_.debug(
      `Getting feature flag: '${data.feature_flag}', context: ${JSON.stringify(
        data.context
      )}`
    )

    if (!this.config_.featureFlags[data.feature_flag]) {
      return {
        is_enabled: false,
      }
    }

    return this.config_.featureFlags[data.feature_flag]
  }
}
