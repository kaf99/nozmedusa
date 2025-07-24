/**
 * @oas [post] /admin/order-edits
 * operationId: PostOrderEdits
 * summary: Create Order Edit
 * description: Create an order edit.
 * x-authenticated: true
 * security:
 *   - api_token: []
 *   - cookie_auth: []
 *   - jwt_token: []
 * requestBody:
 *   content:
 *     application/json:
 *       schema:
 *         type: object
 *         description: The order edit's details.
 *         required:
 *           - order_id
 *         properties:
 *           order_id:
 *             type: string
 *             title: order_id
 *             description: The ID of the order this edit is for.
 *           description:
 *             type: string
 *             title: description
 *             description: The order edit's description.
 *           internal_note:
 *             type: string
 *             title: internal_note
 *             description: A note viewed only by admin users.
 *           metadata:
 *             type: object
 *             description: The order edit's metadata, can hold custom key-value pairs.
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
 *       sdk.admin.orderEdit.initiateRequest({
 *         order_id: "order_123"
 *       })
 *       .then(({ order_change }) => {
 *         console.log(order_change)
 *       })
 *   - lang: Shell
 *     label: cURL
 *     source: |-
 *       curl -X POST '{backend_url}/admin/order-edits' \
 *       -H 'Authorization: Bearer {access_token}' \
 *       -H 'Content-Type: application/json' \
 *       --data-raw '{
 *         "order_id": "{value}",
 *         "metadata": {}
 *       }'
 * tags:
 *   - Order Edits
 * responses:
 *   "200":
 *     description: OK
 *     content:
 *       application/json:
 *         schema:
 *           $ref: "#/components/schemas/AdminOrderEditResponse"
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
 * x-workflow: beginOrderEditOrderWorkflow
 * x-events: []
 * 
*/

