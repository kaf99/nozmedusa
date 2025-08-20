import { MedusaError } from "../utils"
import * as z3 from "zod/v3"
import * as z4 from "zod/v4"

// Union types for issues
type AnyZodIssue = z3.ZodIssue | z4.ZodIssue

const formatPath = (issue: AnyZodIssue) => {
  return issue.path.join(", ")
}

const formatInvalidType = (issues: AnyZodIssue[]) => {
  // Don't handle required field errors here
  if (issues.length === 1 && issues[0].code === "invalid_type") {
    const issue = issues[0] as any
    if (issue.message === "Required" || issue.received === undefined) {
      return undefined
    }
  }
  
  const expected = issues
    .map((i) => {
      if (i.code === "invalid_type") {
        return i.expected
      }
      return
    })
    .filter(Boolean)

  if (!expected.length) {
    return undefined
  }

  const received = (issues?.[0] as any)?.received

  return `Expected type: '${expected.join(", ")}' for field '${formatPath(
    issues[0]
  )}', got: '${received}'`
}

const formatRequiredField = (issues: AnyZodIssue[]) => {
  const expected = issues
    .map((i) => {
      // In v3: message === "Required", in v4: check if received === undefined
      const isV3Required = i.code === "invalid_type" && i.message === "Required"
      const isV4Required = i.code === "invalid_type" && (i as any).received === undefined
      
      if (isV3Required || isV4Required) {
        return i.expected
      }
      return
    })
    .filter(Boolean)

  if (!expected.length) {
    return
  }

  return `Field '${formatPath(issues[0])}' is required`
}

const formatUnionError = (issue: any) => {
  const issues = issue.unionErrors.flatMap((e) => e.issues)
  return (
    formatInvalidType(issues) || formatRequiredField(issues) || issue.message
  )
}

const formatError = (err: z3.ZodError | z4.ZodError) => {
  // Handle both v3 (errors) and v4 (issues) arrays
  const issues = (err as any).issues || (err as any).errors || []
  const issueMessages = issues.slice(0, 3).map((issue: AnyZodIssue) => {
    switch (issue.code) {
      case "invalid_type":
        // First try formatRequiredField, then formatInvalidType
        return (
          formatRequiredField([issue]) ||
          formatInvalidType([issue]) ||
          issue.message
        )
      case "invalid_literal":
        return `Expected literal: '${issue.expected}' for field '${formatPath(
          issue
        )}', but got: '${issue.received}'`
      case "invalid_union":
        return formatUnionError(issue)
      case "invalid_enum_value":
        return `Expected: '${issue.options.join(", ")}' for field '${formatPath(
          issue
        )}', but got: '${issue.received}'`
      case "unrecognized_keys":
        return `Unrecognized fields: '${issue.keys.join(", ")}'`
      case "invalid_arguments":
        return `Invalid arguments for '${issue.path.join(", ")}'`
      case "too_small":
        return `Value for field '${formatPath(
          issue
        )}' too small, expected at least: '${issue.minimum}'`
      case "too_big":
        return `Value for field '${formatPath(
          issue
        )}' too big, expected at most: '${issue.maximum}'`
      case "not_multiple_of":
        return `Value for field '${formatPath(issue)}' not multiple of: '${
          issue.multipleOf
        }'`
      case "not_finite":
        return `Value for field '${formatPath(issue)}' not finite: '${
          issue.message
        }'`
      case "invalid_union_discriminator":
      case "invalid_return_type":
      case "invalid_date":
      case "invalid_string":
      case "invalid_intersection_types":
      default:
        return issue.message
    }
  })

  return issueMessages.join("; ")
}

// Type unions for both v3 and v4
type AnyZodSchema = z3.ZodTypeAny | z4.ZodType
type AnyZodObject = z3.ZodObject<any, any> | z4.ZodObject<any, any>
type AnyZodEffects = z3.ZodEffects<any, any> | z4.ZodEffects<any, any>

// Helper to detect if a schema is v4
function isZodV4Schema(schema: unknown): schema is z4.ZodType {
  return typeof schema === "object" && schema !== null && "_zod" in schema
}

export async function zodValidator<T>(
  zodSchema: AnyZodObject | AnyZodEffects,
  body: T
): Promise<any> {
  const isV4 = isZodV4Schema(zodSchema)
  
  let strictSchema: any = zodSchema
  
  // Handle strict mode differently for v3 and v4
  if (isV4) {
    // v4 deprecates strict() in favor of strip() or passthrough()
    // For backward compatibility, we'll use the schema as-is since v4 strips by default
    strictSchema = zodSchema
  } else {
    // v3 uses strict()
    if ("strict" in zodSchema) {
      strictSchema = zodSchema.strict()
    }
  }

  try {
    return await strictSchema.parseAsync(body)
  } catch (err) {
    // Handle both v3 and v4 errors
    if ((isV4 && err instanceof z4.ZodError) || (!isV4 && err instanceof z3.ZodError)) {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        `Invalid request: ${formatError(err as z3.ZodError)}`
      )
    }

    throw err
  }
}
