# DataTable Column Visibility Customization Guide

## Overview

The new `@medusajs/ui` DataTable component provides built-in column visibility functionality through `Primitive.ColumnVisibilityMenu`. However, this component doesn't support custom implementations out of the box. This guide explains how to integrate custom column visibility with the DataTable component.

## Current Architecture

### Default DataTable Component
The default DataTable from `@medusajs/ui` uses:
- `Primitive.ColumnVisibilityMenu` - A built-in component that cannot be customized
- `columnVisibility` state managed through `useDataTable` hook
- No props to pass custom column visibility components

### Custom Column Visibility Requirements
To integrate with the column visibility API, we need:
1. Access to API column metadata (names, IDs, etc.)
2. Ability to save/load column preferences
3. Custom UI for column selection
4. Integration with the table's visibility state

## Solution Approaches

### Approach 1: Custom DataTable Wrapper (Recommended)

Create a wrapper component that replaces the built-in column visibility menu with a custom implementation:

```tsx
// data-table-with-custom-columns.tsx
import { DataTable as Primitive, useDataTable } from "@medusajs/ui"
import { CustomColumnVisibility } from "./custom-column-visibility"

export const DataTableWithCustomColumns = (props) => {
  const instance = useDataTable({
    // ... table configuration
    columnVisibility: {
      state: columnVisibility,
      onColumnVisibilityChange: setColumnVisibility,
    }
  })

  return (
    <Primitive instance={instance}>
      <Primitive.Toolbar>
        {/* Replace Primitive.ColumnVisibilityMenu with custom component */}
        {enableColumnVisibility && (
          <CustomColumnVisibility 
            table={instance}
            apiColumns={apiColumns}
            onSaveColumns={onSaveColumns}
          />
        )}
      </Primitive.Toolbar>
      <Primitive.Table />
    </Primitive>
  )
}
```

### Approach 2: Extend Existing DataTable

Extend the existing DataTable component with additional props:

```tsx
// Extended DataTable usage
<DataTable
  // ... standard props
  enableColumnVisibility={true}
  apiColumns={apiColumns}
  onSaveColumns={handleSaveColumns}
/>
```

### Approach 3: Hook-based Column Management

Create a hook that manages column visibility state:

```tsx
const useColumnVisibilityManager = (entity: string) => {
  // Load/save column preferences
  // Sync with API
  // Return visibility state and handlers
}
```

## Implementation Details

### Custom Column Visibility Component

The custom component should:
1. Display column names from the API
2. Allow toggling individual columns
3. Support "toggle all" functionality
4. Save preferences when changed
5. Show loading state while fetching column metadata

```tsx
export const CustomColumnVisibility = ({
  table,
  apiColumns,
  isLoading,
  onSaveColumns,
}) => {
  // Get hideable columns from table
  const columns = table.getAllColumns().filter(col => col.getCanHide())
  
  // Handle column toggle
  const handleToggle = (columnId) => {
    table.getColumn(columnId)?.toggleVisibility()
    // Save preferences
    const visibleColumns = getVisibleColumns()
    onSaveColumns(visibleColumns)
  }
  
  // Render dropdown with column list
  return (
    <DropdownMenu>
      {/* Column checkboxes */}
    </DropdownMenu>
  )
}
```

### Integration with Column API

Use the views API to get column metadata:

```tsx
import { useOrderColumns } from "../../hooks/api/views"

const OrderTable = () => {
  const { columns: apiColumns, isLoading } = useOrderColumns()
  
  return (
    <DataTableWithCustomColumns
      apiColumns={apiColumns}
      apiColumnsLoading={isLoading}
      onSaveColumns={saveColumnPreferences}
    />
  )
}
```

## Usage Example

```tsx
import { DataTableWithCustomColumns } from "./data-table-with-custom-columns"
import { useOrderColumns } from "../../hooks/api/views"

export const OrderListTable = () => {
  const { columns: apiColumns } = useOrderColumns()
  
  const handleSaveColumns = async (columns) => {
    // Save to local storage
    localStorage.setItem('order-columns', JSON.stringify(columns))
    
    // Or save to API
    await sdk.admin.views.updateColumns('orders', columns)
  }
  
  return (
    <DataTableWithCustomColumns
      data={orders}
      columns={tableColumns}
      enableColumnVisibility
      apiColumns={apiColumns}
      onSaveColumns={handleSaveColumns}
    />
  )
}
```

## Benefits

1. **Full control** over column visibility UI
2. **Integration** with backend column metadata API
3. **Persistence** of user preferences
4. **Consistent** with existing DataTable API
5. **Reusable** across different table implementations

## Limitations

1. Requires maintaining a custom DataTable wrapper
2. Must keep in sync with @medusajs/ui updates
3. Cannot use the built-in Primitive.ColumnVisibilityMenu

## Future Considerations

Ideally, the `@medusajs/ui` library would support:
- Custom render props for column visibility
- Column metadata integration
- Persistence callbacks
- Custom component injection

Until then, the wrapper approach provides the most flexibility while maintaining compatibility with the existing DataTable API.