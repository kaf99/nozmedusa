import { z } from "zod"
import { bigNumberInputSchema } from "../../common/utils/schemas"

/**
 * Schema for CreateReservationInput
 */
const createReservationInputSchema = z.object({
  inventory_item_id: z.string(),
  location_id: z.string(),
  quantity: bigNumberInputSchema,
  allow_backorder: z.boolean().optional(),
  external_id: z.string().nullable().optional(),
  description: z.string().nullable().optional(),
  created_by: z.string().nullable().optional(),
  metadata: z.record(z.unknown()).nullable().optional(),
})

/**
 * Schema for ReservationDTO
 */
const reservationDTOSchema = z.object({
  id: z.string(),
  inventory_item_id: z.string(),
  location_id: z.string(),
  quantity: bigNumberInputSchema,
  external_id: z.string().nullable().optional(),
  description: z.string().nullable().optional(),
  created_by: z.string().nullable().optional(),
  metadata: z.record(z.unknown()).nullable().optional(),
  created_at: z.union([z.string(), z.date()]),
  updated_at: z.union([z.string(), z.date()]),
  deleted_at: z.union([z.string(), z.date()]).nullable().optional(),
})

/**
 * Schema for CreateReservationsWorkflowInput
 */
export const createReservationsWorkflowInputSchema = z.object({
  reservations: z.array(createReservationInputSchema),
})

/**
 * Schema for CreateReservationsWorkflowOutput
 */
export const createReservationsWorkflowOutputSchema = z.array(reservationDTOSchema)

export type CreateReservationsWorkflowInput = z.infer<
  typeof createReservationsWorkflowInputSchema
>
export type CreateReservationsWorkflowOutput = z.infer<
  typeof createReservationsWorkflowOutputSchema
>

/**
 * Schema for DeleteReservationsWorkflowInput
 */
export const deleteReservationsWorkflowInputSchema = z.object({
  ids: z.array(z.string()),
})

/**
 * Schema for DeleteReservationsWorkflowOutput
 */
export const deleteReservationsWorkflowOutputSchema = z.void()

export type DeleteReservationsWorkflowInput = z.infer<
  typeof deleteReservationsWorkflowInputSchema
>
export type DeleteReservationsWorkflowOutput = z.infer<
  typeof deleteReservationsWorkflowOutputSchema
>

/**
 * Schema for DeleteReservationsByLineItemsWorkflowInput
 */
export const deleteReservationsByLineItemsWorkflowInputSchema = z.object({
  ids: z.array(z.string()),
})

/**
 * Schema for DeleteReservationsByLineItemsWorkflowOutput
 */
export const deleteReservationsByLineItemsWorkflowOutputSchema = z.void()

export type DeleteReservationsByLineItemsWorkflowInput = z.infer<
  typeof deleteReservationsByLineItemsWorkflowInputSchema
>
export type DeleteReservationsByLineItemsWorkflowOutput = z.infer<
  typeof deleteReservationsByLineItemsWorkflowOutputSchema
>

/**
 * Schema for UpdateReservationInput
 */
const updateReservationInputSchema = z.object({
  id: z.string(),
  quantity: bigNumberInputSchema.optional(),
  location_id: z.string().optional(),
  allow_backorder: z.boolean().optional(),
  external_id: z.string().nullable().optional(),
  description: z.string().nullable().optional(),
  metadata: z.record(z.unknown()).nullable().optional(),
})

/**
 * Schema for UpdateReservationsWorkflowInput
 */
export const updateReservationsWorkflowInputSchema = z.object({
  updates: z.array(updateReservationInputSchema),
})

/**
 * Schema for UpdateReservationsWorkflowOutput
 */
export const updateReservationsWorkflowOutputSchema = z.array(reservationDTOSchema)

export type UpdateReservationsWorkflowInput = z.infer<
  typeof updateReservationsWorkflowInputSchema
>
export type UpdateReservationsWorkflowOutput = z.infer<
  typeof updateReservationsWorkflowOutputSchema
>