import { z } from "zod"

// Store schemas
export const createStoreCurrencyDTOSchema = z.object({
  currency_code: z.string(),
  is_default: z.boolean().optional(),
})

export const createStoreDTOSchema = z.object({
  name: z.string().optional(),
  supported_currencies: z.array(createStoreCurrencyDTOSchema).optional(),
  default_sales_channel_id: z.string().optional(),
  default_region_id: z.string().optional(),
  default_location_id: z.string().optional(),
  metadata: z.record(z.any()).optional(),
})

export const storeCurrencyDTOSchema = z.object({
  id: z.string(),
  currency_code: z.string(),
  is_default: z.boolean(),
  store_id: z.string(),
  created_at: z.string(),
  updated_at: z.string(),
  deleted_at: z.string().nullable(),
})

export const storeDTOSchema = z.object({
  id: z.string(),
  name: z.string(),
  supported_currencies: z.array(storeCurrencyDTOSchema).optional(),
  default_sales_channel_id: z.string().optional(),
  default_region_id: z.string().optional(),
  default_location_id: z.string().optional(),
  metadata: z.record(z.any()).nullable(),
  created_at: z.string(),
  updated_at: z.string(),
})

// Sales channel schemas
export const createSalesChannelDTOSchema = z.object({
  name: z.string(),
  description: z.string().nullable().optional(),
  is_disabled: z.boolean().optional(),
})

export const salesChannelLocationDTOSchema = z.object({
  sales_channel_id: z.string(),
  location_id: z.string(),
  sales_channel: z.lazy(() => salesChannelDTOSchema),
})

export const salesChannelDTOSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().nullable(),
  is_disabled: z.boolean(),
  metadata: z.record(z.unknown()).nullable(),
  locations: z.array(salesChannelLocationDTOSchema).optional(),
})

// Workflow input/output schemas for create-defaults
export const createDefaultsWorkflowInputSchema = z.object({}).strict()

export const createDefaultsWorkflowOutputSchema = storeDTOSchema

// Infer types
export type CreateStoreCurrencyDTO = z.infer<typeof createStoreCurrencyDTOSchema>
export type CreateStoreDTO = z.infer<typeof createStoreDTOSchema>
export type StoreCurrencyDTO = z.infer<typeof storeCurrencyDTOSchema>
export type StoreDTO = z.infer<typeof storeDTOSchema>
export type CreateSalesChannelDTO = z.infer<typeof createSalesChannelDTOSchema>
export type SalesChannelLocationDTO = z.infer<typeof salesChannelLocationDTOSchema>
export type SalesChannelDTO = z.infer<typeof salesChannelDTOSchema>
export type CreateDefaultsWorkflowInput = z.infer<typeof createDefaultsWorkflowInputSchema>
export type CreateDefaultsWorkflowOutput = z.infer<typeof createDefaultsWorkflowOutputSchema>