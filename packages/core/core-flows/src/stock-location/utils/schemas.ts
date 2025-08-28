import { z } from "zod"

/**
 * Schema for CreateStockLocationInput
 */
const createStockLocationInputSchema = z.object({
  name: z.string(),
  address_id: z.string().optional(),
  address: z
    .object({
      address_1: z.string(),
      address_2: z.string().nullable().optional(),
      city: z.string().optional(),
      country_code: z.string(),
      phone: z.string().nullable().optional(),
      province: z.string().nullable().optional(),
      postal_code: z.string().optional(),
      company: z.string().nullable().optional(),
    })
    .optional(),
  metadata: z.record(z.unknown()).optional(),
})

/**
 * Schema for StockLocationDTO
 */
const stockLocationDTOSchema = z.object({
  id: z.string(),
  name: z.string(),
  metadata: z.record(z.unknown()).nullable(),
  address_id: z.string(),
  address: z
    .object({
      id: z.string().optional(),
      address_1: z.string().nullable(),
      address_2: z.string().nullable().optional(),
      city: z.string().nullable().optional(),
      country_code: z.string().nullable(),
      phone: z.string().nullable().optional(),
      province: z.string().nullable().optional(),
      postal_code: z.string().nullable().optional(),
      company: z.string().nullable().optional(),
      created_at: z.union([z.date(), z.string()]),
      updated_at: z.union([z.date(), z.string()]),
      deleted_at: z.union([z.date(), z.string()]).nullable().optional(),
      metadata: z.record(z.unknown()).nullable().optional(),
    })
    .nullable()
    .optional(),
  created_at: z.union([z.date(), z.string()]),
  updated_at: z.union([z.date(), z.string()]),
  deleted_at: z.union([z.date(), z.string()]).nullable().optional(),
})

/**
 * Schema for CreateStockLocationsWorkflowInput
 */
export const createStockLocationsWorkflowInputSchema = z.object({
  locations: z.array(createStockLocationInputSchema),
})

/**
 * Schema for CreateStockLocationsWorkflowOutput
 */
export const createStockLocationsWorkflowOutputSchema = z.array(
  stockLocationDTOSchema
)

export type CreateStockLocationsWorkflowInput = z.infer<
  typeof createStockLocationsWorkflowInputSchema
>
export type CreateStockLocationsWorkflowOutput = z.infer<
  typeof createStockLocationsWorkflowOutputSchema
>

/**
 * Schema for UpdateStockLocationInput
 */
const updateStockLocationInputSchema = z.object({
  name: z.string().optional(),
  address_id: z.string().nullable().optional(),
  address: z
    .object({
      address_1: z.string(),
      address_2: z.string().nullable().optional(),
      city: z.string().optional(),
      country_code: z.string(),
      phone: z.string().nullable().optional(),
      province: z.string().nullable().optional(),
      postal_code: z.string().optional(),
      company: z.string().nullable().optional(),
    })
    .optional(),
  metadata: z.record(z.unknown()).optional(),
})

/**
 * Schema for FilterableStockLocationProps
 */
const filterableStockLocationPropsSchema = z
  .object({
    q: z.string().optional(),
    id: z.union([z.string(), z.array(z.string())]).optional(),
    name: z.union([z.string(), z.array(z.string())]).optional(),
    address_id: z.union([z.string(), z.array(z.string())]).optional(),
    $and: z.any().optional(),
    $or: z.any().optional(),
  })
  .passthrough()

/**
 * Schema for UpdateStockLocationsWorkflowInput
 */
export const updateStockLocationsWorkflowInputSchema = z.object({
  selector: filterableStockLocationPropsSchema,
  update: updateStockLocationInputSchema,
})

/**
 * Schema for UpdateStockLocationsWorkflowOutput
 */
export const updateStockLocationsWorkflowOutputSchema = z.array(
  stockLocationDTOSchema
)

export type UpdateStockLocationsWorkflowInput = z.infer<
  typeof updateStockLocationsWorkflowInputSchema
>
export type UpdateStockLocationsWorkflowOutput = z.infer<
  typeof updateStockLocationsWorkflowOutputSchema
>

/**
 * Schema for LinkSalesChannelsToStockLocationWorkflowInput
 */
export const linkSalesChannelsToStockLocationWorkflowInputSchema = z.object({
  id: z.string(),
  add: z.array(z.string()).optional(),
  remove: z.array(z.string()).optional(),
})

/**
 * Schema for LinkSalesChannelsToStockLocationWorkflowOutput
 */
export const linkSalesChannelsToStockLocationWorkflowOutputSchema = z.void()

export type LinkSalesChannelsToStockLocationWorkflowInput = z.infer<
  typeof linkSalesChannelsToStockLocationWorkflowInputSchema
>
export type LinkSalesChannelsToStockLocationWorkflowOutput = z.infer<
  typeof linkSalesChannelsToStockLocationWorkflowOutputSchema
>

/**
 * Schema for CreateLocationFulfillmentSetWorkflowInput
 */
export const createLocationFulfillmentSetWorkflowInputSchema = z.object({
  location_id: z.string(),
  fulfillment_set_data: z.object({
    name: z.string(),
    type: z.string(),
    service_zones: z
      .array(
        z.object({
          name: z.string(),
          geo_zones: z
            .array(
              z.object({
                type: z.string(),
                country_code: z.string(),
                province_code: z.string().optional(),
                city: z.string().optional(),
                postal_expression: z.record(z.unknown()).optional(),
                metadata: z.record(z.unknown()).optional(),
              })
            )
            .optional(),
        })
      )
      .optional(),
  }),
})

/**
 * Schema for CreateLocationFulfillmentSetWorkflowOutput
 */
export const createLocationFulfillmentSetWorkflowOutputSchema = z.void()

export type CreateLocationFulfillmentSetWorkflowInput = z.infer<
  typeof createLocationFulfillmentSetWorkflowInputSchema
>
export type CreateLocationFulfillmentSetWorkflowOutput = z.infer<
  typeof createLocationFulfillmentSetWorkflowOutputSchema
>

/**
 * Schema for DeleteStockLocationWorkflowInput
 */
export const deleteStockLocationsWorkflowInputSchema = z.object({
  ids: z.array(z.string()),
})

/**
 * Schema for DeleteStockLocationWorkflowOutput
 */
export const deleteStockLocationsWorkflowOutputSchema = z.void()

export type DeleteStockLocationsWorkflowInput = z.infer<
  typeof deleteStockLocationsWorkflowInputSchema
>
export type DeleteStockLocationsWorkflowOutput = z.infer<
  typeof deleteStockLocationsWorkflowOutputSchema
>
