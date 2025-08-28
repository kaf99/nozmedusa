# Workflow Schema Migration Guide

This guide outlines the step-by-step process for migrating workflows to use input/output schemas with Zod validation.

You can check your progress by running:

```bash
npx tsx scripts/check-workflow-migration.ts
```

## Overview

The migration adds runtime validation and better type safety to workflows by:

1. Creating Zod schemas that match existing types
2. Using these schemas in workflow definitions
3. Maintaining backward compatibility by re-exporting types

## Step-by-Step Process

### Step 1: Create Schema File

Create or update the `utils/schemas.ts` file in the module directory:

```typescript
// src/[module]/utils/schemas.ts
import { z } from "zod"

// Define schemas matching the existing DTOs
const createItemDTOSchema = z.object({
  name: z.string(),
  description: z.string().optional(),
  metadata: z.record(z.unknown()).optional(),
})

// Define workflow input/output schemas
export const createItemsWorkflowInputSchema = z.object({
  items: z.array(createItemDTOSchema),
})

export const createItemsWorkflowOutputSchema = z.array(itemDTOSchema)

// Export types for backward compatibility
export type CreateItemsWorkflowInput = z.infer<
  typeof createItemsWorkflowInputSchema
>
export type CreateItemsWorkflowOutput = z.infer<
  typeof createItemsWorkflowOutputSchema
>
```

**IMPORTANT NOTES**

- Do not use `.any()`
- Do not use `.passthrough()`

### Step 2: Add Type Verification

**⚠️ CRITICAL: DO NOT DELETE EXISTING TYPES IN THIS STEP!**
The existing type definitions (interfaces, type aliases) MUST remain in the workflow file during migration. They are essential for verifying that your schemas are backward compatible. You will only remove them in Step 5 after ALL workflows have been migrated.

**IMPORTANT: Correct Type Check Order**

The type checks verify backward compatibility:

1. **Input check**: New schema input can be assigned to old input type (schema accepts all valid inputs)
2. **Output check**: Old output type can be assigned to new schema output (schema produces compatible outputs)

In the workflow file, add a check to ensure schemas match existing types:

```typescript
import {
  createItemsWorkflowInputSchema,
  createItemsWorkflowOutputSchema,
  type CreateItemsWorkflowInput as SchemaInput,
  type CreateItemsWorkflowOutput as SchemaOutput,
} from "../utils/schemas"

// Existing type definitions - KEEP THESE!
export type CreateItemsWorkflowInput = {
  items: CreateItemDTO[]
}
export type CreateItemsWorkflowOutput = ItemDTO[]

// Type verification - CORRECT ORDER!
const schemaInput = {} as SchemaInput
const schemaOutput = {} as SchemaOutput

// Check 1: New input can go into old input (schema accepts all valid inputs)
const existingInput: CreateItemsWorkflowInput = schemaInput

// Check 2: Old output can go into new output (schema produces compatible outputs)
const existingOutput: SchemaOutput = {} as CreateItemsWorkflowOutput

// To avoid declared but never used errors
console.log(existingInput, existingOutput)
```

### Step 3: Update Workflow Definition

Update the `createWorkflow` call to use the object syntax with schemas:

```typescript
export const createItemsWorkflow = createWorkflow(
  {
    name: createItemsWorkflowId,
    description: "Create one or more items", // Extract from JSDoc @summary
    inputSchema: createItemsWorkflowInputSchema,
    outputSchema: createItemsWorkflowOutputSchema,
  },
  (input) => {
    // Workflow implementation remains the same
  }
)
```

### Step 4: Build and Verify

Run the build to ensure types match:

```bash
npm run build
```

If you encounter type errors, adjust the schemas to match the expected types exactly.

### Step 5: Once every workflow is migrated and the user confirms the progress - clean Up

Once all workflows have been migrated and the build passes:

1. Ask the user to verify that the migration is completed.
2. Once user confirms start the cleanup phase across all workflows
3. Remove the type checks imports and checks
4. Remove the local type definitions (keep using ones from schemas)
5. Update imports to only import from schemas

Final workflow file structure:

```typescript
import {
  WorkflowData,
  WorkflowResponse,
  createWorkflow,
} from "@medusajs/framework/workflows-sdk"
import { createItemsStep } from "../steps"
import {
  createItemsWorkflowInputSchema,
  createItemsWorkflowOutputSchema,
  type CreateItemsWorkflowInput,
  type CreateItemsWorkflowOutput,
} from "../utils/schemas"

export const createItemsWorkflowId = "create-items"
/**
 * This workflow creates one or more items.
 *
 * @summary
 * Create one or more items.
 */
export const createItemsWorkflow = createWorkflow(
  {
    name: createItemsWorkflowId,
    description: "Create one or more items",
    inputSchema: createItemsWorkflowInputSchema,
    outputSchema: createItemsWorkflowOutputSchema,
  },
  (input) => {
    return new WorkflowResponse(createItemsStep(input.items))
  }
)
```

