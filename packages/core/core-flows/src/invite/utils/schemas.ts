import { z } from "zod"

/**
 * Schema for CreateInviteInput
 */
const createInviteInputSchema = z.object({
  email: z.string().email(),
  metadata: z.record(z.unknown()).nullable().optional(),
})

/**
 * Schema for InviteDTO
 */
const inviteDTOSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  accepted: z.boolean(),
  token: z.string(),
  expires_at: z.union([z.string(), z.date()]),
  metadata: z.record(z.unknown()).nullable().optional(),
  created_at: z.union([z.string(), z.date()]),
  updated_at: z.union([z.string(), z.date()]),
  deleted_at: z.union([z.string(), z.date()]).nullable().optional(),
})

/**
 * Schema for CreateInvitesWorkflowInput
 */
export const createInvitesWorkflowInputSchema = z.object({
  invites: z.array(createInviteInputSchema),
})

/**
 * Schema for CreateInvitesWorkflowOutput
 */
export const createInvitesWorkflowOutputSchema = z.array(inviteDTOSchema)

export type CreateInvitesWorkflowInput = z.infer<
  typeof createInvitesWorkflowInputSchema
>
export type CreateInvitesWorkflowOutput = z.infer<
  typeof createInvitesWorkflowOutputSchema
>

/**
 * Schema for DeleteInvitesWorkflowInput
 */
export const deleteInvitesWorkflowInputSchema = z.object({
  ids: z.array(z.string()),
})

/**
 * Schema for DeleteInvitesWorkflowOutput
 */
export const deleteInvitesWorkflowOutputSchema = z.void()

export type DeleteInvitesWorkflowInput = z.infer<
  typeof deleteInvitesWorkflowInputSchema
>
export type DeleteInvitesWorkflowOutput = z.infer<
  typeof deleteInvitesWorkflowOutputSchema
>

/**
 * Schema for AcceptInviteWorkflowInput
 */
export const acceptInviteWorkflowInputSchema = z.object({
  invite_token: z.string(),
  auth_identity_id: z.string(),
  user: z.object({
    email: z.string().email().optional(),
    first_name: z.string().optional(),
    last_name: z.string().optional(),
    avatar_url: z.string().optional(),
    metadata: z.record(z.unknown()).nullable().optional(),
  }),
})

/**
 * Schema for UserDTO 
 */
const userDTOSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  avatar_url: z.string().nullable().optional(),
  first_name: z.string().nullable().optional(),
  last_name: z.string().nullable().optional(),
  metadata: z.record(z.unknown()).nullable().optional(),
  created_at: z.union([z.string(), z.date()]),
  updated_at: z.union([z.string(), z.date()]),
  deleted_at: z.union([z.string(), z.date()]).nullable().optional(),
})

/**
 * Schema for AcceptInviteWorkflowOutput
 */
export const acceptInviteWorkflowOutputSchema = z.array(userDTOSchema)

export type AcceptInviteWorkflowInput = z.infer<
  typeof acceptInviteWorkflowInputSchema
>
export type AcceptInviteWorkflowOutput = z.infer<
  typeof acceptInviteWorkflowOutputSchema
>

/**
 * Schema for RefreshInviteTokensWorkflowInput
 */
export const refreshInviteTokensWorkflowInputSchema = z.object({
  invite_ids: z.array(z.string()),
})

/**
 * Schema for RefreshInviteTokensWorkflowOutput
 */
export const refreshInviteTokensWorkflowOutputSchema = z.array(inviteDTOSchema)

export type RefreshInviteTokensWorkflowInput = z.infer<
  typeof refreshInviteTokensWorkflowInputSchema
>
export type RefreshInviteTokensWorkflowOutput = z.infer<
  typeof refreshInviteTokensWorkflowOutputSchema
>