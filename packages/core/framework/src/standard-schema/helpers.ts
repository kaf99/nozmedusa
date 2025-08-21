import { MedusaError } from "../utils"
import type { StandardSchemaV1 } from "./index"

/**
 * Format a validation issue path into a readable string
 */
function formatPath(path?: ReadonlyArray<PropertyKey | { key: PropertyKey }>): string {
  if (!path || path.length === 0) return ""
  return path.map(segment => {
    if (typeof segment === "object" && "key" in segment) {
      return segment.key
    }
    return segment
  }).join(", ")
}

/**
 * Format validation issues into error messages
 */
function formatError(issues: ReadonlyArray<{ message: string; path?: ReadonlyArray<PropertyKey | { key: PropertyKey }> }>): string {
  const issueMessages = issues.slice(0, 3).map((issue) => {
    const path = formatPath(issue.path)
    return path ? `Field '${path}': ${issue.message}` : issue.message
  })
  
  return issueMessages.join("; ")
}

/**
 * Validates data using a Standard Schema compatible validator
 * This replaces the old zodValidator function
 */
export async function schemaValidator<T>(
  schema: StandardSchemaV1,
  data: T
): Promise<any> {
  try {
    const result = await schema["~standard"].validate(data)
    
    if (result.issues && result.issues.length > 0) {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        `Invalid request: ${formatError(result.issues)}`
      )
    }
    
    // Success case - no issues
    return "value" in result ? result.value : undefined
  } catch (err) {
    // Re-throw MedusaError as-is
    if (err instanceof MedusaError) {
      throw err
    }
    
    // Handle other errors
    throw new MedusaError(
      MedusaError.Types.INVALID_DATA,
      `Validation error: ${err instanceof Error ? err.message : String(err)}`
    )
  }
}

/**
 * Backward compatibility alias
 * @deprecated Use schemaValidator instead
 */
export const zodValidator = schemaValidator