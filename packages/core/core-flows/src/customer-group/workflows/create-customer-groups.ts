import {
  CustomerGroupDTO,
  CreateCustomerGroupDTO,
} from "@medusajs/framework/types"
import {
  WorkflowResponse,
  createWorkflow,
} from "@medusajs/framework/workflows-sdk"
import { createCustomerGroupsStep } from "../steps"
import {
  createCustomerGroupsWorkflowInputSchema,
  createCustomerGroupsWorkflowOutputSchema,
  type CreateCustomerGroupsWorkflowInput as SchemaInput,
  type CreateCustomerGroupsWorkflowOutput as SchemaOutput,
} from "../utils/schemas"

/**
 * The data to create customer groups.
 */
export type CreateCustomerGroupsWorkflowInput = {
  /**
   * The customer groups to create.
   */
  customersData: CreateCustomerGroupDTO[]
}

/**
 * The created customer groups.
 */
export type CreateCustomerGroupsWorkflowOutput = CustomerGroupDTO[]

const _in: SchemaInput = {} as CreateCustomerGroupsWorkflowInput
const _inRev: CreateCustomerGroupsWorkflowInput = {} as SchemaInput
const _out: SchemaOutput = {} as CreateCustomerGroupsWorkflowOutput
const _outRev: CreateCustomerGroupsWorkflowOutput = {} as SchemaOutput
void _in, _out, _outRev, _inRev

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
