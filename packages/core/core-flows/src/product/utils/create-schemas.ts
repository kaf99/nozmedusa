import { z } from "zod"
import { bigNumberInputSchema } from "../../common/utils/schemas"
import {
  productStatusSchema,
  ruleWithOperatorSchema,
  upsertProductImageDTOSchema,
  productDTOSchema,
  productTypeDTOSchema,
  productTagDTOSchema,
  productCollectionDTOSchema,
  productVariantDTOSchema,
  productOptionDTOSchema,
} from "./common-schemas"

/**
 * Create Schemas - All schemas related to creating products and their related entities
 */

/**
 * Schema for create product variant prices (for pricing module)
 */
export const createMoneyAmountDTOSchema = z.object({
  id: z.string().optional(),
  amount: bigNumberInputSchema,
  currency_code: z.string(),
  min_quantity: bigNumberInputSchema.nullable().optional(),
  max_quantity: bigNumberInputSchema.nullable().optional(),
  rules: z
    .record(z.union([z.string(), z.array(ruleWithOperatorSchema)]))
    .optional(),
})

/**
 * Schema for CreateProductOptionDTO
 */
export const createProductOptionDTOSchema = z.object({
  title: z.string(),
  values: z.array(z.string()),
  product_id: z.string().optional(),
})

const productVariantCreation = z.object({
  id: z.string().optional(),
  title: z.string(),
  sku: z.string().nullable().optional(),
  ean: z.string().nullable().optional(),
  upc: z.string().nullable().optional(),
  barcode: z.string().nullable().optional(),
  hs_code: z.string().nullable().optional(),
  inventory_quantity: z.number().optional(),
  allow_backorder: z.boolean().optional(),
  manage_inventory: z.boolean().optional(),
  weight: z.number().nullable().optional(),
  length: z.number().nullable().optional(),
  height: z.number().nullable().optional(),
  width: z.number().nullable().optional(),
  origin_country: z.string().nullable().optional(),
  mid_code: z.string().nullable().optional(),
  material: z.string().nullable().optional(),
  metadata: z.record(z.unknown()).nullable().optional(),
  prices: z.array(createMoneyAmountDTOSchema).optional(),
  options: z.record(z.string()).optional(),
})

/**
 * Schema for CreateProductVariantWorkflowInputDTO
 */
export const createProductVariantWorkflowInputDTOSchema =
  productVariantCreation.extend({
    product_id: z.string(),
  })

const nestedVariantCreation = productVariantCreation

/**
 * Schema for CreateProductWorkflowInputDTO
 */
export const createProductWorkflowInputDTOSchema = z.object({
  id: z.string().optional(),
  title: z.string(),
  subtitle: z.string().nullable().optional(),
  description: z.string().nullable().optional(),
  is_giftcard: z.boolean().optional(),
  discountable: z.boolean().optional(),
  thumbnail: z.string().nullable().optional(),
  handle: z.string().optional(),
  status: productStatusSchema.optional(),
  images: z.array(upsertProductImageDTOSchema).optional(),
  external_id: z.string().nullable().optional(),
  type_id: z.string().nullable().optional(),
  collection_id: z.string().nullable().optional(),
  tag_ids: z.array(z.string()).optional(),
  category_ids: z.array(z.string()).optional(),
  options: z.array(createProductOptionDTOSchema).optional(),
  width: z.union([z.string(), z.number()]).nullable().optional(),
  height: z.union([z.string(), z.number()]).nullable().optional(),
  length: z.union([z.string(), z.number()]).nullable().optional(),
  weight: z.union([z.string(), z.number()]).nullable().optional(),
  origin_country: z.string().nullable().optional(),
  hs_code: z.string().nullable().optional(),
  material: z.string().nullable().optional(),
  mid_code: z.string().nullable().optional(),
  metadata: z.record(z.unknown()).nullable().optional(),
  sales_channels: z.array(z.object({ id: z.string() })).optional(),
  shipping_profile_id: z.string().optional(),
  variants: z.array(nestedVariantCreation).optional(),
})

/**
 * Schema for CreateProductTypeDTO
 */
export const createProductTypeDTOSchema = z.object({
  value: z.string(),
  metadata: z.record(z.unknown()).nullable().optional(),
})

/**
 * Schema for CreateProductTagDTO
 */
export const createProductTagDTOSchema = z.object({
  value: z.string(),
})

/**
 * Schema for CreateProductCollectionDTO
 */
export const createProductCollectionDTOSchema = z.object({
  title: z.string(),
  handle: z.string().optional(),
  product_ids: z.array(z.string()).optional(),
  metadata: z.record(z.unknown()).nullable().optional(),
})

/**
 * Schema for inventory items in create product variants workflow
 */
export const createProductVariantsInventoryItemSchema = z.object({
  inventory_item_id: z.string(),
  required_quantity: z.number().optional(),
})

/**
 * Schema for prices in create product variants workflow
 * Based on PricingTypes.CreateMoneyAmountDTO
 */
export const createProductVariantsPriceSchema = z.object({
  id: z.string().optional(),
  currency_code: z.string(),
  amount: bigNumberInputSchema,
  min_quantity: bigNumberInputSchema.nullable().optional(),
  max_quantity: bigNumberInputSchema.nullable().optional(),
})

