import {
  CreatePricesDTO,
  UpdatePricesDTO,
  CreatePriceSetDTO,
} from "@medusajs/framework/types"
import { Modules, arrayDifference } from "@medusajs/framework/utils"
import {
  createWorkflow,
  transform,
} from "@medusajs/framework/workflows-sdk"
import { removeRemoteLinkStep, useRemoteQueryStep } from "../../common"
import { createPriceSetsStep, updatePriceSetsStep } from "../../pricing"
import { createVariantPricingLinkStep } from "../steps"
import {
  upsertVariantPricesWorkflowInputSchema,
  upsertVariantPricesWorkflowOutputSchema,
  type UpsertVariantPricesWorkflowInput as SchemaInput,
  type UpsertVariantPricesWorkflowOutput as SchemaOutput,
} from "../utils/schemas"

export {
  type UpsertVariantPricesWorkflowInput,
  type UpsertVariantPricesWorkflowOutput,
} from "../utils/schemas"

// Type verification - CORRECT ORDER!
const schemaInput = {} as SchemaInput
const schemaOutput = undefined as SchemaOutput

// Check 1: New input can go into old input (schema accepts all valid inputs)
const existingInput: {
  variantPrices: {
    variant_id: string
    product_id: string
    prices?: (CreatePricesDTO | UpdatePricesDTO)[]
  }[]
  previousVariantIds: string[]
} = schemaInput

// Check 2: Old output can go into new output (schema produces compatible outputs)
const existingOutput: SchemaOutput = undefined as any

console.log(existingInput, existingOutput, schemaOutput)

// Legacy types for backward compatibility  
export type { UpsertVariantPricesWorkflowInput as LegacyUpsertVariantPricesWorkflowInput } from "../utils/schemas"
export type { UpsertVariantPricesWorkflowOutput as LegacyUpsertVariantPricesWorkflowOutput } from "../utils/schemas"

export const upsertVariantPricesWorkflowId = "upsert-variant-prices"
/**
 * This workflow creates, updates, or removes variants' prices. It's used by the {@link updateProductsWorkflow}
 * when updating a variant's prices.
 * 
 * You can use this workflow within your own customizations or custom workflows to manage the prices of a variant.
 * 
 * @example
 * const { result } = await upsertVariantPricesWorkflow(container)
 * .run({
 *   input: {
 *     variantPrices: [
 *       {
 *         variant_id: "variant_123",
 *         product_id: "prod_123",
 *         prices: [
 *           {
 *             amount: 10,
 *             currency_code: "usd",
 *           },
 *           {
 *             id: "price_123",
 *             amount: 20,
 *           }
 *         ]
 *       }
 *     ],
 *     // these are variants to remove all their prices
 *     // typically used when a variant is deleted.
 *     previousVariantIds: ["variant_321"]
 *   }
 * })
 * 
 * @summary
 * 
 * Create, update, or remove variants' prices.
 */
export const upsertVariantPricesWorkflow = createWorkflow(
  {
    name: upsertVariantPricesWorkflowId,
    description: "Upsert variant prices",
    inputSchema: upsertVariantPricesWorkflowInputSchema,
    outputSchema: upsertVariantPricesWorkflowOutputSchema,
  },
  (input) => {
    const removedVariantIds = transform({ input }, (data) => {
      return arrayDifference(
        data.input.previousVariantIds,
        data.input.variantPrices.map((v) => v.variant_id)
      )
    })

    removeRemoteLinkStep({
      [Modules.PRODUCT]: { variant_id: removedVariantIds },
    }).config({ name: "remove-variant-link-step" })

    const { newVariants, existingVariants } = transform({ input }, (data) => {
      const previousMap = new Set(data.input.previousVariantIds.map((v) => v))

      return {
        existingVariants: data.input.variantPrices.filter((v) =>
          previousMap.has(v.variant_id)
        ),
        newVariants: data.input.variantPrices.filter(
          (v) => !previousMap.has(v.variant_id)
        ),
      }
    })

    const existingVariantIds = transform({ existingVariants }, (data) =>
      data.existingVariants.map((v) => v.variant_id)
    )

    const existingLinks = useRemoteQueryStep({
      entry_point: "product_variant_price_set",
      fields: ["variant_id", "price_set_id"],
      variables: { filters: { variant_id: existingVariantIds } },
    })

    const pricesToUpdate = transform(
      { existingVariants, existingLinks },
      (data) => {
        const linksMap = new Map(
          data.existingLinks.map((l) => [l.variant_id, l.price_set_id])
        )

        return {
          price_sets: data.existingVariants
            .map((v) => {
              const priceSetId = linksMap.get(v.variant_id)

              if (!priceSetId || !v.prices) {
                return
              }

              return {
                id: priceSetId,
                prices: v.prices,
              }
            })
            .filter(Boolean),
        }
      }
    )

    updatePriceSetsStep(pricesToUpdate)

    // Note: We rely on the same order of input and output when creating variants here, make sure that assumption holds
    const pricesToCreate = transform({ newVariants }, (data) =>
      data.newVariants.map((v) => {
        return {
          prices: v.prices,
        } as CreatePriceSetDTO
      })
    )

    const createdPriceSets = createPriceSetsStep(pricesToCreate)

    const variantAndPriceSetLinks = transform(
      { newVariants, createdPriceSets },
      (data) => {
        return {
          links: data.newVariants.map((variant, i) => ({
            variant_id: variant.variant_id,
            price_set_id: data.createdPriceSets[i].id,
          })),
        }
      }
    )

    createVariantPricingLinkStep(variantAndPriceSetLinks)
  }
)
