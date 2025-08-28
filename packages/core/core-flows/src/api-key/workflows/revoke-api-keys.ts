import {
  WorkflowResponse,
  createWorkflow,
} from "@medusajs/framework/workflows-sdk"
import { revokeApiKeysStep } from "../steps"
import {
  revokeApiKeysWorkflowInputSchema,
  revokeApiKeysWorkflowOutputSchema,
} from "../utils/schemas"

// Re-export types from schemas for backward compatibility
export type { RevokeApiKeysWorkflowInput, RevokeApiKeysWorkflowOutput } from "../utils/schemas"

export const revokeApiKeysWorkflowId = "revoke-api-keys"
/**
 * This workflow revokes one or more API keys. If the API key is a secret, 
 * it can't be used for authentication anymore. If it's publishable, it can't be used by client applications.
 * 
 * This workflow is used by the [Revoke API Key API Route](https://docs.medusajs.com/api/admin#api-keys_postapikeysidrevoke).
 * 
 * You can use this workflow within your customizations or your own custom workflows, allowing you to
 * revoke API keys within your custom flows.
 * 
 * @example
 * const { result } = await revokeApiKeysWorkflow(container)
 * .run({
 *   input: {
 *     selector: {
 *       id: "apk_123"
 *     },
 *     revoke: {
 *       revoked_by: "user_123"
 *     }
 *   }
 * })
 * 
 * @summary
 * 
 * Revoke secret or publishable API keys.
 */
export const revokeApiKeysWorkflow = createWorkflow(
  {
    name: revokeApiKeysWorkflowId,
    inputSchema: revokeApiKeysWorkflowInputSchema,
    outputSchema: revokeApiKeysWorkflowOutputSchema,
  },
  (input) => {
    return new WorkflowResponse(revokeApiKeysStep(input))
  }
)
