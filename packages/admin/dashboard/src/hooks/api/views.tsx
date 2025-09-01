import { FetchError } from "@medusajs/js-sdk"
import { HttpTypes } from "@medusajs/types"
import {
  QueryKey,
  useMutation,
  UseMutationOptions,
  useQuery,
  UseQueryOptions
} from "@tanstack/react-query"

import { sdk } from "../../lib/client"
import { queryClient } from "../../lib/query-client"
import { queryKeysFactory } from "../../lib/query-key-factory"

const VIEWS_QUERY_KEY = "views" as const
export const viewsQueryKeys = queryKeysFactory(VIEWS_QUERY_KEY)

// Generic hook to get columns for any entity
export const useEntityColumns = (entity: string, options?: Omit<
  UseQueryOptions<
    HttpTypes.AdminViewsEntityColumnsResponse,
    FetchError,
    HttpTypes.AdminViewsEntityColumnsResponse,
    QueryKey
  >,
  "queryFn" | "queryKey"
>) => {
  const { data, ...rest } = useQuery({
    queryFn: () => sdk.admin.views.columns(entity),
    queryKey: viewsQueryKeys.list(entity),
    ...options,
  })

  return { ...data, ...rest }
}

// View Configuration hooks

// List view configurations for an entity
export const useViewConfigurations = (
  entity: string,
  query?: HttpTypes.AdminGetViewConfigurationsParams,
  options?: Omit<
    UseQueryOptions<
      HttpTypes.AdminViewConfigurationListResponse,
      FetchError,
      HttpTypes.AdminViewConfigurationListResponse,
      QueryKey
    >,
    "queryFn" | "queryKey"
  >
) => {
  const { data, ...rest } = useQuery({
    queryFn: () => sdk.admin.views.listConfigurations(entity, query),
    queryKey: viewsQueryKeys.list(entity, query),
    ...options,
  })

  return { ...data, ...rest }
}

// Get active view configuration for an entity
export const useActiveViewConfiguration = (
  entity: string,
  options?: Omit<
    UseQueryOptions<
      HttpTypes.AdminViewConfigurationResponse & {
        active_view_configuration_id?: string | null
        is_default_active?: boolean
        default_type?: "system" | "code"
      },
      FetchError,
      HttpTypes.AdminViewConfigurationResponse & {
        active_view_configuration_id?: string | null
        is_default_active?: boolean
        default_type?: "system" | "code"
      },
      QueryKey
    >,
    "queryFn" | "queryKey"
  >
) => {
  const { data, ...rest } = useQuery({
    queryFn: () => sdk.admin.views.retrieveActiveConfiguration(entity),
    queryKey: [viewsQueryKeys.detail(entity), "active"],
    ...options,
  })

  return { ...data, ...rest }
}

// Get a specific view configuration
export const useViewConfiguration = (
  entity: string,
  id: string,
  query?: Record<string, any>,
  options?: Omit<
    UseQueryOptions<
      HttpTypes.AdminViewConfigurationResponse,
      FetchError,
      HttpTypes.AdminViewConfigurationResponse,
      QueryKey
    >,
    "queryFn" | "queryKey"
  >
) => {
  const { data, ...rest } = useQuery({
    queryFn: () => sdk.admin.views.retrieveConfiguration(entity, id, query),
    queryKey: viewsQueryKeys.detail(id, query),
    ...options,
  })

  return { ...data, ...rest }
}

export const useCreateViewConfiguration = (
  entity: string,
  options?: UseMutationOptions<
    HttpTypes.AdminViewConfigurationResponse,
    FetchError,
    HttpTypes.AdminCreateViewConfiguration
  >
) => {
  return useMutation({
    mutationFn: (payload: HttpTypes.AdminCreateViewConfiguration) =>
      sdk.admin.views.createConfiguration(entity, payload),
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({ queryKey: viewsQueryKeys.list(entity) })
      // If set_active was true, also invalidate the active configuration
      if ((variables as any).set_active) {
        queryClient.invalidateQueries({
          queryKey: [...viewsQueryKeys.detail(entity, "active")]
        })
      }
      options?.onSuccess?.(data, variables, context)
    },
    ...options,
  })
}

export const useUpdateViewConfiguration = (
  entity: string,
  id: string,
  options?: UseMutationOptions<
    HttpTypes.AdminViewConfigurationResponse,
    FetchError,
    HttpTypes.AdminUpdateViewConfiguration
  >
) => {
  return useMutation({
    mutationFn: (payload: HttpTypes.AdminUpdateViewConfiguration) =>
      sdk.admin.views.updateConfiguration(entity, id, payload),
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({ queryKey: viewsQueryKeys.list(entity) })
      queryClient.invalidateQueries({ queryKey: viewsQueryKeys.detail(id) })
      options?.onSuccess?.(data, variables, context)
    },
    ...options,
  })
}

// Delete view configuration
export const useDeleteViewConfiguration = (
  entity: string,
  id: string,
  options?: UseMutationOptions<
    HttpTypes.AdminViewConfigurationDeleteResponse,
    FetchError,
    void
  >
) => {
  return useMutation({
    mutationFn: () => sdk.admin.views.deleteConfiguration(entity, id),
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({ queryKey: viewsQueryKeys.list(entity) })
      queryClient.invalidateQueries({ queryKey: viewsQueryKeys.detail(id) })
      // Also invalidate active configuration as it might have changed
      queryClient.invalidateQueries({
        queryKey: [...viewsQueryKeys.detail(entity, "active")]
      })
      options?.onSuccess?.(data, variables, context)
    },
    ...options,
  })
}

export const useSetActiveViewConfiguration = (
  entity: string,
  options?: UseMutationOptions<
    { success: boolean },
    FetchError,
    string | null
  >
) => {
  return useMutation({
    mutationFn: (viewConfigurationId: string | null) =>
      sdk.admin.views.setActiveConfiguration(entity, {
        view_configuration_id: viewConfigurationId
      }),
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({
        queryKey: [...viewsQueryKeys.detail(entity, "active")]
      })
      queryClient.invalidateQueries({ queryKey: viewsQueryKeys.list(entity) })
      options?.onSuccess?.(data, variables, context)
    },
    ...options,
  })
}