/**
 * Schema for product variant in create product variants workflow
 * Based on ProductTypes.CreateProductVariantDTO with additional fields
 */
export const createProductVariantsVariantSchema = z.object({
  product_id: z.string(),
  title: z.string(),
  sku: z.string().nullable().optional(),
  barcode: z.string().nullable().optional(),
  ean: z.string().nullable().optional(),
  upc: z.string().nullable().optional(),
  allow_backorder: z.boolean().optional(),
  manage_inventory: z.boolean().optional(),
  hs_code: z.string().nullable().optional(),
  origin_country: z.string().nullable().optional(),
  mid_code: z.string().nullable().optional(),
  material: z.string().nullable().optional(),
  weight: z.number().nullable().optional(),
  length: z.number().nullable().optional(),
  height: z.number().nullable().optional(),
  width: z.number().nullable().optional(),
  options: z.record(z.string()).optional(),
  metadata: z.record(z.unknown()).nullable().optional(),
  // Additional workflow fields
  inventory_quantity: z.number().optional(),
  prices: z.array(createProductVariantsPriceSchema).optional(),
  inventory_items: z.array(createProductVariantsInventoryItemSchema).optional(),
})

/**
 * Schema for CreateProductsWorkflowInput
 */
export const createProductsWorkflowInputSchema = z.object({
  products: z.array(createProductWorkflowInputDTOSchema),
  additional_data: z.record(z.unknown()).optional(),
})

/**
 * Schema for CreateProductsWorkflowOutput
 */
export const createProductsWorkflowOutputSchema = z.array(productDTOSchema)

/**
 * Schema for CreateProductTypesWorkflowInput
 */
export const createProductTypesWorkflowInputSchema = z.object({
  product_types: z.array(createProductTypeDTOSchema),
  additional_data: z.record(z.unknown()).optional(),
})

/**
 * Schema for CreateProductTypesWorkflowOutput
 */
export const createProductTypesWorkflowOutputSchema =
  z.array(productTypeDTOSchema)

/**
 * Schema for CreateProductTagsWorkflowInput
 */
export const createProductTagsWorkflowInputSchema = z.object({
  product_tags: z.array(createProductTagDTOSchema),
  additional_data: z.record(z.unknown()).optional(),
})

/**
 * Schema for CreateProductTagsWorkflowOutput
 */
export const createProductTagsWorkflowOutputSchema =
  z.array(productTagDTOSchema)

/**
 * Schema for CreateCollectionsWorkflowInput
 */
export const createCollectionsWorkflowInputSchema = z.object({
  collections: z.array(createProductCollectionDTOSchema),
  additional_data: z.record(z.unknown()).optional(),
})

/**
 * Schema for CreateCollectionsWorkflowOutput
 */
export const createCollectionsWorkflowOutputSchema = z.array(
  productCollectionDTOSchema
)

/**
 * Schema for CreateProductVariantsWorkflowInput
 */
export const createProductVariantsWorkflowInputSchema = z.object({
  product_variants: z.array(createProductVariantsVariantSchema),
  additional_data: z.record(z.unknown()).optional(),
})

/**
 * Schema for CreateProductVariantsWorkflowOutput
 */
export const createProductVariantsWorkflowOutputSchema = z.array(
  productVariantDTOSchema.extend({
    prices: z.array(z.any()),
  })
)


/**
 * Schema for CreateProductOptionsWorkflowInput
 */
export const createProductOptionsWorkflowInputSchema = z.object({
  product_options: z.array(createProductOptionDTOSchema),
  additional_data: z.record(z.unknown()).optional(),
})

/**
 * Schema for CreateProductOptionsWorkflowOutput
 */
export const createProductOptionsWorkflowOutputSchema = z.array(productOptionDTOSchema)

// Type exports for workflow input/output types
export type CreateProductWorkflowInput = z.infer<
  typeof createProductWorkflowInputDTOSchema
>
export type CreateProductsWorkflowInput = z.infer<
  typeof createProductsWorkflowInputSchema
>
export type CreateProductsWorkflowOutput = z.infer<
  typeof createProductsWorkflowOutputSchema
>
export type CreateProductTypesWorkflowInput = z.infer<
  typeof createProductTypesWorkflowInputSchema
>
export type CreateProductTypesWorkflowOutput = z.infer<
  typeof createProductTypesWorkflowOutputSchema
>
export type CreateProductTagsWorkflowInput = z.infer<
  typeof createProductTagsWorkflowInputSchema
>
export type CreateProductTagsWorkflowOutput = z.infer<
  typeof createProductTagsWorkflowOutputSchema
>
export type CreateCollectionsWorkflowInput = z.infer<
  typeof createCollectionsWorkflowInputSchema
>
export type CreateCollectionsWorkflowOutput = z.infer<
  typeof createCollectionsWorkflowOutputSchema
>
export type CreateProductVariantsWorkflowInput = z.infer<
  typeof createProductVariantsWorkflowInputSchema
>
export type CreateProductVariantsWorkflowOutput = z.infer<
  typeof createProductVariantsWorkflowOutputSchema
>
export type CreateProductOptionsWorkflowInput = z.infer<
  typeof createProductOptionsWorkflowInputSchema
>
export type CreateProductOptionsWorkflowOutput = z.infer<
  typeof createProductOptionsWorkflowOutputSchema
>
