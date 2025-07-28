import { Container } from "@medusajs/ui"
import { useTranslation } from "react-i18next"
import React, { useEffect } from "react"

import { DataTable } from "../../../../../components/data-table"
import { useFeatureFlag } from "../../../../../providers/feature-flag-provider"
import { OrderListTableLegacy } from "./order-list-table-legacy"
import { OrderListTableLoading } from "./components/order-list-table-loading"

// Custom hooks
import { useColumnState } from "./hooks/use-column-state"
import { useRequiredFields } from "./hooks/use-required-fields"
import { useOrderTableColumns } from "./hooks/use-order-table-columns"
import { useOrderListData } from "./hooks/use-order-list-data"
import { useOrderDataTableFilters } from "./hooks/use-order-data-table-filters"

// Constants
import { PAGE_SIZE, QUERY_PREFIX } from "./constants"

export const OrderListTable = () => {
  const { t } = useTranslation()
  const isViewConfigEnabled = useFeatureFlag("view_configurations")

  // If feature flag is disabled, use legacy table
  if (!isViewConfigEnabled) {
    return <OrderListTableLegacy />
  }

  // Get filters
  const filters = useOrderDataTableFilters()

  // First, fetch initial data to get API columns
  const initialData = useOrderListData("")
  const { columns: apiColumns } = initialData

  // Manage column state with API columns
  const {
    visibleColumns,
    columnOrder,
    currentColumns,
    setColumnOrder,
    handleColumnVisibilityChange,
    handleViewChange,
    initializeColumns,
  } = useColumnState(apiColumns)

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

  // Initialize columns when API data is available
  useEffect(() => {
    if (apiColumns?.length) {
      initializeColumns(apiColumns)
    }
  }, [apiColumns, initializeColumns])

  // Handle errors
  if (isError) {
    throw error
  }

  // Show loading state
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
