import { expectTypeOf } from "expect-type"
import { MedusaError } from "@medusajs/utils"
import * as z3 from "zod/v3"
import * as z4 from "zod/v4"
import { MedusaRequest, MedusaResponse } from "../types"
import { validateAndTransformBody } from "../utils/validate-body"

// Keep the original test suite for v3
describe("validateAndTransformBody with Zod v3", () => {
  const z = z3.z

  const createLinkBody = () => {
    return z.object({
      add: z.array(z.string()).optional(),
      remove: z.array(z.string()).optional(),
    })
  }

  afterEach(() => {
    jest.clearAllMocks()
  })

  it("should be typed correctly", () => {
    const StoreCalculateShippingOptionPrice = z3.z.object({
      cart_id: z.string(),
      data: z.record(z.string(), z.unknown()).optional(),
    })

    expectTypeOf(validateAndTransformBody).toBeCallableWith(
      StoreCalculateShippingOptionPrice
    )
  })

  it("should pass additionalDataValidator to validator factory", async () => {
    let mockRequest = {
      query: {},
      body: {
        additional_data: {},
      },
    } as MedusaRequest

    const mockResponse = {} as MedusaResponse
    const nextFunction = jest.fn()

    mockRequest.additionalDataValidator = z
      .object({
        brand_id: z.number(),
      })
      .nullish()

    const validatorFactory = (schema?: any) => {
      return schema
        ? createLinkBody().extend({
            additional_data: schema,
          })
        : createLinkBody()
    }

    let middleware = validateAndTransformBody(validatorFactory)

    await middleware(mockRequest, mockResponse, nextFunction)
    expect(nextFunction.mock.calls[0]).toEqual([
      new MedusaError(
        "invalid_data",
        `Invalid request: Field 'additional_data, brand_id' is required`
      ),
    ])
  })

  it("should allow additional_data to be undefined", async () => {
    let mockRequest = {
      query: {},
      body: {},
    } as MedusaRequest

    const mockResponse = {} as MedusaResponse
    const nextFunction = jest.fn()

    mockRequest.additionalDataValidator = z
      .object({
        brand_id: z.number(),
      })
      .nullish()

    const validatorFactory = (schema?: any) => {
      return schema
        ? createLinkBody().extend({
            additional_data: schema,
          })
        : createLinkBody()
    }

    let middleware = validateAndTransformBody(validatorFactory)

    await middleware(mockRequest, mockResponse, nextFunction)
    expect(nextFunction.mock.calls[0]).toEqual([])
  })

  it("should allow additional_data nested properties to be undefined", async () => {
    let mockRequest = {
      query: {},
      body: {
        additional_data: {},
      },
    } as MedusaRequest

    const mockResponse = {} as MedusaResponse
    const nextFunction = jest.fn()

    mockRequest.additionalDataValidator = z
      .object({
        brand_id: z.number().optional(),
      })
      .nullish()

    const validatorFactory = (schema?: any) => {
      return schema
        ? createLinkBody().extend({
            additional_data: schema,
          })
        : createLinkBody()
    }

    let middleware = validateAndTransformBody(validatorFactory)

    await middleware(mockRequest, mockResponse, nextFunction)
    expect(nextFunction.mock.calls[0]).toEqual([])
  })
})

// Add new test suite for v4
describe("validateAndTransformBody with Zod v4", () => {
  const z = z4.z

  const createLinkBody = () => {
    return z.object({
      add: z.array(z.string()).optional(),
      remove: z.array(z.string()).optional(),
    })
  }

  afterEach(() => {
    jest.clearAllMocks()
  })

  it("should pass additionalDataValidator to validator factory", async () => {
    let mockRequest = {
      query: {},
      body: {
        additional_data: {},
      },
    } as MedusaRequest

    const mockResponse = {} as MedusaResponse
    const nextFunction = jest.fn()

    mockRequest.additionalDataValidator = z
      .object({
        brand_id: z.number(),
      })
      .nullish()

    const validatorFactory = (schema?: any) => {
      return schema
        ? createLinkBody().extend({
            additional_data: schema,
          })
        : createLinkBody()
    }

    let middleware = validateAndTransformBody(validatorFactory)

    await middleware(mockRequest, mockResponse, nextFunction)
    expect(nextFunction.mock.calls[0]).toEqual([
      new MedusaError(
        "invalid_data",
        `Invalid request: Field 'additional_data, brand_id' is required`
      ),
    ])
  })

  it("should allow additional_data to be undefined", async () => {
    let mockRequest = {
      query: {},
      body: {},
    } as MedusaRequest

    const mockResponse = {} as MedusaResponse
    const nextFunction = jest.fn()

    mockRequest.additionalDataValidator = z
      .object({
        brand_id: z.number(),
      })
      .nullish()

    const validatorFactory = (schema?: any) => {
      return schema
        ? createLinkBody().extend({
            additional_data: schema,
          })
        : createLinkBody()
    }

    let middleware = validateAndTransformBody(validatorFactory)

    await middleware(mockRequest, mockResponse, nextFunction)
    expect(nextFunction.mock.calls[0]).toEqual([])
  })

  it("should allow additional_data nested properties to be undefined", async () => {
    let mockRequest = {
      query: {},
      body: {
        additional_data: {},
      },
    } as MedusaRequest

    const mockResponse = {} as MedusaResponse
    const nextFunction = jest.fn()

    mockRequest.additionalDataValidator = z
      .object({
        brand_id: z.number().optional(),
      })
      .nullish()

    const validatorFactory = (schema?: any) => {
      return schema
        ? createLinkBody().extend({
            additional_data: schema,
          })
        : createLinkBody()
    }

    let middleware = validateAndTransformBody(validatorFactory)

    await middleware(mockRequest, mockResponse, nextFunction)
    expect(nextFunction.mock.calls[0]).toEqual([])
  })
})
