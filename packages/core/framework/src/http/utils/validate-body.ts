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
    // Format the error message
    const issues = result.issues.slice(0, 3)
    const messages = issues.map(issue => {
      const path = issue.path?.join(", ")
      return path ? `Field '${path}': ${issue.message}` : issue.message
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
