/**
 * This test simulates how @medusajs/medusa uses validateAndTransformBody
 * to ensure our type signatures are backward compatible
 */

import { z } from "zod"
import { validateAndTransformBody } from "../utils/validate-body"

// Simulate a file from @medusajs/medusa that imports our validator
// This should compile without type errors if we have proper backward compatibility

describe("Medusa package compatibility", () => {
  it("should accept schemas from medusa package without type errors", () => {
    // This is a real schema from @medusajs/medusa that's causing the error
    const StoreCalculateShippingOptionPrice = z.object({
      cart_id: z.string(),
      data: z.record(z.string(), z.unknown()).optional(),
    })

    // This line should not cause a type error about '_cached' being private
    const middleware = validateAndTransformBody(StoreCalculateShippingOptionPrice)
    
    expect(middleware).toBeDefined()
  })

  it("should work with WithAdditionalData pattern from medusa", () => {
    // Medusa uses this pattern for additional data validation
    const WithAdditionalData = <T extends z.ZodObject<any>>(schema: T) => {
      return schema
    }

    const CreateCart = z.object({
      region_id: z.string().nullish(),
      email: z.string().email().nullish(),
      currency_code: z.string().nullish(),
      items: z.array(z.object({
        variant_id: z.string(),
        quantity: z.number(),
        metadata: z.record(z.string(), z.unknown()).nullish(),
      })).optional(),
      sales_channel_id: z.string().nullish(),
      promo_codes: z.array(z.string()).optional(),
      metadata: z.record(z.string(), z.unknown()).nullish(),
    }).strict()

    const StoreCreateCart = WithAdditionalData(CreateCart)

    // This should not cause type errors
    const middleware = validateAndTransformBody(StoreCreateCart)
    
    expect(middleware).toBeDefined()
  })

  it("should work with factory functions from medusa", () => {
    const createSelectParams = () => z.object({
      fields: z.string().optional(),
    })

    // This pattern is used in medusa
    const StoreGetCartsCart = createSelectParams()

    const middleware = validateAndTransformBody(StoreGetCartsCart)
    
    expect(middleware).toBeDefined()
  })

  it("should work with extended schemas", () => {
    const BaseSchema = z.object({
      id: z.string(),
    })

    const ExtendedSchema = BaseSchema.extend({
      name: z.string(),
      description: z.string().optional(),
    })

    const middleware = validateAndTransformBody(ExtendedSchema)
    
    expect(middleware).toBeDefined()
  })

  it("should work with preprocess and transform", () => {
    const schema = z.object({
      offset: z.preprocess(
        (val) => {
          if (val && typeof val === "string") {
            return parseInt(val)
          }
          return val
        },
        z.number().optional().default(0)
      ),
      limit: z.preprocess(
        (val) => {
          if (val && typeof val === "string") {
            return parseInt(val)
          }
          return val
        },
        z.number().optional().default(20)
      ),
    })

    const middleware = validateAndTransformBody(schema)
    
    expect(middleware).toBeDefined()
  })
})