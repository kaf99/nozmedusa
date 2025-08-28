import { AdditionalData, UpdateCampaignDTO, CampaignDTO } from "@medusajs/framework/types"
import {
  WorkflowResponse,
  createHook,
  createWorkflow,
} from "@medusajs/framework/workflows-sdk"
import { updateCampaignsStep } from "../steps"
import {
  updateCampaignsWorkflowInputSchema,
  updateCampaignsWorkflowOutputSchema,
  type UpdateCampaignsWorkflowInput as SchemaInput,
  type UpdateCampaignsWorkflowOutput as SchemaOutput,
} from "../utils/schemas"

export {
  type UpdateCampaignsWorkflowInput,
  type UpdateCampaignsWorkflowOutput,
} from "../utils/schemas"

// Type verification - CORRECT ORDER!
const schemaInput = {} as SchemaInput
const schemaOutput = {} as SchemaOutput

// Check 1: New input can go into old input (schema accepts all valid inputs)
const existingInput: {
  campaignsData: UpdateCampaignDTO[]
} & AdditionalData = schemaInput

// Check 2: Old output can go into new output (schema produces compatible outputs)
const existingOutput: SchemaOutput = {} as CampaignDTO[]

console.log(existingInput, existingOutput, schemaOutput)

export const updateCampaignsWorkflowId = "update-campaigns"
/**
 * This workflow updates one or more campaigns. It's used by the [Update Campaign Admin API Route](https://docs.medusajs.com/api/admin#campaigns_postcampaignsid).
 * 
 * This workflow has a hook that allows you to perform custom actions on the updated campaigns. For example, you can pass under `additional_data` custom data that
 * allows you to update custom data models linked to the campaigns.
 * 
 * You can also use this workflow within your customizations or your own custom workflows, allowing you to wrap custom logic around updating campaigns.
 * 
 * @example
 * const { result } = await updateCampaignsWorkflow(container)
 * .run({
 *   input: {
 *     campaignsData: [
 *       {
 *         id: "camp_123",
 *         name: "Launch Promotions",
 *         ends_at: new Date("2026-01-01"),
 *       }
 *     ],
 *     additional_data: {
 *       target_audience: "new_customers"
 *     }
 *   }
 * })
 * 
 * @summary
 * 
 * Update one or more campaigns.
 * 
 * @property hooks.campaignsUpdated - This hook is executed after the campaigns are updated. You can consume this hook to perform custom actions on the updated campaigns.
 */
export const updateCampaignsWorkflow = createWorkflow(
  {
    name: updateCampaignsWorkflowId,
    description: "Update one or more campaigns",
    inputSchema: updateCampaignsWorkflowInputSchema,
    outputSchema: updateCampaignsWorkflowOutputSchema,
  },
  (input) => {
    const updatedCampaigns = updateCampaignsStep(input.campaignsData)
    const campaignsUpdated = createHook("campaignsUpdated", {
      campaigns: updatedCampaigns,
      additional_data: input.additional_data,
    })

    return new WorkflowResponse(updatedCampaigns, {
      hooks: [campaignsUpdated],
    })
  }
)
