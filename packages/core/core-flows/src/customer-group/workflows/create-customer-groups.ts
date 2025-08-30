import {
  WorkflowResponse,
  createWorkflow,
} from "@medusajs/framework/workflows-sdk"
import { createCustomerGroupsStep } from "../steps"
import {
  createCustomerGroupsWorkflowInputSchema,
  createCustomerGroupsWorkflowOutputSchema,
} from "../utils/schemas"

export type {
  CreateCustomerGroupsWorkflowInput,
  CreateCustomerGroupsWorkflowOutput,
} from "../utils/schemas"

export const createCustomerGroupsWorkflowId = "create-customer-groups"
/**
 * This workflow creates one or more customer groups. It's used by the
 * [Create Customer Group Admin API Route](https://docs.medusajs.com/api/admin#customer-groups_postcustomergroups).
 *
 * You can use this workflow within your customizations or your own custom workflows, allowing you to
 * create customer groups within your custom flows. For example, you can create customer groups to segregate
 * customers by age group or purchase habits.
 *
 * @example
 * const { result } = await createCustomerGroupsWorkflow(container)
 * .run({
 *   input: {
 *     groupsData: [
 *       {
 *         name: "VIP"
 *       }
 *     ]
 *   }
 * })
 *
 * @summary
 *
 * Create one or more customer groups.
 */
export const createCustomerGroupsWorkflow = createWorkflow(
  {
    name: createCustomerGroupsWorkflowId,
    description: "Create one or more customer groups",
    inputSchema: createCustomerGroupsWorkflowInputSchema,
    outputSchema: createCustomerGroupsWorkflowOutputSchema,
  },
  (input) => {
    return new WorkflowResponse(createCustomerGroupsStep(input.customersData))
  }
)
