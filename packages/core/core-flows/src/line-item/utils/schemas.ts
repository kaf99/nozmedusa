import { z } from "zod"

/**
 * Schema for DeleteLineItemsWorkflowInput
 */
export const deleteLineItemsWorkflowInputSchema = z.object({
  cart_id: z.string(),
  ids: z.array(z.string()),
})

/**
 * Schema for DeleteLineItemsWorkflowOutput
 */
export const deleteLineItemsWorkflowOutputSchema = z.void()