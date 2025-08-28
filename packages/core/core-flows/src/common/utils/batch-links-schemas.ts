import { z } from "zod"

/**
 * Schema for LinkDefinition
 */
export const linkDefinitionSchema = z
  .object({
    data: z.record(z.unknown()).optional(),
  })
  .catchall(z.record(z.any())) // Allow any module names with any field names

/**
 * Schema for BatchLinksWorkflowInput
 */
export const batchLinksWorkflowInputSchema = z.object({
  /**
   * Links to create.
   */
  create: z.array(linkDefinitionSchema).optional(),
  /**
   * Links to update.
   */
  update: z.array(linkDefinitionSchema).optional(),
  /**
   * Links to delete.
   */
  delete: z.array(linkDefinitionSchema).optional(),
})

/**
 * Schema for BatchLinksWorkflowOutput
 */
export const batchLinksWorkflowOutputSchema = z.object({
  created: z.array(z.any()),
  updated: z.array(z.any()),
  deleted: z.array(z.any()),
})

/**
 * Schema for CreateLinksWorkflowInput
 */
export const createLinksWorkflowInputSchema = z.array(linkDefinitionSchema)

/**
 * Schema for CreateLinksWorkflowOutput
 */
export const createLinksWorkflowOutputSchema = z.array(z.any())

/**
 * Schema for DismissLinksWorkflowInput
 */
export const dismissLinksWorkflowInputSchema = z.array(linkDefinitionSchema)

/**
 * Schema for DismissLinksWorkflowOutput
 */
export const dismissLinksWorkflowOutputSchema = z.array(linkDefinitionSchema)

/**
 * Schema for UpdateLinksWorkflowInput
 */
export const updateLinksWorkflowInputSchema = z.array(linkDefinitionSchema)

/**
 * Schema for UpdateLinksWorkflowOutput
 */
export const updateLinksWorkflowOutputSchema = z.array(z.any())

// Type exports for workflow input/output types
export type BatchLinksWorkflowInput = z.infer<
  typeof batchLinksWorkflowInputSchema
>
export type BatchLinksWorkflowOutput = z.infer<
  typeof batchLinksWorkflowOutputSchema
>
export type CreateLinksWorkflowInput = z.infer<
  typeof createLinksWorkflowInputSchema
>
export type CreateLinksWorkflowOutput = z.infer<
  typeof createLinksWorkflowOutputSchema
>
export type DismissLinksWorkflowInput = z.infer<
  typeof dismissLinksWorkflowInputSchema
>
export type DismissLinksWorkflowOutput = z.infer<
  typeof dismissLinksWorkflowOutputSchema
>
export type UpdateLinksWorkflowInput = z.infer<
  typeof updateLinksWorkflowInputSchema
>
export type UpdateLinksWorkflowOutput = z.infer<
  typeof updateLinksWorkflowOutputSchema
>
