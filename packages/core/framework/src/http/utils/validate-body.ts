import { NextFunction } from "express"
import { MedusaRequest, MedusaResponse } from "../types"
import { MedusaError } from "../../utils"
import { 
  StandardSchemaV1, 
  isStandardSchemaV1 
} from "../../standard-schema"



// Validator that accepts Standard Schema compatible schemas
async function validateWithStandardSchema(
  schema: StandardSchemaV1,
  value: unknown
): Promise<any> {
  const result = await schema["~standard"].validate(value)
  
  if (result.issues && result.issues.length > 0) {
    // Format the error message to match our existing format
    const issues = result.issues.slice(0, 3)
    const messages = issues.map(issue => {
      const path = issue.path?.join(", ")
      
      // Handle required field errors (Zod compatibility)
      if (issue.message === "Required" || 
          (issue.message.includes("Invalid input") && issue.message.includes("received undefined"))) {
        return path ? `Field '${path}' is required` : "Field is required"
      }
      
      // Handle invalid input without undefined (likely a discriminated union error)
      if (issue.message === "Invalid input" && path) {
        // For discriminated union errors in arrays, Zod v3 would append the discriminator field
        // Check if this is an array element that likely has a type discriminator
        if (path.includes("geo_zones") && path.match(/\d+$/)) {
          return `Field '${path}, type' is required`
        }
        return `Field '${path}': Invalid input`
      }
      
      // Handle enum errors specifically
      if (issue.message.includes("Invalid enum value") && path) {
        // Extract expected and received values
        const expectedMatch = issue.message.match(/Expected (.+), received '([^']+)'/)
        if (expectedMatch) {
          const expectedPart = expectedMatch[1]
          const received = expectedMatch[2]
          
          // Extract values between quotes
          const quotedValues = expectedPart.match(/'([^']+)'/g)
          if (quotedValues) {
            const expected = quotedValues.map(v => v.replace(/'/g, '')).join(", ")
            return `Expected: '${expected}' for field '${path}', but got: '${received}'`
          }
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
      
      // Check if the message already contains all the field names from the path
      if (path && issue.path) {
        const pathSegments = issue.path.map(p => String(p))
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
        
        // Skip field prefix for custom validation messages that are complete sentences
        if (issue.message.includes("Provider is required when creating")) {
          return issue.message
        }
        
        // Otherwise add the path prefix for context
        return `Field '${path}': ${issue.message}`
      }
      
      // Handle unrecognized keys error
      if (issue.message.includes("Unrecognized key(s) in object:")) {
        return issue.message.replace("Unrecognized key(s) in object:", "Unrecognized fields:")
      }
      
      return issue.message
    })
    
    throw new MedusaError(
      MedusaError.Types.INVALID_DATA,
      `Invalid request: ${messages.join("; ")}`
    )
  }
  
  // Success case - no issues
  return "value" in result ? result.value : undefined
}

export function validateAndTransformBody(
  schema:
    | StandardSchemaV1
    | ((
        customSchema?: any // Accept any type for backward compatibility with Zod factories
      ) => StandardSchemaV1)
): (
  req: MedusaRequest,
  res: MedusaResponse,
  next: NextFunction
) => Promise<void> {
  return async function validateBody(
    req: MedusaRequest,
    _: MedusaResponse,
    next: NextFunction
  ) {
    try {
      let resolvedSchema: StandardSchemaV1
      if (typeof schema === "function") {
        resolvedSchema = schema(req.additionalDataValidator)
      } else {
        resolvedSchema = schema
      }

      if (!isStandardSchemaV1(resolvedSchema)) {
        throw new MedusaError(
          MedusaError.Types.INVALID_DATA,
          "Schema must implement Standard Schema v1 interface"
        )
      }

      req.validatedBody = await validateWithStandardSchema(resolvedSchema, req.body)
      next()
    } catch (e) {
      next(e)
    }
  }
}
