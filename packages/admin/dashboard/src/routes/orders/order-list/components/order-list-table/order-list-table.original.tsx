import { Container, createDataTableColumnHelper, createDataTableFilterHelper } from "@medusajs/ui"
import { keepPreviousData } from "@tanstack/react-query"
import { useTranslation } from "react-i18next"
import React, { useMemo, useState, useEffect, useCallback } from "react"
import { HttpTypes } from "@medusajs/types"

import { DataTable } from "../../../../../components/data-table"
import { useOrders } from "../../../../../hooks/api/orders"
import { useOrderColumns } from "../../../../../hooks/api/views"
import { useOrderTableQuery } from "../../../../../hooks/table/query/use-order-table-query"
import { getDisplayStrategy, getEntityAccessor } from "../../../../../lib/table-display-utils"
import { ViewConfiguration } from "../../../../../providers/view-configuration-provider"
import { useFeatureFlag } from "../../../../../providers/feature-flag-provider"
import { useDataTableDateFilters } from "../../../../../components/data-table/helpers/general/use-data-table-date-filters"
import { useRegions } from "../../../../../hooks/api/regions"
import { useSalesChannels } from "../../../../../hooks/api/sales-channels"

import { DEFAULT_FIELDS, DEFAULT_PROPERTIES, DEFAULT_RELATIONS } from "../../const"
import { OrderListTableLegacy } from "./order-list-table-legacy"

const PAGE_SIZE = 20

const columnHelper = createDataTableColumnHelper<HttpTypes.AdminOrder>()
const filterHelper = createDataTableFilterHelper<HttpTypes.AdminOrder>()

// Hook to create filters in the format expected by @medusajs/ui DataTable
const useOrderDataTableFilters = () => {
  const { t } = useTranslation()
  const dateFilters = useDataTableDateFilters()

  const { regions } = useRegions({
    limit: 1000,
    fields: "id,name",
  })

  const { sales_channels } = useSalesChannels({
    limit: 1000,
    fields: "id,name",
  })

  return useMemo(() => {
    const filters = [...dateFilters]

    if (regions?.length) {
      filters.push(
        filterHelper.accessor("region_id", {
          label: t("fields.region"),
          type: "multiselect",
          options: regions.map((r) => ({
            label: r.name,
            value: r.id,
          })),
        })
      )
    }

    if (sales_channels?.length) {
      filters.push(
        filterHelper.accessor("sales_channel_id", {
          label: t("fields.salesChannel"),
          type: "multiselect",
          options: sales_channels.map((s) => ({
            label: s.name,
            value: s.id,
          })),
        })
      )
    }

    // TODO: Add payment and fulfillment status filters when they are properly linked to orders
    // Note: These filters are commented out in the legacy implementation as well

    return filters
  }, [regions, sales_channels, dateFilters, t])
}

