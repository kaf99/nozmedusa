import { expectTypeOf } from "expect-type"
import { z } from "zod"
import { validateAndTransformBody } from "../utils/validate-body"
import { NextFunction } from "express"
import { MedusaRequest, MedusaResponse } from "../types"

describe("validateAndTransformBody type compatibility", () => {
  it("should accept a simple Zod v3 schema", () => {
    const schema = z.object({
      name: z.string(),
      age: z.number(),
    })

    // This should not cause type errors
    expectTypeOf(validateAndTransformBody).toBeCallableWith(schema)
  })

  it("should accept the exact schema structure from @medusajs/medusa", () => {
    // This is the exact schema that's causing issues in @medusajs/medusa
    const StoreCalculateShippingOptionPrice = z.object({
      cart_id: z.string(),
      data: z.record(z.string(), z.unknown()).optional(),
    })

    // This should reproduce the error about '_cached' being private
    expectTypeOf(validateAndTransformBody).toBeCallableWith(
      StoreCalculateShippingOptionPrice
    )
  })

  it("should accept schemas with various Zod types", () => {
    // Test with different Zod constructs to ensure compatibility
    const complexSchema = z.object({
      id: z.string().uuid(),
      items: z.array(z.object({
        variant_id: z.string(),
        quantity: z.number().int().positive(),
      })),
      metadata: z.record(z.string(), z.unknown()).nullish(),
      region_id: z.string().nullish(),
      email: z.string().email().optional(),
      promo_codes: z.array(z.string()).optional(),
    })

    expectTypeOf(validateAndTransformBody).toBeCallableWith(complexSchema)
  })

  it("should accept a factory function returning a schema", () => {
    const schemaFactory = (additionalSchema?: any) => {
      const baseSchema = z.object({
        name: z.string(),
      })
      
      return additionalSchema 
        ? baseSchema.extend({ additional_data: additionalSchema })
        : baseSchema
    }

    expectTypeOf(validateAndTransformBody).toBeCallableWith(schemaFactory)
  })

  it("should return the correct middleware function type", () => {
    const schema = z.object({
      test: z.string(),
    })

    const result = validateAndTransformBody(schema)
    
    expectTypeOf(result).toEqualTypeOf<
      (req: MedusaRequest, res: MedusaResponse, next: NextFunction) => Promise<void>
    >()
  })

  it("should work with strict() schemas", () => {
    const strictSchema = z.object({
      name: z.string(),
    }).strict()

    expectTypeOf(validateAndTransformBody).toBeCallableWith(strictSchema)
  })

  it("should work with transformed schemas", () => {
    const transformedSchema = z.object({
      date: z.string(),
    }).transform((val) => ({
      ...val,
      date: new Date(val.date),
    }))

    expectTypeOf(validateAndTransformBody).toBeCallableWith(transformedSchema)
  })

  it("should work with refined schemas", () => {
    const refinedSchema = z.object({
      password: z.string(),
      confirmPassword: z.string(),
    }).refine((data) => data.password === data.confirmPassword, {
      message: "Passwords don't match",
      path: ["confirmPassword"],
    })

    expectTypeOf(validateAndTransformBody).toBeCallableWith(refinedSchema)
  })
})