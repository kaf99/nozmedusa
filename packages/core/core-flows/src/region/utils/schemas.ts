import { z } from "zod"

/**
 * Schema for RegionCountryDTO
 */
const regionCountryDTOSchema = z.object({
  id: z.string(),
  iso_2: z.string(),
  iso_3: z.string(),
  num_code: z.string(),
  name: z.string(),
  display_name: z.string(),
  region_id: z.string().nullable().optional(),
  region: z.record(z.any()).optional(),
})

/**
 * Schema for PaymentProviderDTO
 */
const paymentProviderDTOSchema = z.object({
  id: z.string(),
  is_enabled: z.boolean(),
})

/**
 * Schema for CreateRegionDTO base
 */
const createRegionDTOBaseSchema = z.object({
  name: z.string(),
  currency_code: z.string(),
  automatic_taxes: z.boolean().optional(),
  countries: z.array(z.string()).optional(),
  metadata: z.record(z.unknown()).nullable().optional(),
})

/**
 * Schema for CreateRegionDTO with extensions
 */
const createRegionDTOExtendedSchema = createRegionDTOBaseSchema.extend({
  payment_providers: z.array(z.string()).optional(),
  is_tax_inclusive: z.boolean().optional(),
})

/**
 * Schema for RegionDTO
 */
const regionDTOSchema = z.object({
  id: z.string(),
  name: z.string(),
  currency_code: z.string(),
  automatic_taxes: z.boolean(),
  countries: z.array(regionCountryDTOSchema),
  payment_providers: z.array(paymentProviderDTOSchema),
  metadata: z.record(z.any()).optional(),
  created_at: z.string(),
  updated_at: z.string(),
})

/**
 * Schema for UpdateRegionDTO base
 */
const updateRegionDTOBaseSchema = z.object({
  name: z.string().optional(),
  currency_code: z.string().optional(),
  automatic_taxes: z.boolean().optional(),
  countries: z.array(z.string()).optional(),
  metadata: z.record(z.unknown()).nullable().optional(),
})

/**
 * Schema for UpdateRegionDTO with extensions
 */
const updateRegionDTOExtendedSchema = updateRegionDTOBaseSchema.extend({
  is_tax_inclusive: z.boolean().optional(),
  payment_providers: z.array(z.string()).optional(),
})

/**
 * Schema for FilterableRegionProps
 */
const filterableRegionPropsSchema = z.object({
  q: z.string().optional(),
  id: z.union([
    z.string(),
    z.array(z.string()),
    z.record(z.any()),
  ]).optional(),
  name: z.union([z.string(), z.record(z.any())]).optional(),
  currency_code: z.union([z.string(), z.record(z.any())]).optional(),
  metadata: z.union([
    z.record(z.unknown()),
    z.record(z.any()),
  ]).optional(),
  created_at: z.record(z.any()).optional(),
  updated_at: z.record(z.any()).optional(),
  $and: z.any().optional(),
  $or: z.any().optional(),
})

/**
 * Schema for CreateRegionsWorkflowInput
 */
export const createRegionsWorkflowInputSchema = z.object({
  regions: z.array(createRegionDTOExtendedSchema),
})

/**
 * Schema for CreateRegionsWorkflowOutput
 */
export const createRegionsWorkflowOutputSchema = z.array(regionDTOSchema)

/**
 * Schema for UpdateRegionsWorkflowInput
 */
export const updateRegionsWorkflowInputSchema = z.object({
  selector: filterableRegionPropsSchema,
  update: updateRegionDTOExtendedSchema,
})

/**
 * Schema for UpdateRegionsWorkflowOutput
 */
export const updateRegionsWorkflowOutputSchema = z.array(regionDTOSchema)

/**
 * Schema for DeleteRegionsWorkflowInput
 */
export const deleteRegionsWorkflowInputSchema = z.object({
  ids: z.array(z.string()),
})

/**
 * Schema for DeleteRegionsWorkflowOutput
 */
export const deleteRegionsWorkflowOutputSchema = z.void()

// Type exports for workflow input/output types
export type CreateRegionsWorkflowInput = z.infer<typeof createRegionsWorkflowInputSchema>
export type CreateRegionsWorkflowOutput = z.infer<typeof createRegionsWorkflowOutputSchema>
export type UpdateRegionsWorkflowInput = z.infer<typeof updateRegionsWorkflowInputSchema>
export type UpdateRegionsWorkflowOutput = z.infer<typeof updateRegionsWorkflowOutputSchema>
export type DeleteRegionsWorkflowInput = z.infer<typeof deleteRegionsWorkflowInputSchema>
export type DeleteRegionsWorkflowOutput = z.infer<typeof deleteRegionsWorkflowOutputSchema>