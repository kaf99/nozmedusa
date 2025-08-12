import { DeleteResponse, PaginatedResponse } from "../../common"
import { AdminShippingOptionType } from "./entities"

export interface AdminShippingOptionTypeResponse {
  /**
   * The product type's details.
   */
  shipping_option_type: AdminShippingOptionType
}

export interface AdminShippingOptionTypeListResponse
  extends PaginatedResponse<{
    /**
     * The list of product types.
     */
    shipping_option_types: AdminShippingOptionType[]
  }> {}

export interface AdminShippingOptionTypeDeleteResponse
  extends DeleteResponse<"shipping_option_type"> {}
