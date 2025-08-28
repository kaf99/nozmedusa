import { z } from "zod"

/**
 * Schema for UserDTO
 * 
 * TODO: There's a discrepancy between the UserDTO type (which expects strict Date objects)
 * and how dates are handled in runtime (typically as ISO strings from the service layer).
 * Other modules use z.union([z.string(), z.date()]) to handle both formats.
 * This should be refactored for consistency at a later point.
 */
const userDTOSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  first_name: z.string().nullable(),
  last_name: z.string().nullable(),
  avatar_url: z.string().nullable(),
  metadata: z.record(z.unknown()).nullable(),
  created_at: z.date(),
  updated_at: z.date(),
  deleted_at: z.date().nullable(),
})

/**
 * Schema for CreateUserDTO
 */
const createUserDTOSchema = z.object({
  email: z.string().email(),
  first_name: z.string().nullable().optional(),
  last_name: z.string().nullable().optional(),
  avatar_url: z.string().nullable().optional(),
  metadata: z.record(z.unknown()).nullable().optional(),
})

/**
 * Schema for UpdateUserDTO
 */
const updateUserDTOSchema = z.object({
  id: z.string(),
  first_name: z.string().nullable().optional(),
  last_name: z.string().nullable().optional(),
  avatar_url: z.string().nullable().optional(),
  metadata: z.record(z.unknown()).nullable().optional(),
})

/**
 * Schema for CreateUsersWorkflowInput
 */
export const createUsersWorkflowInputSchema = z.object({
  users: z.array(createUserDTOSchema),
})

/**
 * Schema for CreateUsersWorkflowOutput
 */
export const createUsersWorkflowOutputSchema = z.array(userDTOSchema)

/**
 * Schema for UpdateUsersWorkflowInput
 */
export const updateUsersWorkflowInputSchema = z.object({
  updates: z.array(updateUserDTOSchema),
})

/**
 * Schema for UpdateUsersWorkflowOutput
 */
export const updateUsersWorkflowOutputSchema = z.array(userDTOSchema)

/**
 * Schema for DeleteUsersWorkflowInput
 */
export const deleteUsersWorkflowInputSchema = z.object({
  ids: z.array(z.string()),
})

/**
 * Schema for DeleteUsersWorkflowOutput
 */
export const deleteUsersWorkflowOutputSchema = z.void()

/**
 * Schema for CreateUserAccountWorkflowInput
 */
export const createUserAccountWorkflowInputSchema = z.object({
  /**
   * The ID of the auth identity to attach the user to.
   */
  authIdentityId: z.string(),
  /**
   * The details of the user to create.
   */
  userData: createUserDTOSchema,
})

/**
 * Schema for CreateUserAccountWorkflowOutput
 */
export const createUserAccountWorkflowOutputSchema = userDTOSchema

/**
 * Schema for RemoveUserAccountWorkflowInput
 */
export const removeUserAccountWorkflowInputSchema = z.object({
  /**
   * The ID of the user to remove.
   */
  userId: z.string(),
})

/**
 * Schema for RemoveUserAccountWorkflowOutput
 */
export const removeUserAccountWorkflowOutputSchema = z.string()

// Type exports for workflow input/output types
export type CreateUsersWorkflowInput = z.infer<typeof createUsersWorkflowInputSchema>
export type CreateUsersWorkflowOutput = z.infer<typeof createUsersWorkflowOutputSchema>
export type UpdateUsersWorkflowInput = z.infer<typeof updateUsersWorkflowInputSchema>
export type UpdateUsersWorkflowOutput = z.infer<typeof updateUsersWorkflowOutputSchema>
export type DeleteUsersWorkflowInput = z.infer<typeof deleteUsersWorkflowInputSchema>
export type DeleteUsersWorkflowOutput = z.infer<typeof deleteUsersWorkflowOutputSchema>
export type CreateUserAccountWorkflowInput = z.infer<typeof createUserAccountWorkflowInputSchema>
export type CreateUserAccountWorkflowOutput = z.infer<typeof createUserAccountWorkflowOutputSchema>
export type RemoveUserAccountWorkflowInput = z.infer<typeof removeUserAccountWorkflowInputSchema>
export type RemoveUserAccountWorkflowOutput = z.infer<typeof removeUserAccountWorkflowOutputSchema>