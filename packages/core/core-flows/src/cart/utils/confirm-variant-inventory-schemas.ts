import { z } from "zod"
import { bigNumberInputSchema } from "../../common/utils/schemas"

/**
 * Schema for variant inventory items
 */
const inventoryItemSchema = z.object({
  inventory_item_id: z.string(),
  variant_id: z.string(),
  required_quantity: z.number(),
  inventory: z.array(
    z.object({
      location_levels: z.object({
        stock_locations: z.array(
          z.object({
            id: z.string(),
            sales_channels: z.array(
              z.object({
                id: z.string(),
              })
            ),
          })
        ),
      }),
    })
  ),
})

/**
 * Schema for variant
 */
const variantSchema = z.object({
  id: z.string(),
  manage_inventory: z.boolean(),
  inventory_items: z.array(inventoryItemSchema),
})

/**
 * Schema for item
 */
const itemSchema = z.object({
  id: z.string().optional(),
  variant_id: z.string().nullable().optional(),
  quantity: bigNumberInputSchema,
})

/**
 * Schema for item update
 */
const itemUpdateSchema = z.union([
  z.array(
    z.object({
      data: z.object({
        variant_id: z.string().optional(),
        quantity: bigNumberInputSchema.optional(),
      }),
    })
  ),
  z.array(
    z.object({
      variant_id: z.string().optional(),
      quantity: bigNumberInputSchema.optional(),
    })
  ),
])

/**
 * Schema for ConfirmVariantInventoryWorkflowInput
 */
export const confirmVariantInventoryWorkflowInputSchema = z.object({
  sales_channel_id: z.string(),
  variants: z.array(variantSchema),
  items: z.array(itemSchema),
  itemsToUpdate: itemUpdateSchema.optional(),
})

/**
 * Schema for inventory output item
 */
const inventoryOutputItemSchema = z.object({
  id: z.string().optional(),
  inventory_item_id: z.string(),
  required_quantity: z.number(),
  allow_backorder: z.boolean(),
  quantity: bigNumberInputSchema,
  location_ids: z.array(z.string()),
})

/**
 * Schema for ConfirmVariantInventoryWorkflowOutput
 */
export const confirmVariantInventoryWorkflowOutputSchema = z.object({
  items: z.array(inventoryOutputItemSchema),
})

// Export types for backward compatibility
export type ConfirmVariantInventoryWorkflowInput = z.infer<
  typeof confirmVariantInventoryWorkflowInputSchema
>
export type ConfirmVariantInventoryWorkflowOutput = z.infer<
  typeof confirmVariantInventoryWorkflowOutputSchema
>
