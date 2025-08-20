import { z } from "zod"
import type {
  ZodSchemaCompat,
  ZodObjectCompat,
  ZodOptionalCompat,
  ZodNullableCompat
} from "./zod-compat"

/**
 * Wraps the original schema to a function to accept and merge
 * additional_data schema
 */
export const WithAdditionalData = <T extends ZodObjectCompat>(
  originalSchema: T,
  modifyCallback?: (schema: T) => ZodObjectCompat | ZodSchemaCompat
) => {
  return (
    additionalDataValidator?: ZodOptionalCompat<ZodNullableCompat<ZodObjectCompat>>
  ) => {
    let schema: ZodObjectCompat

    if (!additionalDataValidator) {
      schema = (originalSchema as any).extend({
        additional_data: z.record(z.string(), z.unknown()).nullish(),
      })
    } else {
      schema = (originalSchema as any).extend({
        additional_data: additionalDataValidator,
      })
    }

    return modifyCallback ? modifyCallback(schema as T) : schema
  }
}

export const createBatchBody = (
  createValidator: ZodSchemaCompat,
  updateValidator: ZodSchemaCompat,
  deleteValidator: ZodSchemaCompat = z.string()
) => {
  return z.object({
    create: z.array(createValidator as any).optional(),
    update: z.array(updateValidator as any).optional(),
    delete: z.array(deleteValidator as any).optional(),
  })
}

export const createLinkBody = () => {
  return z.object({
    add: z.array(z.string()).optional(),
    remove: z.array(z.string()).optional(),
  })
}

export const createSelectParams = () => {
  return z.object({
    fields: z.string().optional(),
  })
}

export const createFindParams = ({
  offset,
  limit,
  order,
}: {
  offset?: number
  limit?: number
  order?: string
} = {}) => {
  const selectParams = createSelectParams()

  return selectParams.merge(
    z.object({
      offset: z.preprocess(
        (val) => {
          if (val && typeof val === "string") {
            return parseInt(val)
          }
          return val
        },
        z
          .number()
          .optional()
          .default(offset ?? 0)
      ),
      limit: z.preprocess(
        (val) => {
          if (val && typeof val === "string") {
            return parseInt(val)
          }
          return val
        },
        z
          .number()
          .optional()
          .default(limit ?? 20)
      ),
      order: order
        ? z.string().optional().default(order)
        : z.string().optional(),
      with_deleted: z.preprocess((val) => {
        if (val && typeof val === "string") {
          return val === "true" ? true : val === "false" ? false : val
        }
        return val
      }, z.boolean().optional()),
    })
  )
}

export const createOperatorMap = (
  type?: ZodSchemaCompat,
  valueParser?: (val: any) => any
) => {
  if (!type) {
    type = z.string()
  }

  let simpleType: any = (type as any).optional()
  if (valueParser) {
    simpleType = z.preprocess(valueParser, type as any).optional()
  }

  const arrayType: any = z.array(type as any).optional()
  const unionType: any = z.union([simpleType, arrayType]).optional()

  return z.union([
    unionType,
    z.object({
      $eq: unionType,
      $ne: unionType,
      $in: arrayType,
      $nin: arrayType,
      $like: simpleType,
      $ilike: simpleType,
      $re: simpleType,
      $contains: simpleType,
      $gt: simpleType,
      $gte: simpleType,
      $lt: simpleType,
      $lte: simpleType,
    }),
  ])
}
