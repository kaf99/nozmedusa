# Zod Compatibility Guide for Medusa Workflows

This guide explains how Medusa Workflows SDK supports both Zod v3 and v4, following [Zod's official library author recommendations](https://zod.dev/library-authors).

## Implementation Details

Following Zod's guide, we:
1. Import from version-specific paths (`zod/v3` and `zod/v4/core`)
2. Define union types that accept schemas from either version
3. Use runtime detection to determine schema version (v4 schemas have `_zod` property)
4. Provide type-safe compatibility without using `any` types

## Setup

### Peer Dependencies

Both `@medusajs/workflows-sdk` and `@medusajs/framework` now use Zod as a peer dependency:

```json
{
  "peerDependencies": {
    "zod": "^3.22.4 || ^4.0.0"
  }
}
```

This means **you choose which Zod version to use** in your project. Install either:

```bash
# For Zod v4 (recommended for new projects)
npm install zod@^4.0.0

# For Zod v3 (if you have existing code)
npm install zod@^3.22.4
```

## Using Schemas with Workflows

The workflow schema feature works identically with both Zod versions:

```typescript
import { createWorkflow, WorkflowResponse } from "@medusajs/workflows-sdk"
import { z } from "zod" // Your chosen version

// Define schemas - works in both v3 and v4
const inputSchema = z.object({
  title: z.string(),
  price: z.number().positive(),
  description: z.string().optional(),
})

const outputSchema = z.object({
  product: z.object({
    id: z.string(),
    title: z.string(),
    price: z.number(),
  }),
  success: z.boolean(),
})

// Create workflow with schemas
const myWorkflow = createWorkflow(
  {
    name: "create-product",
    inputSchema,
    outputSchema,
  },
  (input) => {
    // Input is automatically typed from the schema
    // TypeScript knows: { title: string, price: number, description?: string }
    
    const product = {
      id: "prod_123",
      title: input.title,
      price: input.price,
    }
    
    return new WorkflowResponse({
      product,
      success: true,
    })
  }
)
```

## Migration Guide: Zod v3 to v4

If you're upgrading from Zod v3 to v4, here are the main changes:

### 1. Record Schema

```typescript
// ❌ Zod v3 only
const metadata = z.record(z.unknown())

// ✅ Zod v4 (explicit key type required)
const metadata = z.record(z.string(), z.unknown())

// ✅ Works in both versions (using compatibility helper)
import { zodCompat } from "@medusajs/workflows-sdk"
const metadata = zodCompat.record(z.unknown())
```

### 2. Type Imports

```typescript
// ❌ Zod v3
import { ZodTypeAny, ZodEffects } from "zod"

// ✅ Zod v4
import { ZodType } from "zod"

// ✅ Works in both versions
import { ZodSchemaCompat } from "@medusajs/workflows-sdk"
```

### 3. Effects and Transforms

Effects work similarly in both versions:

```typescript
// Works in both v3 and v4
const ageSchema = z.number().transform(age => ({
  age,
  isAdult: age >= 18
}))

// Using compatibility helper
const processedSchema = zodCompat.transform(
  z.string(),
  (str) => str.toUpperCase()
)
```

## Compatibility Helpers

The SDK provides helpers for common patterns that differ between versions:

```typescript
import { zodCompat, isZodSchema } from "@medusajs/workflows-sdk"

// Check if a value is a Zod schema (v3 or v4)
if (isZodSchema(someValue)) {
  // It's a valid Zod schema
}

// Create a record schema (handles v3/v4 differences)
const attributes = zodCompat.record(z.any())

// Transform helper
const upper = zodCompat.transform(
  z.string(),
  str => str.toUpperCase()
)

// Preprocess helper
const flexibleNumber = zodCompat.preprocess(
  (val) => typeof val === "string" ? parseFloat(val) : val,
  z.number()
)
```

## Type Compatibility

For library authors extending Medusa:

```typescript
import { ZodSchemaCompat } from "@medusajs/workflows-sdk"

// Accept schemas from either Zod version
function myFunction(schema: ZodSchemaCompat) {
  // Works with both v3 and v4 schemas
}

// Type inference works automatically
type InputType = ZodInferOutput<typeof mySchema>
```

## Best Practices

1. **For new projects**: Use Zod v4 directly
2. **For existing projects**: You can stay on Zod v3 or upgrade at your own pace
3. **For libraries**: Use `ZodSchemaCompat` type to accept both versions
4. **For migrations**: Use `zodCompat` helpers during transition

## Troubleshooting

### "Cannot find module 'zod'"

You need to install Zod as it's now a peer dependency:

```bash
npm install zod@^4.0.0
# or
npm install zod@^3.22.4
```

### Type errors after upgrading

1. Check if you're using `z.record()` - it needs explicit key type in v4
2. Replace `ZodTypeAny` with `ZodType` or `ZodSchemaCompat`
3. Use compatibility helpers for smoother migration

### Version conflicts

If you see version conflicts, ensure all Medusa packages are updated to versions that support peer dependencies:

```bash
npm update @medusajs/workflows-sdk @medusajs/framework
```