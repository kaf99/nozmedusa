/**
 * @oas [post] /admin/fulfillments
 * operationId: PostFulfillments
 * summary: Create Fulfillment
 * description: Create a fulfillment for an order, return, exchange, and more.
 * x-authenticated: true
 * parameters:
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
 *         description: The filfillment's details.
 *         required:
 *           - items
 *           - metadata
 *           - order_id
 *           - data
 *           - location_id
 *           - provider_id
 *           - delivery_address
 *           - labels
 *         properties:
 *           location_id:
 *             type: string
 *             title: location_id
 *             description: The ID of the location the items are fulfilled from.
 *           provider_id:
 *             type: string
 *             title: provider_id
 *             description: The ID of the provider handling this fulfillment.
 *           delivery_address:
 *             type: object
 *             description: The address to deliver the items to.
 *             properties:
 *               first_name:
 *                 type: string
 *                 title: first_name
 *                 description: The customer's first name.
 *               last_name:
 *                 type: string
 *                 title: last_name
 *                 description: The customer's last name.
 *               phone:
 *                 type: string
 *                 title: phone
 *                 description: The customer's phone.
 *               company:
 *                 type: string
 *                 title: company
 *                 description: The delivery address's company.
 *               address_1:
 *                 type: string
 *                 title: address_1
 *                 description: The delivery address's first line.
 *               address_2:
 *                 type: string
 *                 title: address_2
 *                 description: The delivery address's second line.
 *               city:
 *                 type: string
 *                 title: city
 *                 description: The delivery address's city.
 *               country_code:
 *                 type: string
 *                 title: country_code
 *                 description: The delivery address's country code.
 *               province:
 *                 type: string
 *                 title: province
 *                 description: The delivery address's ISO 3166-2 province code. Must be lower-case.
 *                 example: us-ca
 *                 externalDocs:
 *                   url: https://en.wikipedia.org/wiki/ISO_3166-2
 *                   description: Learn more about ISO 3166-2
 *               postal_code:
 *                 type: string
 *                 title: postal_code
 *                 description: The delivery address's postal code.
 *               metadata:
 *                 type: object
 *                 description: The delivery address's metadata, used to store custom key-value pairs.
 *           items:
 *             type: array
 *             description: The items to fulfill.
 *             items:
 *               type: object
 *               description: An item to fulfill.
 *               required:
 *                 - title
 *                 - quantity
 *                 - sku
 *                 - barcode
 *               properties:
 *                 title:
 *                   type: string
 *                   title: title
 *                   description: The item's title.
 *                 sku:
 *                   type: string
 *                   title: sku
 *                   description: The item's SKU.
 *                 quantity:
 *                   type: number
 *                   title: quantity
 *                   description: The quantity to fulfill of the item.
 *                 barcode:
 *                   type: string
 *                   title: barcode
 *                   description: The item's barcode.
 *                 line_item_id:
 *                   type: string
 *                   title: line_item_id
 *                   description: The ID of the associated line item.
 *                 inventory_item_id:
 *                   type: string
 *                   title: inventory_item_id
 *                   description: The ID of the inventory item associated with the underlying variant.
 *           labels:
 *             type: array
 *             description: The labels for the fulfillment's shipments.
 *             items:
 *               type: object
 *               description: A shipment's label.
 *               required:
 *                 - tracking_number
 *                 - tracking_url
 *                 - label_url
 *               properties:
 *                 tracking_number:
 *                   type: string
 *                   title: tracking_number
 *                   description: The label's tracking number.
 *                 tracking_url:
 *                   type: string
 *                   title: tracking_url
 *                   description: The label's tracking URL.
 *                 label_url:
 *                   type: string
 *                   title: label_url
 *                   description: The label's URL.
 *           order_id:
 *             type: string
 *             title: order_id
 *             description: The ID of the order this fulfillment is created for.
 *           shipping_option_id:
 *             type: string
 *             title: shipping_option_id
 *             description: The ID of the shipping option used in the order.
 *           data:
 *             type: object
 *             description: Any data useful for the fulfillment provider to handle the fulfillment.
 *             externalDocs:
 *               url: https://docs.medusajs.com/v2/resources/commerce-modules/fulfillment/shipping-option#data-property
 *               description: Learn more about the data property.
 *           packed_at:
 *             type: string
 *             title: packed_at
 *             description: The date and time the fulfillment was packed.
 *             format: date-time
 *           shipped_at:
 *             type: string
 *             title: shipped_at
 *             description: The date and time the fulfillment was shipped.
 *             format: date-time
 *           delivered_at:
 *             type: string
 *             title: delivered_at
 *             description: The date and time the fulfillment was delivered.
 *             format: date-time
 *           canceled_at:
 *             type: string
 *             title: canceled_at
 *             description: The date and time the fulfillment was canceled.
 *             format: date-time
 *           metadata:
 *             type: object
 *             description: The fulfillment's metadata, used to store custom key-value pairs.
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
 *       sdk.admin.fulfillment.create({
 *         location_id: "sloc_123",
 *         provider_id: "my_fulfillment",
 *         delivery_address: {
 *           country_code: "us"
 *         },
 *         items: [
 *           {
 *             title: "Shirt",
 *             sku: "SHIRT",
 *             quantity: 1,
 *             barcode: "123"
 *           }
 *         ],
 *         labels: [],
 *         order: {},
 *         order_id: "order_123"
 *       })
 *       .then(({ fulfillment }) => {
 *         console.log(fulfillment)
 *       })
 *   - lang: Shell
 *     label: cURL
 *     source: |-
 *       curl -X POST '{backend_url}/admin/fulfillments' \
 *       -H 'Authorization: Bearer {access_token}' \
 *       -H 'Content-Type: application/json' \
 *       --data-raw '{
 *         "location_id": "{value}",
 *         "provider_id": "{value}",
 *         "delivery_address": {
 *           "first_name": "{value}",
 *           "last_name": "{value}",
 *           "phone": "{value}",
 *           "company": "{value}",
 *           "address_1": "{value}",
 *           "address_2": "{value}",
 *           "city": "{value}",
 *           "country_code": "{value}",
 *           "province": "us-ca",
 *           "postal_code": "{value}",
 *           "metadata": {}
 *         },
 *         "items": [
 *           {
 *             "title": "{value}",
 *             "sku": "{value}",
 *             "quantity": 1667318922870784,
 *             "barcode": "{value}",
 *             "line_item_id": "{value}",
 *             "inventory_item_id": "{value}"
 *           }
 *         ],
 *         "labels": [
 *           {
 *             "tracking_number": "{value}",
 *             "tracking_url": "{value}",
 *             "label_url": "{value}"
 *           }
 *         ],
 *         "order": {},
 *         "order_id": "{value}",
 *         "shipping_option_id": "{value}",
 *         "data": {},
 *         "packed_at": "2024-11-12T18:37:37.122Z",
 *         "shipped_at": "2025-04-13T12:39:42.432Z",
 *         "delivered_at": "2025-01-29T19:05:57.056Z",
 *         "canceled_at": "2025-02-16T02:12:11.763Z",
 *         "metadata": {}
 *       }'
 * tags:
 *   - Fulfillments
 * responses:
 *   "200":
 *     description: OK
 *     content:
 *       application/json:
 *         schema:
 *           $ref: "#/components/schemas/AdminFulfillmentResponse"
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
 * x-workflow: createFulfillmentWorkflow
 * x-events: []
 * 
*/

