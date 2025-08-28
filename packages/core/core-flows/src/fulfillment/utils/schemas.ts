import { z } from "zod"

/**
 * Schema for CreateShippingProfileDTO
 */
const createShippingProfileDTOSchema = z.object({
  name: z.string(),
  type: z.string(),
  metadata: z.record(z.unknown()).optional(),
})

/**
 * Schema for ShippingProfileDTO
 */
const shippingProfileDTOSchema = z.object({
  id: z.string(),
  name: z.string(),
  type: z.string(),
  metadata: z.record(z.unknown()).nullable().optional(),
  created_at: z.union([z.string(), z.date()]).optional(),
  updated_at: z.union([z.string(), z.date()]).optional(),
  deleted_at: z.union([z.string(), z.date()]).nullable().optional(),
})

/**
 * Schema for CreateShippingProfilesWorkflowInput
 */
export const createShippingProfilesWorkflowInputSchema = z.object({
  data: z.array(createShippingProfileDTOSchema),
})

/**
 * Schema for CreateShippingProfilesWorkflowOutput
 */
export const createShippingProfilesWorkflowOutputSchema = z.array(
  shippingProfileDTOSchema
)

/**
 * Schema for CreateGeoZoneBaseDTO
 */
const createGeoZoneBaseDTOSchema = z.object({
  type: z.enum(["country", "province", "city", "zip"]),
  country_code: z.string(),
  metadata: z.record(z.unknown()).nullable().optional(),
})

/**
 * Schema for country geo zone
 */
const createCountryGeoZoneDTOSchema = createGeoZoneBaseDTOSchema.extend({
  type: z.literal("country"),
})

/**
 * Schema for province geo zone
 */
const createProvinceGeoZoneDTOSchema = createGeoZoneBaseDTOSchema.extend({
  type: z.literal("province"),
  province_code: z.string(),
})

/**
 * Schema for city geo zone
 */
const createCityGeoZoneDTOSchema = createGeoZoneBaseDTOSchema.extend({
  type: z.literal("city"),
  province_code: z.string(),
  city: z.string(),
})

/**
 * Schema for zip geo zone
 */
const createZipGeoZoneDTOSchema = createGeoZoneBaseDTOSchema.extend({
  type: z.literal("zip"),
  province_code: z.string(),
  city: z.string(),
  postal_expression: z.record(z.any()),
})

/**
 * Schema for CreateGeoZoneDTO (union)
 */
const createGeoZoneDTOSchema = z.union([
  createCountryGeoZoneDTOSchema,
  createProvinceGeoZoneDTOSchema,
  createCityGeoZoneDTOSchema,
  createZipGeoZoneDTOSchema,
])

/**
 * Schema for CreateServiceZoneDTO
 */
const createServiceZoneDTOSchema = z.object({
  name: z.string(),
  fulfillment_set_id: z.string(),
  geo_zones: z.array(createGeoZoneDTOSchema).optional(),
  metadata: z.record(z.unknown()).nullable().optional(),
})

/**
 * Schema for ServiceZoneDTO
 */
const serviceZoneDTOSchema = z.object({
  id: z.string(),
  name: z.string(),
  fulfillment_set_id: z.string().nullable().optional(),
  geo_zones: z.array(z.any()).optional(),
  metadata: z.record(z.unknown()).nullable().optional(),
  created_at: z.union([z.string(), z.date()]).optional(),
  updated_at: z.union([z.string(), z.date()]).optional(),
  deleted_at: z.union([z.string(), z.date()]).nullable().optional(),
})

/**
 * Schema for CreateServiceZonesWorkflowInput
 */
export const createServiceZonesWorkflowInputSchema = z.object({
  data: z.array(createServiceZoneDTOSchema),
})

/**
 * Schema for CreateServiceZonesWorkflowOutput
 */
export const createServiceZonesWorkflowOutputSchema =
  z.array(serviceZoneDTOSchema)

/**
 * Schema for CreateShippingOptionTypeDTO
 */
