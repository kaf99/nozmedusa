/**
 * @oas [post] /admin/tax-rates/{id}
 * operationId: PostTaxRatesId
 * summary: Update a Tax Rate
 * description: Update a tax rate's details.
 * x-authenticated: true
 * parameters:
 *   - name: id
 *     in: path
 *     description: The tax rate's ID.
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
 *         description: The properties to update in the tax rate.
 *         properties:
 *           rate:
 *             type: number
 *             title: rate
 *             description: The rate to charge.
 *           code:
 *             type: string
 *             title: code
 *             description: The code that the tax rate is identified by.
 *           rules:
 *             type: array
 *             description: The tax rate's rules.
 *             items:
 *               type: object
 *               description: A tax rate rule.
 *               required:
 *                 - reference
 *                 - reference_id
 *               properties:
 *                 reference:
 *                   type: string
 *                   title: reference
 *                   description: The name of the table this rule references.
 *                   example: product_type
 *                 reference_id:
 *                   type: string
 *                   title: reference_id
 *                   description: The ID of the record in the table that the rule references.
 *                   example: ptyp_123
 *           name:
 *             type: string
 *             title: name
 *             description: The tax rate's name.
 *           is_default:
 *             type: boolean
 *             title: is_default
 *             description: Whether the tax rate is the default in the store.
 *           is_combinable:
 *             type: boolean
 *             title: is_combinable
 *             description: Whether the tax rate should be combined with parent rates.
 *             externalDocs:
 *               url: https://docs.medusajs.com/v2/resources/commerce-modules/tax/tax-rates-and-rules#combinable-tax-rates
 *           metadata:
 *             type: object
 *             description: The tax rate's metadata, can hold custom key-value pairs.
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
 *       sdk.admin.taxRate.update("txrat_123", {
 *         name: "VAT",
 *         code: "VAT",
 *       })
 *       .then(({ tax_rate }) => {
 *         console.log(tax_rate)
 *       })
 *   - lang: Shell
 *     label: cURL
 *     source: |-
 *       curl -X POST '{backend_url}/admin/tax-rates/{id}' \
 *       -H 'Authorization: Bearer {access_token}' \
 *       -H 'Content-Type: application/json' \
 *       --data-raw '{
 *         "metadata": {}
 *       }'
 * tags:
 *   - Tax Rates
 * responses:
 *   "200":
 *     description: OK
 *     content:
 *       application/json:
 *         schema:
 *           $ref: "#/components/schemas/AdminTaxRateResponse"
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
 * x-workflow: updateTaxRatesWorkflow
 * x-events: []
 * 
*/

