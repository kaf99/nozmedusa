import {
  MedusaResponse,
  AuthenticatedMedusaRequest,
} from "@medusajs/framework/http"
import { Modules } from "@medusajs/framework/utils"
import type { HttpTypes } from "@medusajs/framework/types"
import { importProductsWorkflow } from "@medusajs/core-flows"
import type { AdminImportProductsType } from "../validators"

/**
 * @version 2.8.0
 */
export const POST = async (
  req: AuthenticatedMedusaRequest<AdminImportProductsType>,
  res: MedusaResponse<HttpTypes.AdminImportProductResponse>
) => {
  const fileProvider = req.scope.resolve(Modules.FILE)
  const file = await fileProvider.getAsBuffer(req.validatedBody.file_key)

  const { result, transaction } = await importProductsWorkflow(req.scope).run({
    input: {
      filename: req.validatedBody.originalname,
      fileContent: file.toString("utf-8"),
    },
  })

  res
    .status(202)
    .json({ transaction_id: transaction.transactionId, summary: result })
}
