import { Container, Button } from "@medusajs/ui"
import { useTranslation } from "react-i18next"
import React, { useEffect, useState, useMemo, useCallback } from "react"
import { HttpTypes } from "@medusajs/types"
import { useSearchParams } from "react-router-dom"

import { DataTable } from "../../../../../components/data-table"
import { useFeatureFlag } from "../../../../../providers/feature-flag-provider"
import { useViewConfiguration } from "../../../../../providers/view-configuration-provider"
import { OrderListTableLegacy } from "./order-list-table-legacy"
import { OrderListTableLoading } from "./components/order-list-table-loading"
import { SaveViewDropdown } from "./components/save-view-dropdown"

// Custom hooks
import { useColumnState } from "./hooks/use-column-state"
import { useRequiredFields } from "./hooks/use-required-fields"
import { useOrderTableColumns } from "./hooks/use-order-table-columns"
import { useOrderListData } from "./hooks/use-order-list-data"
import { useOrderDataTableFilters } from "./hooks/use-order-data-table-filters"
import { useQueryParams } from "../../../../../hooks/use-query-params"

// Constants
import { PAGE_SIZE, QUERY_PREFIX } from "./constants"

// Utils
import { getInitialColumnVisibility, getInitialColumnOrder } from "./utils/column-utils"

// Helper function to parse sorting state
function parseSortingState(value: string) {
  return value.startsWith("-")
    ? { id: value.slice(1), desc: true }
    : { id: value, desc: false }
}

