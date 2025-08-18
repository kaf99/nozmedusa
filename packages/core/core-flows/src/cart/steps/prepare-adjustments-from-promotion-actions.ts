import {
  AddItemAdjustmentAction,
  AddShippingMethodAdjustment,
  BigNumberInput,
  BigNumberValue,
  CartDTO,
  ComputeActions,
  IPromotionModuleService,
  OrderDTO,
  PromotionDTO,
} from "@medusajs/framework/types"
import { ComputedActions, Modules } from "@medusajs/framework/utils"
import { StepResponse, createStep } from "@medusajs/framework/workflows-sdk"

/**
 * The details of the actions computed by the Promotion Module.
 */
export interface PrepareAdjustmentsFromPromotionActionsStepInput {
  /**
   * The actions computed by the Promotion Module.
   */
  actions: ComputeActions[]
  /**
   * The cart to prepare the adjustments for.
   */
  cart: CartDTO | OrderDTO
}

/**
 * The details of the adjustments to create and remove.
 */
export interface PrepareAdjustmentsFromPromotionActionsStepOutput {
  /**
   * The line item adjustments to create.
   */
  lineItemAdjustmentsToCreate: {
    /**
     * The promotion code that computed the adjustment.
     */
    code: string
    /**
     * The amount of the adjustment.
     */
    amount: number
    /**
     * The ID of the line item to adjust.
     */
    item_id: string
    /**
     * The ID of the applied promotion.
     */
    promotion_id?: string
  }[]
  /**
   * The line item adjustment IDs to remove.
   */
  lineItemAdjustmentIdsToRemove: string[]
  /**
   * The shipping method adjustments to create.
   */
  shippingMethodAdjustmentsToCreate: {
    /**
     * The promotion code that computed the adjustment.
     */
    code: string
    /**
     * The amount of the adjustment.
     */
    amount: number
    /**
     * The ID of the shipping method to adjust.
     */
    shipping_method_id: string
    /**
     * The ID of the applied promotion.
     */
    promotion_id?: string
  }[]
  /**
   * The shipping method adjustment IDs to remove.
   */
  shippingMethodAdjustmentIdsToRemove: string[]
  /**
   * The promotion codes that were computed.
   */
  computedPromotionCodes: string[]
}

function buildAdjustmentKey(
  promotionId: string,
  itemId: string,
  amount: number | BigNumberValue | BigNumberInput
) {
  return `${promotionId}-${itemId}-${amount}`
}

export const prepareAdjustmentsFromPromotionActionsStepId =
  "prepare-adjustments-from-promotion-actions"
/**
 * This step prepares the line item or shipping method adjustments using
 * actions computed by the Promotion Module.
 *
 * @example
 * const data = prepareAdjustmentsFromPromotionActionsStep({
 *   "actions": [{
 *     "action": "addItemAdjustment",
 *     "item_id": "litem_123",
 *     "amount": 10,
 *     "code": "10OFF",
 *   }]
 * })
 */
export const prepareAdjustmentsFromPromotionActionsStep = createStep(
  prepareAdjustmentsFromPromotionActionsStepId,
  async (
    data: PrepareAdjustmentsFromPromotionActionsStepInput,
    { container }
  ) => {
    const promotionModuleService: IPromotionModuleService = container.resolve(
      Modules.PROMOTION
    )

    const { actions = [], cart } = data

    if (!actions.length) {
      return new StepResponse({
        lineItemAdjustmentsToCreate: [],
        lineItemAdjustmentIdsToRemove: [],
        shippingMethodAdjustmentsToCreate: [],
        shippingMethodAdjustmentIdsToRemove: [],
        computedPromotionCodes: [],
      })
    }

    const promotions = await promotionModuleService.listPromotions(
      { code: actions.map((a) => a.code) },
      { select: ["id", "code"] }
    )

    const promotionsMap = new Map<string, PromotionDTO>(
      promotions.map((promotion) => [promotion.code!, promotion])
    )

    const existingLineItemAdjustments = new Set<string>()
    const existingShippingMethodAdjustments = new Set<string>()
    const computedPromotionCodes = new Set<string>()

    for (const item of cart?.items ?? []) {
      for (const adjustment of item?.adjustments ?? []) {
        if (!adjustment.promotion_id) {
          continue
        }

        existingLineItemAdjustments.add(
          buildAdjustmentKey(
            adjustment.promotion_id,
            item.id,
            adjustment.amount
          )
        )
      }
    }

    for (const shippingMethod of cart?.shipping_methods ?? []) {
      for (const adjustment of shippingMethod?.adjustments ?? []) {
        if (!adjustment.promotion_id) {
          continue
        }

        existingShippingMethodAdjustments.add(
          buildAdjustmentKey(
            adjustment.promotion_id,
            shippingMethod.id,
            adjustment.amount
          )
        )
      }
    }

    const lineItemAdjustmentsToCreate = actions
      .map((computeAction) => {
        if (computeAction.action !== ComputedActions.ADD_ITEM_ADJUSTMENT) {
          return null
        }

        const action = computeAction as AddItemAdjustmentAction
        const promoId = promotionsMap.get(action.code)?.id!
        const key = buildAdjustmentKey(promoId, action.item_id, action.amount)

        if (existingLineItemAdjustments.has(key)) {
          return null
        }

        computedPromotionCodes.add(action.code)

        return {
          code: action.code,
          amount: action.amount,
          is_tax_inclusive: action.is_tax_inclusive,
          item_id: action.item_id,
          promotion_id: promotionsMap.get(action.code)?.id,
        }
      })
      .filter((adjustment) => {
        return adjustment !== null
      })

    const lineItemAdjustmentIdsToRemove = actions
      .filter((a) => a.action === ComputedActions.REMOVE_ITEM_ADJUSTMENT)
      .map((a) => a.adjustment_id)

    const shippingMethodAdjustmentsToCreate = actions
      .map((computeAction) => {
        if (
          computeAction.action !==
          ComputedActions.ADD_SHIPPING_METHOD_ADJUSTMENT
        ) {
          return null
        }

        const action = computeAction as AddShippingMethodAdjustment
        const promoId = promotionsMap.get(action.code)?.id!
        const key = buildAdjustmentKey(
          promoId,
          action.shipping_method_id,
          action.amount
        )

        if (existingShippingMethodAdjustments.has(key)) {
          return null
        }

        computedPromotionCodes.add(action.code)

        return {
          code: action.code,
          amount: action.amount,
          shipping_method_id: action.shipping_method_id,
          promotion_id: promotionsMap.get(action.code)?.id,
        }
      })
      .filter((adjustment) => {
        return adjustment !== null
      })

    const shippingMethodAdjustmentIdsToRemove = actions
      .filter(
        (a) => a.action === ComputedActions.REMOVE_SHIPPING_METHOD_ADJUSTMENT
      )
      .map((a) => a.adjustment_id)

    return new StepResponse({
      lineItemAdjustmentsToCreate,
      lineItemAdjustmentIdsToRemove,
      shippingMethodAdjustmentsToCreate,
      shippingMethodAdjustmentIdsToRemove,
      computedPromotionCodes: Array.from(computedPromotionCodes),
    })
  }
)
