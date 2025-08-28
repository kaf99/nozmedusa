import { z } from "zod"

/**
 * Schema for CreateProductCategoryDTO
 */
const createProductCategoryDTOSchema = z.object({
  name: z.string(),
  handle: z.string().optional(),
  is_active: z.boolean().optional(),
  is_internal: z.boolean().optional(),
  parent_category_id: z.string().nullable().optional(),
  rank: z.number().optional(),
  metadata: z.record(z.unknown()).nullable().optional(),
})

/**
 * Schema for UpdateProductCategoryDTO  
 */
const updateProductCategoryDTOSchema = z.object({
  name: z.string().optional(),
  description: z.string().optional(),
  handle: z.string().optional(),
  is_active: z.boolean().optional(),
  is_internal: z.boolean().optional(),
  parent_category_id: z.string().nullable().optional(),
  rank: z.number().optional(),
  metadata: z.record(z.unknown()).nullable().optional(),
})

/**
 * Schema for ProductCategoryDTO
 */
const productCategoryDTOSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  handle: z.string(),
  is_active: z.boolean(),
  is_internal: z.boolean(),
  rank: z.number(),
  parent_category_id: z.string().nullable(),
  parent_category: z.any().nullable().optional(),
  category_children: z.array(z.any()).optional(),
  products: z.array(z.any()).optional(),
  metadata: z.record(z.unknown()).nullable().optional(),
  created_at: z.union([z.string(), z.date()]),
  updated_at: z.union([z.string(), z.date()]),
  deleted_at: z.union([z.string(), z.date()]).nullable().optional(),
})

/**
 * Schema for CreateProductCategoriesWorkflowInput
 */
export const createProductCategoriesWorkflowInputSchema = z.object({
  product_categories: z.array(createProductCategoryDTOSchema),
  additional_data: z.record(z.unknown()).optional(),
})

/**
 * Schema for CreateProductCategoriesWorkflowOutput
 */
export const createProductCategoriesWorkflowOutputSchema = z.array(productCategoryDTOSchema)

export type CreateProductCategoriesWorkflowInput = z.infer<
  typeof createProductCategoriesWorkflowInputSchema
>
export type CreateProductCategoriesWorkflowOutput = z.infer<
  typeof createProductCategoriesWorkflowOutputSchema
>

/**
 * Schema for UpdateProductCategoriesWorkflowInput
 */
export const updateProductCategoriesWorkflowInputSchema = z.object({
  selector: z.record(z.unknown()),
  update: updateProductCategoryDTOSchema,
  additional_data: z.record(z.unknown()).optional(),
})

/**
 * Schema for UpdateProductCategoriesWorkflowOutput
 */
export const updateProductCategoriesWorkflowOutputSchema = z.array(productCategoryDTOSchema)

export type UpdateProductCategoriesWorkflowInput = z.infer<
  typeof updateProductCategoriesWorkflowInputSchema
>
export type UpdateProductCategoriesWorkflowOutput = z.infer<
  typeof updateProductCategoriesWorkflowOutputSchema
>

/**
 * Schema for DeleteProductCategoriesWorkflowInput
 */
export const deleteProductCategoriesWorkflowInputSchema = z.array(z.string())

/**
 * Schema for DeleteProductCategoriesWorkflowOutput
 */
export const deleteProductCategoriesWorkflowOutputSchema = z.void()

export type DeleteProductCategoriesWorkflowInput = z.infer<
  typeof deleteProductCategoriesWorkflowInputSchema
>
export type DeleteProductCategoriesWorkflowOutput = z.infer<
  typeof deleteProductCategoriesWorkflowOutputSchema
>