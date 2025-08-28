/**
 * Enhanced WorkflowResponse Implementation for Schema Validation
 * 
 * This proposal demonstrates how to modify WorkflowResponse to enforce
 * compile-time validation that the constructor parameter matches the
 * workflow's output schema.
 */

import type { StandardSchemaV1 } from "@standard-schema/spec"
import { OrchestrationUtils } from "@medusajs/utils"
import { 
  WorkflowData, 
  WorkflowDataProperties,
  TransactionModelOptions,
  ReturnWorkflow
} from "@medusajs/framework/workflows-sdk"
import { z } from "zod"

// ============= CORE IMPLEMENTATION =============

/**
 * Enhanced WorkflowResponse that validates the result against the schema
 * at the point of construction (inside the workflow composer function)
 */
export class SchemaValidatedWorkflowResponse<
  TResult,
  TSchema extends StandardSchemaV1 | undefined = undefined,
  const THooks extends readonly unknown[] = []
> {
  __type: typeof OrchestrationUtils.SymbolMedusaWorkflowResponse =
    OrchestrationUtils.SymbolMedusaWorkflowResponse

  constructor(
    // The conditional type here enforces that TResult must match the schema output
    public $result: TSchema extends StandardSchemaV1<any, infer Output>
      ? TResult extends Output
        ? TResult | WorkflowData<TResult> | {
            [K in keyof TResult]:
              | WorkflowData<TResult[K]>
              | WorkflowDataProperties<TResult[K]>
              | TResult[K]
          }
        : {
            error: "Return value does not match output schema"
            expected: Output
            received: TResult
          }
      : TResult | WorkflowData<TResult> | {
          [K in keyof TResult]:
            | WorkflowData<TResult[K]>
            | WorkflowDataProperties<TResult[K]>
            | TResult[K]
        },
    public options?: { hooks: THooks }
  ) {}
}

/**
 * Modified createWorkflow overload that returns a schema-aware WorkflowResponse
 * This ensures that when outputSchema is provided, the composer must return
 * a SchemaValidatedWorkflowResponse with the matching schema type
 */
export function createWorkflowWithSchemaValidation<
  TInputSchema extends StandardSchemaV1,
  TOutputSchema extends StandardSchemaV1,
  THooks extends any[]
>(
  options: {
    name: string
    description?: string
    inputSchema: TInputSchema
    outputSchema: TOutputSchema
  } & TransactionModelOptions,
  composer: (
    input: WorkflowData<StandardSchemaV1.InferOutput<TInputSchema>>
  ) => SchemaValidatedWorkflowResponse<
    StandardSchemaV1.InferOutput<TOutputSchema>,
    TOutputSchema,
    THooks
  > | void
): ReturnWorkflow<
  StandardSchemaV1.InferOutput<TInputSchema>,
  StandardSchemaV1.InferOutput<TOutputSchema>,
  THooks
>

// Overload for partial schemas
export function createWorkflowWithSchemaValidation<
  TData,
  TResult,
  THooks extends any[]
>(
  options: {
    name: string
    description?: string
    inputSchema?: StandardSchemaV1<any, TData>
    outputSchema?: StandardSchemaV1<any, TResult>
  } & TransactionModelOptions,
  composer: (
    input: WorkflowData<TData>
  ) => SchemaValidatedWorkflowResponse<TResult, undefined, THooks> | void
): ReturnWorkflow<TData, TResult, THooks>

// Implementation would delegate to the actual createWorkflow
export function createWorkflowWithSchemaValidation(
  options: any,
  composer: any
): any {
  // This would be implemented in the actual workflows-sdk package
  // For now, this is a type-only demonstration
  throw new Error("Implementation placeholder")
}

// ============= HELPER UTILITIES =============

/**
 * Factory function for creating schema-validated responses
 * This provides better ergonomics than using the class constructor directly
 */