## Common Schema Patterns

### Optional vs Required Fields

```typescript
// Required field
name: z.string()

// Optional field
description: z.string().optional()

// Nullable and optional
metadata: z.record(z.unknown()).nullable().optional()
```

### Timestamps

```typescript
// Handles both string and Date types (common pattern)
created_at: z.union([z.string(), z.date()])

// Strict Date type (when type definition requires it)
created_at: z.date()
```

### Union Types

```typescript
// Discriminated union based on type field
const geoZoneSchema = z.union([
  z.object({ type: z.literal("country"), country_code: z.string() }),
  z.object({ type: z.literal("province"), province_code: z.string() }),
])
```

### Extending Types

```typescript
const baseSchema = z.object({ id: z.string() })
const extendedSchema = baseSchema.extend({
  name: z.string(),
})
```

### AdditionalData Pattern

```typescript
const additionalDataSchema = z.object({
  additional_data: z.record(z.string(), z.unknown()).optional(),
})

// IMPORTANT: Use .and() instead of .merge() when the TypeScript type uses & intersection
export const workflowInputSchema = z
  .object({
    items: z.array(itemSchema),
  })
  .and(additionalDataSchema)
```

### Critical: Merge vs And

When creating schemas that need to match existing TypeScript types:

1. **Use `.and()` when the TypeScript type uses `&` (intersection)**:

   ```typescript
   // TypeScript type
   type WorkflowInput = { data: string[] } & AdditionalData

   // Zod schema - use .and()
   const schema = z
     .object({ data: z.array(z.string()) })
     .and(additionalDataSchema)
   ```

2. **Use `.merge()` when the TypeScript type is a single object**:

   ```typescript
   // TypeScript type
   type WorkflowInput = {
     data: string[]
     additional_data?: Record<string, unknown>
   }

   // Zod schema - use .merge() or define directly
   const schema = z
     .object({ data: z.array(z.string()) })
     .merge(additionalDataSchema)
   ```

## Known Issues and Solutions

### Troubleshooting Type Errors

IF YOU BUMP INTO SOMETHING YOU HAVEN'T SEEN BEFORE YOU MUST STOP AND ASK THE USER FOR HELP. THE USER WILL HELP FIX THE PROBLEM AND UPDATE THE TROUBLESHOOTING GUIDE.

#### Type errors from the createWorkflow composer function implementation

If you build the project and encounter type errors from the createWorkflow implementation you should not start changing things to fix that.

It is VERY likely that the reason this is happening is because the schema you have created is not backward compatible with the previous workflow input type.

Therefore you MUST first verify that the types work. If they don't work you MUST not make changes based on the implementation type errors. Instead you MUST stop, and report the issue to the user and I will help solve the problem.

#### Never Use z.any() as a Quick Fix

**CRITICAL**: Using `z.any()` to bypass type errors is NOT acceptable EXCEPT in specific documented cases:

**When z.any() is NOT acceptable:**

1. As a shortcut to avoid creating proper schemas
2. For main input/output types that the workflow processes
3. When you haven't investigated the actual DTO types

**When z.any() IS acceptable:**

1. For circular reference fields that the workflow doesn't inspect (e.g., nested `item` in adjustments when only `item_id` is used)
2. For complex nested types with circular references where the workflow operates at a higher level
3. When documented in the schema with explanation

**General approach:**

1. Investigate the actual DTO types being used
2. Create precise schemas that match the framework's DTOs
3. Use union types when the workflow accepts multiple types (e.g., `CartLineItemDTO[] | OrderLineItemDTO[]`)
4. If circular references exist and the nested data isn't used, document the use of z.any()

Example:

```typescript
// ❌ WRONG - Lazy use without investigation
items: z.any(), // TODO: Fix exact type match

// ✅ RIGHT - Create proper schemas
const cartLineItemDTOSchema = z.object({
  // ... all required fields
})
```

**How to Fix:**

1. **Look past the deepPartial error** - Find the actual type mismatch deeper in the error message
2. **Check for type precision issues** - The most common problems are:
   - Using `z.string()` when a specific string union is expected
   - Using `z.record()` when a structured object type is expected
   - Missing required properties in object schemas

**Real Example - JWT Algorithm Type:**

