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
    
    // Handle required field errors
    if (issue.message === "Required" || 
        (issue.message.includes("Invalid input") && issue.message.includes("received undefined"))) {
      return path ? `Field '${path}' is required` : "Field is required"
    }
    
    // Handle enum errors - both regular enum and nativeEnum
    if (issue.message.includes("Invalid enum value") || 
        (issue.message.includes("Expected") && issue.message.includes("received") && path === "status")) {
      // Try different patterns for enum errors
      let expected: string | null = null
      let received: string | null = null
      
      // Pattern 1: "Invalid enum value. Expected 'draft' | 'active' | 'inactive', received 'does-not-exist'"
      const enumPattern1 = issue.message.match(/Expected (.+), received '([^']+)'/)
      if (enumPattern1) {
        const expectedPart = enumPattern1[1]
        received = enumPattern1[2]
        
        // Extract values between quotes
        const quotedValues = expectedPart.match(/'([^']+)'/g)
        if (quotedValues) {
          expected = quotedValues.map(v => v.replace(/'/g, '')).join(", ")
        }
      }
      
      // Pattern 2: Handle other possible formats
      if (!expected && issue.message.includes("received")) {
        const receivedMatch = issue.message.match(/received '([^']+)'/)
        if (receivedMatch) {
          received = receivedMatch[1]
          // For status field, we know the expected values
          if (path === "status") {
            expected = "draft, active, inactive"
          }
        }
      }
      
      if (expected && received && path) {
        return `Expected: '${expected}' for field '${path}', but got: '${received}'`
      }
    }
    
    // Handle minimum number validation
    if (issue.message.includes("Number must be greater than or equal to") && path) {
      const minMatch = issue.message.match(/Number must be greater than or equal to (\d+)/)
      if (minMatch) {
        const minValue = minMatch[1]
        return `Value for field '${path}' too small, expected at least: '${minValue}'`
      }
    }
    
    // Handle type errors
    if (issue.message.includes("Expected") && issue.message.includes("received")) {
      return path ? `Expected type: '${issue.message.match(/Expected (\w+)/)?.[1]}' for field '${path}', got: '${issue.message.match(/received (\w+)/)?.[1]}'` : issue.message
    }
    
    // Check if the message already contains all the field names from the path
    if (path && issue.path) {
      const pathSegments = issue.path.map(p => {
        if (typeof p === "object" && "key" in p) {
          return String(p.key)
        }
        return String(p)
      })
      const messageContainsAllFields = pathSegments.every(segment => 
        issue.message.includes(`'${segment}'`) || 
        issue.message.includes(`"${segment}"`) ||
        issue.message.includes(` ${segment} `) ||
        issue.message.includes(`${segment}:`)
      )
      
      // If message already mentions all fields, don't add redundant prefix
      if (messageContainsAllFields) {
        return issue.message
      }
      
      // Otherwise add the path prefix for context
      return `Field '${path}': ${issue.message}`
    }
    
    return issue.message
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