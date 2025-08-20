// Following Zod's library author guide: https://zod.dev/library-authors
import type * as z3 from "zod/v3"
import type * as z4 from "zod/v4/core"

/**
 * Schema type that accepts both Zod v3 and v4 schemas
 * This follows the official Zod recommendation for library authors
 */
export type ZodSchemaCompat = z3.ZodTypeAny | z4.$ZodType

/**
 * Type guard to check if a value is a Zod v4 schema
 * v4 schemas have a "_zod" property, v3 schemas don't
 */
export function isZodV4Schema(value: unknown): value is z4.$ZodType {
  return (
    value !== null &&
    typeof value === "object" &&
    "_zod" in value
  )
}

/**
 * Type guard to check if a value is a Zod v3 schema
 */
export function isZodV3Schema(value: unknown): value is z3.ZodTypeAny {
  return (
    value !== null &&
    typeof value === "object" &&
    "_def" in value &&
    !("_zod" in value) // v3 doesn't have _zod
  )
}

/**
 * Type guard to check if a value is any Zod schema
 */
export function isZodSchema(value: unknown): value is ZodSchemaCompat {
  return isZodV3Schema(value) || isZodV4Schema(value)
}

/**
 * Extract the output type from a Zod schema (works with v3 and v4)
 */
export type ZodInferOutput<T> = T extends z3.ZodTypeAny
  ? z3.output<T>
  : T extends z4.$ZodType
  ? z4.output<T>
  : never

/**
 * Extract the input type from a Zod schema (works with v3 and v4)
 */
export type ZodInferInput<T> = T extends z3.ZodTypeAny
  ? z3.input<T>
  : T extends z4.$ZodType
  ? z4.input<T>
  : never

/**
 * Runtime parse that works with both versions
 * Uses dynamic imports to avoid loading unnecessary code
 */
export async function parseAsync<T extends ZodSchemaCompat>(
  schema: T,
  data: unknown
): Promise<ZodInferOutput<T>> {
  if (isZodV4Schema(schema)) {
    const { parseAsync: v4Parse } = await import("zod/v4/core")
    return v4Parse(schema, data) as ZodInferOutput<T>
  } else {
    // v3 schema - use the schema's own parseAsync method
    return (schema as z3.ZodTypeAny).parseAsync(data)
  }
}

/**
 * Sync parse that works with both versions
 */
export function parse<T extends ZodSchemaCompat>(
  schema: T,
  data: unknown
): ZodInferOutput<T> {
  if (isZodV4Schema(schema)) {
    // For v4, we need to use the top-level parse function
    // This is a bit tricky without dynamic imports in sync context
    // So we use the schema's parse method which exists in both versions
    return (schema as any).parse(data)
  } else {
    // v3 schema
    return (schema as z3.ZodTypeAny).parse(data)
  }
}