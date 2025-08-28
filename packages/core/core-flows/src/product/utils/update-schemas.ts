import { z } from "zod"
import { bigNumberInputSchema } from "../../common/utils/schemas"
import {
  ruleWithOperatorSchema,
  upsertProductImageDTOSchema,
  productStatusSchema,
  filterableProductPropsSchema,
  productDTOSchema,
  productTagDTOSchema,
  productTypeDTOSchema,
  productCollectionDTOSchema,
  productOptionDTOSchema,
} from "./common-schemas"

/**
 * Update Schemas - All schemas related to updating products and their related entities
 */

/**
 * Schema for update price
 */
export const updatePriceSchema = z.object({
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
 * Schema for UpdateProductVariantWorkflowInputDTO
 */
export const updateProductVariantWorkflowInputDTOSchema = z.object({
  id: z.string().optional(),
  title: z.string().optional(),
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
  prices: z.array(updatePriceSchema).optional(),
  product_id: z.string().optional(),
})

/**
 * Schema for UpdateProductDTO
 */
export const updateProductDTOSchema = z.object({
  title: z.string().optional(),
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
  options: z
    .array(
      z.object({
        id: z.string().optional(),
        title: z.string().optional(),
        values: z.array(z.string()).optional(),
        product_id: z.string().optional(),
      })
    )
    .optional(),
  variants: z.array(updateProductVariantWorkflowInputDTOSchema).optional(),
  width: z.union([z.number(), z.string()]).nullable().optional(),
  height: z.union([z.number(), z.string()]).nullable().optional(),
  length: z.union([z.number(), z.string()]).nullable().optional(),
  weight: z.union([z.number(), z.string()]).nullable().optional(),
  origin_country: z.string().nullable().optional(),
  hs_code: z.string().nullable().optional(),
  material: z.string().nullable().optional(),
  mid_code: z.string().nullable().optional(),
  metadata: z.record(z.unknown()).nullable().optional(),
})

/**
 * Schema for UpsertProductDTO
 */
export const upsertProductDTOSchema = updateProductDTOSchema.extend({
  id: z.string().optional(),
})

/**
 * Schema for UpdateProductsWorkflowInputSelector
 */
export const updateProductsWorkflowInputSelectorSchema = z.object({
  selector: filterableProductPropsSchema,
  update: updateProductDTOSchema.extend({
    sales_channels: z.array(z.object({ id: z.string() })).optional(),
    variants: z.array(updateProductVariantWorkflowInputDTOSchema).optional(),
    shipping_profile_id: z.string().nullable().optional(),
  }),
  additional_data: z.record(z.unknown()).optional(),
})

/**
 * Schema for UpdateProductsWorkflowInputProducts
 */
export const updateProductsWorkflowInputProductsSchema = z.object({
  products: z.array(
    upsertProductDTOSchema.extend({
      sales_channels: z.array(z.object({ id: z.string() })).optional(),
      variants: z.array(updateProductVariantWorkflowInputDTOSchema).optional(),
      shipping_profile_id: z.string().nullable().optional(),
    })
  ),
  additional_data: z.record(z.unknown()).optional(),
})

/**
 * Schema for UpdateProductWorkflowInput (union of selector and products)
 */
export const updateProductWorkflowInputSchema = z.union([
  updateProductsWorkflowInputSelectorSchema,
  updateProductsWorkflowInputProductsSchema,
])

/**
 * Schema for UpdateProductsWorkflowOutput
 */
export const updateProductsWorkflowOutputSchema = z.array(productDTOSchema)

// Type exports for update products workflow
export type UpdateProductWorkflowInput = z.infer<
  typeof updateProductWorkflowInputSchema
>
export type UpdateProductsWorkflowOutput = z.infer<
  typeof updateProductsWorkflowOutputSchema
>

/**
 * Schema for UpdateCollectionsWorkflowInput
 */
export const updateCollectionsWorkflowInputSchema = z
  .object({
    selector: z.record(z.unknown()),
    update: z.object({
      title: z.string().optional(),
      handle: z.string().optional(),
      metadata: z.record(z.unknown()).nullable().optional(),
    }),
  })
  .and(
    z.object({
      additional_data: z.record(z.unknown()).optional(),
    })
  )

/**
 * Schema for UpdateCollectionsWorkflowOutput
 */
export const updateCollectionsWorkflowOutputSchema = z.union([
  productCollectionDTOSchema,
  z.array(productCollectionDTOSchema),
])

export type UpdateCollectionsWorkflowInput = z.infer<
  typeof updateCollectionsWorkflowInputSchema
>
export type UpdateCollectionsWorkflowOutput = z.infer<
  typeof updateCollectionsWorkflowOutputSchema
>

/**
 * Schema for UpdateProductTagsWorkflowInput
 */
export const updateProductTagsWorkflowInputSchema = z
  .object({
    selector: z.record(z.unknown()),
    update: z.object({
      value: z.string().optional(),
      metadata: z.record(z.unknown()).nullable().optional(),
    }),
  })
  .and(
    z.object({
      additional_data: z.record(z.unknown()).optional(),
    })
  )

/**
 * Schema for UpdateProductTagsWorkflowOutput
 */
export const updateProductTagsWorkflowOutputSchema = z.union([
  productTagDTOSchema,
  z.array(productTagDTOSchema),
])

export type UpdateProductTagsWorkflowInput = z.infer<
  typeof updateProductTagsWorkflowInputSchema
>
export type UpdateProductTagsWorkflowOutput = z.infer<
  typeof updateProductTagsWorkflowOutputSchema
>

/**
 * Schema for UpdateProductTypesWorkflowInput
 */
export const updateProductTypesWorkflowInputSchema = z
  .object({
    selector: z.record(z.unknown()),
    update: z.object({
      value: z.string().optional(),
      metadata: z.record(z.unknown()).nullable().optional(),
    }),
  })
  .and(
    z.object({
      additional_data: z.record(z.unknown()).optional(),
    })
  )

/**
 * Schema for UpdateProductTypesWorkflowOutput
 */
export const updateProductTypesWorkflowOutputSchema = z.union([
  productTypeDTOSchema,
  z.array(productTypeDTOSchema),
])

export type UpdateProductTypesWorkflowInput = z.infer<
  typeof updateProductTypesWorkflowInputSchema
>
export type UpdateProductTypesWorkflowOutput = z.infer<
  typeof updateProductTypesWorkflowOutputSchema
>

/**
 * Schema for UpdateProductOptionDTO
 */
const updateProductOptionDTOSchema = z.object({
  title: z.string().optional(),
  values: z.array(z.string()).optional(),
  metadata: z.record(z.unknown()).nullable().optional(),
})

/**
 * Schema for UpdateProductOptionsWorkflowInput
 */
export const updateProductOptionsWorkflowInputSchema = z
  .object({
    selector: z.record(z.unknown()),
    update: updateProductOptionDTOSchema,
  })
  .and(
    z.object({
      additional_data: z.record(z.unknown()).optional(),
    })
  )

/**
 * Schema for UpdateProductOptionsWorkflowOutput
 */
export const updateProductOptionsWorkflowOutputSchema = z.array(
  productOptionDTOSchema
)

export type UpdateProductOptionsWorkflowInput = z.infer<
  typeof updateProductOptionsWorkflowInputSchema
>
export type UpdateProductOptionsWorkflowOutput = z.infer<
  typeof updateProductOptionsWorkflowOutputSchema
>

/**
 * Schema for prices in update product variants workflow
 */
const updateProductVariantPricesSchema = z.object({
  id: z.string().optional(),
  currency_code: z.string().optional(),
  amount: bigNumberInputSchema.optional(),
  min_quantity: bigNumberInputSchema.nullable().optional(),
  max_quantity: bigNumberInputSchema.nullable().optional(),
})

/**
 * Schema for UpdateProductVariantsWorkflowInput (union type)
 */
export const updateProductVariantsWorkflowInputSchema = z.union([
  // Selector-based update
  z.object({
    selector: z.record(z.unknown()), // FilterableProductVariantProps
    update: updateProductVariantWorkflowInputDTOSchema.extend({
      prices: z.array(updateProductVariantPricesSchema).optional(),
    }),
    additional_data: z.record(z.unknown()).optional(),
  }),
  // Direct variant updates
  z.object({
    product_variants: z.array(
      z.object({
        id: z.string().optional(),
        title: z.string().optional(),
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
        prices: z.array(updateProductVariantPricesSchema).optional(),
        product_id: z.string().optional(),
      })
    ),
    additional_data: z.record(z.unknown()).optional(),
  }),
])

/**
 * Schema for UpdateProductVariantsWorkflowOutput
 */
export const updateProductVariantsWorkflowOutputSchema = z.array(
  z.any() // ProductVariantDTO with price_set
)

export type UpdateProductVariantsWorkflowInput = z.infer<
  typeof updateProductVariantsWorkflowInputSchema
>
export type UpdateProductVariantsWorkflowOutput = z.infer<
  typeof updateProductVariantsWorkflowOutputSchema
>
