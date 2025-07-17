import * as React from "react"
import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { DotsSix } from "@medusajs/icons"
import { clx } from "@/utils/clx"
import { Table } from "@/components/table"

interface DataTableSortableHeaderCellProps extends React.HTMLAttributes<HTMLTableCellElement> {
  id: string
  children: React.ReactNode
}

export const DataTableSortableHeaderCell = React.forwardRef<
  HTMLTableCellElement,
  DataTableSortableHeaderCellProps
>(({ id, children, className, style: propStyle, ...props }, ref) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id,
  })

  // Only apply horizontal transform, ignore vertical movement
  const transformStyle = transform ? {
    x: transform.x,
    y: 0,
    scaleX: transform.scaleX,
    scaleY: transform.scaleY,
  } : null

  const style: React.CSSProperties = {
    ...propStyle,
    transform: transformStyle ? CSS.Transform.toString(transformStyle) : undefined,
    transition,
    opacity: isDragging ? 0.8 : 1,
    zIndex: isDragging ? 50 : undefined,
    position: 'relative' as const,
    cursor: isDragging ? 'grabbing' : undefined,
  }

  const combineRefs = (element: HTMLTableCellElement | null) => {
    setNodeRef(element)
    if (ref) {
      if (typeof ref === 'function') {
        ref(element)
      } else {
        ref.current = element
      }
    }
  }

  return (
    <Table.HeaderCell
      ref={combineRefs}
      style={style}
      className={clx(className, {
        "cursor-grabbing": isDragging,
      })}
      {...props}
    >
      <div className="group/header-cell flex h-full w-full items-center gap-1">
        <button
          type="button"
          className={clx(
            "flex h-5 w-4 cursor-grab items-center justify-center rounded outline-none",
            "text-ui-text-subtle transition-all",
            "opacity-0 group-hover/header-cell:opacity-100",
            "hover:text-ui-text-base",
            "focus-visible:text-ui-text-base focus-visible:opacity-100 focus-visible:ring-2 focus-visible:ring-ui-focus",
            "disabled:cursor-not-allowed disabled:text-ui-text-disabled",
            {
              "opacity-100": isDragging,
            }
          )}
          {...attributes}
          {...listeners}
        >
          <DotsSix className="h-4 w-4" />
        </button>
        <div className="flex-1">{children}</div>
      </div>
    </Table.HeaderCell>
  )
})

DataTableSortableHeaderCell.displayName = "DataTableSortableHeaderCell"