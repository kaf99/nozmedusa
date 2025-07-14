import { Container } from "@medusajs/ui"
import { keepPreviousData } from "@tanstack/react-query"
import { useTranslation } from "react-i18next"
import { useMemo, useState, useEffect, useCallback } from "react"
import { createColumnHelper } from "@tanstack/react-table"
import { HttpTypes } from "@medusajs/types"

import { DataTable } from "../../../../../components/data-table"
import { useOrders } from "../../../../../hooks/api/orders"
import { useOrderColumns } from "../../../../../hooks/api/views"
import { useOrderTableFilters } from "../../../../../hooks/table/filters/use-order-table-filters"
import { useOrderTableQuery } from "../../../../../hooks/table/query/use-order-table-query"

import { DEFAULT_FIELDS, DEFAULT_PROPERTIES, DEFAULT_RELATIONS } from "../../const"

const PAGE_SIZE = 20

const columnHelper = createColumnHelper<HttpTypes.AdminOrder>()

// Helper function to get nested value from object using dot notation
const getNestedValue = (obj: any, path: string) => {
  return path.split('.').reduce((current, key) => current?.[key], obj)
}

export const OrderListTable = () => {
  const { t } = useTranslation()
  const { searchParams, raw } = useOrderTableQuery({
    pageSize: PAGE_SIZE,
  })

  const filters = useOrderTableFilters()
  const { columns: apiColumns, isLoading: isLoadingColumns } = useOrderColumns()
  
  // Track which relationship fields are currently visible/needed
  const [visibleColumns, setVisibleColumns] = useState<Record<string, boolean>>({})
  
  // Calculate required fields based on visible columns
  const requiredFields = useMemo(() => {
    if (!apiColumns?.length) return DEFAULT_FIELDS
    
    // Get all visible columns (both relationship and direct fields)
    // If visibleColumns is empty, fall back to default_visible from API
    const visibleFields = apiColumns
      .filter(column => {
        // If visibleColumns has data, use it; otherwise use default_visible
        if (Object.keys(visibleColumns).length > 0) {
          return visibleColumns[column.field] === true
        }
        return column.default_visible
      })
      .map(column => column.field)
    
    // Separate relationship fields from direct fields
    const visibleRelationshipFields = visibleFields.filter(field => field.includes('.'))
    const visibleDirectFields = visibleFields.filter(field => !field.includes('.'))
    
    // Check which relationship fields need to be added
    const additionalRelationshipFields = visibleRelationshipFields.filter(field => {
      const [relationName] = field.split('.')
      const isAlreadyCovered = DEFAULT_RELATIONS.some(rel => 
        rel === `*${relationName}` || rel === relationName
      )
      return !isAlreadyCovered
    })
    
    // Check which direct fields need to be added
    const additionalDirectFields = visibleDirectFields.filter(field => {
      const isAlreadyIncluded = DEFAULT_PROPERTIES.includes(field)
      return !isAlreadyIncluded
    })
    
    // Combine all additional fields
    const additionalFields = [...additionalRelationshipFields, ...additionalDirectFields]
    
    // Debug logging
    console.log('🔍 Column Debug:', {
      visibleFields,
      additionalDirectFields,
      additionalRelationshipFields,
      additionalFields,
      visibleColumnsState: visibleColumns
    })
    
    // Combine default fields with additional needed fields
    if (additionalFields.length > 0) {
      const finalFields = `${DEFAULT_FIELDS},${additionalFields.join(',')}`
      console.log('📊 Final Fields:', finalFields)
      return finalFields
    }
    
    return DEFAULT_FIELDS
  }, [apiColumns, visibleColumns])

  const { orders, count, isError, error, isLoading } = useOrders(
    {
      fields: requiredFields,
      ...searchParams,
    },
    {
      placeholderData: keepPreviousData,
    }
  )

  // Create table columns dynamically from API data
  const columns = useMemo(() => {
    if (!apiColumns?.length) {
      return []
    }

    return apiColumns.map(apiColumn => {
      return columnHelper.accessor((row) => getNestedValue(row, apiColumn.field), {
        id: apiColumn.field,
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

  // Handle column visibility changes
  const handleColumnVisibilityChange = useCallback((visibility: Record<string, boolean>) => {
    setVisibleColumns(visibility)
  }, [])

  // Initialize visible columns when API columns are loaded
  useEffect(() => {
    if (apiColumns?.length && Object.keys(visibleColumns).length === 0) {
      const initialVisibility: Record<string, boolean> = {}
      apiColumns.forEach(column => {
        initialVisibility[column.field] = column.default_visible
      })
      setVisibleColumns(initialVisibility)
    }
  }, [apiColumns, visibleColumns])

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
        onColumnVisibilityChange={handleColumnVisibilityChange}
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
