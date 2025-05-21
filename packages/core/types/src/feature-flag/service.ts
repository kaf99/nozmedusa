import { IModuleService } from "../modules-sdk"
import { FeatureFlagDTO } from "./common"
import { RetrieveFeatureFlagDTO } from "./mutations"
import { IFeatureFlagProvider } from "./provider"

export interface IFeatureFlagModuleService extends IModuleService {
  /**
   * Returns a reference to the analytics provider in use
   */
  getProvider(): IFeatureFlagProvider

  /**
   * This method retrieves a feature flag from the feature flag provider
   *
   * @param {RetrieveFeatureFlagDTO} data - The data for the feature flag.
   * @returns {Promise<FeatureFlagDTO>} Resolves with the feature flag information when the feature flag is retrieved successfully.
   *
   *
   * @example
   * await featureFlagModuleService.retrieveFeatureFlag({
   *   feature_flag: "product_viewed",
   *   context: {
   *     actor_id: "123",
   *   }
   * })
   */
  retrieveFeatureFlag(data: RetrieveFeatureFlagDTO): Promise<FeatureFlagDTO>
}
