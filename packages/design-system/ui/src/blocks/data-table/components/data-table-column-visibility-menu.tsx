"use client"

import * as React from "react"
import { Column } from "@tanstack/react-table"

import { Button } from "@/components/button"
import { Checkbox } from "@/components/checkbox"
import { DropdownMenu } from "@/components/dropdown-menu"
import { Adjustments } from "@medusajs/icons"
import { clx } from "@/utils/clx"

import { useDataTableContext } from "../context/use-data-table-context"

interface DataTableColumnVisibilityMenuProps {
  className?: string
}

const DataTableColumnVisibilityMenu = ({
  className,
}: DataTableColumnVisibilityMenuProps) => {
  const { instance, enableColumnVisibility } = useDataTableContext()

  if (!enableColumnVisibility) {
    return null
  }

  const columns = instance
    .getAllColumns()
    .filter((column) => column.getCanHide())

  const handleToggleColumn = (column: Column<any, any>) => {
    column.toggleVisibility()
  }

  const handleToggleAll = (value: boolean) => {
    instance.setColumnVisibility(
      Object.fromEntries(
        columns.map((column: Column<any, any>) => [column.id, value])
      )
    )
  }

  const allColumnsVisible = columns.every((column: Column<any, any>) => column.getIsVisible())
  const someColumnsVisible = columns.some((column: Column<any, any>) => column.getIsVisible())

  return (
    <DropdownMenu>
      <DropdownMenu.Trigger asChild>
        <Button
          variant="secondary"
          size="small"
          className={clx(
            "gap-x-1.5 px-2.5 py-1.5",
            "text-ui-fg-muted hover:text-ui-fg-base",
            "transition-fg",
            className
          )}
        >
          <Adjustments />
          Columns
        </Button>
      </DropdownMenu.Trigger>
      <DropdownMenu.Content align="end" className="w-[200px]">
        <DropdownMenu.Label>Toggle columns</DropdownMenu.Label>
        <DropdownMenu.Separator />
        <DropdownMenu.Item
          onSelect={(e: Event) => {
            e.preventDefault()
            handleToggleAll(!allColumnsVisible)
          }}
        >
          <Checkbox checked={allColumnsVisible} />
          <span className="ml-2">Toggle all</span>
        </DropdownMenu.Item>
        <DropdownMenu.Separator />
        {columns.map((column: Column<any, any>) => {
          return (
            <DropdownMenu.Item
              key={column.id}
              onSelect={(e: Event) => {
                e.preventDefault()
                handleToggleColumn(column)
              }}
            >
              <Checkbox checked={column.getIsVisible()} />
              <span className="ml-2 truncate">
                {(column.columnDef.meta as any)?.name || column.id}
              </span>
            </DropdownMenu.Item>
          )
        })}
      </DropdownMenu.Content>
    </DropdownMenu>
  )
}

export { DataTableColumnVisibilityMenu }
export type { DataTableColumnVisibilityMenuProps }