export function schemaResponse<TSchema extends StandardSchemaV1>(
  schema: TSchema
) {
  return function createResponse<
    T extends StandardSchemaV1.InferOutput<TSchema>,
    THooks extends readonly unknown[] = []
  >(
    result: T,
    options?: { hooks: THooks }
  ): SchemaValidatedWorkflowResponse<T, TSchema, THooks> {
    return new SchemaValidatedWorkflowResponse<T, TSchema, THooks>(
      result,
      options
    )
  }
}

/**
 * Type helper to extract the inferred output type from a schema
 */
export type InferSchemaOutput<T> = T extends StandardSchemaV1<any, infer Output>
  ? Output
  : never

// ============= USAGE EXAMPLES =============

// Define schemas
const userInputSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  age: z.number().min(18).optional()
})

const userOutputSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string(),
  age: z.number().optional(),
  createdAt: z.date(),
  updatedAt: z.date()
})

// Example 1: Direct usage with SchemaValidatedWorkflowResponse
export const createUserWorkflowDirect = createWorkflowWithSchemaValidation(
  {
    name: "create-user-direct",
    description: "Creates a new user with validation",
    inputSchema: userInputSchema,
    outputSchema: userOutputSchema
  },
  (input) => {
    const now = new Date()
    
    // ✅ This works - matches schema
    return new SchemaValidatedWorkflowResponse({
      id: `user_${Date.now()}`,
      name: input.name,
      email: input.email,
      age: input.age,
      createdAt: now,
      updatedAt: now
    })

    // ❌ This would show an error at the return statement
    // Uncomment to see the error:
    // return new SchemaValidatedWorkflowResponse({
    //   id: `user_${Date.now()}`,
    //   name: input.name,
    //   // Missing required fields: email, createdAt, updatedAt
    // })
  }
)

// Example 2: Using the factory helper
export const createUserWorkflowFactory = createWorkflowWithSchemaValidation(
  {
    name: "create-user-factory",
    description: "Creates a new user using factory pattern",
    inputSchema: userInputSchema,
    outputSchema: userOutputSchema
  },
  (input) => {
    const response = schemaResponse(userOutputSchema)
    const now = new Date()
    
    // ✅ Clean and type-safe
    return response({
      id: `user_${Date.now()}`,
      name: input.name,
      email: input.email,
      age: input.age,
      createdAt: now,
      updatedAt: now
    })

    // ❌ This would fail at compile time
    // return response({
    //   id: `user_${Date.now()}`,
    //   name: input.name,
    //   email: 123, // Wrong type for email
    //   createdAt: "not-a-date", // Wrong type
    //   updatedAt: now
    // })
  }
)

// Example 3: Complex nested schema with arrays
const orderItemSchema = z.object({
  id: z.string(),
  productId: z.string(),
  variantId: z.string().optional(),
  quantity: z.number().positive(),
  unitPrice: z.number().nonnegative(),
  total: z.number().nonnegative()
})

const orderOutputSchema = z.object({
  id: z.string(),
  customerId: z.string(),
  items: z.array(orderItemSchema),
  subtotal: z.number().nonnegative(),
  tax: z.number().nonnegative(),
  shipping: z.number().nonnegative(),
  total: z.number().nonnegative(),
  status: z.enum(["pending", "processing", "completed", "cancelled"]),
  metadata: z.record(z.any()).optional()
})

export const createOrderWorkflow = createWorkflowWithSchemaValidation(
  {
    name: "create-order",
    inputSchema: z.object({
      customerId: z.string(),
      items: z.array(z.object({
        productId: z.string(),
        variantId: z.string().optional(),
        quantity: z.number().positive()
      }))
    }),
    outputSchema: orderOutputSchema
  },
  (input) => {
    const items = input.items.map((item, idx) => ({
      id: `item_${idx}`,
      productId: item.productId,
      variantId: item.variantId,
      quantity: item.quantity,
      unitPrice: 10.00, // Would be fetched from pricing
      total: item.quantity * 10.00
    }))

    const subtotal = items.reduce((sum, item) => sum + item.total, 0)
    const tax = subtotal * 0.1
    const shipping = 5.00
    
    // ✅ Complex nested structure validated
    return new SchemaValidatedWorkflowResponse({
      id: `order_${Date.now()}`,
      customerId: input.customerId,
      items,
      subtotal,
      tax,
      shipping,
      total: subtotal + tax + shipping,
      status: "pending",
      metadata: {
        source: "api",
        version: "2.0"
      }
    })
  }
)

