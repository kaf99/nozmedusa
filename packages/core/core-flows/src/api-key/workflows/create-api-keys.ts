import { ApiKeyDTO, CreateApiKeyDTO } from "@medusajs/framework/types"
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
  type CreateApiKeysWorkflowInput as SchemaInput,
  type CreateApiKeysWorkflowOutput as SchemaOutput,
} from "../utils/schemas"

/**
 * The data to create API keys.
 */
export type CreateApiKeysWorkflowInput = {
  /**
   * The API keys to create.
   */
  api_keys: CreateApiKeyDTO[]
}

/**
 * The created API keys.
 */
export type CreateApiKeysWorkflowOutput = ApiKeyDTO[]

// Type verification to ensure schemas match existing types
const schemaInput = {} as SchemaInput
const schemaOutput = {} as SchemaOutput
const existingInput: CreateApiKeysWorkflowInput = schemaInput
const existingOutput: CreateApiKeysWorkflowOutput = schemaOutput
// To avoid declared but never used errors
console.log(existingInput, existingOutput)

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
