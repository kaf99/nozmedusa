import {
  AdditionalData,
  CreateCustomerDTO,
  CustomerDTO,
} from "@medusajs/framework/types"
import { CustomerWorkflowEvents } from "@medusajs/framework/utils"
import {
  WorkflowData,
  WorkflowResponse,
  createHook,
  createWorkflow,
  transform,
} from "@medusajs/framework/workflows-sdk"
import { expectTypeOf } from "expect-type"
import { emitEventStep } from "../../common/steps/emit-event"
import { createCustomersStep } from "../steps"
import {
  createCustomersWorkflowInputSchema,
  createCustomersWorkflowOutputSchema,
  type CreateCustomersWorkflowInput as SchemaInput,
  type CreateCustomersWorkflowOutput as SchemaOutput,
} from "../utils/schemas"

/**
 * The data to create one or more customers, along with custom data that's passed to the workflow's hooks.
 */
export type CreateCustomersWorkflowInput = {
  /**
   * The customers to create.
   */
  customersData: CreateCustomerDTO[]
} & AdditionalData

export type CreateCustomersWorkflowOutput = CustomerDTO[]

// Type verification
expectTypeOf<SchemaInput>().toEqualTypeOf<CreateCustomersWorkflowInput>()
expectTypeOf<SchemaOutput>().toEqualTypeOf<CreateCustomersWorkflowOutput>()

export const createCustomersWorkflowId = "create-customers"
/**
 * This workflow creates one or more customers. It's used by the [Create Customer Admin API Route](https://docs.medusajs.com/api/admin#customers_postcustomers).
 *
 * This workflow has a hook that allows you to perform custom actions on the created customer. You can see an example in [this guide](https://docs.medusajs.com/resources/commerce-modules/customer/extend).
 *
 * You can also use this workflow within your customizations or your own custom workflows, allowing you to wrap custom logic around creating customers.
 *
 * @example
 * const { result } = await createCustomersWorkflow(container)
 * .run({
 *   input: {
 *     customersData: [
 *       {
 *         first_name: "John",
 *         last_name: "Doe",
 *         email: "john.doe@example.com",
 *       },
 *     ],
 *     additional_data: {
 *       position_name: "Editor",
 *     }
 *   }
 * })
 *
 * @summary
 *
 * Create one or more customers.
 *
 * @property hooks.customersCreated - This hook is executed after the customers are created. You can consume this hook to perform custom actions on the created customers.
 */
export const createCustomersWorkflow = createWorkflow(
  {
    name: createCustomersWorkflowId,
    description: "Create one or more customers",
    inputSchema: createCustomersWorkflowInputSchema,
    outputSchema: createCustomersWorkflowOutputSchema,
  },
  (input: WorkflowData<CreateCustomersWorkflowInput>) => {
    const createdCustomers = createCustomersStep(input.customersData)
    const customersCreated = createHook("customersCreated", {
      customers: createdCustomers,
      additional_data: input.additional_data,
    })

    const customerIdEvents = transform(
      { createdCustomers },
      ({ createdCustomers }) => {
        return createdCustomers.map((v) => {
          return { id: v.id }
        })
      }
    )

    emitEventStep({
      eventName: CustomerWorkflowEvents.CREATED,
      data: customerIdEvents,
    })

    return new WorkflowResponse(createdCustomers, {
      hooks: [customersCreated],
    })
  }
)
