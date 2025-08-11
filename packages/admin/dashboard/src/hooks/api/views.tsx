import { HttpTypes } from "@medusajs/types"
import { useQuery } from "@tanstack/react-query"

import { sdk } from "../../lib/client"
import { queryKeysFactory } from "../../lib/query-key-factory"

const VIEWS_QUERY_KEY = "views" as const
export const viewsQueryKeys = queryKeysFactory(VIEWS_QUERY_KEY)

// Generic hook to get columns for any entity
export const useEntityColumns = (entity: string) => {
  const { data, ...rest } = useQuery({
    queryFn: () => sdk.admin.views.columns(entity),
    queryKey: viewsQueryKeys.list(entity),
  })

  return { ...data, ...rest }
}

// Specific entity hooks for convenience
export const useOrderColumns = () => {
  return useEntityColumns("orders")
}

export const useProductColumns = () => {
  return useEntityColumns("products")
}

export const useCustomerColumns = () => {
  return useEntityColumns("customers")
}

export const useUserColumns = () => {
  return useEntityColumns("users")
}

export const useRegionColumns = () => {
  return useEntityColumns("regions")
}

export const useSalesChannelColumns = () => {
  return useEntityColumns("sales-channels")
}