import { z } from "zod"
export const createOperatorMap = (
  type?: z.ZodType,
  valueParser?: (val: any) => any
) => {
  if (!type) {
    type = z.string()
  }

  let simpleType: any = type.optional()
  if (valueParser) {
    simpleType = z.preprocess(valueParser, type).optional()
  }

  const arrayType: any = z.array(type).optional()
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
