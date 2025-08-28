/**
 * Re-export all schemas from separate files
 */

// Common schemas and DTOs
export * from "./common-schemas"

// Create schemas
export * from "./create-schemas"

// Update schemas
export * from "./update-schemas"

// Delete schemas
export * from "./delete-schemas"

// Batch schemas
export * from "./batch-schemas"

import { z } from "zod"
import { bigNumberInputSchema } from "../../common/utils/schemas"
import { filterableProductPropsSchema } from "./common-schemas"

/**
 * Schema for UpsertVariantPricesWorkflowInput
 */
// Base schemas for money amount DTOs
const createMoneyAmountDTOSchema = z.object({
  id: z.string().optional(),
  currency_code: z.string(),
  amount: bigNumberInputSchema,
  min_quantity: bigNumberInputSchema.nullable().optional(),
  max_quantity: bigNumberInputSchema.nullable().optional(),
})

const updateMoneyAmountDTOSchema = z.object({
  id: z.string(),
  currency_code: z.string().optional(),
  amount: bigNumberInputSchema.optional(),
  min_quantity: bigNumberInputSchema.nullable().optional(),
  max_quantity: bigNumberInputSchema.nullable().optional(),
})

// Rule schemas
const pricingRuleOperatorSchema = z.enum(["gt", "lt", "eq", "lte", "gte"])

const ruleWithOperatorSchema = z.object({
  operator: pricingRuleOperatorSchema,
  value: z.number(),
})

const createPriceSetPriceRulesSchema = z.record(
  z.union([z.string(), z.array(ruleWithOperatorSchema)])
)

// Extended schemas for prices DTOs
const createPricesDTOSchema = createMoneyAmountDTOSchema.extend({
  rules: createPriceSetPriceRulesSchema.optional(),
})

const updatePricesDTOSchema = updateMoneyAmountDTOSchema.extend({
  rules: createPriceSetPriceRulesSchema.optional(),
})

export const upsertVariantPricesWorkflowInputSchema = z.object({
  variantPrices: z.array(z.object({
    variant_id: z.string(),
    product_id: z.string(),
    prices: z.array(z.union([
      createPricesDTOSchema,
      updatePricesDTOSchema
    ])).optional(),
  })),
  previousVariantIds: z.array(z.string()),
})

/**
 * Schema for UpsertVariantPricesWorkflowOutput - returns void
 */
export const upsertVariantPricesWorkflowOutputSchema = z.void()

export type UpsertVariantPricesWorkflowInput = z.infer<
  typeof upsertVariantPricesWorkflowInputSchema
>
export type UpsertVariantPricesWorkflowOutput = z.infer<
  typeof upsertVariantPricesWorkflowOutputSchema
>

/**
 * Schema for ExportProductsDTO
 */
export const exportProductsDTOSchema = z.object({
  select: z.array(z.string()),
  filter: filterableProductPropsSchema.optional(),
})

/**
 * Schema for exportProductsWorkflow output - returns void
 */
export const exportProductsWorkflowOutputSchema = z.void()

export type ExportProductsDTO = z.infer<typeof exportProductsDTOSchema>
export type ExportProductsWorkflowOutput = z.infer<
  typeof exportProductsWorkflowOutputSchema
>

/**
 * Schema for ImportProductsDTO
 */
export const importProductsDTOSchema = z.object({
  fileContent: z.string(),
  filename: z.string(),
})

/**
 * Schema for ImportProductsSummary (output)
 */
export const importProductsSummarySchema = z.object({
  toCreate: z.number(),
  toUpdate: z.number(),
})

export type ImportProductsDTO = z.infer<typeof importProductsDTOSchema>
export type ImportProductsSummary = z.infer<typeof importProductsSummarySchema>

/**
 * Schema for ImportProductsAsChunksWorkflowInput
 */
export const importProductsAsChunksWorkflowInputSchema = z.object({
  fileKey: z.string(),
  filename: z.string(),
})

/**
 * Schema for ImportProductsAsChunksWorkflowOutput (ImportProductsSummary)
 */
export const importProductsAsChunksWorkflowOutputSchema = importProductsSummarySchema

export type ImportProductsAsChunksWorkflowInput = z.infer<
  typeof importProductsAsChunksWorkflowInputSchema
>
export type ImportProductsAsChunksWorkflowOutput = z.infer<
  typeof importProductsAsChunksWorkflowOutputSchema
>