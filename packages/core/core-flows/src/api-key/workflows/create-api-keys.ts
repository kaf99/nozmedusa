import {
  WorkflowData,
  WorkflowResponse,
  createHook,
  createWorkflow,
} from "@medusajs/framework/workflows-sdk"
import { createApiKeysStep } from "../steps"
import {
  createApiKeysWorkflowInputSchema,
  createApiKeysWorkflowOutputSchema,
  type CreateApiKeysWorkflowInput,
} from "../utils/schemas"

export type { CreateApiKeysWorkflowInput, CreateApiKeysWorkflowOutput } from "../utils/schemas"

export const createApiKeysWorkflowId = "create-api-keys"
/**
 * This workflow creates one or more API keys, which can be secret or publishable. It's used by the
 * [Create API Key Admin API Route](https://docs.medusajs.com/api/admin#api-keys_postapikeys).
 *
 * You can use this workflow within your customizations or your own custom workflows, allowing you to
 * create API keys within your custom flows.
 *
 * @example
 * const { result } = await createApiKeysWorkflow(container)
 * .run({
 *   input: {
 *     api_keys: [
 *       {
 *         type: "publishable",
 *         title: "Storefront",
 *         created_by: "user_123"
 *       }
 *     ]
 *   }
 * })
 *
 * @summary
 *
 * Create secret or publishable API keys.
 */
export const createApiKeysWorkflow = createWorkflow(
  {
    name: createApiKeysWorkflowId,
    description: "Create secret or publishable API keys",
    inputSchema: createApiKeysWorkflowInputSchema,
    outputSchema: createApiKeysWorkflowOutputSchema,
  },
  (input: WorkflowData<CreateApiKeysWorkflowInput>) => {
    const apiKeys = createApiKeysStep(input)

    const apiKeysCreated = createHook("apiKeysCreated", {
      apiKeys,
    })

    return new WorkflowResponse(apiKeys, {
      hooks: [apiKeysCreated],
    })
  }
)
