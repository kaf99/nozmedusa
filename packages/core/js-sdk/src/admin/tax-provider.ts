import { HttpTypes } from "@medusajs/types"
import { Client } from "../client"
import { ClientHeaders } from "../types"

const taxProviderUrl = "/admin/tax-providers"

export class TaxProvider {
  /**
   * @ignore
   */
  private client: Client
  /**
   * @ignore
   */
  constructor(client: Client) {
    this.client = client
  }

  /**
   * This method retrieves a list of tax providers. It sends a request to the
   * [List Tax Providers](https://docs.medusajs.com/api/admin#tax-providers_gettaxproviders)
   * API route.
   *
   * @param query - Filters and pagination configurations.
   * @param headers - Headers to pass in the request.
   * @returns The list of tax providers.
   *
   * @example
   * To retrieve the list of tax providers:
   *
   * ```ts
   * sdk.admin.taxProvider.list()
   * .then(({ tax_providers, count, limit, offset }) => {
   *   console.log(tax_providers)
   * })
   * ```
   */
  async list(
    query?: HttpTypes.AdminGetTaxProvidersParams,
    headers?: ClientHeaders
  ) {
    return await this.client.fetch<HttpTypes.AdminTaxProviderListResponse>(
      taxProviderUrl,
      {
        method: "GET",
        headers,
        query,
      }
    )
  }
}
