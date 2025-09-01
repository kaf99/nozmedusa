import { ApplicationMethodAllocationValues, BigNumberInput, PromotionTypes, } from "@medusajs/framework/types"
import {
  ApplicationMethodAllocation,
  ApplicationMethodTargetType,
  ApplicationMethodTargetType as TargetType,
  calculateAdjustmentAmountFromPromotion,
  ComputedActions,
  MathBN,
  MedusaError,
} from "@medusajs/framework/utils"
import { areRulesValidForContext } from "../validations"
import { computeActionForBudgetExceeded } from "./usage"

function validateContext(
  contextKey: string,
  context: PromotionTypes.ComputeActionContext[TargetType]
) {
  if (!context) {
    throw new MedusaError(
      MedusaError.Types.INVALID_DATA,
      `"${contextKey}" should be present as an array in the context for computeActions`
    )
  }
}

export function getComputedActionsForItems(
  promotion: PromotionTypes.PromotionDTO,
  items: PromotionTypes.ComputeActionContext[TargetType.ITEMS],
  appliedPromotionsMap: Map<string, number>,
  allocationOverride?: ApplicationMethodAllocationValues
): PromotionTypes.ComputeActions[] {
  validateContext("items", items)

  return applyPromotionToItems(
    promotion,
    items,
    appliedPromotionsMap,
    allocationOverride
  )
}

function applyPromotionToItems(
  promotion: PromotionTypes.PromotionDTO,
  items: PromotionTypes.ComputeActionContext[TargetType.ITEMS],
  appliedPromotionsMap: Map<string, BigNumberInput>,
  allocationOverride?: ApplicationMethodAllocationValues
): PromotionTypes.ComputeActions[] {
  const { application_method: applicationMethod } = promotion

  if (!applicationMethod) {
    return []
  }

  const allocation = applicationMethod?.allocation! || allocationOverride
  const target = applicationMethod?.target_type

  if (!items?.length || !target) {
    return []
  }

  const computedActions: PromotionTypes.ComputeActions[] = []

  const applicableItems = getValidItemsForPromotion(items, promotion)

  if (!applicableItems.length) {
    return computedActions
  }

  const isTargetLineItems = target === TargetType.ITEMS
  const isTargetOrder = target === TargetType.ORDER
  const promotionValue = applicationMethod?.value ?? 0
  const maxQuantity = applicationMethod?.max_quantity!

  let lineItemsAmount = MathBN.convert(0)
  if (allocation === ApplicationMethodAllocation.ACROSS) {
    lineItemsAmount = applicableItems.reduce(
      (acc, item) =>
        MathBN.sub(
          MathBN.add(
            acc,
            promotion.is_tax_inclusive ? item.original_total : item.subtotal
          ),
          appliedPromotionsMap.get(item.id) ?? 0
        ),
      MathBN.convert(0)
    )

    if (MathBN.lte(lineItemsAmount, 0)) {
      return computedActions
    }
  }

  for (const item of applicableItems) {
    if (
      MathBN.lte(
        promotion.is_tax_inclusive ? item.original_total : item.subtotal,
        0
      )
    ) {
      continue
    }

    const appliedPromoValue = appliedPromotionsMap.get(item.id) ?? 0

    const amount = calculateAdjustmentAmountFromPromotion(
      item,
      {
        value: promotionValue,
        applied_value: appliedPromoValue,
        is_tax_inclusive: promotion.is_tax_inclusive,
        max_quantity: maxQuantity,
        type: applicationMethod?.type!,
        allocation,
      },
      lineItemsAmount
    )

    if (MathBN.lte(amount, 0)) {
      continue
    }

    const budgetExceededAction = computeActionForBudgetExceeded(
      promotion,
      amount
    )

    if (budgetExceededAction) {
      computedActions.push(budgetExceededAction)
      continue
    }

    appliedPromotionsMap.set(item.id, MathBN.add(appliedPromoValue, amount))

    if (isTargetLineItems || isTargetOrder) {
      computedActions.push({
        action: ComputedActions.ADD_ITEM_ADJUSTMENT,
        item_id: item.id,
        amount,
        code: promotion.code!,
        is_tax_inclusive: promotion.is_tax_inclusive,
      })
    }
  }

  return computedActions
}

function getValidItemsForPromotion(
  items:
    | PromotionTypes.ComputeActionContext[TargetType.ITEMS]
    | PromotionTypes.ComputeActionContext[TargetType.SHIPPING_METHODS],
  promotion: PromotionTypes.PromotionDTO
) {
  if (!items?.length || !promotion?.application_method) {
    return []
  }

  const isTargetShippingMethod =
    promotion.application_method?.target_type === TargetType.SHIPPING_METHODS

  const targetRules = promotion.application_method?.target_rules ?? []
  const hasTargetRules = targetRules.length > 0

  if (isTargetShippingMethod && !hasTargetRules) {
    return items.filter(
      (item) => item && "subtotal" in item && MathBN.gt(item.subtotal, 0)
    )
  }

  return items.filter((item) => {
    if (!item) {
      return false
    }

    if ("is_discountable" in item && !item.is_discountable) {
      return false
    }

    if (!("subtotal" in item) || MathBN.lte(item.subtotal, 0)) {
      return false
    }

    if (!isTargetShippingMethod && !("quantity" in item)) {
      return false
    }

    if (!hasTargetRules) {
      return true
    }

    return areRulesValidForContext(
      promotion?.application_method?.target_rules!,
      item,
      ApplicationMethodTargetType.ITEMS
    )
  })
}
