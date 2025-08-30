import {
  WorkflowResponse,
  createWorkflow,
} from "@medusajs/framework/workflows-sdk"
import { updateCustomerGroupsStep } from "../steps"
import {
  updateCustomerGroupsWorkflowInputSchema,
  updateCustomerGroupsWorkflowOutputSchema,
} from "../utils/schemas"

export type {
  UpdateCustomerGroupsWorkflowInput,
  UpdateCustomerGroupsWorkflowOutput,
} from "../utils/schemas"

export const updateCustomerGroupsWorkflowId = "update-customer-groups"
/**
 * This workflow updates one or more customer groups. It's used by the
 * [Update Customer Group Admin API Route](https://docs.medusajs.com/api/admin#customer-groups_postcustomergroupsid).
 * 
 * You can use this workflow within your customizations or your own custom workflows, allowing you to
 * update customer groups within your custom flows.
 * 
 * @example
 * const { result } = await updateCustomerGroupsWorkflow(container)
 * .run({
 *   input: {
 *     selector: {
 *       id: "cusgrp_123"
 *     },
 *     update: {
 *       name: "VIP"
 *     }
 *   }
 * })
 * 
 * @summary
 * 
 * Update one or more customer groups.
 */
export const updateCustomerGroupsWorkflow = createWorkflow(
  {
    name: updateCustomerGroupsWorkflowId,
    description: "Update one or more customer groups",
    inputSchema: updateCustomerGroupsWorkflowInputSchema,
    outputSchema: updateCustomerGroupsWorkflowOutputSchema,
  },
  (input) => {
    return new WorkflowResponse(updateCustomerGroupsStep(input))
  }
)