const createShippingOptionTypeDTOSchema = z.object({
  label: z.string(),
  description: z.string().optional(),
  code: z.string(),
})

/**
 * Schema for shipping option rules
 */
const shippingOptionRuleSchema = z.object({
  attribute: z.string(),
  operator: z.enum(["in", "eq", "ne", "gt", "gte", "lt", "lte", "nin"]),
  value: z.union([z.string(), z.array(z.string())]),
})

/**
 * Schema for flat rate price record
 */
const createFlatRateShippingOptionPriceRecordSchema = z.union([
  z.object({
    currency_code: z.string(),
    amount: z.number(),
  }),
  z.object({
    region_id: z.string(),
    amount: z.number(),
  }),
])

/**
 * Schema for base shipping option input
 */
const createShippingOptionInputBaseSchema = z.object({
  name: z.string(),
  service_zone_id: z.string(),
  shipping_profile_id: z.string(),
  data: z.record(z.unknown()).optional(),
  provider_id: z.string(),
  type: createShippingOptionTypeDTOSchema.optional(),
  type_id: z.string().optional(),
  rules: z.array(shippingOptionRuleSchema).optional(),
})

/**
 * Schema for flat rate shipping option
 */
const createFlatRateShippingOptionInputSchema =
  createShippingOptionInputBaseSchema.extend({
    price_type: z.literal("flat"),
    prices: z.array(createFlatRateShippingOptionPriceRecordSchema),
  })

/**
 * Schema for calculated shipping option
 */
const createCalculatedShippingOptionInputSchema =
  createShippingOptionInputBaseSchema.extend({
    price_type: z.literal("calculated"),
  })

/**
 * Schema for CreateShippingOptionsWorkflowInput item
 */
const createShippingOptionsWorkflowInputItemSchema = z.union([
  createFlatRateShippingOptionInputSchema,
  createCalculatedShippingOptionInputSchema,
])

/**
 * Schema for ShippingOptionDTO
 */
const shippingOptionDTOSchema = z.object({
  id: z.string(),
  name: z.string(),
  service_zone_id: z.string(),
  shipping_profile_id: z.string().nullable().optional(),
  provider_id: z.string().nullable().optional(),
  data: z.record(z.unknown()).nullable().optional(),
  metadata: z.record(z.unknown()).nullable().optional(),
  type: z.any().optional(),
  rules: z.array(z.any()).optional(),
  fulfillments: z.array(z.any()).optional(),
  created_at: z.union([z.string(), z.date()]).optional(),
  updated_at: z.union([z.string(), z.date()]).optional(),
  deleted_at: z.union([z.string(), z.date()]).nullable().optional(),
})

/**
 * Schema for CreateShippingOptionsWorkflowInput
 */
export const createShippingOptionsWorkflowInputSchema = z.array(
  createShippingOptionsWorkflowInputItemSchema
)

/**
 * Schema for CreateShippingOptionsWorkflowOutput
 */
export const createShippingOptionsWorkflowOutputSchema = z.array(
  shippingOptionDTOSchema
)

/**
 * Schema for RuleOperatorType
 */
export const ruleOperatorTypeSchema = z.enum([
  "in",
  "eq",
  "ne",
  "gt",
  "gte",
  "lt",
  "lte",
  "nin",
])

/**
 * Schema for CreateShippingOptionRuleDTO
 */
export const createShippingOptionRuleDTOSchema = z.object({
  /**
   * The attribute of the shipping option rule.
   */
  attribute: z.string(),
  /**
   * The operator of the shipping option rule.
   */
  operator: ruleOperatorTypeSchema,
  /**
   * The value(s) of the shipping option rule.
   */
  value: z.union([z.string(), z.array(z.string())]),
  /**
   * The associated shipping option's ID.
   */
  shipping_option_id: z.string(),
})

/**
 * Schema for UpdateShippingOptionRuleDTO
 */
