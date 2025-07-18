import { HttpTypes } from "@medusajs/types"
import { Client } from "../client"
import { ClientHeaders } from "../types"

export class ViewConfiguration {
  private client: Client

  constructor(client: Client) {
    this.client = client
  }

  async list(
    queryParams?: HttpTypes.AdminGetViewConfigurationsParams,
    headers?: ClientHeaders
  ) {
    return await this.client.fetch<HttpTypes.AdminViewConfigurationListResponse>(
      `/admin/view-configurations`,
      { headers, query: queryParams }
    )
  }

  async create(
    body: HttpTypes.AdminCreateViewConfiguration,
    query?: any,
    headers?: ClientHeaders
  ) {
    return await this.client.fetch<HttpTypes.AdminViewConfigurationResponse>(
      `/admin/view-configurations`,
      { method: "POST", headers, body, query }
    )
  }

  async retrieve(
    id: string,
    query?: any,
    headers?: ClientHeaders
  ) {
    return await this.client.fetch<HttpTypes.AdminViewConfigurationResponse>(
      `/admin/view-configurations/${id}`,
      { query, headers }
    )
  }

  async update(
    id: string,
    body: HttpTypes.AdminUpdateViewConfiguration,
    query?: any,
    headers?: ClientHeaders
  ) {
    return await this.client.fetch<HttpTypes.AdminViewConfigurationResponse>(
      `/admin/view-configurations/${id}`,
      { method: "POST", headers, body, query }
    )
  }

  async delete(
    id: string,
    headers?: ClientHeaders
  ) {
    return await this.client.fetch<HttpTypes.AdminViewConfigurationDeleteResponse>(
      `/admin/view-configurations/${id}`,
      { method: "DELETE", headers }
    )
  }

  async retrieveActive(
    queryParams: { entity: string },
    headers?: ClientHeaders
  ) {
    return await this.client.fetch<HttpTypes.AdminViewConfigurationResponse>(
      `/admin/view-configurations/active`,
      { headers, query: queryParams }
    )
  }

  async setActive(
    body: { entity: string; view_configuration_id: string },
    headers?: ClientHeaders
  ) {
    return await this.client.fetch<{ success: boolean }>(
      `/admin/view-configurations/active`,
      { method: "POST", headers, body }
    )
  }
}