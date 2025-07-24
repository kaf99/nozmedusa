/**
 * @oas [post] /admin/draft-orders/{id}
 * operationId: PostDraftOrdersId
 * summary: Update a Draft Order
 * description: Update a draft order's details. This doesn't include updating the draft order's items, shipping methods, or promotions. To update those, you need to create an edit that you can later
 *   request or confirm.
 * x-authenticated: true
 * parameters:
 *   - name: id
 *     in: path
 *     description: The draft order's ID.
 *     required: true
 *     schema:
 *       type: string
 *   - name: fields
 *     in: query
 *     description: |-
 *       Comma-separated fields that should be included in the returned data.
 *       if a field is prefixed with `+` it will be added to the default fields, using `-` will remove it from the default fields.
 *       without prefix it will replace the entire default fields.
 *     required: false
 *     schema:
 *       type: string
 *       title: fields
 *       description: Comma-separated fields that should be included in the returned data. If a field is prefixed with `+` it will be added to the default fields, using `-` will remove it from the default
 *         fields. Without prefix it will replace the entire default fields.
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
 *         description: The data to update in the draft order.
 *         properties:
 *           email:
 *             type: string
 *             title: email
 *             description: The customer email associated with the draft order.
 *             format: email
 *           shipping_address:
 *             type: object
 *             description: The draft order's shipping address.
 *             properties:
 *               first_name:
 *                 type: string
 *                 title: first_name
 *                 description: The shipping address's first name.
 *               last_name:
 *                 type: string
 *                 title: last_name
 *                 description: The shipping address's last name.
 *               phone:
 *                 type: string
 *                 title: phone
 *                 description: The shipping address's phone.
 *               company:
 *                 type: string
 *                 title: company
 *                 description: The shipping address's company.
 *               address_1:
 *                 type: string
 *                 title: address_1
 *                 description: The first address line.
 *               address_2:
 *                 type: string
 *                 title: address_2
 *                 description: The second address line.
 *               city:
 *                 type: string
 *                 title: city
 *                 description: The shipping address's city.
 *               country_code:
 *                 type: string
 *                 title: country_code
 *                 description: The shipping address's country code.
 *                 example: us
 *               province:
 *                 type: string
 *                 title: province
 *                 description: The shipping address's ISO 3166-2 province code. Must be lower-case.
 *                 example: us-ca
 *                 externalDocs:
 *                   url: https://en.wikipedia.org/wiki/ISO_3166-2
 *                   description: Learn more about ISO 3166-2
 *               postal_code:
 *                 type: string
 *                 title: postal_code
 *                 description: The shipping address's postal code.
 *               metadata:
 *                 type: object
 *                 description: The shipping address's metadata, can hold custom key-value pairs.
 *           billing_address:
 *             type: object
 *             description: The draft order's billing address.
 *             properties:
 *               first_name:
 *                 type: string
 *                 title: first_name
 *                 description: The billing address's first name.
 *               last_name:
 *                 type: string
 *                 title: last_name
 *                 description: The billing address's last name.
 *               phone:
 *                 type: string
 *                 title: phone
 *                 description: The billing address's phone.
 *               company:
 *                 type: string
 *                 title: company
 *                 description: The billing address's company.
 *               address_1:
 *                 type: string
 *                 title: address_1
 *                 description: The first address line.
 *               address_2:
 *                 type: string
 *                 title: address_2
 *                 description: The second address line.
 *               city:
 *                 type: string
 *                 title: city
 *                 description: The billing address's city.
 *               country_code:
 *                 type: string
 *                 title: country_code
 *                 description: The billing address's country code.
 *                 example: us
 *               province:
 *                 type: string
 *                 title: province
 *                 description: The billing address's ISO 3166-2 province code. Must be lower-case.
 *                 example: us-ca
 *                 externalDocs:
 *                   url: https://en.wikipedia.org/wiki/ISO_3166-2
 *                   description: Learn more about ISO 3166-2
 *               postal_code:
 *                 type: string
 *                 title: postal_code
 *                 description: The billing address's postal code.
 *               metadata:
 *                 type: object
 *                 description: The billing address's metadata, can hold custom key-value pairs.
 *           metadata:
 *             type: object
 *             description: The draft order's metadata, can hold custom key-value pairs.
 *           customer_id:
 *             type: string
 *             title: customer_id
 *             description: The ID of the customer associated with the draft order.
 *           sales_channel_id:
 *             type: string
 *             title: sales_channel_id
 *             description: The ID of the sales channel associated with the draft order.
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
 *       sdk.admin.draftOrder.update("order_123", {
 *         email: "test@test.com",
 *       })
 *       .then(({ draft_order }) => {
 *         console.log(draft_order)
 *       })
 *   - lang: Shell
 *     label: cURL
 *     source: |-
 *       curl -X POST '{backend_url}/admin/draft-orders/{id}' \
 *       -H 'Authorization: Bearer {access_token}'
 * tags:
 *   - Draft Orders
 * responses:
 *   "200":
 *     description: OK
 *     content:
 *       application/json:
 *         schema:
 *           $ref: "#/components/schemas/AdminDraftOrderResponse"
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
 * x-workflow: updateDraftOrderWorkflow
 * x-events:
 *   - name: order.updated
 *     payload: |-
 *       ```ts
 *       {
 *         id, // The ID of the order
 *       }
 *       ```
 *     description: |-
 *       Emitted when the details of an order or draft order is updated. This
 *       doesn't include updates made by an edit.
 *     deprecated: false
 * 
*/