export const updateShippingOptionRuleDTOSchema = z.object({
  /**
   * The ID of the shipping option rule.
   */
  id: z.string(),
  /**
   * The attribute of the shipping option rule.
   */
  attribute: z.string().optional(),
  /**
   * The operator of the shipping option rule.
   */
  operator: ruleOperatorTypeSchema.optional(),
  /**
   * The value(s) of the shipping option rule.
   */
  value: z.union([z.string(), z.array(z.string())]).optional(),
  /**
   * The associated shipping option's ID.
   */
  shipping_option_id: z.string().optional(),
})

/**
 * Schema for ShippingOptionRuleDTO
 */
export const shippingOptionRuleDTOSchema = z.object({
  /**
   * The ID of the shipping option rule.
   */
  id: z.string(),
  /**
   * The attribute of the shipping option rule.
   */
  attribute: z.string(),
  /**
   * The operator of the shipping option rule.
   */
  operator: z.string(),
  /**
   * The values of the shipping option rule.
   */
  value: z
    .object({
      /**
       * The values of the shipping option rule.
       */
      value: z.union([z.string(), z.array(z.string())]),
    })
    .nullable(),
  /**
   * The associated shipping option's ID.
   */
  shipping_option_id: z.string(),
  /**
   * The associated shipping option.
   */
  shipping_option: z.any(),
  /**
   * The date the shipping option rule was created.
   */
  created_at: z.date(),
  /**
   * The date the shipping option rule was updated.
   */
  updated_at: z.date(),
  /**
   * The date the shipping option rule was deleted.
   */
  deleted_at: z.date().nullable(),
})

/**
 * Schema for BatchShippingOptionRulesWorkflowInput
 */
export const batchShippingOptionRulesWorkflowInputSchema = z.object({
  /**
   * The shipping option rules to create.
   */
  create: z.array(createShippingOptionRuleDTOSchema).optional(),
  /**
   * The shipping option rules to update.
   */
  update: z.array(updateShippingOptionRuleDTOSchema).optional(),
  /**
   * The IDs of the shipping option rules to delete.
   */
  delete: z.array(z.string()).optional(),
})

/**
 * Schema for BatchShippingOptionRulesWorkflowOutput
 */
export const batchShippingOptionRulesWorkflowOutputSchema = z.object({
  created: z.array(shippingOptionRuleDTOSchema),
  updated: z.array(shippingOptionRuleDTOSchema),
  deleted: z.array(z.string()),
})

/**
 * Schema for CancelFulfillmentWorkflowInput
 */
export const cancelFulfillmentWorkflowInputSchema = z.object({
  /**
   * The ID of the fulfillment to cancel.
   */
  id: z.string(),
})

/**
 * Schema for CancelFulfillmentWorkflowOutput
 */
export const cancelFulfillmentWorkflowOutputSchema = z.void()

/**
 * Schema for CreateFulfillmentAddressWorkflowDTO
 */
const createFulfillmentAddressWorkflowDTOSchema = z.object({
  company: z.string().nullable().optional(),
  first_name: z.string().nullable().optional(),
  last_name: z.string().nullable().optional(),
  address_1: z.string().nullable().optional(),
  address_2: z.string().nullable().optional(),
  city: z.string().nullable().optional(),
  country_code: z.string().nullable().optional(),
  province: z.string().nullable().optional(),
  postal_code: z.string().nullable().optional(),
  phone: z.string().nullable().optional(),
  metadata: z.record(z.unknown()).nullable().optional(),
})

/**
 * Schema for CreateFulfillmentItemWorkflowDTO
 */
const createFulfillmentItemWorkflowDTOSchema = z.object({
  title: z.string(),
  sku: z.string(),
  quantity: z.number(),
  barcode: z.string(),
  line_item_id: z.string().nullable().optional(),
  inventory_item_id: z.string().nullable().optional(),
})

/**
 * Schema for CreateFulfillmentLabelWorkflowDTO
 */
const createFulfillmentLabelWorkflowDTOSchema = z.object({
  tracking_number: z.string(),
  tracking_url: z.string(),
  label_url: z.string(),
})

/**
 * Schema for CreateFulfillmentOrderWorkflowDTO
 */
