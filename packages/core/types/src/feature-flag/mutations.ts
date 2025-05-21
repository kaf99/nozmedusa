export interface RetrieveFeatureFlagDTO {
  /**
   * The feature flag name
   */
  feature_flag: string
  /**
   * The context of the feature flag, such as the actor or group. The format of the data depends on the provider.
   */
  context?: Record<string, any>
}
