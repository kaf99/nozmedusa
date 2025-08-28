import { z } from "zod"

/**
 * Schema for CreatePricePreferencesWorkflowInput
 */
const createPricePreferencesWorkflowInputItemSchema = z.object({
  attribute: z.string().optional(),
  value: z.string().optional(),
  is_tax_inclusive: z.boolean().optional(),
})

/**
 * Schema for PricePreferenceDTO
 */
const pricePreferenceDTOSchema = z.object({
  id: z.string(),
  attribute: z.string().nullable(),
  value: z.string().nullable(),
  is_tax_inclusive: z.boolean(),
  created_at: z.date(),
  updated_at: z.date(),
  deleted_at: z.date().nullable(),
})

/**
 * Schema for FilterablePricePreferenceProps
 */
const filterablePricePreferencePropsSchema = z.object({
  id: z.array(z.string()).optional(),
  attribute: z.union([z.string(), z.array(z.string())]).optional(),
  value: z.union([z.string(), z.array(z.string())]).optional(),
  $and: z.any().optional(),
  $or: z.any().optional(),
})

/**
 * Schema for UpdatePricePreferences
 */
const updatePricePreferencesSchema = z.object({
  attribute: z.string().nullable().optional(),
  value: z.string().nullable().optional(),
  is_tax_inclusive: z.boolean().optional(),
})

/**
 * Schema for CreatePricePreferencesWorkflowInput
 */
export const createPricePreferencesWorkflowInputSchema = z.array(createPricePreferencesWorkflowInputItemSchema)

/**
 * Schema for CreatePricePreferencesWorkflowOutput
 */
export const createPricePreferencesWorkflowOutputSchema = z.array(pricePreferenceDTOSchema)

/**
 * Schema for UpdatePricePreferencesWorkflowInput
 */
export const updatePricePreferencesWorkflowInputSchema = z.object({
  selector: filterablePricePreferencePropsSchema,
  update: updatePricePreferencesSchema,
})

/**
 * Schema for UpdatePricePreferencesWorkflowOutput
 */
export const updatePricePreferencesWorkflowOutputSchema = z.array(pricePreferenceDTOSchema)

/**
 * Schema for DeletePricePreferencesWorkflowInput
 */
export const deletePricePreferencesWorkflowInputSchema = z.array(z.string())

/**
 * Schema for DeletePricePreferencesWorkflowOutput
 */
export const deletePricePreferencesWorkflowOutputSchema = z.void()

// Type exports for workflow input/output types
export type CreatePricePreferencesWorkflowInput = z.infer<typeof createPricePreferencesWorkflowInputSchema>
export type CreatePricePreferencesWorkflowOutput = z.infer<typeof createPricePreferencesWorkflowOutputSchema>
export type UpdatePricePreferencesWorkflowInput = z.infer<typeof updatePricePreferencesWorkflowInputSchema>
export type UpdatePricePreferencesWorkflowOutput = z.infer<typeof updatePricePreferencesWorkflowOutputSchema>
export type DeletePricePreferencesWorkflowInput = z.infer<typeof deletePricePreferencesWorkflowInputSchema>
export type DeletePricePreferencesWorkflowOutput = z.infer<typeof deletePricePreferencesWorkflowOutputSchema>