const createFulfillmentOrderWorkflowDTOSchema = z.record(z.any())

/**
 * Schema for CreateFulfillmentWorkflowInput
 */
export const createFulfillmentWorkflowInputSchema = z.object({
  location_id: z.string(),
  packed_at: z.date().nullable().optional(),
  shipped_at: z.date().nullable().optional(),
  created_by: z.string().nullable().optional(),
  delivered_at: z.date().nullable().optional(),
  canceled_at: z.date().nullable().optional(),
  data: z.record(z.unknown()).nullable().optional(),
  provider_id: z.string(),
  shipping_option_id: z.string().nullable().optional(),
  metadata: z.record(z.unknown()).nullable().optional(),
  delivery_address: createFulfillmentAddressWorkflowDTOSchema,
  items: z.array(createFulfillmentItemWorkflowDTOSchema),
  labels: z.array(createFulfillmentLabelWorkflowDTOSchema).optional(),
  order: createFulfillmentOrderWorkflowDTOSchema.optional(),
})

/**
 * Schema for FulfillmentDTO - simplified version focusing on main fields
 */
export const fulfillmentDTOSchema = z.object({
  id: z.string(),
  location_id: z.string(),
  packed_at: z.date().nullable(),
  shipped_at: z.date().nullable(),
  delivered_at: z.date().nullable(),
  canceled_at: z.date().nullable(),
  marked_shipped_by: z.string().nullable().optional(),
  created_by: z.string().nullable().optional(),
  data: z.record(z.unknown()).nullable(),
  provider_id: z.string(),
  shipping_option_id: z.string().nullable(),
  metadata: z.record(z.unknown()).nullable(),
  shipping_option: z.any().nullable(),
  requires_shipping: z.boolean(),
  provider: z.any(),
  delivery_address: z.any(),
  items: z.array(z.any()).optional(),
  labels: z.array(z.any()).optional(),
  created_at: z.date(),
  updated_at: z.date(),
  deleted_at: z.date().nullable(),
})

/**
 * Schema for CreateFulfillmentWorkflowOutput
 */
export const createFulfillmentWorkflowOutputSchema = fulfillmentDTOSchema

// Type exports for workflow input/output types
export type CreateShippingProfilesWorkflowInput = z.infer<
  typeof createShippingProfilesWorkflowInputSchema
>
export type CreateShippingProfilesWorkflowOutput = z.infer<
  typeof createShippingProfilesWorkflowOutputSchema
>
export type CreateServiceZonesWorkflowInput = z.infer<
  typeof createServiceZonesWorkflowInputSchema
>
export type CreateServiceZonesWorkflowOutput = z.infer<
  typeof createServiceZonesWorkflowOutputSchema
>
export type CreateShippingOptionsWorkflowInput = z.infer<
  typeof createShippingOptionsWorkflowInputSchema
>
export type CreateShippingOptionsWorkflowOutput = z.infer<
  typeof createShippingOptionsWorkflowOutputSchema
>
export type BatchShippingOptionRulesWorkflowInput = z.infer<
  typeof batchShippingOptionRulesWorkflowInputSchema
>
export type BatchShippingOptionRulesWorkflowOutput = z.infer<
  typeof batchShippingOptionRulesWorkflowOutputSchema
>
export type CancelFulfillmentWorkflowInput = z.infer<
  typeof cancelFulfillmentWorkflowInputSchema
>
export type CancelFulfillmentWorkflowOutput = z.infer<
  typeof cancelFulfillmentWorkflowOutputSchema
>
export type CreateFulfillmentWorkflowInput = z.infer<
  typeof createFulfillmentWorkflowInputSchema
>
export type CreateFulfillmentWorkflowOutput = z.infer<
  typeof createFulfillmentWorkflowOutputSchema
>

/**
 * Schema for CreateShipmentWorkflowInput
 */
