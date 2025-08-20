import type { StandardSchemaV1 } from "../index"

/**
 * Mock Standard Schema implementations for testing
 */

export function string(): StandardSchemaV1<unknown, string> {
  return {
    "~standard": {
      version: 1,
      vendor: "test",
      validate: async (value: unknown) => {
        if (typeof value !== "string") {
          return {
            issues: [{
              message: value === undefined ? "Required" : `Expected string, received ${typeof value}`,
              path: []
            }]
          }
        }
        return { value }
      }
    }
  }
}

export function number(): StandardSchemaV1<unknown, number> {
  return {
    "~standard": {
      version: 1,
      vendor: "test",
      validate: async (value: unknown) => {
        if (typeof value !== "number") {
          return {
            issues: [{
              message: value === undefined ? "Required" : `Invalid input: expected number, received ${value === undefined ? 'undefined' : typeof value}`,
              path: []
            }]
          }
        }
        return { value }
      }
    }
  }
}

export function optional<T>(schema: StandardSchemaV1<unknown, T>): StandardSchemaV1<unknown, T | undefined> {
  return {
    "~standard": {
      version: 1,
      vendor: "test",
      validate: async (value: unknown) => {
        if (value === undefined) {
          return { value: undefined }
        }
        return schema["~standard"].validate(value)
      }
    }
  }
}

export function object<T extends Record<string, StandardSchemaV1>>(
  shape: T
): StandardSchemaV1<unknown, { [K in keyof T]: T[K] extends StandardSchemaV1<any, infer O> ? O : never }> {
  return {
    "~standard": {
      version: 1,
      vendor: "test",
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
        const result: any = {}

        for (const [key, fieldSchema] of Object.entries(shape)) {
          const fieldValue = (value as any)[key]
          const fieldResult = await fieldSchema["~standard"].validate(fieldValue)
          
          if (fieldResult.issues) {
            for (const issue of fieldResult.issues) {
              errors.push({
                message: issue.message,
                path: [{ key }, ...(issue.path || [])]
              })
            }
          } else {
            result[key] = fieldResult.value
          }
        }

        if (errors.length > 0) {
          return { issues: errors }
        }

        return { value: result }
      }
    }
  }
}

export function transform<TIn, TOut>(
  schema: StandardSchemaV1<unknown, TIn>,
  transformer: (value: TIn) => TOut
): StandardSchemaV1<unknown, TOut> {
  return {
    "~standard": {
      version: 1,
      vendor: "test",
      validate: async (value: unknown) => {
        const result = await schema["~standard"].validate(value)
        if (result.issues) {
          return result
        }
        return { value: transformer(result.value!) }
      }
    }
  }
}

// Helper to mimic Zod's extend functionality
export function extend<T extends StandardSchemaV1>(
  schema: T,
  additionalShape: Record<string, StandardSchemaV1>
): StandardSchemaV1 {
  // This is a simplified version - real implementation would need to merge shapes
  return object(additionalShape)
}