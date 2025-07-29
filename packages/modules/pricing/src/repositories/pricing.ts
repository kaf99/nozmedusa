import {
  flattenObjectToKeyValuePairs,
  isPresent,
  MedusaError,
  MikroOrmBase,
  PriceListStatus,
} from "@medusajs/framework/utils"

import {
  CalculatedPriceSetDTO,
  Context,
  PricingContext,
  PricingFilters,
  PricingRepositoryService,
} from "@medusajs/framework/types"
import { Knex, SqlEntityManager } from "@mikro-orm/postgresql"

export class PricingRepository
  extends MikroOrmBase
  implements PricingRepositoryService
{
  #availableAttributes: Set<string> = new Set()

  constructor() {
    // @ts-ignore
    // eslint-disable-next-line prefer-rest-params
    super(...arguments)
  }

  clearAvailableAttributes() {
    this.#availableAttributes.clear()
  }

  async #cacheAvailableAttributes() {
    const manager = this.getActiveManager<SqlEntityManager>()
    const knex = manager.getKnex()

    const { rows } = await knex.raw(
      `
      SELECT DISTINCT attribute 
      FROM (
        SELECT attribute 
        FROM price_rule 
        UNION ALL
        SELECT attribute 
        FROM price_list_rule
      ) as combined_rules_attributes
    `
    )
    this.#availableAttributes.clear()
    rows.forEach(({ attribute }) => {
      this.#availableAttributes.add(attribute)
    })
  }

  async #cacheAvailableAttributesIfNecessary() {
    if (this.#availableAttributes.size === 0) {
      await this.#cacheAvailableAttributes()
    }
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
    const flattenedKeyValuePairs = flattenObjectToKeyValuePairs(context)

    // First filter by value presence
    let flattenedContext = Object.entries(flattenedKeyValuePairs).filter(
      ([, value]) => {
        const isValuePresent = !Array.isArray(value) && isPresent(value)
        const isArrayPresent = Array.isArray(value) && value.flat(1).length

        return isValuePresent || isArrayPresent
      }
    )

    if (flattenedContext.length > 10) {
      await this.#cacheAvailableAttributesIfNecessary()
      flattenedContext = flattenedContext.filter(([key]) =>
        this.#availableAttributes.has(key)
      )
    }

    const hasComplexContext = flattenedContext.length > 0

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

    if (quantity !== undefined) {
      query.andWhere(function (this: Knex.QueryBuilder) {
        this.orWhere(function (this: Knex.QueryBuilder) {
          this.where("price.min_quantity", "<=", quantity).andWhere(
            "price.max_quantity",
            ">=",
            quantity
          )

          this.orWhere("price.min_quantity", "<=", quantity).whereNull(
            "price.max_quantity"
          )

          this.orWhereNull("price.min_quantity").whereNull("price.max_quantity")

          this.orWhereNull("price.min_quantity").andWhere(
            "price.max_quantity",
            ">=",
            quantity
          )
        })
      })
    } else {
      query.andWhere(function (this: Knex.QueryBuilder) {
        this.where("price.min_quantity", "<=", 1).orWhereNull(
          "price.min_quantity"
        )
      })
    }

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

    const preparedBindings = flattenedContext.flatMap(([key, value]) => {
      if (typeof value === "number") {
        return [key, value.toString(), value, value, value, value]
      } else {
        const arrayValue = Array.isArray(value) ? value : [value]
        return [key, JSON.stringify(arrayValue)]
      }
    })

    const preparedParameters = (tableName) =>
      flattenedContext
        .map(([key, value]) => {
          if (typeof value === "number") {
            return `
                    (${tableName}.attribute = ? AND (
                      (${tableName}.operator = 'eq' AND ${tableName}.value = ?) OR
                      (${tableName}.operator = 'gt' AND ? > ${tableName}.value::numeric) OR
                      (${tableName}.operator = 'gte' AND ? >= ${tableName}.value::numeric) OR
                      (${tableName}.operator = 'lt' AND ? < ${tableName}.value::numeric) OR
                      (${tableName}.operator = 'lte' AND ? <= ${tableName}.value::numeric)
                    ))
                    `
          } else {
            return `(${tableName}.attribute = ? AND ${tableName}.value IN (?))`
          }
        })
        .join(" OR ")

    if (hasComplexContext) {
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
            AND (${preparedParameters("pr")})
          ) = (
            /* Get total rule count */
            SELECT COUNT(*) 
            FROM price_rule pr
            WHERE pr.price_id = price.id 
            AND pr.deleted_at IS NULL
          )
        )
        `,
        preparedBindings
      )

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
              AND (${preparedParameters("plr")})
          ) = (
            /* Get total rule count */
            SELECT COUNT(*) 
            FROM price_list_rule plr
            WHERE plr.price_list_id = pl.id
              AND plr.deleted_at IS NULL
          )
        )
        `,
        preparedBindings
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
      query.where(function (this: Knex.QueryBuilder) {
        this.where("price.rules_count", 0).orWhere(function (
          this: Knex.QueryBuilder
        ) {
          this.whereNotNull("price.price_list_id").where("pl.rules_count", 0)
        })
      })
    }

    query
      .orderByRaw("price.price_list_id IS NOT NULL DESC")
      .orderByRaw("price.rules_count + COALESCE(pl.rules_count, 0) DESC")
      .orderBy("pl.id", "asc")
      .orderBy("price.amount", "asc")

    return await query
  }
}
