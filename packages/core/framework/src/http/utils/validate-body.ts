import { NextFunction } from "express"
import { MedusaRequest, MedusaResponse } from "../types"
import { zodValidator } from "../../zod/zod-helpers"
import type { 
  ZodSchemaCompat, 
  ZodObjectCompat, 
  ZodOptionalCompat,
  ZodNullableCompat 
} from "../../zod/zod-compat"

export function validateAndTransformBody(
  zodSchema:
    | ZodObjectCompat
    | ((
        customSchema?: ZodOptionalCompat<ZodNullableCompat<ZodObjectCompat>>
      ) => ZodObjectCompat | ZodSchemaCompat)
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
      let schema: ZodSchemaCompat
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
