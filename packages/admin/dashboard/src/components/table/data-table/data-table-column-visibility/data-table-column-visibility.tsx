import { Button, Checkbox, DropdownMenu } from "@medusajs/ui"
import { Adjustments, Spinner } from "@medusajs/icons"
import { Table as ReactTable, Column } from "@tanstack/react-table"
import { useEntityColumns } from "../../../../hooks/api"
import { useState, useCallback } from "react"
import { toast } from "@medusajs/ui"

interface DataTableColumnVisibilityProps<TData> {
  table: ReactTable<TData>
  entity?: string
}

export const DataTableColumnVisibility = <TData,>({
  table,
  entity = "orders",
}: DataTableColumnVisibilityProps<TData>) => {
  const { columns: apiColumns, isLoading } = useEntityColumns(entity)
  const [isSaving, setIsSaving] = useState(false)

  const columns = table
    .getAllColumns()
    .filter((column: Column<TData, any>) => column.getCanHide())

  if (columns.length === 0) {
    return null
  }

  // Save column visibility to the backend
  const saveColumnVisibility = useCallback(async () => {
    try {
      setIsSaving(true)
      const visibleColumns = columns
        .filter((column) => column.getIsVisible())
        .map((column) => column.id)

      // Make a direct API call to save column visibility
      const response = await fetch(`/admin/views/${entity}/columns`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          // Auth is handled by session cookies
        },
        credentials: "include",
        body: JSON.stringify({
          visible_columns: visibleColumns,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to save column visibility")
      }

      toast.success("Column preferences saved")
    } catch (error) {
      toast.error("Failed to save column preferences")
    } finally {
      setIsSaving(false)
    }
  }, [columns, entity])

  const handleToggleColumn = (column: Column<TData, any>) => {
    column.toggleVisibility()
    // Debounce the save operation
    setTimeout(() => saveColumnVisibility(), 500)
  }

  const handleToggleAll = (value: boolean) => {
    table.setColumnVisibility(
      Object.fromEntries(
        columns.map((column: Column<TData, any>) => [column.id, value])
      )
    )
    // Debounce the save operation
    setTimeout(() => saveColumnVisibility(), 500)
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