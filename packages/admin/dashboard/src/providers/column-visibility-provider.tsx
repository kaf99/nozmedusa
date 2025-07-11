import React, { createContext, useContext, ReactNode } from "react"
import { HttpTypes } from "@medusajs/types"

interface ColumnVisibilityContextValue {
  columns?: HttpTypes.AdminViews.AdminOrderColumn[]
  isLoading: boolean
}

const ColumnVisibilityContext = createContext<ColumnVisibilityContextValue | undefined>(undefined)

export const useColumnVisibility = () => {
  const context = useContext(ColumnVisibilityContext)
  if (!context) {
    return { columns: undefined, isLoading: false }
  }
  return context
}

interface ColumnVisibilityProviderProps {
  children: ReactNode
  columns?: HttpTypes.AdminViews.AdminOrderColumn[]
  isLoading?: boolean
}

export const ColumnVisibilityProvider: React.FC<ColumnVisibilityProviderProps> = ({
  children,
  columns,
  isLoading = false,
}) => {
  return (
    <ColumnVisibilityContext.Provider value={{ columns, isLoading }}>
      {children}
    </ColumnVisibilityContext.Provider>
  )
}