export interface AdminCreateShippingOptionType {
  /**
   * The type's label.
   */
  label: string
  /**
   * Key-value pairs of custom data.
   */
  metadata?: Record<string, unknown> | null
}

export interface AdminUpdateShippingOptionType {
  /**
   * The type's label.
   */
  label?: string
  /**
   * Key-value pairs of custom data.
   */
  metadata?: Record<string, unknown> | null
}
