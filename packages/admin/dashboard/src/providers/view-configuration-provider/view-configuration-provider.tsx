import { PropsWithChildren, useCallback, useMemo } from "react"
import { ViewConfigurationContext } from "./view-configuration-context"
import { toast } from "@medusajs/ui"
import { useFeatureFlag } from "../feature-flag-provider"
import { useActiveViewConfiguration } from "../../hooks/api/views"
import { FetchError } from "@medusajs/js-sdk"

export const ViewConfigurationProvider = ({ children }: PropsWithChildren) => {
  const isViewConfigEnabled = useFeatureFlag("view_configurations")

  const handleError = useCallback((error: Error, message?: string) => {
    console.error("View configuration error:", error)
    
    // Use custom message if provided, otherwise try to extract from error
    let errorMessage = message
    if (!errorMessage) {
      if (error instanceof FetchError) {
        errorMessage = error.message
      } else if (error.message) {
        errorMessage = error.message
      } else {
        errorMessage = "An error occurred"
      }
    }
    
    toast.error(errorMessage)
  }, [])

  const isDefaultViewActive = useCallback((entity: string) => {
    // This is a synchronous check based on the current React Query cache
    // In practice, components should use useActiveViewConfiguration hook directly
    // This is just for quick UI checks where async isn't suitable
    
    // For now, return false as we can't do async checks here
    // Components that need this info should use the hook directly
    return false
  }, [])

  const contextValue = useMemo(() => ({
    isViewConfigEnabled,
    handleError,
    isDefaultViewActive,
  }), [
    isViewConfigEnabled,
    handleError,
    isDefaultViewActive,
  ])

  return (
    <ViewConfigurationContext.Provider value={contextValue}>
      {children}
    </ViewConfigurationContext.Provider>
  )
}