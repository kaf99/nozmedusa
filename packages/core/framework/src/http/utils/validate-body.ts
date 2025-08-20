import * as z3 from "zod/v3"
import * as z4 from "zod/v4"
import { NextFunction } from "express"
import { MedusaRequest, MedusaResponse } from "../types"
import { zodValidator } from "../../zod"

// Type unions to accept both v3 and v4 schemas
type AnyZodObject = z3.ZodObject<any, any> | z4.ZodObject<any, any>
type AnyZodEffects = z3.ZodEffects<any, any> | z4.ZodEffects<any, any>
type AnyZodOptional<T = any> = z3.ZodOptional<T> | z4.ZodOptional<T>
type AnyZodNullable<T = any> = z3.ZodNullable<T> | z4.ZodNullable<T>

export function validateAndTransformBody(
  zodSchema:
    | AnyZodObject
    | AnyZodEffects
    | ((
        customSchema?: AnyZodOptional<AnyZodNullable<AnyZodObject>>
      ) => AnyZodObject | AnyZodEffects)
): (
  req: MedusaRequest,
  res: MedusaResponse,
  next: NextFunction
) => Promise<void> {
  return async function validateBody(
    req: MedusaRequest,
    _: MedusaResponse,
    next: NextFunction
  ) {
    try {
      let schema: AnyZodObject | AnyZodEffects
      if (typeof zodSchema === "function") {
        schema = zodSchema(req.additionalDataValidator)
      } else {
        schema = zodSchema
      }

      req.validatedBody = await zodValidator(schema, req.body)
      next()
    } catch (e) {
      next(e)
    }
  }
}
