import {
  ProviderFeatureFlagDTO,
  ProviderRetrieveFeatureFlagDTO,
} from "@medusajs/framework/types"
import { AbstractFeatureFlagProviderService } from "@medusajs/framework/utils"

export class FeatureFlagProviderServiceFixtures extends AbstractFeatureFlagProviderService {
  static identifier = "fixtures-feature-flag-provider"

  async retrieveFeatureFlag(
    data: ProviderRetrieveFeatureFlagDTO
  ): Promise<ProviderFeatureFlagDTO> {
    return Promise.resolve({
      is_enabled: true,
    })
  }

  async shutdown(): Promise<void> {
    return Promise.resolve()
  }
}

export const services = [FeatureFlagProviderServiceFixtures]
