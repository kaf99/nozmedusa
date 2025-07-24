/**
 * @oas [post] /admin/stock-locations/{id}
 * operationId: PostStockLocationsId
 * summary: Update a Stock Location
 * description: Update a stock location's details.
 * x-authenticated: true
 * parameters:
 *   - name: id
 *     in: path
 *     description: The stock location's ID.
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
 *         description: The properties to update in a stock location.
 *         properties:
 *           name:
 *             type: string
 *             title: name
 *             description: The stock location's name.
 *           address:
 *             type: object
 *             description: The stock location's address. Pass this property if you're creating a new address to associate with the location.
 *             required:
 *               - address_1
 *               - country_code
 *             properties:
 *               address_1:
 *                 type: string
 *                 title: address_1
 *                 description: The address's first line.
 *               address_2:
 *                 type: string
 *                 title: address_2
 *                 description: The address's second line.
 *               company:
 *                 type: string
 *                 title: company
 *                 description: The address's company.
 *               city:
 *                 type: string
 *                 title: city
 *                 description: The address's city.
 *               country_code:
 *                 type: string
 *                 title: country_code
 *                 description: The address's country code.
 *                 example: us
 *               phone:
 *                 type: string
 *                 title: phone
 *                 description: The address's phone.
 *               postal_code:
 *                 type: string
 *                 title: postal_code
 *                 description: The address's postal code.
 *               province:
 *                 type: string
 *                 title: province
 *                 description: The address's ISO 3166-2 province code. Must be lower-case.
 *                 example: us-ca
 *                 externalDocs:
 *                   url: https://en.wikipedia.org/wiki/ISO_3166-2
 *                   description: Learn more about ISO 3166-2
 *           address_id:
 *             type: string
 *             title: address_id
 *             description: The ID of an existing stock location address to associate the stock location with.
 *           metadata:
 *             type: object
 *             description: The stock location's metadata, can hold custom key-value pairs.
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
 *       sdk.admin.stockLocation.update("sloc_123", {
 *         name: "European Warehouse",
 *       })
 *       .then(({ stock_location }) => {
 *         console.log(stock_location)
 *       })
 *   - lang: Shell
 *     label: cURL
 *     source: |-
 *       curl -X POST '{backend_url}/admin/stock-locations/{id}' \
 *       -H 'Authorization: Bearer {access_token}' \
 *       -H 'Content-Type: application/json' \
 *       --data-raw '{
 *         "address_id": "{value}",
 *         "metadata": {}
 *       }'
 * tags:
 *   - Stock Locations
 * responses:
 *   "200":
 *     description: OK
 *     content:
 *       application/json:
 *         schema:
 *           $ref: "#/components/schemas/AdminStockLocationResponse"
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
 * x-workflow: updateStockLocationsWorkflow
 * x-events: []
 * 
*/

