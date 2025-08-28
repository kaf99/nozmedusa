/**
 * Proposal for integrating compile-time return type validation into workflows
 * 
 * This demonstrates how to modify the existing WorkflowResponse to validate
 * return values against schemas at the point of return, not at call site.
 */

import { z } from "zod"
import type { StandardSchemaV1 } from "@standard-schema/spec"
import { OrchestrationUtils } from "@medusajs/utils"
import { 
  WorkflowData, 
  WorkflowDataProperties,
  createWorkflow as originalCreateWorkflow,
  WorkflowResponse as OriginalWorkflowResponse 
} from "@medusajs/framework/workflows-sdk"

// Type to check if a type matches a schema's output
type MatchesSchema<T, Schema> = Schema extends StandardSchemaV1<any, infer Output>
  ? T extends Output ? true : false
  : true

// Type to create informative error messages
type SchemaValidationError<Expected, Actual> = {
  error: "Return type does not match output schema"
  expected: Expected
  actual: Actual
}

// Enhanced WorkflowResponse that validates at construction time
export class ValidatedWorkflowResponse<
  TResult,
  TSchema extends StandardSchemaV1 | undefined = undefined,
  const THooks extends readonly unknown[] = []
> extends OriginalWorkflowResponse<TResult, THooks> {
  constructor(
    result: TSchema extends StandardSchemaV1
      ? MatchesSchema<TResult, TSchema> extends true
        ? TResult | WorkflowData<TResult> | {
            [K in keyof TResult]:
              | WorkflowData<TResult[K]>
              | WorkflowDataProperties<TResult[K]>
              | TResult[K]
          }
        : SchemaValidationError<StandardSchemaV1.InferOutput<TSchema>, TResult>
      : TResult | WorkflowData<TResult> | {
          [K in keyof TResult]:
            | WorkflowData<TResult[K]>
            | WorkflowDataProperties<TResult[K]>
            | TResult[K]
        },
    options?: { hooks: THooks }
  ) {
    super(result as any, options)
  }
}

// Context type that includes schema information
interface SchemaContext<TSchema extends StandardSchemaV1 | undefined> {
  __outputSchema?: TSchema
}

// Modified workflow creation that injects schema context
export function createWorkflowWithValidation<
  TInputSchema extends StandardSchemaV1,
  TOutputSchema extends StandardSchemaV1,
  THooks extends any[]
>(
  options: {
    name: string
    description?: string
    inputSchema: TInputSchema
    outputSchema: TOutputSchema
  },
  composer: (
    input: WorkflowData<StandardSchemaV1.InferOutput<TInputSchema>>,
    context: SchemaContext<TOutputSchema>
  ) => ValidatedWorkflowResponse<
    StandardSchemaV1.InferOutput<TOutputSchema>,
    TOutputSchema,
    THooks
  > | void
): ReturnType<typeof originalCreateWorkflow> {
  // Wrap the composer to inject context
  const wrappedComposer = (input: any) => {
    const context: SchemaContext<TOutputSchema> = {
      __outputSchema: options.outputSchema
    }
    return composer(input, context)
  }

  return originalCreateWorkflow(options as any, wrappedComposer as any)
}

// Helper function to create validated responses with better ergonomics
export function workflowResponse<TSchema extends StandardSchemaV1>(
  schema: TSchema
): <T extends StandardSchemaV1.InferOutput<TSchema>>(
  result: T,
  options?: { hooks: any[] }
) => ValidatedWorkflowResponse<T, TSchema> {
  return (result, options) => new ValidatedWorkflowResponse<typeof result, TSchema>(result, options)
}

// ============= EXAMPLES =============

// Define schemas
const createUserInputSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  age: z.number().min(18)
})

const userOutputSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string(),
  age: z.number(),
  createdAt: z.string()
})

