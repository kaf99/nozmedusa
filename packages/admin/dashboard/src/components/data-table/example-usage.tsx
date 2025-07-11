import { Container } from "@medusajs/ui"
import { keepPreviousData } from "@tanstack/react-query"
import { useTranslation } from "react-i18next"

import { DataTableWithCustomColumns } from "./data-table-with-custom-columns"
import { useOrders } from "../../hooks/api/orders"
import { useOrderColumns } from "../../hooks/api/views"
import { useOrderTableColumns } from "../../hooks/table/columns/use-order-table-columns"
import { useOrderTableFilters } from "../../hooks/table/filters/use-order-table-filters"
import { useOrderTableQuery } from "../../hooks/table/query/use-order-table-query"

const PAGE_SIZE = 20

/**
 * Example usage of DataTableWithCustomColumns with custom column visibility
 * 
 * This example shows how to:
 * 1. Use the custom DataTable component
 * 2. Integrate with the column visibility API (useOrderColumns)
 * 3. Handle saving column preferences
 */
export const OrderListTableWithCustomColumns = () => {
  const { t } = useTranslation()
  const { searchParams, raw } = useOrderTableQuery({
    pageSize: PAGE_SIZE,
  })

  const { orders, count, isError, error, isLoading } = useOrders(
    {
      fields: "*",
      ...searchParams,
    },
    {
      placeholderData: keepPreviousData,
    }
  )

  // Get column metadata from API
  const { columns: apiColumns, isLoading: apiColumnsLoading } = useOrderColumns()

  const filters = useOrderTableFilters()
  const columns = useOrderTableColumns({})

  const handleSaveColumns = (visibleColumns: string[]) => {
    // Here you would implement the logic to save column preferences
    // This could be:
    // 1. Save to local storage
    localStorage.setItem('order-visible-columns', JSON.stringify(visibleColumns))
    
    // 2. Save to user preferences API
    // await sdk.admin.users.updatePreferences({ 
    //   visibleColumns: { orders: visibleColumns } 
    // })
    
    // 3. Save to a custom view API
    // await sdk.admin.views.updateColumns('orders', visibleColumns)
    
    console.log('Saving visible columns:', visibleColumns)
  }

  if (isError) {
    throw error
  }

  return (
    <Container className="divide-y p-0">
      <DataTableWithCustomColumns
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
        isLoading={isLoading}
        pageSize={PAGE_SIZE}
        emptyState={{
          heading: t("orders.list.noRecordsMessage"),
        }}
        prefix="o"
        // Custom column visibility props
        apiColumns={apiColumns}
        apiColumnsLoading={apiColumnsLoading}
        onSaveColumns={handleSaveColumns}
      />
    </Container>
  )
}

/**
 * Alternative approach: Create a hook for column visibility management
 */
export const useColumnVisibilityManager = (entity: string) => {
  const storageKey = `${entity}-visible-columns`
  
  // Load saved column visibility from local storage
  const getSavedColumnVisibility = () => {
    const saved = localStorage.getItem(storageKey)
    if (saved) {
      try {
        return JSON.parse(saved)
      } catch {
        return null
      }
    }
    return null
  }
  
  // Save column visibility to local storage
  const saveColumnVisibility = (columns: string[]) => {
    localStorage.setItem(storageKey, JSON.stringify(columns))
  }
  
  // Get initial column visibility state for table
  const getInitialVisibility = (columns: any[]) => {
    const saved = getSavedColumnVisibility()
    if (!saved) {
      return {}
    }
    
    // Create visibility state object
    const visibility: Record<string, boolean> = {}
    columns.forEach((column) => {
      if (column.id && column.getCanHide?.()) {
        visibility[column.id] = saved.includes(column.id)
      }
    })
    
    return visibility
  }
  
  return {
    getSavedColumnVisibility,
    saveColumnVisibility,
    getInitialVisibility,
  }
}