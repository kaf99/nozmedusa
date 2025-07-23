"use client"

import * as React from "react"

import { DataTableFilter } from "@/blocks/data-table/components/data-table-filter"
import { DataTableFilterMenu } from "@/blocks/data-table/components/data-table-filter-menu"
import { useDataTableContext } from "@/blocks/data-table/context/use-data-table-context"
import { Button } from "@/components/button"
import { Skeleton } from "@/components/skeleton"

interface DataTableFilterBarProps {
  clearAllFiltersLabel?: string
  alwaysShow?: boolean
}

interface LocalFilter {
  id: string
  value: unknown
  isNew: boolean
}

const DataTableFilterBar = ({
  clearAllFiltersLabel = "Clear all",
  alwaysShow = false,
}: DataTableFilterBarProps) => {
  const { instance } = useDataTableContext()
  
  // Local state for managing intermediate filters
  const [localFilters, setLocalFilters] = React.useState<LocalFilter[]>([])
  
  const parentFilterState = instance.getFiltering()
  const availableFilters = instance.getFilters()
  
  // Sync parent filters with local state
  React.useEffect(() => {
    const parentIds = Object.keys(parentFilterState)
    const localIds = localFilters.map(f => f.id)
    
    // Remove local filters that have been removed from parent
    const updatedLocalFilters = localFilters.filter(f => 
      parentIds.includes(f.id) || f.isNew
    )
    
    // Add parent filters that don't exist locally
    parentIds.forEach(id => {
      if (!localIds.includes(id)) {
        updatedLocalFilters.push({
          id,
          value: parentFilterState[id],
          isNew: false
        })
      }
    })
    
    if (updatedLocalFilters.length !== localFilters.length) {
      setLocalFilters(updatedLocalFilters)
    }
  }, [parentFilterState])
  
  // Add a new filter locally
  const addLocalFilter = React.useCallback((id: string, value: unknown) => {
    setLocalFilters(prev => [...prev, { id, value, isNew: true }])
  }, [])
  
  // Update a local filter's value
  const updateLocalFilter = React.useCallback((id: string, value: unknown) => {
    setLocalFilters(prev => prev.map(f => 
      f.id === id ? { ...f, value, isNew: false } : f
    ))
    
    // If the filter has a meaningful value, propagate to parent
    if (value !== undefined && value !== null && value !== '' && 
        !(Array.isArray(value) && value.length === 0)) {
      instance.updateFilter({ id, value })
    }
  }, [instance])
  
  // Remove a local filter
  const removeLocalFilter = React.useCallback((id: string) => {
    setLocalFilters(prev => prev.filter(f => f.id !== id))
    // Also remove from parent if it exists there
    if (parentFilterState[id] !== undefined) {
      instance.removeFilter(id)
    }
  }, [instance, parentFilterState])

  const clearFilters = React.useCallback(() => {
    setLocalFilters([])
    instance.clearFilters()
  }, [instance])

  const filterCount = localFilters.length
  const hasAvailableFilters = availableFilters.length > 0

  // Always show the filter bar when there are available filters
  if (filterCount === 0 && !hasAvailableFilters) {
    return null
  }

  if (!hasAvailableFilters) {
    return null
  }

  if (instance.showSkeleton) {
    return <DataTableFilterBarSkeleton filterCount={filterCount} />
  }

  return (
    <div className="bg-ui-bg-subtle flex w-full flex-nowrap items-center gap-2 overflow-x-auto border-t px-6 py-2 md:flex-wrap">
      {localFilters.map((localFilter) => (
        <DataTableFilter 
          key={localFilter.id} 
          id={localFilter.id} 
          filter={localFilter.value} 
          isNew={localFilter.isNew}
          onUpdate={(value) => updateLocalFilter(localFilter.id, value)}
          onRemove={() => removeLocalFilter(localFilter.id)}
        />
      ))}
      <DataTableFilterMenu onAddFilter={addLocalFilter} />
      {Object.keys(parentFilterState).length > 0 ? (
        <Button
          variant="transparent"
          size="small"
          className="text-ui-fg-muted hover:text-ui-fg-subtle flex-shrink-0 whitespace-nowrap"
          type="button"
          onClick={clearFilters}
        >
          {clearAllFiltersLabel}
        </Button>
      ) : null}
    </div>
  )
}
DataTableFilterBar.displayName = "DataTable.FilterBar"

const DataTableFilterBarSkeleton = ({
  filterCount,
}: {
  filterCount: number
}) => {
  return (
    <div className="bg-ui-bg-subtle flex w-full flex-nowrap items-center gap-2 overflow-x-auto border-t px-6 py-2 md:flex-wrap">
      {Array.from({ length: filterCount }).map((_, index) => (
        <Skeleton key={index} className="h-7 w-[180px]" />
      ))}
      {filterCount > 0 ? <Skeleton className="h-7 w-[66px]" /> : null}
    </div>
  )
}

export { DataTableFilterBar }
export type { DataTableFilterBarProps }

