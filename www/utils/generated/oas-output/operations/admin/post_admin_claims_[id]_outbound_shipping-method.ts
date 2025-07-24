/**
 * @oas [post] /admin/claims/{id}/outbound/shipping-method
 * operationId: PostClaimsIdOutboundShippingMethod
 * summary: Add Outbound Shipping Methods to a Claim
 * x-sidebar-summary: Add Outbound Shipping
 * description: |
 *   Add an outbound shipping method to a claim. The outbound shipping method will have a `SHIPPING_ADD` action.
 * x-authenticated: true
 * parameters:
 *   - name: id
 *     in: path
 *     description: The claim's ID.
 *     required: true
 *     schema:
 *       type: string
 *   - name: fields
 *     in: query
 *     description: Comma-separated fields that should be included in the returned data. if a field is prefixed with `+` it will be added to the default fields, using `-` will remove it from the default
 *       fields. without prefix it will replace the entire default fields.
 *     required: false
 *     schema:
 *       type: string
 *       title: fields
 *       description: Comma-separated fields that should be included in the returned data. if a field is prefixed with `+` it will be added to the default fields, using `-` will remove it from the default
 *         fields. without prefix it will replace the entire default fields.
 *       externalDocs:
 *         url: "#select-fields-and-relations"
 * security:
 *   - api_token: []
 *   - cookie_auth: []
 *   - jwt_token: []
 * requestBody:
 *   content:
 *     application/json:
 *       schema:
 *         type: object
 *         description: The details of the shipping method used to ship outbound items.
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
 *             description: Set a custom price for the shipping method.
 *           description:
 *             type: string
 *             title: description
 *             description: The shipping method's description.
 *           internal_note:
 *             type: string
 *             title: internal_note
 *             description: A note only viewed by admin users.
 *           metadata:
 *             type: object
 *             description: The claim's metadata, can hold custom key-value pairs.
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
 *       sdk.admin.claim.addOutboundShipping(
 *         "claim_123", 
 *         {
 *           shipping_option_id: "so_123",
 *           custom_amount: 10
 *         },
 *       )
 *       .then(({ claim }) => {
 *         console.log(claim)
 *       })
 *   - lang: Shell
 *     label: cURL
 *     source: |-
 *       curl -X POST '{backend_url}/admin/claims/{id}/outbound/shipping-method' \
 *       -H 'Authorization: Bearer {access_token}' \
 *       -H 'Content-Type: application/json' \
 *       --data-raw '{
 *         "shipping_option_id": "{value}"
 *       }'
 * tags:
 *   - Claims
 * responses:
 *   "200":
 *     description: OK
 *     content:
 *       application/json:
 *         schema:
 *           $ref: "#/components/schemas/AdminClaimPreviewResponse"
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
 * x-workflow: createClaimShippingMethodWorkflow
 * x-events: []
 * 
*/

