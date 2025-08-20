// Following Zod's library author guide: https://zod.dev/library-authors
import type * as z3 from "zod/v3"
import type * as z4 from "zod/v4/core"

/**
 * Schema type that accepts both Zod v3 and v4 schemas
 */
export type ZodSchemaCompat = z3.ZodTypeAny | z4.$ZodType

/**
 * Object schema type that works with both versions
 */
export type ZodObjectCompat = z3.ZodObject<any, any> | z4.$ZodObject<any, any>

/**
 * Optional schema type that works with both versions
 */
export type ZodOptionalCompat<T extends ZodSchemaCompat = ZodSchemaCompat> = 
  | z3.ZodOptional<T extends z3.ZodTypeAny ? T : any>
  | z4.$ZodOptional<T extends z4.$ZodType ? T : any>

/**
 * Nullable schema type that works with both versions
 */
export type ZodNullableCompat<T extends ZodSchemaCompat = ZodSchemaCompat> = 
  | z3.ZodNullable<T extends z3.ZodTypeAny ? T : any>
  | z4.$ZodNullable<T extends z4.$ZodType ? T : any>