import { expectTypeOf } from "expect-type"
import { createWorkflow } from "../create-workflow"
import { WorkflowResponse } from "../helpers/workflow-response"
import { WorkflowManager } from "@medusajs/orchestration"
import { z } from "zod"

describe("createWorkflow with schemas", () => {
  beforeEach(() => {
    WorkflowManager.unregisterAll()
  })

  it("should store schemas when provided", () => {
    const inputSchema = z.object({
      name: z.string(),
      age: z.number(),
    })

    const outputSchema = z.object({
      greeting: z.string(),
    })

    createWorkflow(
      {
        name: "test-workflow-with-schemas",
        inputSchema,
        outputSchema,
      },
      (input) => {
        return new WorkflowResponse({
          greeting: `Hello ${input.name}, you are ${input.age} years old`,
        })
      }
    )

    const schemas = WorkflowManager.getWorkflowSchemas(
      "test-workflow-with-schemas"
    )

    expect(schemas).toBeDefined()
    expect(schemas?.inputSchema).toBe(inputSchema)
    expect(schemas?.outputSchema).toBe(outputSchema)
  })

  it("should work without schemas (backward compatibility)", () => {
    createWorkflow("test-workflow-no-schemas", () => {
      return new WorkflowResponse({
        result: "test",
      })
    })

    const schemas = WorkflowManager.getWorkflowSchemas(
      "test-workflow-no-schemas"
    )

    expect(schemas).toBeDefined()
    expect(schemas?.inputSchema).toBeUndefined()
    expect(schemas?.outputSchema).toBeUndefined()
  })

  it("should infer types from schemas", () => {
    const inputSchema = z.object({
      firstName: z.string(),
      lastName: z.string(),
    })

    const outputSchema = z.object({
      fullName: z.string(),
    })

    const workflow = createWorkflow(
      {
        name: "test-workflow-type-inference",
        inputSchema,
        outputSchema,
      },
      (input) => {
        // This should have proper type inference
        // input.firstName and input.lastName should be typed as string
        const fullName = `${input.firstName} ${input.lastName}`

        return new WorkflowResponse({
          fullName,
        })
      }
    )

    const run = workflow.run<undefined, undefined>
    type RunParams = Parameters<typeof run>[0]
    type InputType = NonNullable<RunParams>["input"]
    type ExpectedInput = { firstName: string; lastName: string } | undefined
    expectTypeOf<InputType>().toEqualTypeOf<ExpectedInput>()

    type WorkflowOut = Awaited<ReturnType<typeof run>>
    type ResultOutput = WorkflowOut["result"]
    type ExpectedOutput = { fullName: string }
    expectTypeOf<ResultOutput>().toEqualTypeOf<ExpectedOutput>()
  })
})
