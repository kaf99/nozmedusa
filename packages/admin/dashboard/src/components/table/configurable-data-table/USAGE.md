# Configurable Data Table Usage Guide

## Overview

The `ConfigurableDataTable` component and related hooks provide a reusable solution for creating tables with configurable columns, views, and filters across different entity types in the Medusa admin dashboard.

## Key Components

### 1. ConfigurableDataTable Component

The main component that renders a configurable table with view management capabilities.

```tsx
import { ConfigurableDataTable } from "../components/table/configurable-data-table"

<ConfigurableDataTable
  entity="products"
  entityName="Products"
  data={products}
  columns={columns}
  filters={filters}
  pageSize={20}
  queryPrefix="p"
  getRowId={(row) => row.id}
  rowHref={(row) => `/products/${row.id}`}
  isLoading={isLoading}
  rowCount={count}
/>
```

### 2. useTableConfiguration Hook

Manages table configuration state including views, columns, and filters.

```tsx
import { useTableConfiguration } from "../hooks/table/use-table-configuration"

const {
  activeView,
  visibleColumns,
  columnOrder,
  currentConfiguration,
  hasConfigurationChanged,
  requiredFields,
} = useTableConfiguration({
  entity: "products",
  pageSize: 20,
  queryPrefix: "p",
  filters: productFilters,
})
```

### 3. useConfigurableTableColumns Hook

Generates column definitions from API column metadata.

```tsx
import { useConfigurableTableColumns } from "../hooks/table/columns/use-configurable-table-columns"
import { getEntityAdapter } from "../lib/table/entity-adapters"

const adapter = getEntityAdapter("products")
const columns = useConfigurableTableColumns("products", apiColumns, adapter)
```

### 4. Entity Adapters

Provide entity-specific customizations for column display and behavior.

```tsx
// lib/table/entity-adapters.tsx
export const productColumnAdapter: ColumnAdapter<HttpTypes.AdminProduct> = {
  getColumnAlignment: (column) => {
    if (column.field === "stock") return "right"
    return "left"
  },
  
  transformCellValue: (value, row, column) => {
    if (column.field === "variants_count") {
      return `${value || 0} variants`
    }
    return null
  }
}
```

## Creating a New Configurable Table

To create a configurable table for a new entity:

### Step 1: Create the Table Component

```tsx
import { ConfigurableDataTable } from "../components/table/configurable-data-table"
import { useConfigurableTableColumns } from "../hooks/table/columns/use-configurable-table-columns"
import { useTableConfiguration } from "../hooks/table/use-table-configuration"
import { useEntityColumns } from "../hooks/api/views"
import { getEntityAdapter } from "../lib/table/entity-adapters"

const PAGE_SIZE = 20
const QUERY_PREFIX = "c"

export const ConfigurableCustomerListTable = () => {
  // Get API columns
  const { columns: apiColumns } = useEntityColumns("customers")
  
  // Get filters for the entity
  const filters = useCustomerTableFilters()
  
  // Configure table
  const { requiredFields } = useTableConfiguration({
    entity: "customers",
    pageSize: PAGE_SIZE,
    queryPrefix: QUERY_PREFIX,
    filters,
  })
  
  // Fetch data
  const { customers, count, isLoading } = useCustomers({
    fields: requiredFields,
    // ... other params
  })
  
  // Get columns with adapter
  const adapter = getEntityAdapter("customers")
  const columns = useConfigurableTableColumns("customers", apiColumns, adapter)
  
  return (
    <ConfigurableDataTable
      entity="customers"
      entityName="Customers"
      data={customers}
      columns={columns}
      filters={filters}
      pageSize={PAGE_SIZE}
      queryPrefix={QUERY_PREFIX}
      getRowId={(row) => row.id}
      rowHref={(row) => `/customers/${row.id}`}
      isLoading={isLoading}
      rowCount={count}
    />
  )
}
```

### Step 2: Create an Entity Adapter (Optional)

```tsx
// lib/table/entity-adapters.tsx
export const customerColumnAdapter: ColumnAdapter<HttpTypes.AdminCustomer> = {
  getColumnAlignment: (column) => {
    if (column.field === "orders_count") return "right"
    return "left"
  },
  
  transformCellValue: (value, row, column) => {
    if (column.field === "full_name") {
      return `${row.first_name} ${row.last_name}`.trim()
    }
    return null
  }
}

// Add to registry
export const entityAdapters = {
  // ... existing adapters
  customers: customerColumnAdapter,
}
```

### Step 3: Define Table Filters

Create filters specific to your entity using the standard filter pattern.

## Benefits

1. **Consistency**: All configurable tables behave the same way
2. **Reusability**: Core logic is shared across all tables
3. **Maintainability**: Updates to configuration logic only need to be made once
4. **Type Safety**: Full TypeScript support with proper typing
5. **Extensibility**: Easy to add new entities with custom behavior

## Migration from Existing Tables

To migrate an existing table to use the configurable system:

1. Replace the existing table component with `ConfigurableDataTable`
2. Use `useConfigurableTableColumns` instead of custom column definitions
3. Use `useTableConfiguration` for view and column state management
4. Create an entity adapter if custom behavior is needed
5. Remove duplicate configuration logic

## API Column Requirements

The configurable table system expects columns from the API to have:

- `field`: The field name in the data
- `name`: Display name for the column
- `default_visible`: Whether column is visible by default
- `default_order`: Default column order
- `hideable`: Whether column can be hidden
- `semantic_type`: Optional semantic type (currency, status, etc.)
- `computed`: Optional computed column configuration