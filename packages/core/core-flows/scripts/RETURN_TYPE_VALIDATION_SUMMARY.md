# TypeScript Return Type Validation Inside Function Bodies

## Overview

This document summarizes TypeScript patterns and techniques for validating return types inside function bodies rather than at the function call site, specifically in the context of workflow schemas.

## Key Findings

### 1. **Conditional Type Constraints**

The most effective pattern uses conditional types in constructor parameters to enforce type constraints:

```typescript
class ValidatedWorkflowResponse<TResult, TSchema extends StandardSchemaV1> {
  constructor(
    result: TResult extends StandardSchemaV1.InferOutput<TSchema>
      ? TResult
      : never
  ) {}
}
```

This causes TypeScript to show errors at the point where `new ValidatedWorkflowResponse()` is called if the result doesn't match the schema.

### 2. **Type-Level Validation**

Using type-level functions that return `never` or error types when validation fails:

```typescript
type MatchesSchema<T, Schema> = Schema extends StandardSchemaV1<any, infer Output>
  ? T extends Output ? T : SchemaValidationError<Output, T>
  : T
```

### 3. **Factory Pattern**

Creating factory functions that enforce type constraints:

```typescript
function workflowResponse<TSchema>(schema: TSchema) {
  return <T extends StandardSchemaV1.InferOutput<TSchema>>(result: T) => {
    return new WorkflowResponse(result)
  }
}
```

## Recommended Implementation

The most practical approach for the Medusa workflow system would be:

### 1. **Enhanced WorkflowResponse Class**

```typescript
export class ValidatedWorkflowResponse<
  TResult,
  TSchema extends StandardSchemaV1 | undefined = undefined,
  const THooks extends readonly unknown[] = []
> extends WorkflowResponse<TResult, THooks> {
  constructor(
    result: TSchema extends StandardSchemaV1
      ? TResult extends StandardSchemaV1.InferOutput<TSchema>
        ? TResult | WorkflowData<TResult>
        : never
      : TResult | WorkflowData<TResult>,
    options?: { hooks: THooks }
  ) {
    super(result as any, options)
  }
}
```

### 2. **Modified createWorkflow Function**

The `createWorkflow` function can be enhanced to pass schema information to the composer function, enabling compile-time validation:

```typescript
export function createWorkflow<TInputSchema, TOutputSchema>(
  options: {
    inputSchema: TInputSchema
    outputSchema: TOutputSchema
  },
  composer: (input) => ValidatedWorkflowResponse<
    StandardSchemaV1.InferOutput<TOutputSchema>,
    TOutputSchema
  >
) {
  // Implementation
}
```

## Benefits

1. **Early Error Detection**: Errors appear at the return statement, not when the workflow is called
2. **Better Developer Experience**: Immediate feedback while writing the workflow
3. **Type Safety**: Ensures workflow outputs match their declared schemas
4. **Backward Compatibility**: Can be implemented alongside existing patterns

## Implementation Path

1. Create `ValidatedWorkflowResponse` as an alternative to `WorkflowResponse`
2. Add overloads to `createWorkflow` that use the validated response type
3. Gradually migrate workflows to use the new pattern
4. Eventually deprecate the non-validated approach

## Example Usage

```typescript
const workflow = createWorkflow(
  {
    name: "create-user",
    outputSchema: userSchema
  },
  (input) => {
    // ✅ This validates at compile time
    return new ValidatedWorkflowResponse({
      id: "123",
      name: "John",
      email: "john@example.com"
    })
    
    // ❌ This shows error at the return statement
    return new ValidatedWorkflowResponse({
      id: "123"
      // Missing required fields
    })
  }
)
```

## Limitations

1. **Generic Type Inference**: TypeScript's inference can be limited with deeply nested generics
2. **Error Messages**: Error messages from conditional types can be cryptic
3. **Performance**: Complex type checking can slow down TypeScript compilation

## Conclusion

The conditional type constraint pattern in constructor parameters provides the best balance of:
- Compile-time validation at the return statement
- Minimal changes to existing code
- Good developer experience
- Type safety

This approach can be incrementally adopted in the Medusa workflow system to provide better type safety for workflow outputs.