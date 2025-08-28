import { z } from "zod"

/**
 * Schema for CreateSalesChannelDTO
 */
const createSalesChannelDTOSchema = z.object({
  name: z.string(),
  description: z.string().nullable().optional(),
  is_disabled: z.boolean().optional(),
})

/**
 * Schema for SalesChannelDTO
 */
const salesChannelDTOSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().nullable(),
  is_disabled: z.boolean(),
  metadata: z.record(z.unknown()).nullable(),
  locations: z.array(z.object({
    sales_channel_id: z.string(),
    location_id: z.string(),
    sales_channel: z.lazy(() => salesChannelDTOSchema),
  })).optional(),
})

/**
 * Schema for UpdateSalesChannelDTO
 */
const updateSalesChannelDTOSchema = z.object({
  name: z.string().optional(),
  description: z.string().nullable().optional(),
  is_disabled: z.boolean().optional(),
  metadata: z.record(z.unknown()).optional(),
})

/**
 * Schema for FilterableSalesChannelProps
 */
const filterableSalesChannelPropsSchema = z.object({
  q: z.string().optional(),
  id: z.union([z.string(), z.array(z.string())]).optional(),
  name: z.union([z.string(), z.array(z.string())]).optional(),
  is_disabled: z.boolean().optional(),
  $and: z.any().optional(),
  $or: z.any().optional(),
})

/**
 * Schema for LinkWorkflowInput
 */
const linkWorkflowInputSchema = z.object({
  id: z.string(),
  add: z.array(z.string()).optional(),
  remove: z.array(z.string()).optional(),
})

/**
 * Schema for CreateSalesChannelsWorkflowInput
 */
export const createSalesChannelsWorkflowInputSchema = z.object({
  salesChannelsData: z.array(createSalesChannelDTOSchema),
})

/**
 * Schema for CreateSalesChannelsWorkflowOutput
 */
export const createSalesChannelsWorkflowOutputSchema = z.array(salesChannelDTOSchema)

/**
 * Schema for UpdateSalesChannelsWorkflowInput
 */
export const updateSalesChannelsWorkflowInputSchema = z.object({
  selector: filterableSalesChannelPropsSchema,
  update: updateSalesChannelDTOSchema,
})

/**
 * Schema for UpdateSalesChannelsWorkflowOutput
 */
export const updateSalesChannelsWorkflowOutputSchema = z.array(salesChannelDTOSchema)

/**
 * Schema for DeleteSalesChannelsWorkflowInput
 */
export const deleteSalesChannelsWorkflowInputSchema = z.object({
  ids: z.array(z.string()),
})

/**
 * Schema for DeleteSalesChannelsWorkflowOutput
 */
export const deleteSalesChannelsWorkflowOutputSchema = z.void()

/**
 * Schema for LinkProductsToSalesChannelWorkflowInput
 */
export const linkProductsToSalesChannelWorkflowInputSchema = linkWorkflowInputSchema

/**
 * Schema for LinkProductsToSalesChannelWorkflowOutput
 */
export const linkProductsToSalesChannelWorkflowOutputSchema = z.void()

// Type exports for workflow input/output types
export type CreateSalesChannelsWorkflowInput = z.infer<typeof createSalesChannelsWorkflowInputSchema>
export type CreateSalesChannelsWorkflowOutput = z.infer<typeof createSalesChannelsWorkflowOutputSchema>
export type UpdateSalesChannelsWorkflowInput = z.infer<typeof updateSalesChannelsWorkflowInputSchema>
export type UpdateSalesChannelsWorkflowOutput = z.infer<typeof updateSalesChannelsWorkflowOutputSchema>
export type DeleteSalesChannelsWorkflowInput = z.infer<typeof deleteSalesChannelsWorkflowInputSchema>
export type DeleteSalesChannelsWorkflowOutput = z.infer<typeof deleteSalesChannelsWorkflowOutputSchema>
export type LinkProductsToSalesChannelWorkflowInput = z.infer<typeof linkProductsToSalesChannelWorkflowInputSchema>
export type LinkProductsToSalesChannelWorkflowOutput = z.infer<typeof linkProductsToSalesChannelWorkflowOutputSchema>