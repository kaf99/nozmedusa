import * as z3 from "zod/v3"
import { NextFunction } from "express"
import { MedusaRequest, MedusaResponse } from "../types"
import { zodValidator } from "../../zod"

export function validateAndTransformBody(
  zodSchema:
    | z3.ZodObject<any, any>
    | z3.ZodEffects<any, any>
    | ((
        customSchema?: z3.ZodOptional<z3.ZodNullable<z3.ZodObject<any, any>>>
      ) => z3.ZodObject<any, any> | z3.ZodEffects<any, any>)
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
      let schema: z3.ZodObject<any, any> | z3.ZodEffects<any, any>
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
