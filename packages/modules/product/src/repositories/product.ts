import { Product, ProductOption } from "@models"

import { Context, DAL, InferEntityType } from "@medusajs/framework/types"
import { buildQuery, DALUtils } from "@medusajs/framework/utils"
import { SqlEntityManager, wrap } from "@mikro-orm/postgresql"

// eslint-disable-next-line max-len
export class ProductRepository extends DALUtils.mikroOrmBaseRepositoryFactory(
  Product
) {
  constructor(...args: any[]) {
    // @ts-ignore
    super(...arguments)
  }

  async deepUpdate(
    updates: any[],
    validateVariantOptions: (
      variants: any[],
      options: InferEntityType<typeof ProductOption>[]
    ) => void,
    context: Context = {}
  ): Promise<InferEntityType<typeof Product>[]> {
    updates.forEach((update) => this.correctUpdateDTOTypes(update))

    const products = await this.find(
      buildQuery({ id: updates.map((p) => p.id) }, { relations: ["*"] }),
      context
    )
    const productsMap = new Map(products.map((p) => [p.id, p]))

    for (const update of updates) {
      const product = productsMap.get(update.id)!

      // Assign the options first, so they'll be available for the variants loop below
      if (update.options) {
        wrap(product).assign({ options: update.options })
        delete update.options // already assigned above, so no longer necessary
      }

      if (update.variants) {
        validateVariantOptions(update.variants, product.options)

        update.variants.forEach((variant: any) => {
          if (variant.options) {
            variant.options = Object.entries(variant.options).map(
              ([key, value]) => {
                const productOption = product.options.find(
                  (option) => option.title === key
                )!
                const productOptionValue = productOption.values?.find(
                  (optionValue) => optionValue.value === value
                )!
                return productOptionValue.id
              }
            )
          }
        })
      }

      if (update.tags) {
        update.tags = update.tags.map((t: { id: string }) => t.id)
      }
      if (update.categories) {
        update.categories = update.categories.map((c: { id: string }) => c.id)
      }
      if (update.images) {
        update.images = update.images.map((image: any, index: number) => ({
          ...image,
          rank: index,
        }))
      }

      wrap(product!).assign(update)
    }

    // Doing this to ensure updates are returned in the same order they were provided,
    // since some core flows rely on this.
    // This is a high level of coupling though.
    return updates
      .map((update) => productsMap.get(update.id))
      .filter((product) => product !== undefined)
  }

  // We should probably fix the column types in the database to avoid this
  // It would also match the types in ProductVariant, which are already numbers
  protected correctUpdateDTOTypes(update: any) {
    update.weight = update.weight?.toString()
    update.length = update.length?.toString()
    update.height = update.height?.toString()
    update.width = update.width?.toString()
  }

  /**
   * In order to be able to have a strict not in categories, and prevent a product
   * to be return in the case it also belongs to other categories, we need to
   * first find all products that are in the categories, and then exclude them
   */
  protected async mutateNotInCategoriesConstraints(
    findOptions: DAL.FindOptions<typeof Product> = {
      where: {},
    },
    context: Context = {}
  ): Promise<void> {
    const manager = this.getActiveManager<SqlEntityManager>(context)

    if (
      "categories" in findOptions.where &&
      findOptions.where.categories?.id?.["$nin"]
    ) {
      const productsInCategories = await manager.find(
        this.entity,
        {
          categories: {
            id: { $in: findOptions.where.categories.id["$nin"] },
          },
        },
        {
          fields: ["id"],
        }
      )

      const productIds = productsInCategories.map((product) => product.id)

      if (productIds.length) {
        findOptions.where.id = { $nin: productIds }
        delete findOptions.where.categories?.id

        if (Object.keys(findOptions.where.categories).length === 0) {
          delete findOptions.where.categories
        }
      }
    }
  }
}
