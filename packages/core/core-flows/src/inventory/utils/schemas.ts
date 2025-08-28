import { z } from "zod"

/**
 * Schema for CreateInventoryLevelInput
 */
const createInventoryLevelInputSchema = z.object({
  inventory_item_id: z.string(),
  location_id: z.string(),
  stocked_quantity: z.number().optional(),
  incoming_quantity: z.number().optional(),
  metadata: z.record(z.unknown()).optional(),
})

/**
 * Schema for LocationLevelWithoutInventory
 */
const locationLevelWithoutInventorySchema =
  createInventoryLevelInputSchema.omit({
    inventory_item_id: true,
  })

/**
 * Schema for CreateInventoryItemInput
 */
const createInventoryItemInputSchema = z.object({
  sku: z.string().nullable().optional(),
  origin_country: z.string().nullable().optional(),
  mid_code: z.string().nullable().optional(),
  material: z.string().nullable().optional(),
  weight: z.number().nullable().optional(),
  length: z.number().nullable().optional(),
  height: z.number().nullable().optional(),
  width: z.number().nullable().optional(),
  hs_code: z.string().nullable().optional(),
  requires_shipping: z.boolean().optional(),
  title: z.string().nullable().optional(),
  description: z.string().nullable().optional(),
  thumbnail: z.string().nullable().optional(),
  metadata: z.record(z.unknown()).nullable().optional(),
})

/**
 * Schema for CreateInventoryItemInput with location levels
 */
const createInventoryItemWithLevelsInputSchema =
  createInventoryItemInputSchema.extend({
    location_levels: z.array(locationLevelWithoutInventorySchema).optional(),
  })

/**
 * Schema for InventoryItemDTO
 */
const inventoryItemDTOSchema = z.object({
  id: z.string(),
  sku: z.string().nullable().optional(),
  origin_country: z.string().nullable().optional(),
  hs_code: z.string().nullable().optional(),
  requires_shipping: z.boolean(),
  mid_code: z.string().nullable().optional(),
  material: z.string().nullable().optional(),
  weight: z.number().nullable().optional(),
  length: z.number().nullable().optional(),
  height: z.number().nullable().optional(),
  width: z.number().nullable().optional(),
  title: z.string().nullable().optional(),
  description: z.string().nullable().optional(),
  thumbnail: z.string().nullable().optional(),
  metadata: z.record(z.any()).nullable().optional(),
  location_levels: z.array(z.any()).optional(),
  created_at: z.union([z.string(), z.date()]),
  updated_at: z.union([z.string(), z.date()]),
  deleted_at: z.union([z.string(), z.date()]).nullable(),
})

/**
 * Schema for InventoryLevelDTO
 */
const inventoryLevelDTOSchema = z.object({
  id: z.string(),
  inventory_item_id: z.string(),
  location_id: z.string(),
  stocked_quantity: z.number(),
  reserved_quantity: z.number(),
  incoming_quantity: z.number(),
  metadata: z.record(z.any()).nullable(),
  inventory_item: inventoryItemDTOSchema.optional(),
  available_quantity: z.number(),
  created_at: z.union([z.string(), z.date()]),
  updated_at: z.union([z.string(), z.date()]),
  deleted_at: z.union([z.string(), z.date()]).nullable(),
})

/**
 * Schema for CreateInventoryItemsWorkflowInput
 */
export const createInventoryItemsWorkflowInputSchema = z.object({
  items: z.array(createInventoryItemWithLevelsInputSchema),
})

/**
 * Schema for CreateInventoryItemsWorkflowOutput
 */
export const createInventoryItemsWorkflowOutputSchema = z.array(
  inventoryItemDTOSchema
)

/**
 * Schema for CreateInventoryLevelsWorkflowInput
 */
export const createInventoryLevelsWorkflowInputSchema = z.object({
  inventory_levels: z.array(createInventoryLevelInputSchema),
})

/**
 * Schema for CreateInventoryLevelsWorkflowOutput
 */
export const createInventoryLevelsWorkflowOutputSchema = z.array(
  inventoryLevelDTOSchema
)

/**
 * Schema for UpdateInventoryItemInput
 */
const updateInventoryItemInputSchema = z.object({
  id: z.string(),
  sku: z.string().nullable().optional(),
  origin_country: z.string().nullable().optional(),
  mid_code: z.string().nullable().optional(),
  material: z.string().nullable().optional(),
  weight: z.number().nullable().optional(),
  length: z.number().nullable().optional(),
  height: z.number().nullable().optional(),
  width: z.number().nullable().optional(),
  hs_code: z.string().nullable().optional(),
  requires_shipping: z.boolean().optional(),
  title: z.string().nullable().optional(),
  description: z.string().nullable().optional(),
  thumbnail: z.string().nullable().optional(),
  metadata: z.record(z.unknown()).nullable().optional(),
})

/**
 * Schema for UpdateInventoryItemsWorkflowInput
 */
export const updateInventoryItemsWorkflowInputSchema = z.object({
  updates: z.array(updateInventoryItemInputSchema),
})

/**
 * Schema for UpdateInventoryItemsWorkflowOutput
 */
export const updateInventoryItemsWorkflowOutputSchema = z.array(
  inventoryItemDTOSchema
)

/**
 * Schema for DeleteInventoryItemsWorkflowInput
 */
export const deleteInventoryItemsWorkflowInputSchema = z.array(z.string())

/**
 * Schema for DeleteInventoryItemsWorkflowOutput
 */
export const deleteInventoryItemsWorkflowOutputSchema = z.array(z.string())

/**
 * Schema for UpdateInventoryLevelsWorkflowInput
 */
