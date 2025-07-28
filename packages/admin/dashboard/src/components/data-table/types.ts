import type { 
  DataTableFilteringState, 
  DataTableSortingState,
  VisibilityState,
} from "@medusajs/ui"

export interface BaseViewConfiguration {
  filters?: DataTableFilteringState
  sorting?: DataTableSortingState | null
  search?: string
  columnVisibility?: VisibilityState
  columnOrder?: string[]
}

export interface DataTableDivergenceState {
  filters: boolean
  sorting: boolean
  search: boolean
  columnVisibility: boolean
  columnOrder: boolean
  hasAnyDivergence: boolean
}