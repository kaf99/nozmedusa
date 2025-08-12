import { OperatorMap } from "../../dal"
import { FindParams } from "../common"

export interface BaseShippingOptionType {
  /**
   * The shipping option type's ID.
   */
  id: string
  /**
   * The shipping option type's label.
   */
  label: string
  /**
   * The date the shipping option type was created.
   */
  created_at: string
  /**
   * The date the shipping option type was updated.
   */
  updated_at: string
  /**
   * The date the shipping option type was deleted.
   */
  deleted_at?: string | null
  /**
   * Key-value pairs of custom data.
   */
  metadata?: Record<string, unknown> | null
}

export interface BaseShippingOptionTypeListParams extends FindParams {
  /**
   * Query or keyword to apply on the type's searchable fields.
   */
  q?: string
  /**
   * Filter by type ID(s).
   */
  id?: string | string[]
  /**
   * Filter by label(s).
   */
  label?: string | string[]
  /**
   * Filter by code(s).
   */
  code?: string | string[]
  /**
   * Apply filters on the creation date.
   */
  created_at?: OperatorMap<string>
  /**
   * Apply filters on the update date.
   */
  updated_at?: OperatorMap<string>
}
