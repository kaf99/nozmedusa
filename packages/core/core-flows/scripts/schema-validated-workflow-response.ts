/**
 * Practical implementation of schema-validated WorkflowResponse
 * that shows errors at the return statement when the value doesn't match the schema
 */

import { z } from "zod"
import type { StandardSchemaV1 } from "@standard-schema/spec"
import { OrchestrationUtils } from "@medusajs/utils"
import { WorkflowData, WorkflowDataProperties } from "@medusajs/framework/workflows-sdk"

// Enhanced WorkflowResponse that validates against a schema at compile time
export class SchemaValidatedWorkflowResponse<
  TResult,
  TSchema extends StandardSchemaV1 | undefined = undefined,
  const THooks extends readonly unknown[] = []
> {
  __type: typeof OrchestrationUtils.SymbolMedusaWorkflowResponse =
    OrchestrationUtils.SymbolMedusaWorkflowResponse

  constructor(
    public $result: TSchema extends StandardSchemaV1
      ? TResult extends StandardSchemaV1.InferOutput<TSchema>
        ? TResult | WorkflowData<TResult> | {
            [K in keyof TResult]:
              | WorkflowData<TResult[K]>
              | WorkflowDataProperties<TResult[K]>
              | TResult[K]
          }
        : never
      : TResult | WorkflowData<TResult> | {
          [K in keyof TResult]:
            | WorkflowData<TResult[K]>
            | WorkflowDataProperties<TResult[K]>
            | TResult[K]
        },
    public options?: { hooks: THooks }
  ) {}
}

// Helper type to extract schema from workflow options
type ExtractOutputSchema<T> = T extends { outputSchema: infer S } 
  ? S extends StandardSchemaV1 ? S : undefined
  : undefined

// Modified createWorkflow signature that propagates schema to response
declare function createWorkflowWithValidation<
  TOptions extends { outputSchema?: StandardSchemaV1 },
  THooks extends any[]
>(
  options: TOptions,
  composer: (
    input: any
  ) => SchemaValidatedWorkflowResponse<
    StandardSchemaV1.InferOutput<ExtractOutputSchema<TOptions>>,
    ExtractOutputSchema<TOptions>,
    THooks
  > | void
): any

// Example usage
const userSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string().email(),
  age: z.number().min(0)
})

const orderSchema = z.object({
  id: z.string(),
  userId: z.string(),
  items: z.array(z.object({
    productId: z.string(),
    quantity: z.number().positive()
  })),
  total: z.number().positive()
})

// This should work - return value matches schema
const validWorkflow = createWorkflowWithValidation(
  {
    name: "create-user",
    outputSchema: userSchema
  },
  (input) => {
    // This return should be valid
    return new SchemaValidatedWorkflowResponse({
      id: "123",
      name: "John Doe",
      email: "john@example.com",
      age: 30
    })
  }
)

// This should show error at the return statement
const invalidWorkflow = createWorkflowWithValidation(
  {
    name: "create-user-invalid",
    outputSchema: userSchema
  },
  (input) => {
    // This return should show error - missing required fields
    return new SchemaValidatedWorkflowResponse({
      id: "123",
      name: "John Doe"
      // Missing email and age
    } as any) // Remove 'as any' to see the error
  }
)

// Alternative approach using a factory function
function createSchemaValidatedResponse<TSchema extends StandardSchemaV1>(
  schema: TSchema
) {
  return function<T extends StandardSchemaV1.InferOutput<TSchema>>(
    value: T
  ): SchemaValidatedWorkflowResponse<T, TSchema> {
    return new SchemaValidatedWorkflowResponse(value)
  }
}

// Usage with factory
const createUserResponse = createSchemaValidatedResponse(userSchema)

// This works
const validUser = createUserResponse({
  id: "123",
  name: "John Doe",
  email: "john@example.com",
  age: 30
})

// This would fail at compile time (uncomment to test)
// const invalidUser = createUserResponse({
//   id: "123",
//   name: "John Doe"
//   // Missing email and age
// })

// Integration proposal for existing WorkflowResponse
export class WorkflowResponseWithSchema<
  TResult,
  const THooks extends readonly unknown[] = []
> {
  static withSchema<TSchema extends StandardSchemaV1>(schema: TSchema) {
    return class<T extends StandardSchemaV1.InferOutput<TSchema>> {
      constructor(
        result: T,
        options?: { hooks: THooks }
      ) {
        return new SchemaValidatedWorkflowResponse<T, TSchema, THooks>(result, options)
      }
    }
  }
}

// Usage of the integrated approach
const UserWorkflowResponse = WorkflowResponseWithSchema.withSchema(userSchema)

// This works
const user1 = new UserWorkflowResponse({
  id: "123",
  name: "John Doe",
  email: "john@example.com",
  age: 30
})

// This would fail (uncomment to test)
// const user2 = new UserWorkflowResponse({
//   id: "123",
//   name: "John Doe"
// })

export {
  createSchemaValidatedResponse,
  ExtractOutputSchema
}