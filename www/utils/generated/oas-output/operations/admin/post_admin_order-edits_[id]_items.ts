/**
 * @oas [post] /admin/order-edits/{id}/items
 * operationId: PostOrderEditsIdItems
 * summary: Add Items to Order Edit
 * x-sidebar-summary: Add Items
 * description: Add new items to an order edit. These items will have the action `ITEM_ADD`.
 * x-authenticated: true
 * parameters:
 *   - name: id
 *     in: path
 *     description: The order edit's ID.
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
 *         description: The details of items to be edited.
 *         properties:
 *           items:
 *             type: array
 *             description: The details of items to be edited.
 *             items:
 *               type: object
 *               description: An item's details.
 *               required:
 *                 - variant_id
 *                 - quantity
 *               properties:
 *                 variant_id:
 *                   type: string
 *                   title: variant_id
 *                   description: The ID of the associated product variant.
 *                 quantity:
 *                   type: number
 *                   title: quantity
 *                   description: The item's quantity.
 *                 unit_price:
 *                   type: number
 *                   title: unit_price
 *                   description: The item's unit price.
 *                 internal_note:
 *                   type: string
 *                   title: internal_note
 *                   description: A note viewed only by admin users.
 *                 allow_backorder:
 *                   type: boolean
 *                   title: allow_backorder
 *                   description: Whether the item can be added even if there's no available invenotory quantity of the variant.
 *                 metadata:
 *                   type: object
 *                   description: The item's metadata, can hold custom key-value pairs.
 *                 compare_at_unit_price:
 *                   type: number
 *                   title: compare_at_unit_price
 *                   description: The original price of the item before a promotion or sale.
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
 *       sdk.admin.orderEdit.addItems("ordch_123", {
 *         items: [
 *           {
 *             variant_id: "variant_123",
 *             quantity: 1
 *           }
 *         ]
 *       })
 *       .then(({ order_preview }) => {
 *         console.log(order_preview)
 *       })
 *   - lang: Shell
 *     label: cURL
 *     source: |-
 *       curl -X POST '{backend_url}/admin/order-edits/{id}/items' \
 *       -H 'Authorization: Bearer {access_token}'
 * tags:
 *   - Order Edits
 * responses:
 *   "200":
 *     description: OK
 *     content:
 *       application/json:
 *         schema:
 *           $ref: "#/components/schemas/AdminOrderEditPreviewResponse"
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
 * x-workflow: orderEditAddNewItemWorkflow
 * x-events: []
 * 
*/

