import { Table as ReactTable } from "@tanstack/react-table"
import { Filter } from ".."
import { DataTableColumnVisibility } from "../data-table-column-visibility"
import { DataTableFilter } from "../data-table-filter"
import { DataTableOrderBy, DataTableOrderByKey } from "../data-table-order-by"
import { DataTableSearch } from "../data-table-search"
import { ViewSelector } from "../../view-selector"
import { ViewConfiguration } from "../../../../providers/view-configuration-provider"

export interface DataTableQueryProps<TData> {
  search?: boolean | "autofocus"
  orderBy?: DataTableOrderByKey<TData>[]
  filters?: Filter[]
  prefix?: string
  table?: ReactTable<TData>
  enableColumnVisibility?: boolean
  enableViewSelector?: boolean
  entity?: string
  onViewChange?: (view: ViewConfiguration | null) => void
  currentColumns?: {
    visible: string[]
    order: string[]
  }
}

export const DataTableQuery = <TData,>({
  search,
  orderBy,
  filters,
  prefix,
  table,
  enableColumnVisibility = false,
  enableViewSelector = false,
  entity,
  onViewChange,
  currentColumns,
}: DataTableQueryProps<TData>) => {
  const showQuery = search || orderBy || filters || prefix || 
    (enableColumnVisibility && table) || (enableViewSelector && entity)
    
  return (
    showQuery && (
      <div className="flex items-start justify-between gap-x-4 px-6 py-4">
        <div className="w-full max-w-[60%]">
          {filters && filters.length > 0 && (
            <DataTableFilter filters={filters} prefix={prefix} />
          )}
        </div>
        <div className="flex shrink-0 items-center gap-x-2">
          {search && (
            <DataTableSearch
              prefix={prefix}
              autofocus={search === "autofocus"}
            />
          )}
          {orderBy && <DataTableOrderBy keys={orderBy} prefix={prefix} />}
          {enableViewSelector && entity && (
            <ViewSelector
              entity={entity}
              onViewChange={onViewChange}
              currentColumns={currentColumns}
            />
          )}
          {enableColumnVisibility && table && (
            <DataTableColumnVisibility table={table} entity={entity} />
          )}
        </div>
      </div>
    )
  )
}