// Example 1: Direct usage with ValidatedWorkflowResponse
export const createUserWorkflowV1 = createWorkflowWithValidation(
  {
    name: "create-user-v1",
    inputSchema: createUserInputSchema,
    outputSchema: userOutputSchema
  },
  (input) => {
    // ✅ This works - matches schema
    return new ValidatedWorkflowResponse({
      id: "user_123",
      name: input.name,
      email: input.email,
      age: input.age,
      createdAt: new Date().toISOString()
    })

    // ❌ This would show error at return statement (uncomment to test)
    // return new ValidatedWorkflowResponse({
    //   id: "user_123",
    //   name: input.name,
    //   email: input.email
    //   // Missing age and createdAt
    // })
  }
)

// Example 2: Using the helper function
export const createUserWorkflowV2 = createWorkflowWithValidation(
  {
    name: "create-user-v2",
    inputSchema: createUserInputSchema,
    outputSchema: userOutputSchema
  },
  (input, context) => {
    const response = workflowResponse(userOutputSchema)
    
    // ✅ This works
    return response({
      id: "user_123",
      name: input.name,
      email: input.email,
      age: input.age,
      createdAt: new Date().toISOString()
    })

    // ❌ This would fail (uncomment to test)
    // return response({
    //   id: "user_123",
    //   name: input.name
    // })
  }
)

// Example 3: Complex nested schema
const orderSchema = z.object({
  id: z.string(),
  userId: z.string(),
  items: z.array(z.object({
    id: z.string(),
    productId: z.string(),
    quantity: z.number(),
    price: z.number()
  })),
  subtotal: z.number(),
  tax: z.number(),
  total: z.number(),
  status: z.enum(["pending", "confirmed", "shipped", "delivered"])
})

export const createOrderWorkflow = createWorkflowWithValidation(
  {
    name: "create-order",
    inputSchema: z.object({
      userId: z.string(),
      items: z.array(z.object({
        productId: z.string(),
        quantity: z.number()
      }))
    }),
    outputSchema: orderSchema
  },
  (input) => {
    // ✅ Complex object that matches schema
    return new ValidatedWorkflowResponse({
      id: "order_123",
      userId: input.userId,
      items: input.items.map((item, idx) => ({
        id: `item_${idx}`,
        productId: item.productId,
        quantity: item.quantity,
        price: 10.99 // Would come from product lookup
      })),
      subtotal: 100,
      tax: 10,
      total: 110,
      status: "pending"
    })

    // ❌ This would fail - wrong status value (uncomment to test)
    // return new ValidatedWorkflowResponse({
    //   id: "order_123",
    //   userId: input.userId,
    //   items: [],
    //   subtotal: 0,
    //   tax: 0,
    //   total: 0,
    //   status: "invalid_status" // Not in enum
    // })
  }
)

// Example 4: Conditional returns with type narrowing
const conditionalSchema = z.union([
  z.object({ success: z.literal(true), data: userOutputSchema }),
  z.object({ success: z.literal(false), error: z.string() })
])

export const conditionalWorkflow = createWorkflowWithValidation(
  {
    name: "conditional-workflow",
    inputSchema: z.object({ shouldSucceed: z.boolean() }),
    outputSchema: conditionalSchema
  },
  (input) => {
    if (input.shouldSucceed) {
      // ✅ Type narrows correctly
      return new ValidatedWorkflowResponse({
        success: true,
        data: {
          id: "user_123",
          name: "John",
          email: "john@example.com",
          age: 30,
          createdAt: new Date().toISOString()
        }
      })
    } else {
      // ✅ Alternative branch also validates
      return new ValidatedWorkflowResponse({
        success: false,
        error: "Operation failed"
      })
    }
  }
)

// Integration with existing patterns
export class WorkflowResponseFactory {
  static forSchema<TSchema extends StandardSchemaV1>(schema: TSchema) {
    return {
      create<T extends StandardSchemaV1.InferOutput<TSchema>>(
        result: T,
        options?: { hooks: any[] }
      ): ValidatedWorkflowResponse<T, TSchema> {
        return new ValidatedWorkflowResponse(result, options)
      }
    }
  }
}

// Usage:
const userResponse = WorkflowResponseFactory.forSchema(userOutputSchema)
// Now userResponse.create() will validate against userOutputSchema

export {
  ValidatedWorkflowResponse,
  workflowResponse,
  SchemaContext,
  WorkflowResponseFactory
}