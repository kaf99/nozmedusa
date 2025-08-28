import {
  CustomerGroupDTO,
  CreateCustomerGroupDTO,
} from "@medusajs/framework/types"
import {
  WorkflowData,
  WorkflowResponse,
  createWorkflow,
} from "@medusajs/framework/workflows-sdk"
// import { expectTypeOf } from "expect-type"
import { createCustomerGroupsStep } from "../steps"
import {
  createCustomerGroupsWorkflowInputSchema,
  createCustomerGroupsWorkflowOutputSchema,
  // type CreateCustomerGroupsWorkflowInput as SchemaInput,
  // type CreateCustomerGroupsWorkflowOutput as SchemaOutput,
} from "../utils/schemas"

/**
 * The data to create customer groups.
 */
export type CreateCustomerGroupsWorkflowInput = {
  /**
   * The customer groups to create.
   */
  groupsData: CreateCustomerGroupDTO[]
}

/**
 * The created customer groups.
 */
export type CreateCustomerGroupsWorkflowOutput = CustomerGroupDTO[]

// Type verification
// TODO: Fix CustomerGroupDTO type issue
// expectTypeOf<SchemaInput>().toEqualTypeOf<CreateCustomerGroupsWorkflowInput>()
// expectTypeOf<SchemaOutput>().toEqualTypeOf<CreateCustomerGroupsWorkflowOutput>()

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
  (
    input: WorkflowData<CreateCustomerGroupsWorkflowInput>
  ): WorkflowResponse<CreateCustomerGroupsWorkflowOutput> => {
    return new WorkflowResponse(createCustomerGroupsStep(input.groupsData))
  }
)
