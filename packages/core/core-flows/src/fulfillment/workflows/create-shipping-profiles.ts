import {
  WorkflowData,
  WorkflowResponse,
  createWorkflow,
} from "@medusajs/framework/workflows-sdk"
import { createShippingProfilesStep } from "../steps"
import {
  createShippingProfilesWorkflowInputSchema,
  createShippingProfilesWorkflowOutputSchema,
  type CreateShippingProfilesWorkflowInput,
  type CreateShippingProfilesWorkflowOutput,
} from "../utils/schemas"

export const createShippingProfilesWorkflowId =
  "create-shipping-profiles-workflow"
/**
 * This workflow creates one or more shipping profiles. It's used by the
 * [Create Shipping Profile Admin API Route](https://docs.medusajs.com/api/admin#shipping-profiles_postshippingprofiles).
 * 
 * You can use this workflow within your own customizations or custom workflows, allowing you to
 * create shipping profiles within your custom flows.
 * 
 * @example
 * const { result } = await createShippingProfilesWorkflow(container)
 * .run({
 *   input: {
 *     data: [
 *       {
 *         name: "Standard",
 *         type: "standard"
 *       }
 *     ]
 *   }
 * })
 * 
 * @summary
 * 
 * Create one or more shipping profiles.
 */
export const createShippingProfilesWorkflow = createWorkflow(
  {
    name: createShippingProfilesWorkflowId,
    description: "Create one or more shipping profiles",
    inputSchema: createShippingProfilesWorkflowInputSchema,
    outputSchema: createShippingProfilesWorkflowOutputSchema,
  },
  (
    input: WorkflowData<CreateShippingProfilesWorkflowInput>
  ): WorkflowResponse<CreateShippingProfilesWorkflowOutput> => {
    return new WorkflowResponse(createShippingProfilesStep(input.data))
  }
)
