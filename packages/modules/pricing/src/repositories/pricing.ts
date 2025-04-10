import {
  flattenObjectToKeyValuePairs,
  isPresent,
  MedusaError,
  MikroOrmBase,
  PriceListStatus,
  promiseAll,
} from "@medusajs/framework/utils"

import {
  CalculatedPriceSetDTO,
  Context,
  PricingContext,
  PricingFilters,
  PricingRepositoryService,
} from "@medusajs/framework/types"
import { Knex, SqlEntityManager } from "@mikro-orm/postgresql"

// Simple cache implementation

export class PricingRepository
  extends MikroOrmBase
  implements PricingRepositoryService
{
  constructor() {
    // @ts-ignore
    // eslint-disable-next-line prefer-rest-params
    super(...arguments)
  }

  async calculatePrices(
    pricingFilters: PricingFilters,
    pricingContext: PricingContext = { context: {} },
    sharedContext: Context = {}
  ): Promise<CalculatedPriceSetDTO[]> {
    const manager = this.getActiveManager<SqlEntityManager>(sharedContext)
    const knex = manager.getKnex()
    const context = pricingContext.context || {}

    // Extract quantity and currency from context
    const quantity = context.quantity
    delete context.quantity

    // Currency code is required
    const currencyCode = context.currency_code
    delete context.currency_code

    if (!currencyCode) {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        `Method calculatePrices requires currency_code in the pricing context`
      )
    }

    // Generate flatten key-value pairs for rule matching
    const [ruleAttributes, priceListRuleAttributes] =
      await this.getAttributesFromRuleTables(knex)

    const allowedRuleAttributes = [
      ...ruleAttributes,
      ...priceListRuleAttributes,
    ]

    const flattenedKeyValuePairs = flattenObjectToKeyValuePairs(context)

    const flattenedContext = Object.entries(flattenedKeyValuePairs).filter(
      ([key, value]) => {
        const isValuePresent = !Array.isArray(value) && isPresent(value)
        const isArrayPresent = Array.isArray(value) && value.flat(1).length

        return (
          allowedRuleAttributes.includes(key) &&
          (isValuePresent || isArrayPresent)
        )
      }
    )

    const hasComplexContext = flattenedContext.length > 0

    // Base query with efficient index lookups
    const query = knex
      .select({
        id: "price.id",
        price_set_id: "price.price_set_id",
        amount: "price.amount",
        raw_amount: "price.raw_amount",
        min_quantity: "price.min_quantity",
        max_quantity: "price.max_quantity",
        currency_code: "price.currency_code",
        price_list_id: "price.price_list_id",
        price_list_type: "pl.type",
        rules_count: "price.rules_count",
        price_list_rules_count: "pl.rules_count",
      })
      .from("price")
      .whereIn("price.price_set_id", pricingFilters.id)
      .andWhere("price.currency_code", currencyCode)
      .whereNull("price.deleted_at")

    // Apply quantity filter
    if (quantity !== undefined) {
      query.andWhere(function (this: Knex.QueryBuilder) {
        this.where(function (this: Knex.QueryBuilder) {
          this.where("price.min_quantity", "<=", quantity).andWhere(
            "price.max_quantity",
            ">=",
            quantity
          )
        }).orWhere(function (this: Knex.QueryBuilder) {
          this.whereNull("price.min_quantity").whereNull("price.max_quantity")
        })
      })
    } else {
      query.andWhere(function (this: Knex.QueryBuilder) {
        this.where("price.min_quantity", "<=", 1).orWhereNull(
          "price.min_quantity"
        )
      })
    }

    // Efficient price list join with index usage
    query.leftJoin("price_list as pl", function (this: Knex.JoinClause) {
      this.on("pl.id", "=", "price.price_list_id")
        .andOn("pl.status", "=", knex.raw("?", [PriceListStatus.ACTIVE]))
        .andOn(function (this: Knex.JoinClause) {
          this.onNull("pl.deleted_at")
        })
        .andOn(function (this: Knex.JoinClause) {
          this.onNull("pl.starts_at").orOn("pl.starts_at", "<=", knex.fn.now())
        })
        .andOn(function (this: Knex.JoinClause) {
          this.onNull("pl.ends_at").orOn("pl.ends_at", ">=", knex.fn.now())
        })
    })

    // OPTIMIZATION: Only add complex rule filtering when necessary
    if (hasComplexContext) {
      // For price rules - direct check that ALL rules match
      const priceRuleConditions = knex.raw(
        `
        (
          price.rules_count = 0 OR
          (
            /* Count all matching rules and compare to total rule count */
            SELECT COUNT(*) 
            FROM price_rule pr
            WHERE pr.price_id = price.id 
            AND pr.deleted_at IS NULL
            AND (
              ${flattenedContext
                .map(([key, value]) => {
                  if (typeof value === "number") {
                    return `
                    (pr.attribute = ? AND (
                      (pr.operator = 'eq' AND pr.value = ?) OR
                      (pr.operator = 'gt' AND ? > pr.value::numeric) OR
                      (pr.operator = 'gte' AND ? >= pr.value::numeric) OR
                      (pr.operator = 'lt' AND ? < pr.value::numeric) OR
                      (pr.operator = 'lte' AND ? <= pr.value::numeric)
                    ))
                    `
                  } else {
                    const normalizeValue = Array.isArray(value)
                      ? value
                      : [value]
                    const placeholders = normalizeValue.map(() => "?").join(",")
                    return `(pr.attribute = ? AND pr.value IN (${placeholders}))`
                  }
                })
                .join(" OR ")}
            )
          ) = (
            /* Get total rule count */
            SELECT COUNT(*) 
            FROM price_rule pr
            WHERE pr.price_id = price.id 
            AND pr.deleted_at IS NULL
          )
        )
        `,
        flattenedContext.flatMap(([key, value]) => {
          if (typeof value === "number") {
            return [key, value.toString(), value, value, value, value]
          } else {
            const normalizeValue = Array.isArray(value) ? value : [value]
            return [key, ...normalizeValue]
          }
        })
      )

      // For price list rules - direct check that ALL rules match
      const priceListRuleConditions = knex.raw(
        `
        (
          pl.rules_count = 0 OR
          (
            /* Count all matching rules and compare to total rule count */
            SELECT COUNT(*) 
            FROM price_list_rule plr
            WHERE plr.price_list_id = pl.id
              AND plr.deleted_at IS NULL
              AND (
                ${flattenedContext
                  .map(([key, value]) => {
                    return `(plr.attribute = ? AND plr.value @> ?)`
                  })
                  .join(" OR ")}
              )
          ) = (
            /* Get total rule count */
            SELECT COUNT(*) 
            FROM price_list_rule plr
            WHERE plr.price_list_id = pl.id
              AND plr.deleted_at IS NULL
          )
        )
        `,
        flattenedContext.flatMap(([key, value]) => {
          return [key, JSON.stringify(Array.isArray(value) ? value : [value])]
        })
      )

      query.where((qb) => {
        qb.whereNull("price.price_list_id")
          .andWhereRaw(priceRuleConditions)
          .orWhere((qb2) => {
            qb2
              .whereNotNull("price.price_list_id")
              .whereRaw(priceListRuleConditions)
              .andWhereRaw(priceRuleConditions)
          })
      })
    } else {
      // Simple case - just get prices with no rules or price lists with no rules
      query.where(function (this: Knex.QueryBuilder) {
        this.where("price.rules_count", 0).orWhere(function (
          this: Knex.QueryBuilder
        ) {
          this.whereNotNull("price.price_list_id").where("pl.rules_count", 0)
        })
      })
    }

    // Optimized ordering to help query planner and preserve price list precedence
    query
      .orderByRaw("price.price_list_id IS NOT NULL DESC")
      .orderByRaw("price.rules_count + COALESCE(pl.rules_count, 0) DESC") // More specific rules first
      .orderBy("pl.id", "asc") // Order by price list ID to ensure first created price list takes precedence
      .orderBy("price.amount", "asc") // For non-price list prices, cheaper ones first

    // Execute the optimized query
    return await query
  }

  // Helper method to get attributes from rule tables
  private async getAttributesFromRuleTables(knex: Knex) {
    // Using distinct queries for better performance
    const priceRuleAttributesQuery = knex("price_rule")
      .distinct("attribute")
      .pluck("attribute")

    const priceListRuleAttributesQuery = knex("price_list_rule")
      .distinct("attribute")
      .pluck("attribute")

    return await promiseAll([
      priceRuleAttributesQuery,
      priceListRuleAttributesQuery,
    ])
  }
}
