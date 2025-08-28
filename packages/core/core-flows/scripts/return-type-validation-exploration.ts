/**
 * This file explores TypeScript patterns for validating return types
 * inside function bodies rather than at the function call site.
 */

import { z } from "zod"
import type { StandardSchemaV1 } from "@standard-schema/spec"

// Pattern 1: Using a generic constraint with conditional type
type ValidateReturn<T, Schema> = Schema extends StandardSchemaV1<any, infer Output>
  ? T extends Output ? T : never
  : T

function createValidatedFunction<TSchema extends StandardSchemaV1>(
  schema: TSchema
) {
  return function<T>(value: ValidateReturn<T, TSchema>): T {
    return value
  }
}

// Pattern 2: Using a helper function with type assertion
function assertReturnType<Schema extends StandardSchemaV1>(
  value: StandardSchemaV1.InferOutput<Schema>,
  schema: Schema
): StandardSchemaV1.InferOutput<Schema> {
  // Runtime validation could happen here
  // For compile-time only, this is a no-op
  return value
}

// Pattern 3: Using a wrapper type that enforces schema compliance
type SchemaCompliant<T, Schema extends StandardSchemaV1> = T extends StandardSchemaV1.InferOutput<Schema> 
  ? T 
  : never

class TypedWorkflowResponse<T, Schema extends StandardSchemaV1> {
  constructor(public value: SchemaCompliant<T, Schema>) {}
}

// Pattern 4: Using a builder pattern with method chaining
class WorkflowBuilder<TInput, TOutput, TSchema extends StandardSchemaV1> {
  constructor(private schema: TSchema) {}
  
  returns<T extends StandardSchemaV1.InferOutput<TSchema>>(
    value: T
  ): WorkflowResult<T> {
    return new WorkflowResult(value)
  }
}

class WorkflowResult<T> {
  constructor(public value: T) {}
}

// Pattern 5: Using a validation function that returns a branded type
type Validated<T, Brand> = T & { __brand: Brand }

function validateReturn<T, Schema extends StandardSchemaV1>(
  value: T,
  schema: Schema
): Validated<StandardSchemaV1.InferOutput<Schema>, "validated"> {
  // This would fail at compile time if T doesn't match schema output
  return value as any
}

// Pattern 6: Using function overloads with conditional return types
interface ValidatedWorkflow<TInput, TOutput> {
  <T extends TOutput>(value: T): T
  <T>(value: T): T extends TOutput ? T : never
}

// Example usage to test the patterns
const userSchema = z.object({
  id: z.string(),
  name: z.string(),
  age: z.number()
})

// Test Pattern 1
const validateUser = createValidatedFunction(userSchema)
// This should work
const validUser1 = validateUser({ id: "1", name: "John", age: 30 })
// This should fail at compile time (uncomment to test)
// const invalidUser1 = validateUser({ id: "1", name: "John" })

// Test Pattern 3
// This should work
const response1 = new TypedWorkflowResponse<typeof validUser1, typeof userSchema>(validUser1)
// This should fail at compile time (uncomment to test)
// const response2 = new TypedWorkflowResponse<{ id: string }, typeof userSchema>({ id: "1" })

// Test Pattern 4
const builder = new WorkflowBuilder(userSchema)
// This should work
const result1 = builder.returns({ id: "1", name: "John", age: 30 })
// This should fail at compile time (uncomment to test)
// const result2 = builder.returns({ id: "1", name: "John" })

// Pattern 7: Using a type-level function to enforce constraints
type EnforceSchema<T, Schema> = Schema extends StandardSchemaV1<any, infer Output>
  ? T extends Output
    ? T
    : Output & { __error: "Return value does not match schema output type" }
  : T

function workflowWithSchema<TSchema extends StandardSchemaV1>(
  outputSchema: TSchema
) {
  return function<T>(
    fn: () => EnforceSchema<T, TSchema>
  ): StandardSchemaV1.InferOutput<TSchema> {
    return fn() as any
  }
}

// Test Pattern 7
const createUser = workflowWithSchema(userSchema)
// This should work
const user1 = createUser(() => ({ id: "1", name: "John", age: 30 }))
// This should show error at the return statement (uncomment to test)
// const user2 = createUser(() => ({ id: "1", name: "John" }))

// Pattern 8: Using template literal types for better error messages
type ValidateWithMessage<T, Schema> = Schema extends StandardSchemaV1<any, infer Output>
  ? T extends Output
    ? T
    : `Error: Expected ${keyof Output & string} but got ${keyof T & string}`
  : T

// Pattern 9: Combining with existing WorkflowResponse pattern
class SchemaValidatedWorkflowResponse<
  TResult,
  TSchema extends StandardSchemaV1,
  const THooks extends readonly unknown[] = []
> {
  constructor(
    public $result: TResult extends StandardSchemaV1.InferOutput<TSchema>
      ? TResult
      : never,
    public options?: { hooks: THooks }
  ) {}
}

// This approach could be integrated into the existing WorkflowResponse
// to provide compile-time validation when a schema is provided

export {
  ValidateReturn,
  SchemaCompliant,
  TypedWorkflowResponse,
  WorkflowBuilder,
  Validated,
  validateReturn,
  EnforceSchema,
  workflowWithSchema,
  SchemaValidatedWorkflowResponse
}