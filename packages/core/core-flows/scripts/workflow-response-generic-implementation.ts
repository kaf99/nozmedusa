/**
 * Implementation Guide: Making WorkflowResponse Generic for Schema Validation
 * 
 * This file demonstrates the minimal changes needed to the existing WorkflowResponse
 * and createWorkflow to enforce type safety between outputSchema and return values.
 */

import type { StandardSchemaV1 } from "@standard-schema/spec"
import { OrchestrationUtils } from "@medusajs/utils"
import { WorkflowData, WorkflowDataProperties } from "@medusajs/framework/workflows-sdk"

// ============= STEP 1: Enhanced WorkflowResponse =============

/**
 * Modified WorkflowResponse that can optionally validate against a schema
 * 
 * Key changes:
 * 1. Added TSchema generic parameter (defaults to 'any' for backward compatibility)
 * 2. Constructor parameter type changes based on whether TSchema is provided
 * 3. When TSchema is a StandardSchemaV1, TResult must extend its output type
 */
export class WorkflowResponse<
  TResult,
  const THooks extends readonly unknown[] = [],
  TSchema = any
> {
  __type: typeof OrchestrationUtils.SymbolMedusaWorkflowResponse =
    OrchestrationUtils.SymbolMedusaWorkflowResponse

  constructor(
    // This conditional type enforces validation when TSchema is provided
    public $result: TSchema extends StandardSchemaV1<any, infer Output>
      ? TResult extends Output
        ? // Valid case: allow WorkflowData variations
          | TResult
          | WorkflowData<TResult>
          | {
              [K in keyof TResult]:
                | WorkflowData<TResult[K]>
                | WorkflowDataProperties<TResult[K]>
                | TResult[K]
            }
        : // Invalid case: show descriptive error
          {
            __error: "WorkflowResponse: Return value does not match output schema"
            __expected: Output
            __received: TResult
          }
      : // No schema provided: accept any valid workflow result
        | TResult
        | WorkflowData<TResult>
        | {
            [K in keyof TResult]:
              | WorkflowData<TResult[K]>
              | WorkflowDataProperties<TResult[K]>
              | TResult[K]
          },
    public options?: { hooks: THooks }
  ) {}
}

// ============= STEP 2: Schema-Aware Composer Return Type =============

/**
 * Type that modifies the composer function's return type based on schema presence
 */
type SchemaAwareComposerReturn<TResult, THooks, TOutputSchema> = 
  TOutputSchema extends StandardSchemaV1
    ? WorkflowResponse<TResult, THooks, TOutputSchema> | void
    : WorkflowResponse<TResult, THooks> | void

// ============= STEP 3: Modified createWorkflow Signature =============

/**
 * Enhanced createWorkflow that propagates schema information to WorkflowResponse
 * 
 * The key insight is that when outputSchema is provided in options,
 * the composer function must return a WorkflowResponse with that schema type.
 */
declare function createWorkflow<
  TInputSchema extends StandardSchemaV1 | undefined,
  TOutputSchema extends StandardSchemaV1 | undefined,
  THooks extends any[]
>(
  options: {
    name: string
    description?: string
    inputSchema?: TInputSchema
    outputSchema?: TOutputSchema
  },
  composer: (
    input: WorkflowData<
      TInputSchema extends StandardSchemaV1 
        ? StandardSchemaV1.InferOutput<TInputSchema>
        : any
    >
  ) => SchemaAwareComposerReturn<
    TOutputSchema extends StandardSchemaV1
      ? StandardSchemaV1.InferOutput<TOutputSchema>
      : any,
    THooks,
    TOutputSchema
  >
): any // ReturnWorkflow type would be here

// ============= USAGE EXAMPLES =============

import { z } from "zod"

// Define schemas
const userSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string().email(),
  age: z.number().optional()
})

const orderSchema = z.object({
  id: z.string(),
  items: z.array(z.object({
    productId: z.string(),
    quantity: z.number()
  })),
  total: z.number()
})

// Example 1: Workflow with output schema - VALID
const validUserWorkflow = createWorkflow(
  {
    name: "create-user",
    outputSchema: userSchema
  },
  (input) => {
    // ✅ This works - return value matches schema
    return new WorkflowResponse({
      id: "123",
      name: "John Doe",
      email: "john@example.com",
      age: 30
    })
  }
)