export const createShipmentWorkflowInputSchema = z.object({
  /**
   * The ID of the fulfillment
   */
  id: z.string(),

  /**
   * The labels associated with the fulfillment.
   */
  labels: z.array(createFulfillmentLabelWorkflowDTOSchema),

  /**
   * The id of the user that marked fulfillment as shipped
   */
  marked_shipped_by: z.string().nullable().optional(),
})

/**
 * Schema for CreateShipmentWorkflowOutput - returns fulfillment
 */
export const createShipmentWorkflowOutputSchema = fulfillmentDTOSchema

export type CreateShipmentWorkflowInput = z.infer<
  typeof createShipmentWorkflowInputSchema
>
export type CreateShipmentWorkflowOutput = z.infer<
  typeof createShipmentWorkflowOutputSchema
>

/**
 * Schema for DeleteFulfillmentSetsWorkflowInput
 */
export const deleteFulfillmentSetsWorkflowInputSchema = z.object({
  /**
   * The IDs of the fulfillment sets to delete.
   */
  ids: z.array(z.string()),
})

/**
 * Schema for DeleteFulfillmentSetsWorkflowOutput
 */
export const deleteFulfillmentSetsWorkflowOutputSchema = z.void()

export type DeleteFulfillmentSetsWorkflowInput = z.infer<
  typeof deleteFulfillmentSetsWorkflowInputSchema
>
export type DeleteFulfillmentSetsWorkflowOutput = z.infer<
  typeof deleteFulfillmentSetsWorkflowOutputSchema
>

/**
 * Schema for DeleteServiceZonesWorkflowInput
 */
export const deleteServiceZonesWorkflowInputSchema = z.object({
  /**
   * The IDs of the service zones to delete.
   */
  ids: z.array(z.string()),
})

/**
 * Schema for DeleteServiceZonesWorkflowOutput
 */
export const deleteServiceZonesWorkflowOutputSchema = z.void()

export type DeleteServiceZonesWorkflowInput = z.infer<
  typeof deleteServiceZonesWorkflowInputSchema
>
export type DeleteServiceZonesWorkflowOutput = z.infer<
  typeof deleteServiceZonesWorkflowOutputSchema
>

/**
 * Schema for DeleteShippingOptionsWorkflowInput
 */
export const deleteShippingOptionsWorkflowInputSchema = z.object({
  /**
   * The IDs of the shipping options to delete.
   */
  ids: z.array(z.string()),
})

/**
 * Schema for DeleteShippingOptionsWorkflowOutput
 */
export const deleteShippingOptionsWorkflowOutputSchema = z.void()

export type DeleteShippingOptionsWorkflowInput = z.infer<
  typeof deleteShippingOptionsWorkflowInputSchema
>
export type DeleteShippingOptionsWorkflowOutput = z.infer<
  typeof deleteShippingOptionsWorkflowOutputSchema
>

/**
 * Schema for MarkFulfillmentAsDeliveredInput
 */
export const markFulfillmentAsDeliveredInputSchema = z.object({
  /**
   * The fulfillment's ID.
   */
  id: z.string(),
})

/**
 * Schema for MarkFulfillmentAsDeliveredOutput - returns fulfillment
 */
export const markFulfillmentAsDeliveredOutputSchema = fulfillmentDTOSchema

export type MarkFulfillmentAsDeliveredInput = z.infer<
  typeof markFulfillmentAsDeliveredInputSchema
>
export type MarkFulfillmentAsDeliveredOutput = z.infer<
  typeof markFulfillmentAsDeliveredOutputSchema
>

/**
 * Schema for UpdateFulfillmentWorkflowInput
 */
export const updateFulfillmentWorkflowInputSchema = z.object({
  /**
   * The ID of the fulfillment
   */
  id: z.string(),

  /**
   * The associated location's ID.
   */
  location_id: z.string().optional(),

  /**
   * The date the fulfillment was packed.
   */
  packed_at: z.date().nullable().optional(),

  /**
   * The date the fulfillment was shipped.
   */
  shipped_at: z.date().nullable().optional(),

  /**
   * The id of the user that marked fulfillment as shipped
   */
  marked_shipped_by: z.string().nullable().optional(),

  /**
   * The id of the user that created the fulfillment
   */
  created_by: z.string().nullable().optional(),

  /**
   * The date the fulfillment was delivered.
   */
  delivered_at: z.date().nullable().optional(),

  /**
   * The data necessary for the associated fulfillment provider to process the fulfillment.
   */
  data: z.record(z.unknown()).nullable().optional(),

  /**
   * Holds custom data in key-value pairs.
   */
  metadata: z.record(z.unknown()).nullable().optional(),
})

