import { Table as ReactTable } from "@tanstack/react-table"
import { Filter } from ".."
import { DataTableColumnVisibility } from "../data-table-column-visibility"
import { DataTableFilter } from "../data-table-filter"
import { DataTableOrderBy, DataTableOrderByKey } from "../data-table-order-by"
import { DataTableSearch } from "../data-table-search"

export interface DataTableQueryProps<TData> {
  search?: boolean | "autofocus"
  orderBy?: DataTableOrderByKey<TData>[]
  filters?: Filter[]
  prefix?: string
  table?: ReactTable<TData>
  enableColumnVisibility?: boolean
}

export const DataTableQuery = <TData,>({
  search,
  orderBy,
  filters,
  prefix,
  table,
  enableColumnVisibility = false,
}: DataTableQueryProps<TData>) => {
  return (
    (search || orderBy || filters || prefix || (enableColumnVisibility && table)) && (
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
          {enableColumnVisibility && table && (
            <DataTableColumnVisibility table={table} />
          )}
        </div>
      </div>
    )
  )
}
