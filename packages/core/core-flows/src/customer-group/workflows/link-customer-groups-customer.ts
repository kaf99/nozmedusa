import { createWorkflow } from "@medusajs/framework/workflows-sdk"
import { linkCustomerGroupsToCustomerStep } from "../steps"
import {
  linkCustomerGroupsCustomerWorkflowInputSchema,
  linkCustomerGroupsCustomerWorkflowOutputSchema,
} from "../utils/schemas"

export type {
  LinkCustomerGroupsCustomerWorkflowInput as LinkCustomerGroupsToCustomerWorkflowInput,
  LinkCustomerGroupsCustomerWorkflowOutput as LinkCustomerGroupsToCustomerWorkflowOutput,
} from "../utils/schemas"

export const linkCustomerGroupsToCustomerWorkflowId =
  "link-customer-groups-to-customer"
/**
 * This workflow manages the customer groups a customer is in. It's used by the 
 * [Manage Groups of Customer Admin API Route](https://docs.medusajs.com/api/admin#customers_postcustomersidcustomergroups).
 * 
 * You can use this workflow within your customizations or your own custom workflows, allowing you to
 * manage the customer groups of a customer in your custom flow.
 * 
 * @example
 * const { result } = await linkCustomerGroupsToCustomerWorkflow(container)
 * .run({
 *   input: {
 *     id: "cus_123",
 *     add: ["cusgrp_123"],
 *     remove: ["cusgrp_456"]
 *   }
 * })
 * 
 * @summary
 * 
 * Manage groups of a customer.
 */
export const linkCustomerGroupsToCustomerWorkflow = createWorkflow(
  {
    name: linkCustomerGroupsToCustomerWorkflowId,
    description: "Manage groups of a customer",
    inputSchema: linkCustomerGroupsCustomerWorkflowInputSchema,
    outputSchema: linkCustomerGroupsCustomerWorkflowOutputSchema,
  },
  (input) => {
    return linkCustomerGroupsToCustomerStep(input)
  }
)
