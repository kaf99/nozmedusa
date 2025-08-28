import {
  CustomerGroupDTO,
  FilterableCustomerGroupProps,
  CustomerGroupUpdatableFields,
} from "@medusajs/framework/types"
import {
  WorkflowData,
  WorkflowResponse,
  createWorkflow,
} from "@medusajs/framework/workflows-sdk"
// import { expectTypeOf } from "expect-type"
import { updateCustomerGroupsStep } from "../steps"
import {
  updateCustomerGroupsWorkflowInputSchema,
  updateCustomerGroupsWorkflowOutputSchema,
  // type UpdateCustomerGroupsWorkflowInput as SchemaInput,
  // type UpdateCustomerGroupsWorkflowOutput as SchemaOutput,
} from "../utils/schemas"

/**
 * The data to update customer groups.
 */
export type UpdateCustomerGroupsWorkflowInput = {
  /**
   * The filter to select the customer groups to update.
   */
  selector: FilterableCustomerGroupProps
  /**
   * The data to update in the customer group.
   */
  update: CustomerGroupUpdatableFields
}

/**
 * The updated customer groups.
 */
export type UpdateCustomerGroupsWorkflowOutput = CustomerGroupDTO[]

// Type verification
// TODO: Fix FilterableCustomerGroupProps type issue
// expectTypeOf<SchemaInput>().toEqualTypeOf<UpdateCustomerGroupsWorkflowInput>()
// expectTypeOf<SchemaOutput>().toEqualTypeOf<UpdateCustomerGroupsWorkflowOutput>()

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
  (
    input: WorkflowData<UpdateCustomerGroupsWorkflowInput>
  ): WorkflowResponse<UpdateCustomerGroupsWorkflowOutput> => {
    return new WorkflowResponse(updateCustomerGroupsStep(input))
  }
)
