import {
  WorkflowResponse,
  createWorkflow,
} from "@medusajs/framework/workflows-sdk"
import { updateApiKeysStep } from "../steps"
import {
  updateApiKeysWorkflowInputSchema,
  updateApiKeysWorkflowOutputSchema,
} from "../utils/schemas"

// Re-export types from schemas for backward compatibility
export type {
  UpdateApiKeysWorkflowInput,
  UpdateApiKeysWorkflowOutput,
} from "../utils/schemas"

export const updateApiKeysWorkflowId = "update-api-keys"
/**
 * This workflow updates one or more secret or publishable API keys. It's used by the
 * [Update API Key Admin API Route](https://docs.medusajs.com/api/admin#api-keys_postapikeysid).
 *
 * You can use this workflow within your customizations or your own custom workflows, allowing you to
 * update API keys within your custom flows.
 *
 * @example
 * const { result } = await updateApiKeysWorkflow(container)
 * .run({
 *   input: {
 *     selector: {
 *       id: "apk_123"
 *     },
 *     update: {
 *       title: "Storefront"
 *     }
 *   }
 * })
 *
 * @summary
 *
 * Update secret or publishable API keys.
 */
export const updateApiKeysWorkflow = createWorkflow(
  {
    name: updateApiKeysWorkflowId,
    inputSchema: updateApiKeysWorkflowInputSchema,
    outputSchema: updateApiKeysWorkflowOutputSchema,
  },
  (input) => {
    return new WorkflowResponse(updateApiKeysStep(input))
  }
)
