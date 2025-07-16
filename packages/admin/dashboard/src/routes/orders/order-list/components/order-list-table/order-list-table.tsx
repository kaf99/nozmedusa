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
import { getDisplayStrategy, getEntityAccessor } from "../../../../../components/data-table/display-strategies"

import { DEFAULT_FIELDS, DEFAULT_PROPERTIES, DEFAULT_RELATIONS } from "../../const"

const PAGE_SIZE = 20

const columnHelper = createColumnHelper<HttpTypes.AdminOrder>()

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
    
    // Get all visible columns
    // If visibleColumns is empty, fall back to default_visible from API
    const visibleColumnObjects = apiColumns.filter(column => {
      // If visibleColumns has data, use it; otherwise use default_visible
      if (Object.keys(visibleColumns).length > 0) {
        return visibleColumns[column.field] === true
      }
      return column.default_visible
    })
    
    // Collect all required fields from visible columns
    const requiredFieldsSet = new Set<string>()
    
    visibleColumnObjects.forEach(column => {
      if (column.computed) {
        // For computed columns, add all required and optional fields
        column.computed.required_fields?.forEach(field => requiredFieldsSet.add(field))
        column.computed.optional_fields?.forEach(field => requiredFieldsSet.add(field))
      } else if (!column.field.includes('.')) {
        // Direct field
        requiredFieldsSet.add(column.field)
      } else {
        // Relationship field
        requiredFieldsSet.add(column.field)
      }
    })
    
    // Separate relationship fields from direct fields
    const allRequiredFields = Array.from(requiredFieldsSet)
    const visibleRelationshipFields = allRequiredFields.filter(field => field.includes('.'))
    const visibleDirectFields = allRequiredFields.filter(field => !field.includes('.'))
    
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
      visibleColumnObjects,
      requiredFieldsSet: Array.from(requiredFieldsSet),
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
      // Get the display strategy for this column
      const displayStrategy = getDisplayStrategy(apiColumn)
      
      // Get the entity-specific accessor or use default
      const accessor = getEntityAccessor('orders', apiColumn.field, apiColumn)
      
      return columnHelper.accessor(accessor, {
        id: apiColumn.field,
        header: () => apiColumn.name,
        cell: ({ getValue, row }) => {
          const value = getValue()
          
          // Use the display strategy to format the value
          return displayStrategy(value, row.original)
        },
        meta: {
          name: apiColumn.name,
          column: apiColumn, // Store column metadata for future use
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