/**
 * Schema for UpdateFulfillmentWorkflowOutput - returns fulfillment
 */
export const updateFulfillmentWorkflowOutputSchema = fulfillmentDTOSchema

export type UpdateFulfillmentWorkflowInput = z.infer<
  typeof updateFulfillmentWorkflowInputSchema
>
export type UpdateFulfillmentWorkflowOutput = z.infer<
  typeof updateFulfillmentWorkflowOutputSchema
>

/**
 * Schema for FilterableServiceZoneProps
 */
const filterableServiceZonePropsSchema = z.object({
  id: z.union([z.string(), z.array(z.string()), z.record(z.any())]).optional(),
  name: z
    .union([z.string(), z.array(z.string()), z.record(z.any())])
    .optional(),
  geo_zones: z.any().optional(),
  fulfillment_set: z.any().optional(),
  shipping_options: z.any().optional(),
})

/**
 * Schema for UpdateServiceZone
 */
const updateServiceZoneSchema = z.object({
  name: z.string().nullable().optional(),
  geo_zones: z
    .array(
      z.union([
        z.object({
          type: z.literal("country"),
          country_code: z.string(),
          metadata: z.record(z.unknown()).nullable().optional(),
        }),
        z.object({
          type: z.literal("province"),
          country_code: z.string(),
          province_code: z.string(),
          metadata: z.record(z.unknown()).nullable().optional(),
        }),
        z.object({
          type: z.literal("city"),
          country_code: z.string(),
          province_code: z.string(),
          city: z.string(),
          metadata: z.record(z.unknown()).nullable().optional(),
        }),
        z.object({
          type: z.literal("zip"),
          country_code: z.string(),
          province_code: z.string(),
          city: z.string(),
          postal_expression: z.record(z.any()),
          metadata: z.record(z.unknown()).nullable().optional(),
        }),
        z.object({ id: z.string() }),
      ])
    )
    .optional(),
})

/**
 * Schema for UpdateServiceZonesWorkflowInput
 */
export const updateServiceZonesWorkflowInputSchema = z.object({
  selector: filterableServiceZonePropsSchema,
  update: updateServiceZoneSchema,
})

/**
 * Schema for UpdateServiceZonesWorkflowOutput
 */
export const updateServiceZonesWorkflowOutputSchema =
  z.array(serviceZoneDTOSchema)

export type UpdateServiceZonesWorkflowInput = z.infer<
  typeof updateServiceZonesWorkflowInputSchema
>
export type UpdateServiceZonesWorkflowOutput = z.infer<
  typeof updateServiceZonesWorkflowOutputSchema
>

/**
 * Schema for UpdateShippingOptionPriceRecord
 */
const updateShippingOptionPriceRecordSchema = z.union([
  z.object({
    id: z.string().optional(),
    currency_code: z.string().optional(),
    amount: z.number().optional(),
    rules: z.array(z.any()).optional(),
  }),
  z.object({
    id: z.string().optional(),
    region_id: z.string().optional(),
    amount: z.number().optional(),
    rules: z.array(z.any()).optional(),
  }),
])

/**
 * Schema for base shipping option update input
 */
const updateFlatShippingOptionInputBaseSchema = z.object({
  id: z.string(),
  name: z.string().optional(),
  service_zone_id: z.string().optional(),
  shipping_profile_id: z.string().optional(),
  data: z.record(z.unknown()).optional(),
  provider_id: z.string().optional(),
  type: z
    .object({
      label: z.string(),
      description: z.string().optional(),
      code: z.string(),
    })
    .optional(),
  type_id: z.string().optional(),
  rules: z
    .array(
      z.object({
        attribute: z.string(),
        operator: ruleOperatorTypeSchema,
        value: z.union([z.string(), z.array(z.string())]),
      })
    )
    .optional(),
})

