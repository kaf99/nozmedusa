import {
  IPromotionModuleService,
  LinkDefinition,
} from "@medusajs/framework/types"
import {
  ContainerRegistrationKeys,
  Modules,
  PromotionActions,
} from "@medusajs/framework/utils"
import { StepResponse, createStep } from "@medusajs/framework/workflows-sdk"

/**
 * The details of the promotion codes to apply on a cart.
 */
export interface UpdateCartPromotionStepInput {
  /**
   * The ID of the cart to update promotions for.
   */
  id: string
  /**
   * The promotion codes to apply on the cart.
   */
  promo_codes?: string[]
  /**
   * Whether to add, remove, or replace promotion codes.
   */
  action?:
    | PromotionActions.ADD
    | PromotionActions.REMOVE
    | PromotionActions.REPLACE
}

export const updateCartPromotionsStepId = "update-cart-promotions"
/**
 * This step updates the promotions applied on a cart.
 */
export const updateCartPromotionsStep = createStep(
  updateCartPromotionsStepId,
  async (data: UpdateCartPromotionStepInput, { container }) => {
    const { promo_codes = [], id, action = PromotionActions.ADD } = data

    const remoteLink = container.resolve(ContainerRegistrationKeys.LINK)
    const query = container.resolve(ContainerRegistrationKeys.QUERY)
    const promotionService = container.resolve<IPromotionModuleService>(
      Modules.PROMOTION
    )

    const { data: existingCartPromotionLinks } = (await query.graph({
      entity: "cart_promotion",
      fields: ["cart_id", "promotion_id"],
      filters: {
        cart_id: [id],
      },
      pagination: {
        take: null,
      },
    })) as { data: { cart_id: string; promotion_id: string }[] }

    const promotionLinkMap = new Map<
      string,
      (typeof existingCartPromotionLinks)[number]
    >(existingCartPromotionLinks.map((link) => [link.promotion_id, link]))

    const linksToCreate: LinkDefinition[] = []
    const linksToDismiss: LinkDefinition[] = []

    const promotionIdsToCreate = new Set<string>()

    // Start by making everything to dismiss and then remove if they are not to dismiss. Cover edge cases where promo are not dimissed in some scenarios
    const promotionIdsToDismiss = new Set<string>(
      existingCartPromotionLinks.map((link) => link.promotion_id)
    )

    if (promo_codes?.length) {
      const promotions = await promotionService.listPromotions(
        { code: promo_codes },
        { select: ["id"], take: null }
      )

      for (const promotion of promotions) {
        const linkObject = {
          [Modules.CART]: { cart_id: id },
          [Modules.PROMOTION]: { promotion_id: promotion.id },
        }

        if ([PromotionActions.ADD, PromotionActions.REPLACE].includes(action)) {
          linksToCreate.push(linkObject)
          promotionIdsToCreate.add(promotion.id)
          promotionIdsToDismiss.delete(promotion.id)
        } else if (action === PromotionActions.REMOVE) {
          const link = promotionLinkMap.get(promotion.id)

          if (link) {
            linksToDismiss.push(linkObject)
            promotionIdsToDismiss.add(promotion.id)
          }
        }
      }
    }

    if (promotionIdsToDismiss.size) {
      linksToDismiss.push(
        ...[...promotionIdsToDismiss].map((promoId) => ({
          [Modules.CART]: { cart_id: id },
          [Modules.PROMOTION]: { promotion_id: promoId },
        }))
      )
    }

    const promotionIdsInBoth = new Set(
      [...promotionIdsToCreate].filter((id) => promotionIdsToDismiss.has(id))
    )

    const filteredLinksToCreate = linksToCreate.filter(
      (link) => !promotionIdsInBoth.has(link[Modules.PROMOTION].promotion_id)
    )
    const filteredLinksToDismiss = linksToDismiss.filter(
      (link) => !promotionIdsInBoth.has(link[Modules.PROMOTION].promotion_id)
    )

    if (filteredLinksToDismiss.length) {
      await remoteLink.dismiss(filteredLinksToDismiss)
    }

    const createdLinks = (
      filteredLinksToCreate.length
        ? await remoteLink.create(filteredLinksToCreate)
        : []
    ) as { id: string; cart_id: string; promotion_id: string }[]

    return new StepResponse(null, {
      createdLink: createdLinks,
      dismissedLinks: filteredLinksToDismiss,
    })
  },
  async (revertData, { container }) => {
    const remoteLink = container.resolve(ContainerRegistrationKeys.LINK)

    if (revertData?.dismissedLinks?.length) {
      await remoteLink.create(revertData.dismissedLinks)
    }

    if (revertData?.createdLink?.length) {
      const toDismiss = revertData?.createdLink.map((link) => ({
        [Modules.CART]: { cart_id: link.cart_id },
        [Modules.PROMOTION]: { promotion_id: link.promotion_id },
      }))

      await remoteLink.dismiss(toDismiss)
    }
  }
)
