import { z } from "zod"

/**
 * Schema for CreateReturnReasonDTO
 */
const createReturnReasonDTOSchema = z.object({
  value: z.string(),
  label: z.string(),
  parent_return_reason_id: z.string().optional(),
  metadata: z.record(z.unknown()).nullable().optional(),
})

/**
 * Schema for UpdateReturnReasonDTO
 */
const updateReturnReasonDTOSchema = z.object({
  value: z.string().optional(),
  label: z.string().optional(),
  description: z.string().optional(),
  parent_return_reason_id: z.string().optional(),
  metadata: z.record(z.unknown()).nullable().optional(),
})

/**
 * Schema for ReturnReasonDTO
 */
const returnReasonDTOSchema = z.object({
  id: z.string(),
  value: z.string(),
  label: z.string(),
  description: z.string().nullable().optional(),
  parent_return_reason_id: z.string().nullable().optional(),
  parent_return_reason: z.any().nullable().optional(),
  return_reason_children: z.array(z.any()).optional(),
  metadata: z.record(z.unknown()).nullable().optional(),
  created_at: z.union([z.string(), z.date()]),
  updated_at: z.union([z.string(), z.date()]),
  deleted_at: z.union([z.string(), z.date()]).nullable().optional(),
})

/**
 * Schema for CreateReturnReasonsWorkflowInput
 */
export const createReturnReasonsWorkflowInputSchema = z.object({
  data: z.array(createReturnReasonDTOSchema),
})

/**
 * Schema for CreateReturnReasonsWorkflowOutput
 */
export const createReturnReasonsWorkflowOutputSchema = z.array(returnReasonDTOSchema)

export type CreateReturnReasonsWorkflowInput = z.infer<
  typeof createReturnReasonsWorkflowInputSchema
>
export type CreateReturnReasonsWorkflowOutput = z.infer<
  typeof createReturnReasonsWorkflowOutputSchema
>

/**
 * Schema for UpdateReturnReasonsWorkflowInput
 */
export const updateReturnReasonsWorkflowInputSchema = z.object({
  selector: z.record(z.unknown()),
  update: updateReturnReasonDTOSchema,
})

/**
 * Schema for UpdateReturnReasonsWorkflowOutput
 */
export const updateReturnReasonsWorkflowOutputSchema = z.array(returnReasonDTOSchema)

export type UpdateReturnReasonsWorkflowInput = z.infer<
  typeof updateReturnReasonsWorkflowInputSchema
>
export type UpdateReturnReasonsWorkflowOutput = z.infer<
  typeof updateReturnReasonsWorkflowOutputSchema
>

/**
 * Schema for DeleteReturnReasonsWorkflowInput
 */
export const deleteReturnReasonsWorkflowInputSchema = z.object({
  ids: z.array(z.string()),
})

/**
 * Schema for DeleteReturnReasonsWorkflowOutput
 */
export const deleteReturnReasonsWorkflowOutputSchema = z.void()

export type DeleteReturnReasonsWorkflowInput = z.infer<
  typeof deleteReturnReasonsWorkflowInputSchema
>
export type DeleteReturnReasonsWorkflowOutput = z.infer<
  typeof deleteReturnReasonsWorkflowOutputSchema
>