// Example 4: Union types for conditional returns
const resultSchema = z.discriminatedUnion("status", [
  z.object({
    status: z.literal("success"),
    data: userOutputSchema
  }),
  z.object({
    status: z.literal("error"),
    error: z.object({
      code: z.string(),
      message: z.string(),
      details: z.any().optional()
    })
  })
])

export const conditionalWorkflow = createWorkflowWithSchemaValidation(
  {
    name: "conditional-workflow",
    inputSchema: z.object({
      email: z.string().email(),
      shouldSucceed: z.boolean()
    }),
    outputSchema: resultSchema
  },
  (input) => {
    const response = schemaResponse(resultSchema)
    
    if (input.shouldSucceed) {
      const now = new Date()
      // ✅ Success branch validated
      return response({
        status: "success",
        data: {
          id: `user_${Date.now()}`,
          name: "Test User",
          email: input.email,
          createdAt: now,
          updatedAt: now
        }
      })
    } else {
      // ✅ Error branch also validated
      return response({
        status: "error",
        error: {
          code: "USER_EXISTS",
          message: `User with email ${input.email} already exists`,
          details: { email: input.email }
        }
      })
    }
  }
)

// ============= INTEGRATION PATTERNS =============

/**
 * Pattern for gradually migrating existing workflows
 */
export class WorkflowResponseBuilder {
  static forSchema<TSchema extends StandardSchemaV1>(schema: TSchema) {
    return {
      validate<T extends StandardSchemaV1.InferOutput<TSchema>>(
        value: T
      ): T {
        // Runtime validation could be added here if needed
        return value
      },
      
      create<T extends StandardSchemaV1.InferOutput<TSchema>>(
        value: T,
        options?: { hooks: any[] }
      ): SchemaValidatedWorkflowResponse<T, TSchema> {
        return new SchemaValidatedWorkflowResponse(value, options)
      }
    }
  }
}

// Usage example:
const userResponseBuilder = WorkflowResponseBuilder.forSchema(userOutputSchema)

export const migrationExampleWorkflow = createWorkflowWithSchemaValidation(
  {
    name: "migration-example",
    inputSchema: userInputSchema,
    outputSchema: userOutputSchema
  },
  (input) => {
    const now = new Date()
    
    // First validate, then create response
    const userData = userResponseBuilder.validate({
      id: `user_${Date.now()}`,
      name: input.name,
      email: input.email,
      age: input.age,
      createdAt: now,
      updatedAt: now
    })
    
    return userResponseBuilder.create(userData)
  }
)

// ============= TYPE UTILITIES =============

/**
 * Extract the output type from a workflow
 */
export type WorkflowOutput<T> = T extends ReturnWorkflow<any, infer Output, any>
  ? Output
  : never

/**
 * Extract the input type from a workflow
 */
export type WorkflowInput<T> = T extends ReturnWorkflow<infer Input, any, any>
  ? Input
  : never

/**
 * Type guard for schema validation errors
 */
export type IsSchemaValid<T, Schema> = Schema extends StandardSchemaV1<any, infer Output>
  ? T extends Output ? true : false
  : true

// Example usage of type utilities
type UserWorkflowInput = WorkflowInput<typeof createUserWorkflowDirect>
type UserWorkflowOutput = WorkflowOutput<typeof createUserWorkflowDirect>

// This would be 'true' if the types match
type IsValidUser = IsSchemaValid<UserWorkflowOutput, typeof userOutputSchema>

export {
  SchemaValidatedWorkflowResponse,
  schemaResponse,
  WorkflowResponseBuilder,
  type InferSchemaOutput,
  type WorkflowOutput,
  type WorkflowInput,
  type IsSchemaValid
}