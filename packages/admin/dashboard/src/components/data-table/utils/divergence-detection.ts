import type { 
  DataTableFilteringState, 
  DataTableSortingState,
  VisibilityState,
} from "@medusajs/ui"
import { BaseViewConfiguration, DataTableDivergenceState } from "../types"

/**
 * Deep equality check for objects
 */
function deepEqual(obj1: any, obj2: any): boolean {
  if (obj1 === obj2) return true
  if (obj1 == null || obj2 == null) return false
  if (typeof obj1 !== "object" || typeof obj2 !== "object") return false
  
  const keys1 = Object.keys(obj1)
  const keys2 = Object.keys(obj2)
  
  if (keys1.length !== keys2.length) return false
  
  for (const key of keys1) {
    if (!keys2.includes(key)) return false
    if (!deepEqual(obj1[key], obj2[key])) return false
  }
  
  return true
}

/**
 * Check if filters have diverged from base
 */
function checkFiltersDivergence(
  current: DataTableFilteringState,
  base: DataTableFilteringState = {}
): boolean {
  return !deepEqual(current, base)
}

/**
 * Check if sorting has diverged from base
 */
function checkSortingDivergence(
  current: DataTableSortingState | null,
  base: DataTableSortingState | null = null
): boolean {
  if (current === base) return false
  if (!current || !base) return current !== base
  return current.id !== base.id || current.desc !== base.desc
}

/**
 * Check if search has diverged from base
 */
function checkSearchDivergence(
  current: string,
  base: string = ""
): boolean {
  return current !== base
}

/**
 * Check if column visibility has diverged from base
 */
function checkColumnVisibilityDivergence(
  current: VisibilityState,
  base: VisibilityState = {}
): boolean {
  return !deepEqual(current, base)
}

/**
 * Check if column order has diverged from base
 */
function checkColumnOrderDivergence(
  current: string[],
  base: string[] = []
): boolean {
  if (current.length !== base.length) return true
  return !current.every((col, index) => col === base[index])
}

/**
 * Check all divergences between current state and base configuration
 */
export function checkConfigurationDivergence(
  current: {
    filters: DataTableFilteringState
    sorting: DataTableSortingState | null
    search: string
    columnVisibility: VisibilityState
    columnOrder: string[]
  },
  base?: BaseViewConfiguration
): DataTableDivergenceState {
  const divergence: DataTableDivergenceState = {
    filters: checkFiltersDivergence(current.filters, base?.filters),
    sorting: checkSortingDivergence(current.sorting, base?.sorting),
    search: checkSearchDivergence(current.search, base?.search),
    columnVisibility: checkColumnVisibilityDivergence(current.columnVisibility, base?.columnVisibility),
    columnOrder: checkColumnOrderDivergence(current.columnOrder, base?.columnOrder),
    hasAnyDivergence: false,
  }
  
  divergence.hasAnyDivergence = Object.values(divergence).some(v => v === true)
  
  return divergence
}