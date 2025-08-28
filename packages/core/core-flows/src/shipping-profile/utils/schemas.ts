import { z } from "zod"

/**
 * Schema for DeleteShippingProfilesWorkflowInput
 */
export const deleteShippingProfilesWorkflowInputSchema = z.object({
  ids: z.array(z.string()),
})

/**
 * Schema for DeleteShippingProfilesWorkflowOutput
 */
export const deleteShippingProfilesWorkflowOutputSchema = z.void()

export type DeleteShippingProfilesWorkflowInput = z.infer<
  typeof deleteShippingProfilesWorkflowInputSchema
>
export type DeleteShippingProfilesWorkflowOutput = z.infer<
  typeof deleteShippingProfilesWorkflowOutputSchema
>