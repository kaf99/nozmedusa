/**
 * @oas [post] /admin/draft-orders/{id}/edit/items
 * operationId: PostDraftOrdersIdEditItems
 * summary: Add Item to Draft Order Edit
 * x-sidebar-summary: Add Item
 * description: Add an item to a draft order edit.
 * x-authenticated: true
 * parameters:
 *   - name: id
 *     in: path
 *     description: The draft order's ID.
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
 *         description: The details of the items to add to a draft order.
 *         properties:
 *           items:
 *             type: array
 *             description: The items to add to the draft order.
 *             items:
 *               type: object
 *               description: The item's details
 *               required:
 *                 - quantity
 *               properties:
 *                 quantity:
 *                   type: number
 *                   title: quantity
 *                   description: The item's quantity.
 *                 variant_id:
 *                   type: string
 *                   title: variant_id
 *                   description: The ID of the variant to add to the draft order.
 *                 title:
 *                   type: string
 *                   title: title
 *                   description: The item's title.
 *                 unit_price:
 *                   type: number
 *                   title: unit_price
 *                   description: The item's unit price.
 *                 compare_at_unit_price:
 *                   type: number
 *                   title: compare_at_unit_price
 *                   description: The original price of the item before a promotion or sale.
 *                 internal_note:
 *                   type: string
 *                   title: internal_note
 *                   description: A note viewed only by admin users about the item.
 *                 allow_backorder:
 *                   type: boolean
 *                   title: allow_backorder
 *                   description: Whether the item can be purchased if it's out of stock.
 *                 metadata:
 *                   type: object
 *                   description: The item's metadata, can hold custom key-value pairs.
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
 *       sdk.admin.draftOrder.addItems("order_123", {
 *         items: [
 *           {
 *             variant_id: "variant_123",
 *             quantity: 1,
 *           },
 *         ],
 *       })
 *       .then(({ draft_order_preview }) => {
 *         console.log(draft_order_preview)
 *       })
 *   - lang: Shell
 *     label: cURL
 *     source: |-
 *       curl -X POST '{backend_url}/admin/draft-orders/{id}/edit/items' \
 *       -H 'Authorization: Bearer {access_token}'
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
 * x-workflow: addDraftOrderItemsWorkflow
 * x-events: []
 * 
*/

