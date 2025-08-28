import { z } from "zod"

/**
 * Schema for StoreCurrencyDTO matching the type from @medusajs/framework/types
 */
export const storeCurrencyDTOSchema = z.object({
  /**
   * The ID of the store currency.
   */
  id: z.string(),
  /**
   * The currency code of the store currency.
   */
  currency_code: z.string(),
  /**
   * Whether the currency is the default one for the store.
   */
  is_default: z.boolean(),
  /**
   * The store ID associated with the currency.
   */
  store_id: z.string(),
  /**
   * The created date of the currency
   */
  created_at: z.string(),
  /**
   * The updated date of the currency
   */
  updated_at: z.string(),
  /**
   * The deleted date of the currency
   */
  deleted_at: z.string().nullable(),
})

/**
 * Schema for StoreDTO matching the type from @medusajs/framework/types
 */
export const storeDTOSchema = z.object({
  /**
   * The ID of the store.
   */
  id: z.string(),

  /**
   * The name of the store.
   */
  name: z.string(),

  /**
   * The supported currency codes of the store.
   */
  supported_currencies: z.array(storeCurrencyDTOSchema).optional(),

  /**
   * The associated default sales channel's ID.
   */
  default_sales_channel_id: z.string().optional(),

  /**
   * The associated default region's ID.
   */
  default_region_id: z.string().optional(),

  /**
   * The associated default location's ID.
   */
  default_location_id: z.string().optional(),

  /**
   * Holds custom data in key-value pairs.
   */
  metadata: z.record(z.any()).nullable(),

  /**
   * The created at of the store.
   */
  created_at: z.string(),

  /**
   * The updated at of the store.
   */
  updated_at: z.string(),
})

/**
 * Schema for supported currency in create/update workflows
 */
export const workflowSupportedCurrencySchema = z.object({
  /**
   * The currency ISO 3 code.
   * 
   * @example
   * usd
   */
  currency_code: z.string(),
  /**
   * Whether this currency is the default currency in the store.
   */
  is_default: z.boolean().optional(),
  /**
   * Whether prices in this currency are tax inclusive.
   * 
   * Learn more in [this documentation](https://docs.medusajs.com/resources/commerce-modules/pricing/tax-inclusive-pricing).
   */
  is_tax_inclusive: z.boolean().optional(),
})

/**
 * Schema for CreateStoreWorkflowInput
 */
export const createStoreWorkflowInputSchema = z.object({
  /**
   * The name of the store.
   */
  name: z.string().optional(),

  /**
   * The supported currencies of the store.
   */
  supported_currencies: z.array(workflowSupportedCurrencySchema),

  /**
   * The associated default sales channel's ID.
   */
  default_sales_channel_id: z.string().optional(),

  /**
   * The associated default region's ID.
   */
  default_region_id: z.string().optional(),

  /**
   * The associated default location's ID.
   */
  default_location_id: z.string().optional(),

  /**
   * Holds custom data in key-value pairs.
   */
  metadata: z.record(z.any()).optional(),
})

/**
 * Schema for CreateStoresWorkflowInput
 */
export const createStoresWorkflowInputSchema = z.object({
  /**
   * The stores to create.
   */
  stores: z.array(createStoreWorkflowInputSchema),
})

/**
 * Schema for CreateStoresWorkflowOutput
 */
export const createStoresWorkflowOutputSchema = z.array(storeDTOSchema)

/**
 * Schema for DeleteStoresWorkflowInput
 */
export const deleteStoresWorkflowInputSchema = z.object({
  /**
   * The IDs of the stores to delete.
   */
  ids: z.array(z.string()),
})

/**
 * Schema for DeleteStoresWorkflowOutput
 */
export const deleteStoresWorkflowOutputSchema = z.void()

/**
 * Schema for FilterableStoreProps
 */
export const filterableStorePropsSchema = z.object({
  /**
   * Find stores by name through this search term.
   */
  q: z.string().optional(),
  /**
   * The IDs to filter the stores by.
   */
  id: z.union([z.string(), z.array(z.string())]).optional(),
  /**
   * Filter stores by their names.
   */
  name: z.union([z.string(), z.array(z.string())]).optional(),
  /**
   * Filter stores by their associated default sales channel's ID.
   */
  default_sales_channel_id: z.union([
    z.string(),
    z.array(z.string()),
    z.record(z.union([z.string(), z.array(z.string())])),
  ]).optional(),
})

/**
 * Schema for AdminUpdateStore
 */
export const adminUpdateStoreSchema = z.object({
  /**
   * The name of the store.
   */
  name: z.string().optional(),
  /**
   * The supported currencies of the store.
   */
  supported_currencies: z.array(workflowSupportedCurrencySchema).optional(),
  /**
   * The ID of the default sales channel of the store.
   */
  default_sales_channel_id: z.string().nullable().optional(),
  /**
   * The ID of the default region of the store.
   */
  default_region_id: z.string().nullable().optional(),
  /**
   * The ID of the default stock location of the store.
   */
  default_location_id: z.string().nullable().optional(),
  /**
   * Custom key-value pairs to store custom data in the store.
   */
  metadata: z.record(z.any()).nullable().optional(),
})

/**
 * Schema for UpdateStoresWorkflowInput
 */
export const updateStoresWorkflowInputSchema = z.object({
  /**
   * The filters to select the stores to update.
   */
  selector: filterableStorePropsSchema,
  /**
   * The data to update in the stores.
   */
  update: adminUpdateStoreSchema,
})

/**
 * Schema for UpdateStoresWorkflowOutput
 */
export const updateStoresWorkflowOutputSchema = z.array(storeDTOSchema)

// Re-export types for backward compatibility
export type CreateStoresWorkflowInput = z.infer<typeof createStoresWorkflowInputSchema>
export type CreateStoresWorkflowOutput = z.infer<typeof createStoresWorkflowOutputSchema>
export type DeleteStoresWorkflowInput = z.infer<typeof deleteStoresWorkflowInputSchema>
export type DeleteStoresWorkflowOutput = z.infer<typeof deleteStoresWorkflowOutputSchema>
export type UpdateStoresWorkflowInput = z.infer<typeof updateStoresWorkflowInputSchema>
export type UpdateStoresWorkflowOutput = z.infer<typeof updateStoresWorkflowOutputSchema>