import { Button, Checkbox, DropdownMenu } from "@medusajs/ui"
import { Adjustments, Spinner } from "@medusajs/icons"
import { Table as ReactTable, Column } from "@tanstack/react-table"
import { useOrderColumns } from "../../../../hooks/api"

interface DataTableColumnVisibilityProps<TData> {
  table: ReactTable<TData>
}

export const DataTableColumnVisibility = <TData,>({
  table,
}: DataTableColumnVisibilityProps<TData>) => {
  const { columns: apiColumns, isLoading } = useOrderColumns()

  const columns = table
    .getAllColumns()
    .filter((column: Column<TData, any>) => column.getCanHide())

  if (columns.length === 0) {
    return null
  }

  const handleToggleColumn = (column: Column<TData, any>) => {
    column.toggleVisibility()
  }

  const handleToggleAll = (value: boolean) => {
    table.setColumnVisibility(
      Object.fromEntries(
        columns.map((column: Column<TData, any>) => [column.id, value])
      )
    )
  }

  const allColumnsVisible = columns.every((column: Column<TData, any>) => 
    column.getIsVisible()
  )
  const someColumnsVisible = columns.some((column: Column<TData, any>) => 
    column.getIsVisible()
  )

  return (
    <DropdownMenu>
      <DropdownMenu.Trigger asChild>
        <Button
          variant="secondary"
          size="small"
          className="gap-x-1.5 px-2.5 py-1.5 text-ui-fg-muted hover:text-ui-fg-base transition-fg"
        >
          <Adjustments />
          Columns
        </Button>
      </DropdownMenu.Trigger>
      <DropdownMenu.Content align="end" className="min-w-[200px] max-h-[400px] overflow-hidden">
        <DropdownMenu.Label>Toggle columns</DropdownMenu.Label>
        <DropdownMenu.Separator />
        {isLoading ? (
          <div className="flex items-center justify-center py-6">
            <Spinner className="animate-spin" />
          </div>
        ) : (
          <>
            <DropdownMenu.Item
              onSelect={(e: Event) => {
                e.preventDefault()
                handleToggleAll(!allColumnsVisible)
              }}
            >
              <div className="flex items-center gap-x-2">
                <Checkbox 
                  checked={allColumnsVisible ? true : (someColumnsVisible && !allColumnsVisible) ? "indeterminate" : false}
                />
                <span>Toggle all</span>
              </div>
            </DropdownMenu.Item>
            <DropdownMenu.Separator />
            <div className="max-h-[250px] overflow-y-auto">
              {columns.map((column: Column<TData, any>) => {
                return (
                  <DropdownMenu.Item
                    key={column.id}
                    onSelect={(e: Event) => {
                      e.preventDefault()
                      handleToggleColumn(column)
                    }}
                  >
                    <div className="flex items-center gap-x-2">
                      <Checkbox checked={column.getIsVisible()} />
                      <span className="truncate">
                        {(() => {
                          const apiColumn = apiColumns?.find(c => c.id === column.id)
                          return apiColumn?.name || (column.columnDef.meta as any)?.name || column.id
                        })()}
                      </span>
                    </div>
                  </DropdownMenu.Item>
                )
              })}
            </div>
          </>
        )}
      </DropdownMenu.Content>
    </DropdownMenu>
  )
}