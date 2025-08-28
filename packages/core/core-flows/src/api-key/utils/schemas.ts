import { z } from "zod"

/**
 * API key type enum matching ApiKeyType from types package
 */
export const apiKeyTypeSchema = z.enum(["secret", "publishable"])

/**
 * Schema for CreateApiKeyDTO matching the type from @medusajs/framework/types
 */
export const createApiKeyDTOSchema = z.object({
  /**
   * The title of the API key.
   */
  title: z.string(),

  /**
   * The type of the API key.
   */
  type: apiKeyTypeSchema,

  /**
   * Who created the API key.
   * If the API key type is `secret`, the user can use the created API key's token to authenticate
   * as explained in the [API Reference](https://docs.medusajs.com/api/admin#2-api-token).
   */
  created_by: z.string(),
})

/**
 * Schema for ApiKeyDTO matching the type from @medusajs/framework/types
 */
export const apiKeyDTOSchema = z.object({
  /**
   * The ID of the API key.
   */
  id: z.string(),

  /**
   * The token of the API key.
   */
  token: z.string(),

  /**
   * The redacted form of the API key's token. This is useful
   * when showing portion of the token. For example `sk_...123`.
   */
  redacted: z.string(),

  /**
   * The title of the API key.
   */
  title: z.string(),

  /**
   * The type of the API key.
   */
  type: apiKeyTypeSchema,

  /**
   * The date the API key was last used.
   */
  last_used_at: z.date().nullable(),

  /**
   * Who created the API key.
   */
  created_by: z.string(),

  /**
   * The date the API key was created.
   */
  created_at: z.date(),

  /**
   * The date the API key was updated.
   */
  updated_at: z.date(),

  /**
   * The date the API key was deleted.
   */
  deleted_at: z.date().nullable(),

  /**
   * Who revoked the API key. For example,
   * the ID of the user that revoked it.
   */
  revoked_by: z.string().nullable(),

  /**
   * The date the API key was revoked.
   */
  revoked_at: z.date().nullable(),
})

/**
 * Schema for CreateApiKeysWorkflowInput
 */
export const createApiKeysWorkflowInputSchema = z.object({
  /**
   * The API keys to create.
   */
  api_keys: z.array(createApiKeyDTOSchema),
})

/**
 * Schema for CreateApiKeysWorkflowOutput
 */
export const createApiKeysWorkflowOutputSchema = z.array(apiKeyDTOSchema)

/**
 * Schema for DeleteApiKeysWorkflowInput
 */
export const deleteApiKeysWorkflowInputSchema = z.object({
  /**
   * The IDs of the API keys to delete.
   */
  ids: z.array(z.string()),
})

/**
 * Schema for DeleteApiKeysWorkflowOutput
 */
export const deleteApiKeysWorkflowOutputSchema = z.void()

/**
 * Schema for LinkSalesChannelsToApiKeyWorkflowInput
 */
export const linkSalesChannelsToApiKeyWorkflowInputSchema = z.object({
  /**
   * The ID of the publishable API key.
   */
  id: z.string(),
  /**
   * The sales channel IDs to add to the publishable API key.
   */
  add: z.array(z.string()).optional(),
  /**
   * The sales channel IDs to remove from the publishable API key.
   */
  remove: z.array(z.string()).optional(),
})

/**
 * Schema for LinkSalesChannelsToApiKeyWorkflowOutput
 */
export const linkSalesChannelsToApiKeyWorkflowOutputSchema = z.void()

/**
 * Schema for FilterableApiKeyProps
 */
export const filterableApiKeyPropsSchema = z.object({
  /**
   * Search through the api key names and redacted keys using this search term.
   */
  q: z.string().optional(),
  /**
   * The IDs to filter the API keys by.
   */
  id: z.union([z.string(), z.array(z.string())]).optional(),
}).passthrough() // Allow additional BaseFilterable properties

/**
 * Schema for RevokeApiKeyDTO
 */
export const revokeApiKeyDTOSchema = z.object({
  /**
   * Who revoked the API key.
   */
  revoked_by: z.string(),
  /**
   * When to revoke the API key (time in seconds).
   */
  revoke_in: z.number().optional(),
})

/**
 * Schema for RevokeApiKeysWorkflowInput
 */
export const revokeApiKeysWorkflowInputSchema = z.object({
  /**
   * The filters to select the API keys to revoke.
   */
  selector: filterableApiKeyPropsSchema,
  /**
   * The data to revoke the API keys.
   */
  revoke: revokeApiKeyDTOSchema,
})

/**
 * Schema for RevokeApiKeysWorkflowOutput
 */
export const revokeApiKeysWorkflowOutputSchema = z.array(apiKeyDTOSchema)

/**
 * Schema for UpdateApiKeyDTO
 */
export const updateApiKeyDTOSchema = z.object({
  /**
   * The title of the API key.
   */
  title: z.string().optional(),
})

/**
 * Schema for UpdateApiKeysWorkflowInput
 */
export const updateApiKeysWorkflowInputSchema = z.object({
  /**
   * The filters to select the API keys to update.
   */
  selector: filterableApiKeyPropsSchema,
  /**
   * The data to update the API keys.
   */
  update: updateApiKeyDTOSchema,
})

/**
 * Schema for UpdateApiKeysWorkflowOutput
 */
export const updateApiKeysWorkflowOutputSchema = z.array(apiKeyDTOSchema)

// Type inference for workflow input/output types (these are defined locally, not in types package)
export type CreateApiKeysWorkflowInput = z.infer<typeof createApiKeysWorkflowInputSchema>
export type CreateApiKeysWorkflowOutput = z.infer<typeof createApiKeysWorkflowOutputSchema>
export type DeleteApiKeysWorkflowInput = z.infer<typeof deleteApiKeysWorkflowInputSchema>
export type DeleteApiKeysWorkflowOutput = z.infer<typeof deleteApiKeysWorkflowOutputSchema>
export type LinkSalesChannelsToApiKeyWorkflowInput = z.infer<typeof linkSalesChannelsToApiKeyWorkflowInputSchema>
export type LinkSalesChannelsToApiKeyWorkflowOutput = z.infer<typeof linkSalesChannelsToApiKeyWorkflowOutputSchema>
export type RevokeApiKeysWorkflowInput = z.infer<typeof revokeApiKeysWorkflowInputSchema>
export type RevokeApiKeysWorkflowOutput = z.infer<typeof revokeApiKeysWorkflowOutputSchema>
export type UpdateApiKeysWorkflowInput = z.infer<typeof updateApiKeysWorkflowInputSchema>
export type UpdateApiKeysWorkflowOutput = z.infer<typeof updateApiKeysWorkflowOutputSchema>