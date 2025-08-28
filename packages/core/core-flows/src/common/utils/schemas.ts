import { z } from "zod"
import BigNumberJS from "bignumber.js"

// IBigNumber interface schema
const iBigNumberSchema = z.object({
  numeric: z.number(),
  raw: z
    .object({
      value: z.union([z.string(), z.number()]),
    })
    .passthrough()
    .optional(),
  bigNumber: z.instanceof(BigNumberJS).optional(),
  toJSON: z.function().returns(z.number()),
  valueOf: z.function().returns(z.number()),
})

// BigNumberRawValue is an object with value and optional additional properties
export const bigNumberRawValueSchema = z
  .object({
    value: z.union([z.string(), z.number()]),
  })
  .passthrough()

// BigNumberValue can be number, string, BigNumberJS, or IBigNumber
export const bigNumberValueSchema = z.union([
  z.number(),
  z.string(),
  z.instanceof(BigNumberJS),
  iBigNumberSchema,
])

// BigNumberInput is similar to BigNumberValue - used for input quantities and amounts
export const bigNumberInputSchema = z.union([
  bigNumberRawValueSchema,
  z.number(),
  z.string(),
  z.instanceof(BigNumberJS),
  iBigNumberSchema,
])
