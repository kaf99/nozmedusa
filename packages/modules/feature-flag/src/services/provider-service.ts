import { MedusaError } from "@medusajs/framework/utils"
import {
  Constructor,
  IFeatureFlagProvider,
  ProviderFeatureFlagDTO,
  ProviderRetrieveFeatureFlagDTO,
} from "@medusajs/types"

export const FeatureFlagProviderIdentifierRegistrationName =
  "feature_flag_providers_identifier"

export const FeatureFlagProviderRegistrationPrefix = "ftrflg_"

type InjectedDependencies = {
  [
    key: `${typeof FeatureFlagProviderRegistrationPrefix}${string}`
  ]: IFeatureFlagProvider
}

export default class FeatureFlagProviderService {
  protected readonly featureFlagProvider_: IFeatureFlagProvider

  constructor(container: InjectedDependencies) {
    const featureFlagProviderKeys = Object.keys(container).filter((k) =>
      k.startsWith(FeatureFlagProviderRegistrationPrefix)
    )

    if (featureFlagProviderKeys.length !== 1) {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        `Feature flag module should be initialized with exactly one provider`
      )
    }

    this.featureFlagProvider_ = container[featureFlagProviderKeys[0]]
  }

  static getRegistrationIdentifier(
    providerClass: Constructor<IFeatureFlagProvider>,
    optionName?: string
  ) {
    return `${(providerClass as any).identifier}_${optionName}`
  }

  async getFeatureFlag(
    data: ProviderRetrieveFeatureFlagDTO
  ): Promise<ProviderFeatureFlagDTO> {
    return this.featureFlagProvider_.retrieveFeatureFlag(data)
  }

  async shutdown(): Promise<void> {
    await this.featureFlagProvider_.shutdown?.()
  }
}
