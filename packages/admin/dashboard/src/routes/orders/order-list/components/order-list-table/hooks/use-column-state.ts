import { useState, useCallback, useMemo } from "react"
import { HttpTypes } from "@medusajs/types"
import { ViewConfiguration } from "../../../../../../providers/view-configuration-provider"
import { ColumnState } from "../constants"
import { getInitialColumnVisibility, getInitialColumnOrder } from "../utils/column-utils"

interface UseColumnStateReturn {
  visibleColumns: Record<string, boolean>
  columnOrder: string[]
  columnState: ColumnState
  currentColumns: {
    visible: string[]
    order: string[]
  }
  setVisibleColumns: (visibility: Record<string, boolean>) => void
  setColumnOrder: (order: string[]) => void
  handleColumnVisibilityChange: (visibility: Record<string, boolean>) => void
  handleViewChange: (view: ViewConfiguration | null, apiColumns: HttpTypes.AdminViewColumn[]) => void
  initializeColumns: (apiColumns: HttpTypes.AdminViewColumn[]) => void
}

export function useColumnState(
  apiColumns: HttpTypes.AdminViewColumn[] | undefined,
  activeView?: ViewConfiguration | null
): UseColumnStateReturn {
  // Initialize state lazily to avoid unnecessary re-renders
  const [visibleColumns, setVisibleColumns] = useState<Record<string, boolean>>(() => {
    if (apiColumns?.length && activeView) {
      // If there's an active view, initialize with its configuration
      const visibility: Record<string, boolean> = {}
      apiColumns.forEach(column => {
        visibility[column.field] = activeView.configuration.visible_columns.includes(column.field)
      })
      return visibility
    } else if (apiColumns?.length) {
      return getInitialColumnVisibility(apiColumns)
    }
    return {}
  })

  const [columnOrder, setColumnOrder] = useState<string[]>(() => {
    if (activeView) {
      // If there's an active view, use its column order
      return activeView.configuration.column_order || []
    } else if (apiColumns?.length) {
      return getInitialColumnOrder(apiColumns)
    }
    return []
  })

  const columnState = useMemo<ColumnState>(() => ({
    visibility: visibleColumns,
    order: columnOrder,
  }), [visibleColumns, columnOrder])

  const currentColumns = useMemo(() => {
    const visible = Object.entries(visibleColumns)
      .filter(([_, isVisible]) => isVisible)
      .map(([field]) => field)

    return {
      visible,
      order: columnOrder,
    }
  }, [visibleColumns, columnOrder])

  const handleColumnVisibilityChange = useCallback((visibility: Record<string, boolean>) => {
    setVisibleColumns(visibility)
  }, [])

  const handleViewChange = useCallback((
    view: ViewConfiguration | null,
    apiColumns: HttpTypes.AdminViewColumn[]
  ) => {
    if (view) {
      // Apply view configuration
      const newVisibility: Record<string, boolean> = {}
      apiColumns.forEach(column => {
        newVisibility[column.field] = view.configuration.visible_columns.includes(column.field)
      })
      setVisibleColumns(newVisibility)
      setColumnOrder(view.configuration.column_order)
    } else {
      // Reset to default visibility when no view is selected
      setVisibleColumns(getInitialColumnVisibility(apiColumns))
      setColumnOrder(getInitialColumnOrder(apiColumns))
    }
  }, [])

  const initializeColumns = useCallback((apiColumns: HttpTypes.AdminViewColumn[]) => {
    // Only initialize if we don't already have column state
    if (Object.keys(visibleColumns).length === 0) {
      setVisibleColumns(getInitialColumnVisibility(apiColumns))
    }
    if (columnOrder.length === 0) {
      setColumnOrder(getInitialColumnOrder(apiColumns))
    }
  }, [])

  return {
    visibleColumns,
    columnOrder,
    columnState,
    currentColumns,
    setVisibleColumns,
    setColumnOrder,
    handleColumnVisibilityChange,
    handleViewChange,
    initializeColumns,
  }
}