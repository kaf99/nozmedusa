import { createWorkflow } from "@medusajs/framework/workflows-sdk"
import { linkCustomersToCustomerGroupStep } from "../steps"
import {
  linkCustomersCustomerGroupWorkflowInputSchema,
  linkCustomersCustomerGroupWorkflowOutputSchema,
} from "../utils/schemas"

export type {
  LinkCustomersCustomerGroupWorkflowInput as LinkCustomersToCustomerGroupWorkflow,
  LinkCustomersCustomerGroupWorkflowOutput as LinkCustomersToCustomerGroupWorkflowOutput,
} from "../utils/schemas"

export const linkCustomersToCustomerGroupWorkflowId =
  "link-customers-to-customer-group"
/**
 * This workflow manages the customers of a customer group. It's used by the 
 * [Manage Customers of Group Admin API Route](https://docs.medusajs.com/api/admin#customer-groups_postcustomergroupsidcustomers).
 * 
 * You can use this workflow within your customizations or your own custom workflows, allowing you to
 * manage the customers of a customer group within your custom flows.
 * 
 * @example
 * const { result } = await linkCustomersToCustomerGroupWorkflow(container)
 * .run({
 *   input: {
 *     id: "cusgrp_123",
 *     add: ["cus_123"],
 *     remove: ["cus_456"]
 *   }
 * })
 * 
 * @summary
 * 
 * Manage the customers of a customer group.
 */
export const linkCustomersToCustomerGroupWorkflow = createWorkflow(
  {
    name: linkCustomersToCustomerGroupWorkflowId,
    description: "Manage the customers of a customer group",
    inputSchema: linkCustomersCustomerGroupWorkflowInputSchema,
    outputSchema: linkCustomersCustomerGroupWorkflowOutputSchema,
  },
  (input) => {
    return linkCustomersToCustomerGroupStep(input)
  }
)
