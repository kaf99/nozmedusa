/**
 * @oas [post] /admin/draft-orders/{id}/edit/shipping-methods/{action_id}
 * operationId: PostDraftOrdersIdEditShippingMethodsAction_id
 * summary: Update New Shipping Method in Draft Order Edit
 * x-sidebar-summary: Update New Shipping Method
 * description: |
 *   Update a new shipping method that was added to a draft order edit using the `ID` of the method's `SHIPPING_ADD` action.
 * 
 *   Every shipping method has an `actions` property, whose value is an array of actions. You can check the action's name using its `action` property, and use the value of the `id` property.
 * x-authenticated: true
 * parameters:
 *   - name: id
 *     in: path
 *     description: The draft order's ID.
 *     required: true
 *     schema:
 *       type: string
 *   - name: action_id
 *     in: path
 *     description: The ID of the shipping method's `SHIPPING_ADD` action.
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
 *         description: The updates to make on a changed shipping method.
 *         required:
 *           - shipping_option_id
 *         properties:
 *           shipping_option_id:
 *             type: string
 *             title: shipping_option_id
 *             description: The ID of the associated shipping option.
 *           custom_amount:
 *             type: number
 *             title: custom_amount
 *             description: The custom amount of the shipping method. If not provided, the shipping option's amount will be used.
 *           description:
 *             type: string
 *             title: description
 *             description: The shipping method's description.
 *           internal_note:
 *             type: string
 *             title: internal_note
 *             description: A note viewed only by admin users about the shipping method.
 *           metadata:
 *             type: object
 *             description: The shipping method's metadata, can hold custom key-value pairs.
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
 *       sdk.admin.draftOrder.updateShippingMethod("order_123", "action_123", {
 *         shipping_option_id: "shipping_option_123",
 *       })
 *       .then(({ draft_order_preview }) => {
 *         console.log(draft_order_preview)
 *       })
 *   - lang: Shell
 *     label: cURL
 *     source: |-
 *       curl -X POST '{backend_url}/admin/draft-orders/{id}/edit/shipping-methods/{action_id}' \
 *       -H 'Authorization: Bearer {access_token}' \
 *       -H 'Content-Type: application/json' \
 *       --data-raw '{
 *         "shipping_option_id": "{value}"
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
 * x-workflow: updateDraftOrderActionShippingMethodWorkflow
 * x-events: []
 * 
*/

