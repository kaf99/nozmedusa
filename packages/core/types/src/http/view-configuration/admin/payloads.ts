export interface AdminCreateViewConfiguration {
  /**
   * The entity this configuration is for (e.g., "order", "product").
   */
  entity: string
  /**
   * The name of the view configuration.
   */
  name?: string
  /**
   * Whether this is a system default configuration.
   */
  is_system_default?: boolean
  /**
   * The view configuration settings.
   */
  configuration: {
    /**
     * The list of visible column IDs.
     */
    visible_columns: string[]
    /**
     * The order of columns.
     */
    column_order: string[]
    /**
     * Custom column widths.
     */
    column_widths?: Record<string, number>
  }
}

export interface AdminUpdateViewConfiguration {
  /**
   * The name of the view configuration.
   */
  name?: string
  /**
   * The view configuration settings.
   */
  configuration?: {
    /**
     * The list of visible column IDs.
     */
    visible_columns?: string[]
    /**
     * The order of columns.
     */
    column_order?: string[]
    /**
     * Custom column widths.
     */
    column_widths?: Record<string, number>
  }
}

export interface AdminSetActiveViewConfiguration {
  /**
   * The entity to set the active view for.
   */
  entity: string
  /**
   * The ID of the view configuration to set as active.
   */
  view_configuration_id: string
}