export const updateInventoryLevelsWorkflowInputSchema = z.object({
  updates: z.array(
    z.object({
      id: z.string().optional(),
      inventory_item_id: z.string(),
      location_id: z.string(),
      stocked_quantity: z.number().optional(),
      incoming_quantity: z.number().optional(),
      metadata: z.record(z.unknown()).optional(),
    })
  ),
})

/**
 * Schema for UpdateInventoryLevelsWorkflowOutput
 */
export const updateInventoryLevelsWorkflowOutputSchema = z.array(
  inventoryLevelDTOSchema
)

/**
 * Schema for FilterableInventoryLevelProps
 */
const baseFilterableInventoryLevelPropsSchema = z.object({
  id: z.union([z.string(), z.array(z.string())]).optional(),
  location_id: z.union([z.string(), z.array(z.string())]).optional(),
  inventory_item_id: z.union([z.string(), z.array(z.string())]).optional(),
})

type FilterableInventoryLevelPropsInput = z.infer<
  typeof baseFilterableInventoryLevelPropsSchema
> & {
  $and?: FilterableInventoryLevelPropsInput[]
  $or?: FilterableInventoryLevelPropsInput[]
}

const filterableInventoryLevelPropsSchema: z.ZodType<FilterableInventoryLevelPropsInput> =
  baseFilterableInventoryLevelPropsSchema.extend({
    $and: z.lazy(() => z.array(filterableInventoryLevelPropsSchema)).optional(),
    $or: z.lazy(() => z.array(filterableInventoryLevelPropsSchema)).optional(),
  })

/**
 * Schema for DeleteInventoryLevelsWorkflowInput
 */
export const deleteInventoryLevelsWorkflowInputSchema = z.intersection(
  filterableInventoryLevelPropsSchema,
  z.object({
    force: z.boolean().optional(),
  })
)

/**
 * Schema for DeleteInventoryLevelsWorkflowOutput
 */
export const deleteInventoryLevelsWorkflowOutputSchema = z.void()

// Type exports for workflow input/output types
export type CreateInventoryItemsWorkflowInput = z.infer<
  typeof createInventoryItemsWorkflowInputSchema
>
export type CreateInventoryItemsWorkflowOutput = z.infer<
  typeof createInventoryItemsWorkflowOutputSchema
>
export type CreateInventoryLevelsWorkflowInput = z.infer<
  typeof createInventoryLevelsWorkflowInputSchema
>
export type CreateInventoryLevelsWorkflowOutput = z.infer<
  typeof createInventoryLevelsWorkflowOutputSchema
>
export type UpdateInventoryItemsWorkflowInput = z.infer<
  typeof updateInventoryItemsWorkflowInputSchema
>
export type UpdateInventoryItemsWorkflowOutput = z.infer<
  typeof updateInventoryItemsWorkflowOutputSchema
>
export type DeleteInventoryItemsWorkflowInput = z.infer<
  typeof deleteInventoryItemsWorkflowInputSchema
>
export type DeleteInventoryItemsWorkflowOutput = z.infer<
  typeof deleteInventoryItemsWorkflowOutputSchema
>
export type UpdateInventoryLevelsWorkflowInput = z.infer<
  typeof updateInventoryLevelsWorkflowInputSchema
>
export type UpdateInventoryLevelsWorkflowOutput = z.infer<
  typeof updateInventoryLevelsWorkflowOutputSchema
>
export type DeleteInventoryLevelsWorkflowInput = z.infer<
  typeof deleteInventoryLevelsWorkflowInputSchema
>
export type DeleteInventoryLevelsWorkflowOutput = z.infer<
  typeof deleteInventoryLevelsWorkflowOutputSchema
>

/**
 * Schema for BatchInventoryItemLevelsWorkflowInput
 */
export const batchInventoryItemLevelsWorkflowInputSchema = z.object({
  create: z.array(createInventoryLevelInputSchema).optional(),
  update: z
    .array(
      z.object({
        id: z.string().optional(),
        inventory_item_id: z.string(),
        location_id: z.string(),
        stocked_quantity: z.number().optional(),
        incoming_quantity: z.number().optional(),
        metadata: z.record(z.unknown()).optional(),
      })
    )
    .optional(),
  delete: z.array(z.string()).optional(),
  force: z.boolean().optional(),
})

/**
 * Schema for BatchInventoryItemLevelsWorkflowOutput
 */
export const batchInventoryItemLevelsWorkflowOutputSchema = z.object({
  created: z.array(inventoryLevelDTOSchema),
  updated: z.array(inventoryLevelDTOSchema),
  deleted: z.array(z.string()),
})

// Type exports
export type BatchInventoryItemLevelsWorkflowInput = z.infer<
  typeof batchInventoryItemLevelsWorkflowInputSchema
>
export type BatchInventoryItemLevelsWorkflowOutput = z.infer<
  typeof batchInventoryItemLevelsWorkflowOutputSchema
>

/**
 * Schema for BulkCreateDeleteLevelsWorkflowInput
 * @deprecated Use batchInventoryItemLevelsWorkflowInputSchema instead
 */
export const bulkCreateDeleteLevelsWorkflowInputSchema = z.object({
  creates: z.array(createInventoryLevelInputSchema),
  deletes: z.array(
    z.object({
      inventory_item_id: z.string(),
      location_id: z.string(),
    })
  ),
})

/**
 * Schema for BulkCreateDeleteLevelsWorkflowOutput
 * @deprecated
 */
export const bulkCreateDeleteLevelsWorkflowOutputSchema = z.array(
  inventoryLevelDTOSchema
)

// Type exports
export type BulkCreateDeleteLevelsWorkflowInput = z.infer<
  typeof bulkCreateDeleteLevelsWorkflowInputSchema
>
export type BulkCreateDeleteLevelsWorkflowOutput = z.infer<
  typeof bulkCreateDeleteLevelsWorkflowOutputSchema
>
