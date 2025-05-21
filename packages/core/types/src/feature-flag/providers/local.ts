export interface LocalFeatureFlagServiceOptions {
  featureFlags: Record<string, { is_enabled: boolean; value: string }>
}
