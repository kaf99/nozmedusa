import { z } from "zod"

/**
 * Schema for DeleteFilesWorkflowInput
 */
export const deleteFilesWorkflowInputSchema = z.object({
  ids: z.array(z.string()),
})

/**
 * Schema for DeleteFilesWorkflowOutput
 */
export const deleteFilesWorkflowOutputSchema = z.void()

export type DeleteFilesWorkflowInput = z.infer<
  typeof deleteFilesWorkflowInputSchema
>
export type DeleteFilesWorkflowOutput = z.infer<
  typeof deleteFilesWorkflowOutputSchema
>

/**
 * Schema for file upload input
 */
const fileUploadInputSchema = z.object({
  filename: z.string(),
  mimeType: z.string(),
  content: z.string(),
  access: z.enum(["public", "private"]),
})

/**
 * Schema for FileDTO
 */
const fileDTOSchema = z.object({
  id: z.string(),
  url: z.string(),
})

/**
 * Schema for UploadFilesWorkflowInput
 */
export const uploadFilesWorkflowInputSchema = z.object({
  files: z.array(fileUploadInputSchema),
})

/**
 * Schema for UploadFilesWorkflowOutput
 */
export const uploadFilesWorkflowOutputSchema = z.array(fileDTOSchema)

export type UploadFilesWorkflowInput = z.infer<
  typeof uploadFilesWorkflowInputSchema
>
export type UploadFilesWorkflowOutput = z.infer<
  typeof uploadFilesWorkflowOutputSchema
>