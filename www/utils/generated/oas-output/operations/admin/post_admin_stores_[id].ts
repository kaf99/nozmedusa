/**
 * @oas [post] /admin/stores/{id}
 * operationId: PostStoresId
 * summary: Update a Store
 * description: Update a store's details.
 * x-authenticated: true
 * parameters:
 *   - name: id
 *     in: path
 *     description: The store's ID.
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
 *         description: The properties to update in a store.
 *         properties:
 *           name:
 *             type: string
 *             title: name
 *             description: The store's name.
 *           supported_currencies:
 *             type: array
 *             description: The store's supported currencies.
 *             items:
 *               type: object
 *               description: A store currency.
 *               required:
 *                 - currency_code
 *               properties:
 *                 currency_code:
 *                   type: string
 *                   title: currency_code
 *                   description: The currency's code.
 *                   example: usd
 *                 is_default:
 *                   type: boolean
 *                   title: is_default
 *                   description: Whether the currency is the default in the store.
 *                 is_tax_inclusive:
 *                   type: boolean
 *                   title: is_tax_inclusive
 *                   description: Whether prices using this currency are tax inclusive.
 *           default_sales_channel_id:
 *             type: string
 *             title: default_sales_channel_id
 *             description: The ID of the default sales channel in the store.
 *           default_region_id:
 *             type: string
 *             title: default_region_id
 *             description: The ID of the default region in the store.
 *           default_location_id:
 *             type: string
 *             title: default_location_id
 *             description: The ID of the default stock location in the store.
 *           metadata:
 *             type: object
 *             description: The store's metadata, can hold custom key-value pairs.
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
 *       sdk.admin.store.update("store_123", {
 *         name: "My Store",
 *       })
 *       .then(({ store }) => {
 *         console.log(store)
 *       })
 *   - lang: Shell
 *     label: cURL
 *     source: |-
 *       curl -X POST '{backend_url}/admin/stores/{id}' \
 *       -H 'Authorization: Bearer {access_token}' \
 *       -H 'Content-Type: application/json' \
 *       --data-raw '{
 *         "name": "Melvina",
 *         "default_sales_channel_id": "{value}",
 *         "default_region_id": "{value}",
 *         "default_location_id": "{value}",
 *         "metadata": {}
 *       }'
 * tags:
 *   - Stores
 * responses:
 *   "200":
 *     description: OK
 *     content:
 *       application/json:
 *         schema:
 *           $ref: "#/components/schemas/AdminStoreResponse"
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
 * x-workflow: updateStoresWorkflow
 * x-events: []
 * 
*/

