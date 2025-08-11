import { createContext } from "react"
import { HttpTypes } from "@medusajs/types"

// Re-export the type for convenience
export type ViewConfiguration = HttpTypes.AdminViewConfiguration

export interface ViewConfigurationContextValue {
  // Feature flag state
  isViewConfigEnabled: boolean
  
  // Common error handler that shows toasts
  handleError: (error: Error, message?: string) => void
  
  // Check if default view is active (for UI state)
  isDefaultViewActive: (entity: string) => boolean
}

export const ViewConfigurationContext = createContext<ViewConfigurationContextValue | null>(null)