// Example 2: Workflow with output schema - INVALID
const invalidUserWorkflow = createWorkflow(
  {
    name: "create-user-invalid",
    outputSchema: userSchema
  },
  (input) => {
    // ❌ TypeScript error: Return value does not match output schema
    // Missing required fields: name, email
    return new WorkflowResponse({
      id: "123"
      // name and email are required by schema but missing
    })
  }
)

// Example 3: Workflow without schema (backward compatible)
const unvalidatedWorkflow = createWorkflow(
  {
    name: "unvalidated-workflow"
    // No outputSchema provided
  },
  (input) => {
    // ✅ Works with any return value (backward compatible)
    return new WorkflowResponse({
      anything: "goes",
      here: 123
    })
  }
)

// Example 4: Complex nested validation
const complexWorkflow = createWorkflow(
  {
    name: "complex-workflow",
    outputSchema: z.object({
      user: userSchema,
      orders: z.array(orderSchema),
      metadata: z.record(z.any())
    })
  },
  (input) => {
    // ✅ Nested objects are validated
    return new WorkflowResponse({
      user: {
        id: "user_1",
        name: "Jane Doe",
        email: "jane@example.com"
      },
      orders: [
        {
          id: "order_1",
          items: [
            { productId: "prod_1", quantity: 2 }
          ],
          total: 99.99
        }
      ],
      metadata: {
        source: "api",
        version: "2.0"
      }
    })
  }
)

// ============= MIGRATION PATH =============

/**
 * For existing workflows, we can provide a migration helper
 * that adds schema validation to existing WorkflowResponse usage
 */
export function withSchema<TSchema extends StandardSchemaV1>(schema: TSchema) {
  return <TResult extends StandardSchemaV1.InferOutput<TSchema>, THooks extends readonly unknown[]>(
    result: TResult,
    options?: { hooks: THooks }
  ): WorkflowResponse<TResult, THooks, TSchema> => {
    return new WorkflowResponse(result, options)
  }
}

// Example migration:
const userResponse = withSchema(userSchema)

const migratedWorkflow = createWorkflow(
  {
    name: "migrated-workflow",
    outputSchema: userSchema
  },
  (input) => {
    // Use the helper for gradual migration
    return userResponse({
      id: "123",
      name: "John",
      email: "john@example.com"
    })
  }
)

// ============= IMPLEMENTATION NOTES =============

/**
 * To implement this in the actual codebase:
 * 
 * 1. Modify WorkflowResponse in workflows-sdk/src/utils/composer/helpers/workflow-response.ts:
 *    - Add the TSchema generic parameter with default value
 *    - Update the constructor parameter type as shown above
 * 
 * 2. Update createWorkflow in workflows-sdk/src/utils/composer/create-workflow.ts:
 *    - Modify the overloads to pass schema type to WorkflowResponse
 *    - Ensure the composer return type includes the schema type
 * 
 * 3. The key is that the schema type flows from:
 *    createWorkflow options -> composer return type -> WorkflowResponse generic
 * 
 * 4. This maintains backward compatibility because:
 *    - TSchema defaults to 'any' when not provided
 *    - Existing workflows without schemas continue to work
 *    - Only workflows with outputSchema get validation
 */

// ============= TYPE SAFETY BENEFITS =============

/**
 * Benefits of this approach:
 * 
 * 1. Compile-time validation: Errors appear immediately in the IDE
 * 2. Location of errors: Errors show at the return statement, not at call site
 * 3. Backward compatible: Existing workflows continue to work
 * 4. Progressive enhancement: Can add schemas gradually
 * 5. Type inference: Return types are inferred from schemas
 * 6. Complex validation: Supports nested objects, arrays, unions, etc.
 */

// Example of complex type inference
type InferredUserType = StandardSchemaV1.InferOutput<typeof userSchema>
// InferredUserType = { id: string; name: string; email: string; age?: number }

// Example of conditional types for validation
type ValidateReturn<T, Schema> = Schema extends StandardSchemaV1<any, infer Output>
  ? T extends Output ? "valid" : "invalid"
  : "no-schema"

type Test1 = ValidateReturn<{ id: string; name: string; email: string }, typeof userSchema> // "valid"
type Test2 = ValidateReturn<{ id: string }, typeof userSchema> // "invalid"
type Test3 = ValidateReturn<any, undefined> // "no-schema"

export {
  WorkflowResponse,
  withSchema,
  type SchemaAwareComposerReturn,
  type ValidateReturn
}