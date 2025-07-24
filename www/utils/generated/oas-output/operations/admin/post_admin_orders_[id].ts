/**
 * @oas [post] /admin/orders/{id}
 * operationId: PostOrdersId
 * summary: Update Order
 * description: Update an order's details.
 * x-authenticated: true
 * parameters:
 *   - name: id
 *     in: path
 *     description: The order's ID.
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
 *         description: The details to update in the order.
 *         properties:
 *           email:
 *             type: string
 *             title: email
 *             description: The order's email.
 *             format: email
 *           shipping_address:
 *             type: object
 *             description: The order's shipping address.
 *             properties:
 *               first_name:
 *                 type: string
 *                 title: first_name
 *                 description: The address's first name.
 *               last_name:
 *                 type: string
 *                 title: last_name
 *                 description: The address's last name.
 *               phone:
 *                 type: string
 *                 title: phone
 *                 description: The address's phone.
 *               company:
 *                 type: string
 *                 title: company
 *                 description: The address's company.
 *               address_1:
 *                 type: string
 *                 title: address_1
 *                 description: The address's first line.
 *               address_2:
 *                 type: string
 *                 title: address_2
 *                 description: The address's second line.
 *               city:
 *                 type: string
 *                 title: city
 *                 description: The address's city.
 *               country_code:
 *                 type: string
 *                 title: country_code
 *                 description: The address's country code.
 *                 example: us
 *               province:
 *                 type: string
 *                 title: province
 *                 description: The address's ISO 3166-2 province code. Must be lower-case.
 *                 example: us-ca
 *                 externalDocs:
 *                   url: https://en.wikipedia.org/wiki/ISO_3166-2
 *                   description: Learn more about ISO 3166-2
 *               postal_code:
 *                 type: string
 *                 title: postal_code
 *                 description: The address's postal code.
 *               metadata:
 *                 type: object
 *                 description: The address's metadata, can hold custom key-value pairs.
 *           billing_address:
 *             type: object
 *             description: The order's billing address.
 *             properties:
 *               first_name:
 *                 type: string
 *                 title: first_name
 *                 description: The address's first name.
 *               last_name:
 *                 type: string
 *                 title: last_name
 *                 description: The address's last name.
 *               phone:
 *                 type: string
 *                 title: phone
 *                 description: The address's phone.
 *               company:
 *                 type: string
 *                 title: company
 *                 description: The address's company.
 *               address_1:
 *                 type: string
 *                 title: address_1
 *                 description: The address's first line.
 *               address_2:
 *                 type: string
 *                 title: address_2
 *                 description: The address's second line.
 *               city:
 *                 type: string
 *                 title: city
 *                 description: The address's city.
 *               country_code:
 *                 type: string
 *                 title: country_code
 *                 description: The address's country code.
 *                 example: us
 *               province:
 *                 type: string
 *                 title: province
 *                 description: The address's ISO 3166-2 province code. Must be lower-case.
 *                 example: us-ca
 *                 externalDocs:
 *                   url: https://en.wikipedia.org/wiki/ISO_3166-2
 *                   description: Learn more about ISO 3166-2
 *               postal_code:
 *                 type: string
 *                 title: postal_code
 *                 description: The address's postal code.
 *               metadata:
 *                 type: object
 *                 description: The address's metadata, can hold custom key-value pairs.
 *           metadata:
 *             type: object
 *             description: The order's metadata, can hold custom key-value pairs.
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
 *       sdk.admin.order.update(
 *         "order_123",
 *         {
 *           email: "new_email@example.com",
 *           shipping_address: {
 *             first_name: "John",
 *             last_name: "Doe",
 *             address_1: "123 Main St",
 *           }
 *         }
 *       )
 *       .then(({ order }) => {
 *         console.log(order)
 *       })
 *   - lang: Shell
 *     label: cURL
 *     source: |-
 *       curl -X POST '{backend_url}/admin/orders/{id}' \
 *       -H 'Authorization: Bearer {access_token}'
 * tags:
 *   - Orders
 * responses:
 *   "200":
 *     description: OK
 *     content:
 *       application/json:
 *         schema:
 *           $ref: "#/components/schemas/AdminOrderResponse"
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
 * x-workflow: updateOrderWorkflow
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

