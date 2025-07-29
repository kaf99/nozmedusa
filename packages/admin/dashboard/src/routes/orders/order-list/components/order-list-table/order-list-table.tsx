import { Container, Button } from "@medusajs/ui"
import { useTranslation } from "react-i18next"
import React, { useEffect, useState, useMemo } from "react"

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

  const { activeViews } = useViewConfiguration()

  // Get filters
  const filters = useOrderDataTableFilters()
  
  // Get active view
  const activeView = activeViews.get("orders") || null

  // Get current query params
  const queryParams = useQueryParams(
    ["q", "order", ...filters.map(f => f.id)],
    QUERY_PREFIX
  )
  
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
  
  // Use the original handleViewChange directly
  const handleViewChange = originalHandleViewChange

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
  
  // Handler to reset configuration back to active view
  const handleClearConfiguration = React.useCallback(() => {
    if (activeView) {
      // Reset to active view's configuration
      handleViewChange(activeView, apiColumns)
    } else {
      // No active view - clear all configuration
      handleViewChange(null, apiColumns)
    }
  }, [activeView, apiColumns, handleViewChange])
  
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
  
  // Create filter bar content
  const filterBarContent = hasConfigurationChanged ? (
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
        onViewChange={(view) => handleViewChange(view, apiColumns)}
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
