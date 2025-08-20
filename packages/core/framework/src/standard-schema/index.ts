/**
 * Re-export Standard Schema types and utilities
 * @see https://standardschema.dev/
 */
export type { StandardSchemaV1 } from "@standard-schema/spec"

/**
 * Type guard to check if a value implements Standard Schema v1
 */
export function isStandardSchemaV1(value: unknown): value is import("@standard-schema/spec").StandardSchemaV1 {
  return (
    typeof value === "object" &&
    value !== null &&
    "~standard" in value &&
    typeof (value as any)["~standard"] === "object" &&
    (value as any)["~standard"].version === 1 &&
    typeof (value as any)["~standard"].validate === "function"
  )
}

/**
 * Helper type for optional schemas (for backward compatibility)
 */
export type StandardSchemaV1Optional<T extends import("@standard-schema/spec").StandardSchemaV1 = import("@standard-schema/spec").StandardSchemaV1> = T

/**
 * Helper type for nullable schemas (for backward compatibility)
 */
export type StandardSchemaV1Nullable<T extends import("@standard-schema/spec").StandardSchemaV1 = import("@standard-schema/spec").StandardSchemaV1> = T

/**
 * Raw shape type for object schemas (for backward compatibility)
 */
export type StandardSchemaV1RawShape = Record<string, import("@standard-schema/spec").StandardSchemaV1>

// Export object helpers
export { createObjectSchema, nullable } from "./object"

// Export validation helpers
export { schemaValidator, zodValidator } from "./helpers"