```typescript
// ❌ Wrong - too generic
const jwtOptionsSchema = z.object({
  algorithm: z.string().optional(), // Error: expects specific algorithm names
})

// ✅ Correct - matches exact type
const algorithmSchema = z.enum([
  "HS256",
  "HS384",
  "HS512",
  "RS256",
  "RS384",
  "RS512",
  "ES256",
  "ES384",
  "ES512",
  "PS256",
  "PS384",
  "PS512",
  "none",
])

const jwtOptionsSchema = z.object({
  algorithm: algorithmSchema.optional(),
})
```

**Real Example - JWT Header Type:**

```typescript
// ❌ Wrong - too generic
header: z.record(z.any()).optional()

// ✅ Correct - matches JwtHeader interface
const jwtHeaderSchema = z.object({
  alg: z.union([z.string(), algorithmSchema]), // Required property
  typ: z.string().optional(),
  cty: z.string().optional(),
  // ... other properties
})

header: jwtHeaderSchema.optional()
```

#### Key Lessons

1. **Type precision matters** - Zod schemas must match the exact TypeScript types, not just their general shape
2. **Read the full error** - The real type mismatch is usually mentioned deeper in the error message
3. **Check existing type definitions** - Look up the actual TypeScript interfaces/types being used (e.g., in @types packages)
4. **Use specific Zod types**:
   - Use `z.enum()` for string unions
   - Use `z.object()` with exact properties for interfaces
   - Use `z.union()` for union types
   - Don't default to `z.string()` or `z.record()` without checking
5. **Nullable vs Optional fields** - Pay attention to the difference:
   - `field: string | null` requires `z.string().nullable()` (field is required but can be null)
   - `field?: string` requires `z.string().optional()` (field might not exist)
   - `field?: string | null` requires `z.string().nullable().optional()` (field might not exist and can be null)
   - Using `.optional()` on a required nullable field will cause type mismatches

### Debugging Schema Compatibility Issues

When encountering TypeScript errors during migration, follow this systematic approach:

#### 1. Set Up Proper Type Verification

Instead of guessing at type compatibility, import the actual DTO types and verify schema compatibility:

```typescript
import { CartDTO } from "@medusajs/framework/types"
import {
  createCartWorkflowInputSchema,
  createCartWorkflowOutputSchema,
  type CreateCartWorkflowInput,
  type CreateCartWorkflowOutput,
} from "../utils/schemas"

// Type verification - compare schema output with actual DTO
const schemaOutput = {} as CreateCartWorkflowOutput
const actualDTO: CartDTO = schemaOutput // This will show exact mismatches
```

#### 2. Common Type Mismatches and Solutions

**BigNumber Fields in DTOs**
Many DTOs use `BigNumberValue` for numeric fields (amounts, totals, etc.), not plain numbers:

```typescript
// ❌ Wrong - causes type mismatch
const cartDTOSchema = z.object({
  total: z.number(),
  subtotal: z.number(),
  tax_total: z.number(),
})

// ✅ Correct - use the common BigNumberValue schema
import { bigNumberValueSchema } from "../../common/utils/schemas"

const cartDTOSchema = z.object({
  total: bigNumberValueSchema,
  subtotal: bigNumberValueSchema,
  tax_total: bigNumberValueSchema,
})
```

Common fields that use BigNumberValue:

- All "total" fields (item_total, subtotal, tax_total, etc.)
- All "amount" fields
- Quantity fields in line items
- Price fields

**Address Type Variations**
Different workflows expect different address types:

```typescript
// For create workflows - fields are optional but not nullable
const createCartAddressDTOSchema = z.object({
  first_name: z.string().optional(),
  last_name: z.string().optional(),
  // ... other fields
})

// For update workflows - fields can be nullable
const updateCartAddressDTOSchema = z.object({
  id: z.string().optional(),
  first_name: z.string().nullable().optional(),
  last_name: z.string().nullable().optional(),
  // ... other fields
})

// For workflows accepting both create and update
shipping_address: z.union([
  createCartAddressDTOSchema,
  updateCartAddressDTOSchema,
])
  .nullable()
  .optional()
```

#### 3. TypeScript Overload False Positives

When you see errors like:

```
No overload matches this call.
  Overload 3 of 3, '(nameOrConfig: string | ({ name: string; } & TransactionModelOptions), composer: ...'
```

This is often a false positive that occurs when input/output schemas don't match the existing workflow types. Fix the schema types first - the overload error will resolve automatically.

## Type Verification Commands

```bash
# Build a single file
npx tsc --noErrorTruncation --noEmit --esModuleInterop --target ES2021 --module Node16 --moduleResolution Node16 --skipLibCheck --allowJs --experimentalDecorators --emitDecoratorMetadata packages/core/core-flows/src/cart/workflows/upsert-tax-lines.ts

# When checkpoint reached build entire project
yarn build
```
