import { z } from "zod"
import { bigNumberValueSchema } from "../../common/utils/schemas"

/**
 * Schema for PriceListStatus
 */
const priceListStatusSchema = z.enum(["active", "draft"])

/**
 * Schema for PriceListTypeValues
 */
const priceListTypeSchema = z.enum(["sale", "override"])

/**
 * Schema for CreatePriceDTO
 */
const createPriceDTOSchema = z.object({
  variant_id: z.string(),
  currency_code: z.string(),
  amount: z.number(),
  min_quantity: z.number().nullable().optional(),
  max_quantity: z.number().nullable().optional(),
  rules: z.record(z.string()).optional(),
})

/**
 * Schema for CreatePriceListWorkflowInputDTO
 */
const createPriceListWorkflowInputDTOSchema = z.object({
  title: z.string(),
  description: z.string(),
  starts_at: z.string().nullable().optional(),
  ends_at: z.string().nullable().optional(),
  status: priceListStatusSchema.optional(),
  rules: z.record(z.array(z.string())).optional(),
  prices: z.array(createPriceDTOSchema).optional(),
})

/**
 * Schema for PriceDTO
 */
const priceDTOSchema = z.object({
  id: z.string(),
  title: z.string().optional(),
  currency_code: z.string().optional(),
  amount: bigNumberValueSchema.optional(),
  min_quantity: bigNumberValueSchema.optional(),
  max_quantity: bigNumberValueSchema.optional(),
  price_set_id: z.string().optional(),
  price_list_id: z.string().nullable().optional(),
  price_rules: z.array(z.any()).optional(),
  price_set: z.any().optional(),
  price_list: z.any().optional(),
  created_at: z.date(),
  updated_at: z.date(),
  deleted_at: z.date().nullable(),
})

/**
 * Schema for PriceListDTO
 */
const priceListDTOSchema = z.object({
  id: z.string(),
  title: z.string().optional(),
  description: z.string().optional(),
  starts_at: z.string().nullable().optional(),
  ends_at: z.string().nullable().optional(),
  status: priceListStatusSchema.optional(),
  type: priceListTypeSchema.optional(),
  prices: z.array(priceDTOSchema).optional(),
  price_set_money_amounts: z.array(z.any()).optional(),
  money_amounts: z.array(z.any()).optional(),
  rules: z.record(z.array(z.string())).optional(),
  rule_types: z.array(z.any()).optional(),
  rules_count: z.number().optional(),
})

/**
 * Schema for CreatePriceListsWorkflowInput
 */
export const createPriceListsWorkflowInputSchema = z.object({
  price_lists_data: z.array(createPriceListWorkflowInputDTOSchema),
})

/**
 * Schema for CreatePriceListsWorkflowOutput
 */
export const createPriceListsWorkflowOutputSchema = z.array(priceListDTOSchema)

export type CreatePriceListsWorkflowInput = z.infer<
  typeof createPriceListsWorkflowInputSchema
>
export type CreatePriceListsWorkflowOutput = z.infer<
  typeof createPriceListsWorkflowOutputSchema
>

/**
 * Schema for UpdatePriceListWorkflowInputDTO
 */
const updatePriceListWorkflowInputDTOSchema = z.object({
  id: z.string(),
  title: z.string().optional(),
  description: z.string().optional(),
  starts_at: z.string().nullable().optional(),
  ends_at: z.string().nullable().optional(),
  status: priceListStatusSchema.optional(),
  type: priceListTypeSchema.optional(),
  rules: z.record(z.array(z.string())).optional(),
})

/**
 * Schema for UpdatePriceListsWorkflowInput
 */
export const updatePriceListsWorkflowInputSchema = z.object({
  price_lists_data: z.array(updatePriceListWorkflowInputDTOSchema),
})

/**
 * Schema for UpdatePriceListsWorkflowOutput
 */
export const updatePriceListsWorkflowOutputSchema = z.array(priceListDTOSchema)

export type UpdatePriceListsWorkflowInput = z.infer<
  typeof updatePriceListsWorkflowInputSchema
>
export type UpdatePriceListsWorkflowOutput = z.infer<
  typeof updatePriceListsWorkflowOutputSchema
