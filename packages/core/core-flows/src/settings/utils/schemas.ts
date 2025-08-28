import { z } from "zod"

/**
 * Schema for view configuration object
 */
const viewConfigurationConfigSchema = z.object({
  visible_columns: z.array(z.string()),
  column_order: z.array(z.string()),
  column_widths: z.record(z.number()).optional(),
  filters: z.record(z.any()).optional(),
  sorting: z
    .object({
      id: z.string(),
      desc: z.boolean(),
    })
    .nullable()
    .optional(),
  search: z.string().optional(),
})

/**
 * Schema for CreateViewConfigurationDTO
 */
const createViewConfigurationDTOSchema = z.object({
  entity: z.string(),
  name: z.string().nullable().optional(),
  user_id: z.string().nullable().optional(),
  is_system_default: z.boolean().optional(),
  configuration: viewConfigurationConfigSchema,
})

/**
 * Schema for UpdateViewConfigurationDTO
 */
const updateViewConfigurationDTOSchema = z.object({
  name: z.string().nullable().optional(),
  configuration: z
    .object({
      visible_columns: z.array(z.string()).optional(),
      column_order: z.array(z.string()).optional(),
      column_widths: z.record(z.number()).optional(),
      filters: z.record(z.any()).optional(),
      sorting: z
        .object({
          id: z.string(),
          desc: z.boolean(),
        })
        .nullable()
        .optional(),
      search: z.string().optional(),
    })
    .optional(),
})

/**
 * Schema for ViewConfigurationDTO
 */
const viewConfigurationDTOSchema = z.object({
  id: z.string(),
  entity: z.string(),
  name: z.string().nullable(),
  user_id: z.string().nullable(),
  is_system_default: z.boolean(),
  configuration: viewConfigurationConfigSchema,
  created_at: z.date(),
  updated_at: z.date(),
})

/**
 * Schema for CreateViewConfigurationWorkflowInput
 */
export const createViewConfigurationWorkflowInputSchema =
  createViewConfigurationDTOSchema.extend({
    set_active: z.boolean().optional(),
  })

/**
 * Schema for CreateViewConfigurationWorkflowOutput
 */
export const createViewConfigurationWorkflowOutputSchema =
  viewConfigurationDTOSchema

export type CreateViewConfigurationWorkflowInput = z.infer<
  typeof createViewConfigurationWorkflowInputSchema
>
export type CreateViewConfigurationWorkflowOutput = z.infer<
  typeof createViewConfigurationWorkflowOutputSchema
>

/**
 * Schema for UpdateViewConfigurationWorkflowInput
 */
export const updateViewConfigurationWorkflowInputSchema = z
  .object({
    id: z.string(),
    set_active: z.boolean().optional(),
  })
  .merge(updateViewConfigurationDTOSchema)

/**
 * Schema for UpdateViewConfigurationWorkflowOutput
 */
export const updateViewConfigurationWorkflowOutputSchema =
  viewConfigurationDTOSchema

export type UpdateViewConfigurationWorkflowInput = z.infer<
  typeof updateViewConfigurationWorkflowInputSchema
>
export type UpdateViewConfigurationWorkflowOutput = z.infer<
  typeof updateViewConfigurationWorkflowOutputSchema
>
