import { z } from "zod"

/**
 * Delete Schemas - All schemas related to deleting products and their related entities
 */

/**
 * Schema for DeleteProductsWorkflowInput
 */
export const deleteProductsWorkflowInputSchema = z.object({
  ids: z.array(z.string()),
})

/**
 * Schema for DeleteProductsWorkflowOutput
 */
export const deleteProductsWorkflowOutputSchema = z.void()

/**
 * Schema for DeleteProductVariantsWorkflowInput
 */
export const deleteProductVariantsWorkflowInputSchema = z.object({
  ids: z.array(z.string()),
})

/**
 * Schema for DeleteProductVariantsWorkflowOutput
 */
export const deleteProductVariantsWorkflowOutputSchema = z.void()

/**
 * Schema for DeleteProductOptionsWorkflowInput
 */
export const deleteProductOptionsWorkflowInputSchema = z.object({
  ids: z.array(z.string()),
})

/**
 * Schema for DeleteProductOptionsWorkflowOutput
 */
export const deleteProductOptionsWorkflowOutputSchema = z.void()

/**
 * Schema for DeleteProductTypesWorkflowInput
 */
export const deleteProductTypesWorkflowInputSchema = z.object({
  ids: z.array(z.string()),
})

/**
 * Schema for DeleteProductTypesWorkflowOutput
 */
export const deleteProductTypesWorkflowOutputSchema = z.void()

/**
 * Schema for DeleteProductTagsWorkflowInput
 */
export const deleteProductTagsWorkflowInputSchema = z.object({
  ids: z.array(z.string()),
})

/**
 * Schema for DeleteProductTagsWorkflowOutput
 */
export const deleteProductTagsWorkflowOutputSchema = z.void()

/**
 * Schema for DeleteCollectionsWorkflowInput
 */
export const deleteCollectionsWorkflowInputSchema = z.object({
  ids: z.array(z.string()),
})

/**
 * Schema for DeleteCollectionsWorkflowOutput
 */
export const deleteCollectionsWorkflowOutputSchema = z.void()

// Type exports for delete workflows
export type DeleteProductsWorkflowInput = z.infer<
  typeof deleteProductsWorkflowInputSchema
>
export type DeleteProductsWorkflowOutput = z.infer<
  typeof deleteProductsWorkflowOutputSchema
>
export type DeleteProductVariantsWorkflowInput = z.infer<
  typeof deleteProductVariantsWorkflowInputSchema
>
export type DeleteProductVariantsWorkflowOutput = z.infer<
  typeof deleteProductVariantsWorkflowOutputSchema
>
export type DeleteProductOptionsWorkflowInput = z.infer<
  typeof deleteProductOptionsWorkflowInputSchema
>
export type DeleteProductOptionsWorkflowOutput = z.infer<
  typeof deleteProductOptionsWorkflowOutputSchema
>
export type DeleteProductTypesWorkflowInput = z.infer<
  typeof deleteProductTypesWorkflowInputSchema
>
export type DeleteProductTypesWorkflowOutput = z.infer<
  typeof deleteProductTypesWorkflowOutputSchema
>
export type DeleteProductTagsWorkflowInput = z.infer<
  typeof deleteProductTagsWorkflowInputSchema
>
export type DeleteProductTagsWorkflowOutput = z.infer<
  typeof deleteProductTagsWorkflowOutputSchema
>
export type DeleteCollectionsWorkflowInput = z.infer<
  typeof deleteCollectionsWorkflowInputSchema
>
export type DeleteCollectionsWorkflowOutput = z.infer<
  typeof deleteCollectionsWorkflowOutputSchema
>