/**
 * Schema for UpdateCalculatedShippingOptionInput
 */
const updateCalculatedShippingOptionInputSchema =
  updateFlatShippingOptionInputBaseSchema.extend({
    price_type: z.literal("calculated").optional(),
  })

/**
 * Schema for UpdateFlatRateShippingOptionInput
 */
const updateFlatRateShippingOptionInputSchema =
  updateFlatShippingOptionInputBaseSchema.extend({
    price_type: z.literal("flat").optional(),
    prices: z.array(updateShippingOptionPriceRecordSchema).optional(),
  })

/**
 * Schema for UpdateShippingOptionsWorkflowInput (array of items)
 */
export const updateShippingOptionsWorkflowInputSchema = z.array(
  z.union([
    updateFlatRateShippingOptionInputSchema,
    updateCalculatedShippingOptionInputSchema,
  ])
)

/**
 * Schema for UpdateShippingOptionsWorkflowOutput
 */
export const updateShippingOptionsWorkflowOutputSchema = z.array(
  z.object({
    id: z.string(),
  })
)

export type UpdateShippingOptionsWorkflowInput = z.infer<
  typeof updateShippingOptionsWorkflowInputSchema
>
export type UpdateShippingOptionsWorkflowOutput = z.infer<
  typeof updateShippingOptionsWorkflowOutputSchema
>

/**
 * Schema for FilterableShippingProfileProps
 */
const filterableShippingProfilePropsSchema = z.object({
  id: z.union([z.string(), z.array(z.string()), z.record(z.any())]).optional(),
  name: z
    .union([z.string(), z.array(z.string()), z.record(z.any())])
    .optional(),
  type: z
    .union([z.string(), z.array(z.string()), z.record(z.any())])
    .optional(),
  shipping_options: z.any().optional(),
})

/**
 * Schema for UpdateShippingProfile
 */
const updateShippingProfileSchema = z.object({
  name: z.string().optional(),
  type: z.string().optional(),
})

/**
 * Schema for UpdateShippingProfilesWorkflowInput
 */
export const updateShippingProfilesWorkflowInputSchema = z.object({
  selector: filterableShippingProfilePropsSchema,
  update: updateShippingProfileSchema,
})

/**
 * Schema for UpdateShippingProfilesWorkflowOutput
 */
export const updateShippingProfilesWorkflowOutputSchema =
  createShippingProfilesWorkflowOutputSchema

export type UpdateShippingProfilesWorkflowInput = z.infer<
  typeof updateShippingProfilesWorkflowInputSchema
>
export type UpdateShippingProfilesWorkflowOutput = z.infer<
  typeof updateShippingProfilesWorkflowOutputSchema
>

/**
 * Schema for CalculatedShippingOptionPrice
 */
const calculatedShippingOptionPriceSchema = z.object({
  calculated_amount: z.number(),
  is_calculated_price_tax_inclusive: z.boolean(),
})

/**
 * Schema for CalculateShippingOptionsPricesWorkflowInput
 */
export const calculateShippingOptionsPricesWorkflowInputSchema = z.object({
  cart_id: z.string(),
  shipping_options: z.array(
    z.object({
      id: z.string(),
      data: z.record(z.unknown()).optional(),
    })
  ),
})

/**
 * Schema for CalculateShippingOptionsPricesWorkflowOutput
 */
export const calculateShippingOptionsPricesWorkflowOutputSchema = z.array(
  calculatedShippingOptionPriceSchema
)

export type CalculateShippingOptionsPricesWorkflowInput = z.infer<
  typeof calculateShippingOptionsPricesWorkflowInputSchema
>
export type CalculateShippingOptionsPricesWorkflowOutput = z.infer<
  typeof calculateShippingOptionsPricesWorkflowOutputSchema
>
