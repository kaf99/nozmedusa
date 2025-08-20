import { MedusaError } from "../utils"
import { ZodError } from "zod"
import type * as z3 from "zod/v3"
import type * as z4 from "zod/v4/core"
import { ZodSchemaCompat } from "./zod-compat"

// Issue type that works with both v3 and v4
type ZodIssue = z3.ZodIssue | z4.$ZodIssue

const formatPath = (issue: ZodIssue) => {
  return issue.path.join(", ")
}

const formatInvalidType = (issues: ZodIssue[]) => {
  const expected = issues
    .map((i) => {
      // Unforutnately the zod library doesn't distinguish between a wrong type and a required field, which we want to handle differently
      if (i.code === "invalid_type" && i.message !== "Required") {
        return i.expected
      }
      return
    })
    .filter(Boolean)

  if (!expected.length) {
    return
  }

  const received = issues?.[0]?.code === "invalid_type" ? (issues[0] as any)?.received : undefined

  return `Expected type: '${expected.join(", ")}' for field '${formatPath(
    issues[0]
  )}', got: '${received}'`
}

const formatRequiredField = (issues: ZodIssue[]) => {
  const expected = issues
    .map((i) => {
      if (i.code === "invalid_type" && i.message === "Required") {
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

const formatUnionError = (issue: ZodIssue) => {
  if (issue.code !== "invalid_union") return issue.message
  const issues = (issue as any).unionErrors?.flatMap((e: any) => e.issues) || []
  return (
    formatInvalidType(issues) || formatRequiredField(issues) || issue.message
  )
}

const formatError = (err: ZodError) => {
  const issueMessages = err.issues.slice(0, 3).map((issue) => {
    switch (issue.code) {
      case "invalid_type":
        return (
          formatInvalidType([issue]) ||
          formatRequiredField([issue]) ||
          issue.message
        )
      case "invalid_union":
        return formatUnionError(issue)
      case "unrecognized_keys":
        return `Unrecognized fields: '${(issue as any).keys?.join(", ")}'`
      case "too_small":
        return `Value for field '${formatPath(
          issue
        )}' too small, expected at least: '${(issue as any).minimum}'`
      case "too_big":
        return `Value for field '${formatPath(
          issue
        )}' too big, expected at most: '${(issue as any).maximum}'`
      case "not_multiple_of":
        return `Value for field '${formatPath(issue)}' not multiple of: '${
          (issue as any).divisor || (issue as any).multipleOf
        }'`
      case "invalid_value":
        return `Expected: '${(issue as any).values?.join(", ")}' for field '${formatPath(
          issue
        )}', but got: '${(issue as any).input}'`
      case "custom":
      default:
        return issue.message
    }
  })

  return issueMessages.join("; ")
}

export async function zodValidator<T>(
  zodSchema: ZodSchemaCompat,
  body: T
): Promise<any> {
  let strictSchema = zodSchema
  // ZodTransform/ZodPipe doesn't support setting as strict, for all other schemas we want to enforce strictness.
  if ("strict" in zodSchema && typeof (zodSchema as any).strict === "function") {
    strictSchema = (zodSchema as any).strict()
  }

  try {
    // Both v3 and v4 schemas have parseAsync method
    return await (strictSchema as any).parseAsync(body)
  } catch (err) {
    if (err instanceof ZodError) {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        `Invalid request: ${formatError(err)}`
      )
    }

    throw err
  }
}
