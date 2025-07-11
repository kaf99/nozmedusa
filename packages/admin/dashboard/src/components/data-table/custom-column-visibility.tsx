import { Button, Checkbox, DropdownMenu } from "@medusajs/ui"
import { Adjustments, Spinner } from "@medusajs/icons"
import { Table as ReactTable } from "@tanstack/react-table"
import { useTranslation } from "react-i18next"
import { useState, useEffect } from "react"

interface CustomColumnVisibilityProps<TData> {
  table: ReactTable<TData>
  apiColumns?: Array<{ id: string; name: string }>
  isLoading?: boolean
  onSaveColumns?: (columns: string[]) => void
}

export const CustomColumnVisibility = <TData,>({
  table,
  apiColumns,
  isLoading = false,
  onSaveColumns,
}: CustomColumnVisibilityProps<TData>) => {
  const { t } = useTranslation()
  const [open, setOpen] = useState(false)

  const columns = table
    .getAllColumns()
    .filter((column) => column.getCanHide())

  if (columns.length === 0) {
    return null
  }

  const handleToggleColumn = (columnId: string) => {
    const column = table.getColumn(columnId)
    if (column) {
      column.toggleVisibility()
      
      // Save column visibility state if callback provided
      if (onSaveColumns) {
        const visibleColumns = table
          .getAllColumns()
          .filter((col) => col.getIsVisible() && col.getCanHide())
          .map((col) => col.id)
        onSaveColumns(visibleColumns)
      }
    }
  }

  const handleToggleAll = (value: boolean) => {
    table.setColumnVisibility(
      Object.fromEntries(
        columns.map((column) => [column.id, value])
      )
    )
    
    // Save column visibility state if callback provided
    if (onSaveColumns) {
      const visibleColumns = value 
        ? columns.map((col) => col.id)
        : []
      onSaveColumns(visibleColumns)
    }
  }

  const allColumnsVisible = columns.every((column) => 
    column.getIsVisible()
  )
  const someColumnsVisible = columns.some((column) => 
    column.getIsVisible()
  )

  const getColumnLabel = (columnId: string) => {
    // First check API columns
    const apiColumn = apiColumns?.find(c => c.id === columnId)
    if (apiColumn) {
      return apiColumn.name
    }
    
    // Then check column meta
    const column = table.getColumn(columnId)
    const meta = column?.columnDef.meta as any
    if (meta?.name) {
      return meta.name
    }
    
    // Fall back to column ID
    return columnId
  }

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenu.Trigger asChild>
        <Button
          variant="secondary"
          size="small"
          className="gap-x-1.5"
        >
          <Adjustments />
          {t("general.columns")}
        </Button>
      </DropdownMenu.Trigger>
      <DropdownMenu.Content align="end" className="min-w-[200px]">
        <DropdownMenu.Label>{t("general.toggleColumns")}</DropdownMenu.Label>
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
                  checked={allColumnsVisible}
                  indeterminate={someColumnsVisible && !allColumnsVisible}
                />
                <span>{t("general.toggleAll")}</span>
              </div>
            </DropdownMenu.Item>
            <DropdownMenu.Separator />
            <div className="max-h-[300px] overflow-y-auto">
              {columns.map((column) => {
                return (
                  <DropdownMenu.Item
                    key={column.id}
                    onSelect={(e: Event) => {
                      e.preventDefault()
                      handleToggleColumn(column.id)
                    }}
                  >
                    <div className="flex items-center gap-x-2">
                      <Checkbox checked={column.getIsVisible()} />
                      <span className="truncate">
                        {getColumnLabel(column.id)}
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