import { updateCartPromotionsWorkflow } from "@medusajs/core-flows"
import { PromotionActions } from "@medusajs/framework/utils"
import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { refetchCart } from "../../helpers"
import { HttpTypes } from "@medusajs/framework/types"

export const POST = async (
  req: MedusaRequest<HttpTypes.StoreCartAddPromotion>,
  res: MedusaResponse<HttpTypes.StoreCartResponse>
) => {
  const workflow = updateCartPromotionsWorkflow(req.scope)
  const payload = req.validatedBody

  await workflow.run({
    input: {
      promo_codes: payload.promo_codes,
      cart_id: req.params.id,
      action: PromotionActions.ADD,
    },
  })

  const cart = await refetchCart(
    req.params.id,
    req.scope,
    req.queryConfig.fields
  )

  res.status(200).json({ cart })
}

export const DELETE = async (
  req: MedusaRequest<any, HttpTypes.StoreCartRemovePromotion>,
  res: MedusaResponse<{
    cart: HttpTypes.StoreCart
  }>
) => {
  const workflow = updateCartPromotionsWorkflow(req.scope)
  let promoCodes = req.validatedQuery.promo_codes
  if (!Array.isArray(promoCodes)) {
    promoCodes = [promoCodes]
  }

  await workflow.run({
    input: {
      promo_codes: promoCodes,
      cart_id: req.params.id,
      action: PromotionActions.REMOVE,
    },
  })

  const cart = await refetchCart(
    req.params.id,
    req.scope,
    req.queryConfig.fields
  )

  res.status(200).json({ cart })
}
