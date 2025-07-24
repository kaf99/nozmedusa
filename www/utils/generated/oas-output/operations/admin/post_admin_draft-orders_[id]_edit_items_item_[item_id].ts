/**
 * @oas [post] /admin/draft-orders/{id}/edit/items/item/{item_id}
 * operationId: PostDraftOrdersIdEditItemsItemItem_id
 * summary: Update Existing Item in Draft Order Edit
 * x-sidebar-summary: Update Item
 * description: Update an existing item in a draft order edit.
 * x-authenticated: true
 * parameters:
 *   - name: id
 *     in: path
 *     description: The draft order's ID.
 *     required: true
 *     schema:
 *       type: string
 *   - name: item_id
 *     in: path
 *     description: The item's ID.
 *     required: true
 *     schema:
 *       type: string
 * security:
 *   - api_token: []
 *   - cookie_auth: []
 *   - jwt_token: []
 * requestBody:
 *   content:
 *     application/json:
 *       schema:
 *         type: object
 *         description: The updates to make on a draft order's item.
 *         required:
 *           - quantity
 *         properties:
 *           quantity:
 *             type: number
 *             title: quantity
 *             description: The item's quantity.
 *           unit_price:
 *             type: number
 *             title: unit_price
 *             description: The item's unit price.
 *           compare_at_unit_price:
 *             type: number
 *             title: compare_at_unit_price
 *             description: The original price of the item before a promotion or sale.
 *           internal_note:
 *             type: string
 *             title: internal_note
 *             description: A note viewed only by admin users about the item.
 * x-codeSamples:
 *   - lang: JavaScript
 *     label: JS SDK
 *     source: |-
 *       import Medusa from "@medusajs/js-sdk"
 * 
 *       export const sdk = new Medusa({
 *         baseUrl: import.meta.env.VITE_BACKEND_URL || "/",
 *         debug: import.meta.env.DEV,
 *         auth: {
 *           type: "session",
 *         },
 *       })
 * 
 *       sdk.admin.draftOrder.updateItem("order_123", "item_123", {
 *         quantity: 2,
 *       })
 *       .then(({ draft_order_preview }) => {
 *         console.log(draft_order_preview)
 *       })
 *   - lang: Shell
 *     label: cURL
 *     source: |-
 *       curl -X POST '{backend_url}/admin/draft-orders/{id}/edit/items/item/{item_id}' \
 *       -H 'Authorization: Bearer {access_token}' \
 *       -H 'Content-Type: application/json' \
 *       --data-raw '{
 *         "quantity": 0
 *       }'
 * tags:
 *   - Draft Orders
 * responses:
 *   "200":
 *     description: OK
 *   "400":
 *     $ref: "#/components/responses/400_error"
 *   "401":
 *     $ref: "#/components/responses/unauthorized"
 *   "404":
 *     $ref: "#/components/responses/not_found_error"
 *   "409":
 *     $ref: "#/components/responses/invalid_state_error"
 *   "422":
 *     $ref: "#/components/responses/invalid_request_error"
 *   "500":
 *     $ref: "#/components/responses/500_error"
 * x-workflow: updateDraftOrderItemWorkflow
 * x-events: []
 * 
*/

