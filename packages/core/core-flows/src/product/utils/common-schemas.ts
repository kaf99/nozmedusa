import { z } from "zod"
import { createOperatorMap } from "../../common/utils/validator-schemas"

/**
 * Common Schemas and DTOs
 */

/**
 * Schema for ProductStatus enum
 */
export const productStatusSchema = z.enum([
  "draft",
  "proposed",
  "published",
  "rejected",
])

/**
 * Schema for RuleWithOperator
 */
export const ruleWithOperatorSchema = z.object({
  operator: z.enum(["gt", "lt", "eq", "lte", "gte"]),
  value: z.number(),
})

/**
 * Schema for product images
 */
export const upsertProductImageDTOSchema = z.object({
  id: z.string().optional(),
  url: z.string().optional(),
  rank: z.number().optional(),
  metadata: z.record(z.unknown()).nullable().optional(),
})

/**
 * Schema for ProductTypeDTO
 */
export const productTypeDTOSchema = z.object({
  id: z.string(),
  value: z.string(),
  metadata: z.record(z.unknown()).nullable().optional(),
  created_at: z.union([z.string(), z.date()]),
  updated_at: z.union([z.string(), z.date()]),
  deleted_at: z.union([z.string(), z.date()]).optional(),
})

/**
 * Schema for ProductCollectionDTO
 */
export const productCollectionDTOSchema = z.object({
  id: z.string(),
  title: z.string(),
  handle: z.string(),
  products: z.array(z.any()).optional(),
  metadata: z.record(z.unknown()).nullable().optional(),
  created_at: z.union([z.string(), z.date()]),
  updated_at: z.union([z.string(), z.date()]),
  deleted_at: z.union([z.string(), z.date()]).optional(),
})

/**
 * Schema for ProductCategoryDTO
 */
export const productCategoryDTOSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  handle: z.string(),
  is_active: z.boolean(),
  is_internal: z.boolean(),
  rank: z.number(),
  metadata: z.record(z.any()).nullable().optional(),
  parent_category: z.any(),
  parent_category_id: z.string().nullable(),
  category_children: z.array(z.any()),
  products: z.array(z.any()),
  created_at: z.union([z.string(), z.date()]),
  updated_at: z.union([z.string(), z.date()]),
  deleted_at: z.union([z.string(), z.date()]).optional(),
})

/**
 * Schema for ProductTagDTO
 */
export const productTagDTOSchema = z.object({
  id: z.string(),
  value: z.string(),
  metadata: z.record(z.unknown()).nullable().optional(),
  products: z.array(z.any()).optional(),
  created_at: z.union([z.string(), z.date()]).optional(),
  updated_at: z.union([z.string(), z.date()]).optional(),
  deleted_at: z.union([z.string(), z.date()]).nullable().optional(),
})

/**
 * Schema for ProductOptionDTO
 */
export const productOptionDTOSchema = z.object({
  id: z.string(),
  title: z.string(),
  product: z.any().optional(),
  product_id: z.string().nullable().optional(),
  values: z.array(z.any()),
  metadata: z.record(z.any()).nullable().optional(),
  created_at: z.union([z.string(), z.date()]),
  updated_at: z.union([z.string(), z.date()]),
  deleted_at: z.union([z.string(), z.date()]).optional(),
})

/**
 * Schema for ProductOptionValueDTO
 */
export const productOptionValueDTOSchema = z.object({
  id: z.string(),
  value: z.string(),
  option: productOptionDTOSchema.nullable().optional(),
  option_id: z.string().nullable().optional(),
  metadata: z.record(z.any()).nullable().optional(),
  created_at: z.union([z.string(), z.date()]),
  updated_at: z.union([z.string(), z.date()]),
  deleted_at: z.union([z.string(), z.date()]).optional(),
})

/**
 * Schema for ProductVariantDTO
 */
export const productVariantDTOSchema = z.object({
  id: z.string(),
  title: z.string(),
  sku: z.string().nullable(),
  barcode: z.string().nullable(),
  ean: z.string().nullable(),
  upc: z.string().nullable(),
  requires_shipping: z.boolean(),
  allow_backorder: z.boolean(),
  manage_inventory: z.boolean(),
  hs_code: z.string().nullable(),
  origin_country: z.string().nullable(),
  mid_code: z.string().nullable(),
  material: z.string().nullable(),
  weight: z.number().nullable(),
  length: z.number().nullable(),
  height: z.number().nullable(),
  width: z.number().nullable(),
  metadata: z.record(z.unknown()).nullable(),
  variant_rank: z.number().nullable().optional(),
  product: z.any().optional(),
  product_id: z.string().nullable(),
  options: z.array(productOptionValueDTOSchema),
  inventory_items: z.array(z.any()).optional(),
  calculated_price: z.any().optional(),
  created_at: z.union([z.string(), z.date()]),
  updated_at: z.union([z.string(), z.date()]),
  deleted_at: z.union([z.string(), z.date()]),
})

/**
 * Schema for ProductDTO
 */
export const productDTOSchema = z.object({
  id: z.string(),
  title: z.string(),
  handle: z.string(),
  subtitle: z.string().nullable(),
  description: z.string().nullable(),
  is_giftcard: z.boolean(),
  status: productStatusSchema,
  thumbnail: z.string().nullable(),
  width: z.number().nullable(),
  weight: z.number().nullable(),
  length: z.number().nullable(),
  height: z.number().nullable(),
  origin_country: z.string().nullable(),
  hs_code: z.string().nullable(),
  mid_code: z.string().nullable(),
  material: z.string().nullable(),
  collection: productCollectionDTOSchema.nullable(),
  collection_id: z.string().nullable(),
  categories: z.array(productCategoryDTOSchema).nullable().optional(),
  type: productTypeDTOSchema.nullable(),
  type_id: z.string().nullable(),
  tags: z.array(z.any()),
  discountable: z.boolean().optional(),
  external_id: z.string().nullable(),
  sales_channels: z.array(z.any()).optional(),
  shipping_profile: z.any().nullable().optional(),
  images: z.array(z.any()),
  options: z.array(productOptionDTOSchema),
  variants: z.array(productVariantDTOSchema),
  metadata: z.record(z.any()).nullable().optional(),
  created_at: z.union([z.string(), z.date()]),
  updated_at: z.union([z.string(), z.date()]),
  deleted_at: z.union([z.string(), z.date()]),
})

/**
 * Schema for FilterableProductProps
 */
const baseFilters = z.object({
  q: z.string().optional(),
  status: createOperatorMap(productStatusSchema).optional(),
  title: createOperatorMap(z.string()).optional(),
  handle: createOperatorMap(z.string()).optional(),
  thumbnail: createOperatorMap(z.string()).optional(),
  discountable: z.boolean().optional(),
  id: createOperatorMap(z.string()).optional(),
  sku: createOperatorMap(z.string()).optional(),
  inventory_quantity: createOperatorMap(z.number()).optional(),
  created_at: createOperatorMap(z.string()).optional(),
  updated_at: createOperatorMap(z.string()).optional(),
  deleted_at: createOperatorMap(z.string()).optional(),
  external_id: createOperatorMap(z.string()).optional(),
  is_giftcard: z.boolean().optional(),
  type_id: createOperatorMap(z.string()).optional(),
  collection_id: createOperatorMap(z.string()).optional(),
})

export const filterableProductPropsSchema = baseFilters.merge(
  z.object({
    $and: z.array(baseFilters).optional(),
    $or: z.array(baseFilters).optional(),
  })
)
