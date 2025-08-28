import { z } from "zod"
import {
  createProductVariantWorkflowInputDTOSchema,
  createProductWorkflowInputDTOSchema,
} from "./create-schemas"
import { upsertProductDTOSchema, updateProductVariantWorkflowInputDTOSchema } from "./update-schemas"
import { productDTOSchema, productVariantDTOSchema } from "./common-schemas"

const batchCreateProductProductVariant =
  createProductVariantWorkflowInputDTOSchema.omit({ product_id: true })
const batchCreateProduct = createProductWorkflowInputDTOSchema.merge(
  z.object({
    variants: z.array(batchCreateProductProductVariant).optional(),
  })
)

/**
 * Schema for BatchProductWorkflowInput
 */
export const batchProductWorkflowInputSchema = z.object({
  create: z.array(batchCreateProduct).optional(),
  update: z
    .array(
      upsertProductDTOSchema.extend({
        sales_channels: z.array(z.object({ id: z.string() })).optional(),
        shipping_profile_id: z.string().nullable().optional(),
      })
    )
    .optional(),
  delete: z.array(z.string()).optional(),
})

/**
 * Schema for BatchWorkflowOutput for products
 */
export const batchProductsWorkflowOutputSchema = z.object({
  created: z.array(productDTOSchema),
  updated: z.array(productDTOSchema),
  deleted: z.array(z.string()),
})

// Type exports for batch products workflow
export type BatchProductWorkflowInput = z.infer<
  typeof batchProductWorkflowInputSchema
>
export type BatchProductsWorkflowOutput = z.infer<
  typeof batchProductsWorkflowOutputSchema
>

/**
 * Schema for LinkWorkflowInput (batch link workflows)
 */
export const linkWorkflowInputSchema = z.object({
  id: z.string(),
  add: z.array(z.string()).optional(),
  remove: z.array(z.string()).optional(),
})

/**
 * Schema for batch link workflows output - returns void
 */
export const batchLinkWorkflowOutputSchema = z.void()

export type LinkWorkflowInput = z.infer<typeof linkWorkflowInputSchema>
export type BatchLinkWorkflowOutput = z.infer<typeof batchLinkWorkflowOutputSchema>

/**
 * Schema for BatchProductVariantsWorkflowInput
 */
export const batchProductVariantsWorkflowInputSchema = z.object({
  create: z.array(createProductVariantWorkflowInputDTOSchema).optional(),
  update: z.array(updateProductVariantWorkflowInputDTOSchema).optional(),
  delete: z.array(z.string()).optional(),
})

/**
 * Schema for BatchProductVariantsWorkflowOutput
 */
export const batchProductVariantsWorkflowOutputSchema = z.object({
  created: z.array(productVariantDTOSchema),
  updated: z.array(z.any()), // ProductVariantDTO with price_set
  deleted: z.array(z.string()),
})

export type BatchProductVariantsWorkflowInput = z.infer<
  typeof batchProductVariantsWorkflowInputSchema
>
export type BatchProductVariantsWorkflowOutput = z.infer<
  typeof batchProductVariantsWorkflowOutputSchema
>
