import { Container } from "@medusajs/ui"
import { keepPreviousData } from "@tanstack/react-query"
import { useTranslation } from "react-i18next"
import { useMemo } from "react"
import { createColumnHelper } from "@tanstack/react-table"
import { HttpTypes } from "@medusajs/types"

import { DataTable } from "../../../../../components/data-table"
import { useOrders } from "../../../../../hooks/api/orders"
import { useOrderColumns } from "../../../../../hooks/api/views"
import { useOrderTableFilters } from "../../../../../hooks/table/filters/use-order-table-filters"
import { useOrderTableQuery } from "../../../../../hooks/table/query/use-order-table-query"

import { DEFAULT_FIELDS } from "../../const"

const PAGE_SIZE = 20

const columnHelper = createColumnHelper<HttpTypes.AdminOrder>()

export const OrderListTable = () => {
  const { t } = useTranslation()
  const { searchParams, raw } = useOrderTableQuery({
    pageSize: PAGE_SIZE,
  })

  const { orders, count, isError, error, isLoading } = useOrders(
    {
      fields: DEFAULT_FIELDS,
      ...searchParams,
    },
    {
      placeholderData: keepPreviousData,
    }
  )

  const filters = useOrderTableFilters()
  const { columns: apiColumns, isLoading: isLoadingColumns } = useOrderColumns()

  // Create table columns dynamically from API data
  const columns = useMemo(() => {
    if (!apiColumns?.length) {
      return []
    }

    return apiColumns.map(apiColumn => {
      return columnHelper.accessor(apiColumn.field as any, {
        header: () => apiColumn.name,
        cell: ({ getValue }) => {
          const value = getValue()
          
          // Format different data types
          if (apiColumn.data_type === 'date' && value) {
            return new Date(value as string).toLocaleDateString()
          }
          
          if (apiColumn.data_type === 'currency' && typeof value === 'number') {
            return new Intl.NumberFormat('en-US', {
              style: 'currency',
              currency: 'USD'
            }).format(value / 100) // Assuming cents
          }
          
          if (apiColumn.data_type === 'object' && value && typeof value === 'object') {
            // Handle object fields like customer, sales_channel
            if ('name' in value) return value.name
            if ('email' in value) return value.email
            if ('title' in value) return value.title
            return JSON.stringify(value)
          }
          
          return value?.toString() || '-'
        },
        meta: {
          name: apiColumn.name,
        },
        enableHiding: apiColumn.hideable,
        enableSorting: apiColumn.sortable,
      })
    })
  }, [apiColumns])

  // Set initial column visibility based on API default_visible property
  const initialColumnVisibility = useMemo(() => {
    if (!apiColumns?.length) {
      return {}
    }
    
    const visibility: Record<string, boolean> = {}
    apiColumns.forEach(column => {
      visibility[column.field] = column.default_visible
    })
    return visibility
  }, [apiColumns])

  if (isError) {
    throw error
  }

  // Show loading state while columns are being fetched
  if (isLoadingColumns || !columns.length) {
    return (
      <Container className="divide-y p-0">
        <DataTable
          data={[]}
          columns={[]}
          heading={t("orders.domain")}
          rowCount={0}
          getRowId={(row) => row.id}
          isLoading={true}
          pageSize={PAGE_SIZE}
          emptyState={{
            heading: "Loading columns...",
          }}
        />
      </Container>
    )
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
        initialColumnVisibility={initialColumnVisibility}
        isLoading={isLoading}
        pageSize={PAGE_SIZE}
        emptyState={{
          heading: t("orders.list.noRecordsMessage"),
        }}
        prefix="o"
      />
    </Container>
  )
}
