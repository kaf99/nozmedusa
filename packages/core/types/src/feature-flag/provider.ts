import { FeatureFlagDTO } from "./common"
import { RetrieveFeatureFlagDTO } from "./mutations"

export type ProviderRetrieveFeatureFlagDTO = RetrieveFeatureFlagDTO

export type ProviderFeatureFlagDTO = FeatureFlagDTO

export interface IFeatureFlagProvider {
  /**
   * This method is used to retrieve a feature flag from the feature flag provider
   *
   * @param {ProviderRetrieveFeatureFlagDTO} data - The data for the feature flag.
   * @returns {Promise<ProviderFeatureFlagDTO>} Resolves with the feature flag information when the feature flag is retrieved successfully.
   *
   */
  retrieveFeatureFlag(
    data: ProviderRetrieveFeatureFlagDTO
  ): Promise<ProviderFeatureFlagDTO>

  /**
   * This method is used to shutdown the feature flag provider, and flush all data before shutting down.
   *
   * @returns {Promise<void>} Resolves when the provider is shutdown successfully.
   *
   */
  shutdown?(): Promise<void>
}
