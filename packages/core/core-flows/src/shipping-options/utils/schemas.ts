import { z } from "zod"

/**
 * Schema for CreateShippingOptionTypeDTO
 */
const createShippingOptionTypeDTOSchema = z.object({
  label: z.string(),
  code: z.string(),
  description: z.string().optional(),
})

/**
 * Schema for UpdateShippingOptionTypeDTO
 */
const updateShippingOptionTypeDTOSchema = z.object({
  label: z.string().optional(),
  description: z.string().optional(),
})

/**
 * Schema for ShippingOptionTypeDTO
 */
const shippingOptionTypeDTOSchema = z.object({
  id: z.string(),
  label: z.string(),
  code: z.string(),
  description: z.string().nullable().optional(),
  created_at: z.union([z.string(), z.date()]),
  updated_at: z.union([z.string(), z.date()]),
  deleted_at: z.union([z.string(), z.date()]).nullable().optional(),
})

/**
 * Schema for CreateShippingOptionTypesWorkflowInput
 */
export const createShippingOptionTypesWorkflowInputSchema = z.object({
  shipping_option_types: z.array(createShippingOptionTypeDTOSchema),
  additional_data: z.record(z.unknown()).optional(),
})

/**
 * Schema for CreateShippingOptionTypesWorkflowOutput
 */
export const createShippingOptionTypesWorkflowOutputSchema = z.array(shippingOptionTypeDTOSchema)

export type CreateShippingOptionTypesWorkflowInput = z.infer<
  typeof createShippingOptionTypesWorkflowInputSchema
>
export type CreateShippingOptionTypesWorkflowOutput = z.infer<
  typeof createShippingOptionTypesWorkflowOutputSchema
>

/**
 * Schema for UpdateShippingOptionTypesWorkflowInput
 */
export const updateShippingOptionTypesWorkflowInputSchema = z.object({
  selector: z.record(z.unknown()),
  update: updateShippingOptionTypeDTOSchema,
  additional_data: z.record(z.unknown()).optional(),
})

/**
 * Schema for UpdateShippingOptionTypesWorkflowOutput
 */
export const updateShippingOptionTypesWorkflowOutputSchema = z.array(shippingOptionTypeDTOSchema)

export type UpdateShippingOptionTypesWorkflowInput = z.infer<
  typeof updateShippingOptionTypesWorkflowInputSchema
>
export type UpdateShippingOptionTypesWorkflowOutput = z.infer<
  typeof updateShippingOptionTypesWorkflowOutputSchema
>

/**
 * Schema for DeleteShippingOptionTypesWorkflowInput
 */
export const deleteShippingOptionTypesWorkflowInputSchema = z.object({
  ids: z.array(z.string()),
})

/**
 * Schema for DeleteShippingOptionTypesWorkflowOutput
 */
export const deleteShippingOptionTypesWorkflowOutputSchema = z.void()

export type DeleteShippingOptionTypesWorkflowInput = z.infer<
  typeof deleteShippingOptionTypesWorkflowInputSchema
>
export type DeleteShippingOptionTypesWorkflowOutput = z.infer<
  typeof deleteShippingOptionTypesWorkflowOutputSchema
>