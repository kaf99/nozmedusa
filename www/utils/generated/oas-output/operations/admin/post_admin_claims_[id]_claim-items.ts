/**
 * @oas [post] /admin/claims/{id}/claim-items
 * operationId: PostClaimsIdClaimItems
 * summary: Add Claim Items to a Claim
 * x-sidebar-summary: Add Claim Items
 * description: Add order items to a claim as claim items. These claim items will have the action `WRITE_OFF_ITEM`.
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
 *         description: The details of the order items to add to the claim.
 *         properties:
 *           items:
 *             type: array
 *             description: The item's details.
 *             items:
 *               type: object
 *               description: An item's details.
 *               required:
 *                 - id
 *                 - quantity
 *               properties:
 *                 id:
 *                   type: string
 *                   title: id
 *                   description: The ID of the order's item.
 *                 quantity:
 *                   type: number
 *                   title: quantity
 *                   description: The quantity of the order's item to add to the claim.
 *                 reason:
 *                   type: string
 *                   description: The reason the item is claimed.
 *                   enum:
 *                     - missing_item
 *                     - wrong_item
 *                     - production_failure
 *                     - other
 *                 description:
 *                   type: string
 *                   title: description
 *                   description: The item's description.
 *                 internal_note:
 *                   type: string
 *                   title: internal_note
 *                   description: A note that's only viewed by admin users.
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
 *       sdk.admin.claim.addItems("claim_123", {
 *         items: [
 *           {
 *             id: "orli_123",
 *             quantity: 1
 *           }
 *         ]
 *       })
 *       .then(({ claim }) => {
 *         console.log(claim)
 *       })
 *   - lang: Shell
 *     label: cURL
 *     source: |-
 *       curl -X POST '{backend_url}/admin/claims/{id}/claim-items' \
 *       -H 'Authorization: Bearer {access_token}'
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
 * x-workflow: orderClaimItemWorkflow
 * x-events: []
 * 
*/