export const OrderListTable = () => {
  const { t } = useTranslation()
  const isViewConfigEnabled = useFeatureFlag("view_configurations")

  // If feature flag is disabled, use legacy table
  if (!isViewConfigEnabled) {
    return <OrderListTableLegacy />
  }
  const { searchParams, raw } = useOrderTableQuery({
    pageSize: PAGE_SIZE,
    prefix: "o",
  })

  const renderCount = React.useRef(0)
  renderCount.current += 1

  const newFilters = useOrderDataTableFilters()
  const { columns: apiColumns, isLoading: isLoadingColumns } = useOrderColumns()

  // Track which relationship fields are currently visible/needed
  const [visibleColumns, setVisibleColumns] = useState<Record<string, boolean>>({})

  // Track column order
  const [columnOrder, setColumnOrder] = useState<string[]>([])

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

    // Combine default fields with additional needed fields
    if (additionalFields.length > 0) {
      const finalFields = `${DEFAULT_FIELDS},${additionalFields.join(',')}`
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

      // Determine header alignment based on semantic type, context, or data type
      let headerAlign: 'left' | 'center' | 'right' = 'left'

      // Currency columns should be right-aligned
      if (apiColumn.semantic_type === 'currency' || apiColumn.data_type === 'currency') {
        headerAlign = 'right'
      }
      // Number columns should be right-aligned
      else if (apiColumn.data_type === 'number' && apiColumn.context !== 'identifier') {
        headerAlign = 'right'
      }
      // Total/amount/price columns should be right-aligned
      else if (apiColumn.field.includes('total') || apiColumn.field.includes('amount') || apiColumn.field.includes('price')) {
        headerAlign = 'right'
      }
      // Country columns should be center-aligned
      else if (apiColumn.field === 'country' || apiColumn.field.includes('country_code')) {
        headerAlign = 'center'
      }
      // Status columns could be center-aligned
      else if (apiColumn.semantic_type === 'status') {
        headerAlign = 'left' // Keep status left-aligned for consistency with existing tables
      }

      return columnHelper.accessor(accessor, {
        id: apiColumn.field,
        header: () => apiColumn.name,
        cell: ({ getValue, row }) => {
          const value = getValue()

          // If the value is already a React element (from computed columns), return it directly
          if (React.isValidElement(value)) {
            return value
          }

          // Otherwise, use the display strategy to format the value
          return displayStrategy(value, row.original)
        },
        meta: {
          name: apiColumn.name,
          column: apiColumn, // Store column metadata for future use
        },
        enableHiding: apiColumn.hideable,
        enableSorting: apiColumn.sortable,
        headerAlign, // Pass the header alignment to the DataTable
      } as any)
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

  // Handle view configuration changes
  const handleViewChange = useCallback((view: ViewConfiguration | null) => {
    if (view) {
      // Apply view configuration
      const newVisibility: Record<string, boolean> = {}
      apiColumns?.forEach(column => {
        newVisibility[column.field] = view.configuration.visible_columns.includes(column.field)
      })
      setVisibleColumns(newVisibility)
      setColumnOrder(view.configuration.column_order)
    } else {
      // Reset to default visibility when no view is selected
      const defaultVisibility: Record<string, boolean> = {}
      apiColumns?.forEach(column => {
        defaultVisibility[column.field] = column.default_visible
      })
      setVisibleColumns(defaultVisibility)
      // Reset column order to default
      const sortedColumns = [...(apiColumns || [])].sort((a, b) => {
        const orderA = a.default_order ?? 500
        const orderB = b.default_order ?? 500
        return orderA - orderB
      })
      setColumnOrder(sortedColumns.map(col => col.field))
    }
  }, [apiColumns])

  // Get current columns state for saving views
  const currentColumns = useMemo(() => {
    const visible = Object.entries(visibleColumns)
      .filter(([_, isVisible]) => isVisible)
      .map(([field]) => field)

    return {
      visible,
      order: columnOrder,
    }
  }, [visibleColumns, columnOrder])

  // Initialize visible columns and column order when API columns are loaded

  useEffect(() => {
    if (apiColumns?.length) {
      if (Object.keys(visibleColumns).length === 0) {
        const initialVisibility: Record<string, boolean> = {}
        apiColumns.forEach(column => {
          initialVisibility[column.field] = column.default_visible
        })
        setVisibleColumns(initialVisibility)
      }

      if (columnOrder.length === 0) {
        // Sort columns by default_order before creating initial order
        const sortedColumns = [...apiColumns].sort((a, b) => {
          const orderA = a.default_order ?? 500
          const orderB = b.default_order ?? 500
          return orderA - orderB
        })
        setColumnOrder(sortedColumns.map(col => col.field))
      }
    }
  }, [apiColumns, visibleColumns, columnOrder])

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
            empty: {
              heading: "Loading columns...",
            },
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
        filters={newFilters}
        enableSearch
        enablePagination
        enableColumnVisibility
        initialColumnVisibility={Object.keys(visibleColumns).length > 0 ? visibleColumns : initialColumnVisibility}
        onColumnVisibilityChange={handleColumnVisibilityChange}
        columnOrder={columnOrder}
        onColumnOrderChange={setColumnOrder}
        enableViewSelector
        entity="orders"
        onViewChange={handleViewChange}
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
        prefix="o"
      />
    </Container>
  )
}
