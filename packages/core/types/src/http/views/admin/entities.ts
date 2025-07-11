export interface AdminColumn {
  /**
   * The unique identifier for the column
   */
  id: string
  /**
   * The display name of the column
   */
  name: string
  /**
   * A description of what the column represents
   */
  description?: string
  /**
   * The field path in the entity object that this column represents
   */
  field: string
  /**
   * Whether this column can be used for sorting
   */
  sortable: boolean
  /**
   * Whether this column can be hidden by the user
   */
  hideable: boolean
  /**
   * Whether this column is visible by default
   */
  default_visible: boolean
  /**
   * The data type of the column value
   */
  data_type: "string" | "number" | "date" | "boolean" | "enum" | "object" | "currency"
}

// Keep the existing type for backward compatibility
export interface AdminOrderColumn extends AdminColumn {}