>

/**
 * Schema for DeletePriceListsWorkflowInput
 */
export const deletePriceListsWorkflowInputSchema = z.object({
  ids: z.array(z.string()),
})

/**
 * Schema for DeletePriceListsWorkflowOutput
 */
export const deletePriceListsWorkflowOutputSchema = z.void()

export type DeletePriceListsWorkflowInput = z.infer<
  typeof deletePriceListsWorkflowInputSchema
>
export type DeletePriceListsWorkflowOutput = z.infer<
  typeof deletePriceListsWorkflowOutputSchema
>

/**
 * Schema for CreatePriceListPricesWorkflowInput
 */
export const createPriceListPricesWorkflowInputSchema = z.object({
  data: z.array(
    z.object({
      id: z.string(),
      prices: z.array(createPriceDTOSchema),
    })
  ),
})

/**
 * Schema for CreatePriceListPricesWorkflowOutput
 */
export const createPriceListPricesWorkflowOutputSchema = z.array(priceDTOSchema)

export type CreatePriceListPricesWorkflowInput = z.infer<
  typeof createPriceListPricesWorkflowInputSchema
>
export type CreatePriceListPricesWorkflowOutput = z.infer<
  typeof createPriceListPricesWorkflowOutputSchema
>

/**
 * Schema for UpdatePriceListPricesWorkflowInput
 */
export const updatePriceListPricesWorkflowInputSchema = z.object({
  data: z.array(
    z.object({
      id: z.string(),
      prices: z.array(
        z.object({
          id: z.string(),
          variant_id: z.string(),
          currency_code: z.string().optional(),
          amount: z.number().optional(),
          min_quantity: z.number().nullable().optional(),
          max_quantity: z.number().nullable().optional(),
          rules: z.record(z.string()).optional(),
        })
      ),
    })
  ),
})

/**
 * Schema for UpdatePriceListPricesWorkflowOutput
 */
export const updatePriceListPricesWorkflowOutputSchema = z.array(priceDTOSchema)

export type UpdatePriceListPricesWorkflowInput = z.infer<
  typeof updatePriceListPricesWorkflowInputSchema
>
export type UpdatePriceListPricesWorkflowOutput = z.infer<
  typeof updatePriceListPricesWorkflowOutputSchema
>

/**
 * Schema for BatchPriceListPricesWorkflowInput
 */
export const batchPriceListPricesWorkflowInputSchema = z.object({
  data: z.object({
    id: z.string(),
    create: z.array(createPriceDTOSchema).optional(),
    update: z
      .array(
        z.object({
          id: z.string(),
          variant_id: z.string(),
          currency_code: z.string().optional(),
          amount: z.number().optional(),
          min_quantity: z.number().nullable().optional(),
          max_quantity: z.number().nullable().optional(),
          rules: z.record(z.string()).optional(),
        })
      )
      .optional(),
    delete: z.array(z.string()).optional(),
  }),
})

/**
 * Schema for BatchPriceListPricesWorkflowOutput
 */
export const batchPriceListPricesWorkflowOutputSchema = z.object({
  created: z.array(priceDTOSchema),
  updated: z.array(priceDTOSchema),
  deleted: z.array(z.string()),
})

export type BatchPriceListPricesWorkflowInput = z.infer<
  typeof batchPriceListPricesWorkflowInputSchema
>
export type BatchPriceListPricesWorkflowOutput = z.infer<
  typeof batchPriceListPricesWorkflowOutputSchema
>

/**
 * Schema for RemovePriceListPricesWorkflowInput
 */
export const removePriceListPricesWorkflowInputSchema = z.object({
  ids: z.array(z.string()),
})

/**
 * Schema for RemovePriceListPricesWorkflowOutput
 */
export const removePriceListPricesWorkflowOutputSchema = z.array(z.string())

export type RemovePriceListPricesWorkflowInput = z.infer<
  typeof removePriceListPricesWorkflowInputSchema
>
export type RemovePriceListPricesWorkflowOutput = z.infer<
  typeof removePriceListPricesWorkflowOutputSchema
>
