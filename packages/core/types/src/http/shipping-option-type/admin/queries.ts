import { BaseFilterable, OperatorMap } from "../../../dal"
import { FindParams, SelectParams } from "../../common"

export interface AdminShippingOptionTypeListParams
  extends FindParams,
    BaseFilterable<AdminShippingOptionTypeListParams> {
  /**
   * Query or keywords to apply filters on the type's searchable fields.
   */
  q?: string
  /**
   * Filter by shipping option type ID(s).
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
  /**
   * Apply filters on the deletion date.
   */
  deleted_at?: OperatorMap<string>
}

export interface AdminShippingOptionTypeParams extends SelectParams {}
