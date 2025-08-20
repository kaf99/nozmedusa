import type { StandardSchemaV1, StandardSchemaV1RawShape } from "./index"

/**
 * Creates a Standard Schema object validator from a shape
 */
export function createObjectSchema(shape: StandardSchemaV1RawShape): StandardSchemaV1 {
  return {
    "~standard": {
      version: 1,
      vendor: "medusa",
      validate: async (value: unknown) => {
        if (typeof value !== "object" || value === null) {
          return {
            issues: [{
              message: "Expected object",
              path: []
            }]
          }
        }

        const errors: Array<{ message: string; path: ReadonlyArray<PropertyKey | { key: PropertyKey }> }> = []
        const result: Record<string, any> = {}

        // Validate each field in the shape
        for (const [key, fieldSchema] of Object.entries(shape)) {
          const fieldValue = (value as any)[key]
          const fieldResult = await fieldSchema["~standard"].validate(fieldValue)
          
          if (fieldResult.issues) {
            // Prepend the key to each issue's path
            for (const issue of fieldResult.issues) {
              errors.push({
                message: issue.message,
                path: [{ key }, ...(issue.path || [])]
              })
            }
          } else {
            result[key] = "value" in fieldResult ? fieldResult.value : undefined
          }
        }

        // Check for unexpected keys
        const expectedKeys = new Set(Object.keys(shape))
        const actualKeys = Object.keys(value as object)
        const unexpectedKeys = actualKeys.filter(key => !expectedKeys.has(key))
        
        if (unexpectedKeys.length > 0) {
          errors.push({
            message: `Unexpected properties: ${unexpectedKeys.join(", ")}`,
            path: []
          })
        }

        if (errors.length > 0) {
          return { issues: errors }
        }

        return { value: result }
      }
    }
  }
}

/**
 * Makes a schema nullable (allows null or undefined)
 */
export function nullable<T extends StandardSchemaV1>(schema: T): StandardSchemaV1 {
  return {
    "~standard": {
      version: 1,
      vendor: "medusa",
      validate: async (value: unknown) => {
        if (value === null || value === undefined) {
          return { value: undefined }
        }
        return schema["~standard"].validate(value)
      }
    }
  }
}