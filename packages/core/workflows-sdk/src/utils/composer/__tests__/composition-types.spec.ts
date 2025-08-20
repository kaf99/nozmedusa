import { expectTypeOf } from "expect-type"
import { z } from "zod"
import { createWorkflow } from "../create-workflow"
import { WorkflowResponse } from "../helpers/workflow-response"
import { WorkflowData } from "../type"
import { isZodSchema } from "../../zod-compat"

describe("Workflow composition types", () => {
  describe("createWorkflow with schemas", () => {
    it("should work with previous type inference", () => {
      type InputSchema = {
        title: string
        description?: string
        price: number
      }

      // This should cause a TypeScript error since inputSchema is not a valid property yet
      const myWorkflow = createWorkflow(
        {
          name: "myWorkflow",
        },
        (input: WorkflowData<InputSchema>) => {
          return new WorkflowResponse(input)
        }
      )

      const run = myWorkflow.run<undefined, undefined>
      type Input = Exclude<Parameters<typeof run>[0], undefined>["input"]

      expectTypeOf<Input>().toEqualTypeOf<
        | { title: string; description?: string | undefined; price: number }
        | undefined
      >()
    })

    it("should infer input type from zod schema when inputSchema is provided", () => {
      const inputSchema = z.object({
        title: z.string(),
        description: z.string().optional(),
        price: z.number(),
      })

      const myWorkflow = createWorkflow(
        {
          name: "myWorkflow",
          inputSchema,
        },
        (input) => {
          // Check that input type is correctly inferred inside the composer
          expectTypeOf(input).toMatchTypeOf<
            WorkflowData<{
              title: string
              description?: string | undefined
              price: number
            }>
          >()

          return new WorkflowResponse(input)
        }
      )

      // Check the workflow run method input type
      const run = myWorkflow.run<undefined, undefined>
      type Input = Exclude<Parameters<typeof run>[0], undefined>["input"]

      expectTypeOf<Input>().toEqualTypeOf<
        | {
            title: string
            description?: string | undefined
            price: number
          }
        | undefined
      >()
    })

    it("should infer output type from zod schema when outputSchema is provided", () => {
      const outputSchema = z.object({
        id: z.string(),
        created: z.boolean(),
      })

      const myWorkflow = createWorkflow(
        {
          name: "myWorkflow",
          outputSchema,
        },
        (input: WorkflowData<{ title: string }>) => {
          return new WorkflowResponse({
            id: "123",
            created: true,
          })
        }
      )

      const run = myWorkflow.run<undefined, undefined>
      type Exec = Awaited<ReturnType<typeof run>>
      type Result = Exec extends { result: infer R } ? R : never

      expectTypeOf<Result>().toEqualTypeOf<{
        id: string
        created: boolean
      }>()

      type Input = Exclude<Parameters<typeof run>[0], undefined>["input"]
      expectTypeOf<Input>().toEqualTypeOf<
        | {
            title: string
          }
        | undefined
      >()
    })

    it("should infer both input and output types when both schemas are provided", () => {
      const inputSchema = z.object({
        title: z.string(),
        description: z.string().optional(),
        price: z.number(),
      })

      const outputSchema = z.object({
        id: z.string(),
        success: z.boolean(),
        product: z.object({
          title: z.string(),
          price: z.number(),
        }),
      })

      const myWorkflow = createWorkflow(
        {
          name: "myWorkflow",
          inputSchema,
          outputSchema,
        },
        (input) => {
          // Check that input type is correctly inferred
          expectTypeOf(input).toMatchTypeOf<
            WorkflowData<{
              title: string
              description?: string | undefined
              price: number
            }>
          >()

          return new WorkflowResponse({
            id: "123",
            success: true,
            product: {
              title: input.title,
              price: input.price,
            },
          })
        }
      )

      // Check the workflow input type
      const run = myWorkflow.run<undefined, undefined>
      type Input = Exclude<Parameters<typeof run>[0], undefined>["input"]

      expectTypeOf<Input>().toEqualTypeOf<
        | {
            title: string
            description?: string | undefined
            price: number
          }
        | undefined
      >()

      type Exec = Awaited<ReturnType<typeof run>>
      type Result = Exec extends { result: infer R } ? R : never

      expectTypeOf<Result>().toEqualTypeOf<{
        id: string
        success: boolean
        product: {
          title: string
          price: number
        }
      }>()
    })

    it("should accept Zod v3-style schemas through compatibility layer", () => {
      // Simulate a Zod v3-style schema (they have the same structure in v4)
      const v3StyleSchema = z.object({
        name: z.string(),
        age: z.number().min(0),
      })

      // Verify the schema is recognized as a Zod schema
      expect(isZodSchema(v3StyleSchema)).toBe(true)

      const myWorkflow = createWorkflow(
        {
          name: "v3CompatWorkflow",
          inputSchema: v3StyleSchema,
        },
        (input) => {
          // Input should be typed correctly
          expectTypeOf(input).toMatchTypeOf<
            WorkflowData<{
              name: string
              age: number
            }>
          >()
          
          return new WorkflowResponse({ success: true })
        }
      )

      // Check runtime compatibility
      const run = myWorkflow.run<undefined, undefined>
      type Input = Exclude<Parameters<typeof run>[0], undefined>["input"]

      expectTypeOf<Input>().toEqualTypeOf<
        | {
            name: string
            age: number
          }
        | undefined
      >()
    })
  })
})
