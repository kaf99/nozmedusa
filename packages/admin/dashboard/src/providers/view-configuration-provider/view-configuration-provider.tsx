import { PropsWithChildren, useCallback, useRef, useState } from "react"
import { ViewConfigurationContext, ViewConfiguration } from "./view-configuration-context"
import { sdk } from "../../lib/client"
import { toast } from "@medusajs/ui"

export const ViewConfigurationProvider = ({ children }: PropsWithChildren) => {
  const [viewConfigurations] = useState<Map<string, ViewConfiguration[]>>(new Map())
  const [activeViews] = useState<Map<string, ViewConfiguration>>(new Map())
  const [isLoading] = useState<Map<string, boolean>>(new Map())
  
  // Use ref to track ongoing requests to prevent duplicate fetches
  const fetchingRef = useRef<Map<string, Promise<ViewConfiguration[]>>>(new Map())

  const getViewConfigurations = useCallback(async (entity: string): Promise<ViewConfiguration[]> => {
    // Check cache first
    if (viewConfigurations.has(entity)) {
      return viewConfigurations.get(entity)!
    }

    // Check if we're already fetching
    if (fetchingRef.current.has(entity)) {
      return fetchingRef.current.get(entity)!
    }

    // Start loading
    isLoading.set(entity, true)

    // Create fetch promise
    const fetchPromise = sdk.admin.viewConfiguration.list({ 
      entity,
      limit: 100 
    }).then(response => {
      const configs = response.view_configurations
      viewConfigurations.set(entity, configs)
      isLoading.set(entity, false)
      fetchingRef.current.delete(entity)
      return configs
    }).catch(error => {
      console.error("Failed to fetch view configurations:", error)
      isLoading.set(entity, false)
      fetchingRef.current.delete(entity)
      return []
    })

    fetchingRef.current.set(entity, fetchPromise)
    return fetchPromise
  }, [viewConfigurations, isLoading])

  const getActiveView = useCallback(async (entity: string): Promise<ViewConfiguration | null> => {
    // Check cache first
    if (activeViews.has(entity)) {
      return activeViews.get(entity)
    }

    try {
      const response = await sdk.admin.viewConfiguration.retrieveActive({ entity })
      const config = response.view_configuration
      if (config) {
        activeViews.set(entity, config)
      }
      return config
    } catch (error) {
      console.error("Failed to fetch active view configuration:", error)
      return null
    }
  }, [activeViews])

  const setActiveView = useCallback(async (entity: string, viewConfigurationId: string) => {
    try {
      await sdk.admin.viewConfiguration.setActive({
        entity,
        view_configuration_id: viewConfigurationId
      })
      
      // Update cache
      const configs = await getViewConfigurations(entity)
      const activeConfig = configs.find(c => c.id === viewConfigurationId)
      if (activeConfig) {
        activeViews.set(entity, activeConfig)
      }
    } catch (error) {
      console.error("Failed to set active view configuration:", error)
      toast.error("Failed to set active view")
    }
  }, [activeViews, getViewConfigurations])

  const createViewConfiguration = useCallback(async (
    config: Omit<ViewConfiguration, "id" | "created_at" | "updated_at">
  ): Promise<ViewConfiguration> => {
    try {
      const response = await sdk.admin.viewConfiguration.create(config)
      const newConfig = response.view_configuration
      
      // Invalidate cache for this entity
      viewConfigurations.delete(config.entity)
      
      return newConfig
    } catch (error: any) {
      console.error("Failed to create view configuration:", error)
      const errorMessage = error?.response?.data?.message || error?.message || "Failed to create view"
      toast.error(errorMessage)
      throw error
    }
  }, [viewConfigurations])

  const updateViewConfiguration = useCallback(async (
    id: string, 
    config: Partial<ViewConfiguration>
  ): Promise<ViewConfiguration> => {
    try {
      const response = await sdk.admin.viewConfiguration.update(id, config)
      const updatedConfig = response.view_configuration
      
      // Invalidate cache for this entity
      if (updatedConfig.entity) {
        viewConfigurations.delete(updatedConfig.entity)
        // Update active view if it's the one being updated
        const activeView = activeViews.get(updatedConfig.entity)
        if (activeView?.id === id) {
          activeViews.set(updatedConfig.entity, updatedConfig)
        }
      }
      
      return updatedConfig
    } catch (error: any) {
      console.error("Failed to update view configuration:", error)
      const errorMessage = error?.response?.data?.message || error?.message || "Failed to update view"
      toast.error(errorMessage)
      throw error
    }
  }, [viewConfigurations, activeViews])

  const deleteViewConfiguration = useCallback(async (id: string) => {
    try {
      // First get the config to know which entity to invalidate
      const configs = Array.from(viewConfigurations.values()).flat()
      const configToDelete = configs.find(c => c.id === id)
      
      await sdk.admin.viewConfiguration.delete(id)
      
      // Invalidate cache
      if (configToDelete) {
        viewConfigurations.delete(configToDelete.entity)
        // Remove from active views if it was active
        const activeView = activeViews.get(configToDelete.entity)
        if (activeView?.id === id) {
          activeViews.delete(configToDelete.entity)
        }
      }
    } catch (error) {
      console.error("Failed to delete view configuration:", error)
      toast.error("Failed to delete view")
      throw error
    }
  }, [viewConfigurations, activeViews])

  const invalidateCache = useCallback((entity: string) => {
    viewConfigurations.delete(entity)
    activeViews.delete(entity)
    isLoading.delete(entity)
  }, [viewConfigurations, activeViews, isLoading])

  return (
    <ViewConfigurationContext.Provider
      value={{
        viewConfigurations,
        activeViews,
        isLoading,
        getViewConfigurations,
        getActiveView,
        setActiveView,
        createViewConfiguration,
        updateViewConfiguration,
        deleteViewConfiguration,
        invalidateCache,
      }}
    >
      {children}
    </ViewConfigurationContext.Provider>
  )
}