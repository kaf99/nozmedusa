import { AdminOrderColumn, AdminColumn } from "./entities"

export interface AdminColumnsResponse {
  /**
   * The list of available columns for the entity view
   */
  columns: AdminColumn[]
}

// Keep the existing type for backward compatibility
export interface AdminOrderColumnsResponse {
  /**
   * The list of available columns for the orders view
   */
  columns: AdminOrderColumn[]
}