export const OrderListTable = () => {
  const { t } = useTranslation()
  const isViewConfigEnabled = useFeatureFlag("view_configurations")

  // If feature flag is disabled, use legacy table
  if (!isViewConfigEnabled) {
    return <OrderListTableLegacy />
  }

  const renderCount = React.useRef(0)
  renderCount.current += 1
  console.log("Rendering OrderListTable", renderCount.current, "times")

  const { activeViews } = useViewConfiguration()

  // Track if we're transitioning between views
  const [isTransitioningView, setIsTransitioningView] = useState(false)

  // Get filters
  const filters = useOrderDataTableFilters()

  // Get active view
  const activeView = activeViews.get("orders") || null

  // Get current query params
  const queryParams = useQueryParams(
    ["q", "order", ...filters.map(f => f.id)],
    QUERY_PREFIX
  )

  // Get setSearchParams hook early so it can be used in handleViewChange
  const [_, setSearchParams] = useSearchParams()

  // First, fetch initial data to get API columns
  const initialData = useOrderListData("")
  const { columns: apiColumns } = initialData

  // Manage column state with API columns and active view
  const {
    visibleColumns,
    columnOrder,
    currentColumns,
    setColumnOrder,
    handleColumnVisibilityChange,
    handleViewChange: originalHandleViewChange,
    initializeColumns,
  } = useColumnState(apiColumns, activeView)

  // Wrap handleViewChange to manage transition state and apply view configuration
  const handleViewChange = useCallback((view: ViewConfiguration | null, columns: HttpTypes.AdminViewColumn[]) => {
    setIsTransitioningView(true)
    originalHandleViewChange(view, columns)
    
    // Apply the view's filters, sorting, and search to URL params
    setSearchParams((prev) => {
      // Clear all existing parameters with the prefix
      const keysToDelete = Array.from(prev.keys()).filter(key =>
        key.startsWith(QUERY_PREFIX + "_") || key === QUERY_PREFIX + "_q" || key === QUERY_PREFIX + "_order"
      )
      keysToDelete.forEach(key => prev.delete(key))
      
      if (view) {
        // Apply view's configuration
        const viewConfig = view.configuration
        
        // Apply filters
        if (viewConfig.filters) {
          Object.entries(viewConfig.filters).forEach(([key, value]) => {
            prev.set(`${QUERY_PREFIX}_${key}`, JSON.stringify(value))
          })
        }
        
        // Apply sorting
        if (viewConfig.sorting) {
          const sortValue = viewConfig.sorting.desc 
            ? `-${viewConfig.sorting.id}` 
            : viewConfig.sorting.id
          prev.set(`${QUERY_PREFIX}_order`, sortValue)
        }
        
        // Apply search
        if (viewConfig.search) {
          prev.set(`${QUERY_PREFIX}_q`, viewConfig.search)
        }
      }
      
      return prev
    })
    
    // Clear transition state after a short delay to allow state to settle
    setTimeout(() => setIsTransitioningView(false), 100)
  }, [originalHandleViewChange, setSearchParams])

  // Calculate required fields based on visible columns
  const requiredFields = useRequiredFields(apiColumns, visibleColumns)

  // Fetch data with proper fields
  const {
    orders,
    count,
    isLoading,
    isLoadingColumns,
    isError,
    error,
  } = useOrderListData(requiredFields)

  // Create table columns
  const columns = useOrderTableColumns(apiColumns)

  // Debounced state for configuration changes
  const [debouncedHasConfigChanged, setDebouncedHasConfigChanged] = useState(false)

  // Check if configuration has diverged from the active view
  const hasConfigurationChanged = React.useMemo(() => {
    // Get current state
    const currentFilters = {}
    filters.forEach(filter => {
      if (queryParams[filter.id] !== undefined) {
        currentFilters[filter.id] = JSON.parse(queryParams[filter.id])
      }
    })

    const currentSorting = queryParams.order ? parseSortingState(queryParams.order) : null
    const currentSearch = queryParams.q || ""
    const currentVisibleColumns = Object.entries(visibleColumns)
      .filter(([_, isVisible]) => isVisible)
      .map(([field]) => field)
      .sort()

    if (activeView) {
      // Compare against active view configuration
      const viewFilters = activeView.configuration.filters || {}
      const viewSorting = activeView.configuration.sorting
      const viewSearch = activeView.configuration.search || ""
      const viewVisibleColumns = [...(activeView.configuration.visible_columns || [])].sort()
      const viewColumnOrder = activeView.configuration.column_order || []

      // Check filters
      const filterKeys = new Set([...Object.keys(currentFilters), ...Object.keys(viewFilters)])
      for (const key of filterKeys) {
        if (JSON.stringify(currentFilters[key]) !== JSON.stringify(viewFilters[key])) {
          return true
        }
      }

      // Check sorting - treat null and undefined as equivalent (no sorting)
      const normalizedCurrentSorting = currentSorting || undefined
      const normalizedViewSorting = viewSorting || undefined
      if (JSON.stringify(normalizedCurrentSorting) !== JSON.stringify(normalizedViewSorting)) {
        return true
      }

      // Check search
      if (currentSearch !== viewSearch) {
        return true
      }

      // Check visible columns
      if (JSON.stringify(currentVisibleColumns) !== JSON.stringify(viewVisibleColumns)) {
        return true
      }

      // Check column order
      if (JSON.stringify(columnOrder) !== JSON.stringify(viewColumnOrder)) {
        return true
      }
    } else {
      // No active view - check if we have any non-default state
      if (Object.keys(currentFilters).length > 0) return true
      if (currentSorting !== null) return true
      if (currentSearch !== "") return true

      // Check if columns differ from defaults
      if (apiColumns) {
        // Get default configurations using the same utility functions used for initialization
        const defaultVisibility = getInitialColumnVisibility(apiColumns)
        const defaultOrder = getInitialColumnOrder(apiColumns)

        // Get default visible columns (sorted for comparison)
        const defaultVisibleColumns = Object.entries(defaultVisibility)
          .filter(([_, isVisible]) => isVisible)
          .map(([field]) => field)
          .sort()

        // Check if visible columns differ from defaults
        if (JSON.stringify(currentVisibleColumns) !== JSON.stringify(defaultVisibleColumns)) {
          return true
        }

        // Check if column order differs from defaults
        if (JSON.stringify(columnOrder) !== JSON.stringify(defaultOrder)) {
          return true
        }
      }
    }

    return false
  }, [activeView, visibleColumns, columnOrder, filters, queryParams, apiColumns])

  // Debounce the configuration changed state
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedHasConfigChanged(hasConfigurationChanged && !isTransitioningView)
    }, 50)

    return () => clearTimeout(timer)
  }, [hasConfigurationChanged, isTransitioningView])

  // Handler to reset configuration back to active view
  const handleClearConfiguration = React.useCallback(() => {
    if (activeView) {
      // Reset to active view's configuration
      handleViewChange(activeView, apiColumns)

      // Apply the view's filters, sorting, and search from its configuration
      setSearchParams((prev) => {
        // Clear all existing parameters with the prefix
        const keysToDelete = Array.from(prev.keys()).filter(key =>
          key.startsWith(QUERY_PREFIX + "_") || key === QUERY_PREFIX + "_q" || key === QUERY_PREFIX + "_order"
        )
        keysToDelete.forEach(key => prev.delete(key))

        // Apply view's configuration
        const viewConfig = activeView.configuration

        // Apply filters
        if (viewConfig.filters) {
          Object.entries(viewConfig.filters).forEach(([key, value]) => {
            prev.set(`${QUERY_PREFIX}_${key}`, JSON.stringify(value))
          })
        }

        // Apply sorting
        if (viewConfig.sorting) {
          const sortValue = viewConfig.sorting.desc
            ? `-${viewConfig.sorting.id}`
            : viewConfig.sorting.id
          prev.set(`${QUERY_PREFIX}_order`, sortValue)
        }

        // Apply search
        if (viewConfig.search) {
          prev.set(`${QUERY_PREFIX}_q`, viewConfig.search)
        }

        return prev
      })
    } else {
      // No active view - clear all configuration including URL params
      handleViewChange(null, apiColumns)

      // Clear all query parameters
      setSearchParams((prev) => {
        // Remove all parameters with our prefix
        const keysToDelete = Array.from(prev.keys()).filter(key =>
          key.startsWith(QUERY_PREFIX + "_") || key === QUERY_PREFIX + "_q" || key === QUERY_PREFIX + "_order"
        )
        keysToDelete.forEach(key => prev.delete(key))
        return prev
      })
    }
  }, [activeView, apiColumns, handleViewChange, setSearchParams])

  // Get current configuration for save button
  const currentConfiguration = useMemo(() => {
    const currentFilters = {}
    filters.forEach(filter => {
      if (queryParams[filter.id] !== undefined) {
        currentFilters[filter.id] = JSON.parse(queryParams[filter.id])
      }
    })

    return {
      filters: currentFilters,
      sorting: queryParams.order ? parseSortingState(queryParams.order) : null,
      search: queryParams.q || "",
    }
  }, [filters, queryParams])

  // Create filter bar content - use debounced state to prevent flashing
  const filterBarContent = debouncedHasConfigChanged ? (
    <>
      <Button
        variant="secondary"
        size="small"
        type="button"
        onClick={handleClearConfiguration}
      >
        {t("general.clear")}
      </Button>
      <SaveViewDropdown
        entity="orders"
        isDefaultView={!activeView}
        currentViewId={activeView?.id}
        currentViewName={activeView?.name}
        currentColumns={currentColumns}
        currentConfiguration={currentConfiguration}
      />
    </>
  ) : null

  // Handle errors after all hooks
  if (isError) {
    throw error
  }

  // Show loading state after all hooks
  if (isLoadingColumns || !columns.length) {
    return <OrderListTableLoading />
  }

  return (
    <Container className="divide-y p-0">
      <DataTable
        data={orders}
        columns={columns}
        heading={t("orders.domain")}
        rowCount={count}
        getRowId={(row) => row.id}
        rowHref={(row) => `/orders/${row.id}`}
        filters={filters}
        enableSearch
        enablePagination
        enableColumnVisibility
        initialColumnVisibility={visibleColumns}
        onColumnVisibilityChange={handleColumnVisibilityChange}
        columnOrder={columnOrder}
        onColumnOrderChange={setColumnOrder}
        enableViewSelector
        entity="orders"
        onViewChange={(view) => {
          handleViewChange(view, apiColumns)
        }}
        currentColumns={currentColumns}
        filterBarContent={filterBarContent}
        isLoading={isLoading}
        pageSize={PAGE_SIZE}
        emptyState={{
          empty: {
            heading: t("orders.domain"),
            description: t("orders.list.noRecordsMessage"),
          },
          filtered: {
            heading: t("general.noResultsTitle"),
            description: t("general.noResultsMessage"),
          },
        }}
        prefix={QUERY_PREFIX}
      />
    </Container>
  )
}
