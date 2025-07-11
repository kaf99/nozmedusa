import { HttpTypes, SelectParams } from "@medusajs/types"

import { Client } from "../client"
import { ClientHeaders } from "../types"

export class Views {
  constructor(private client: Client) {}

  // Generic method to get columns for any entity
  async columns(
    entity: string,
    query?: SelectParams,
    headers?: ClientHeaders
  ): Promise<HttpTypes.AdminViews.AdminOrderColumnsResponse> {
    return await this.client.fetch(`/admin/views/${entity}/columns`, {
      method: "GET",
      headers,
      query,
    })
  }

  // Specific entity methods for convenience
  orders = {
    columns: {
      list: async (
        query?: SelectParams,
        headers?: ClientHeaders
      ): Promise<HttpTypes.AdminViews.AdminOrderColumnsResponse> => {
        return await this.columns("orders", query, headers)
      },
    },
  }

  products = {
    columns: {
      list: async (
        query?: SelectParams,
        headers?: ClientHeaders
      ): Promise<HttpTypes.AdminViews.AdminOrderColumnsResponse> => {
        return await this.columns("products", query, headers)
      },
    },
  }

  customers = {
    columns: {
      list: async (
        query?: SelectParams,
        headers?: ClientHeaders
      ): Promise<HttpTypes.AdminViews.AdminOrderColumnsResponse> => {
        return await this.columns("customers", query, headers)
      },
    },
  }

  users = {
    columns: {
      list: async (
        query?: SelectParams,
        headers?: ClientHeaders
      ): Promise<HttpTypes.AdminViews.AdminOrderColumnsResponse> => {
        return await this.columns("users", query, headers)
      },
    },
  }

  regions = {
    columns: {
      list: async (
        query?: SelectParams,
        headers?: ClientHeaders
      ): Promise<HttpTypes.AdminViews.AdminOrderColumnsResponse> => {
        return await this.columns("regions", query, headers)
      },
    },
  }

  salesChannels = {
    columns: {
      list: async (
        query?: SelectParams,
        headers?: ClientHeaders
      ): Promise<HttpTypes.AdminViews.AdminOrderColumnsResponse> => {
        return await this.columns("sales-channels", query, headers)
      },
    },
  }
}