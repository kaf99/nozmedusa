/**
 * @schema AdminShippingOptionTypeListResponse
 * type: object
 * description: The paginated list of shipping option types.
 * x-schemaName: AdminShippingOptionTypeListResponse
 * required:
 *   - limit
 *   - offset
 *   - count
 *   - shipping_option_types
 * properties:
 *   limit:
 *     type: number
 *     title: limit
 *     description: The maximum number of items returned.
 *   offset:
 *     type: number
 *     title: offset
 *     description: The number of items skipped before returning the results.
 *   count:
 *     type: number
 *     title: count
 *     description: The total number of items.
 *   estimate_count:
 *     type: number
 *     title: estimate_count
 *     description: The estimated count retrieved from the PostgreSQL query planner, which may be inaccurate.
 *     x-featureFlag: index_engine
 *   shipping_option_types:
 *     type: array
 *     description: The list of shipping option types.
 *     items:
 *       $ref: "#/components/schemas/AdminShippingOptionType"
 * 
*/

