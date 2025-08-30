import { CustomerWorkflowEvents } from "@medusajs/framework/utils"
import {
  WorkflowResponse,
  createHook,
  createWorkflow,
  transform,
} from "@medusajs/framework/workflows-sdk"
import { emitEventStep } from "../../common/steps/emit-event"
import { updateCustomersStep } from "../steps"
import {
  updateCustomersWorkflowInputSchema,
  updateCustomersWorkflowOutputSchema,
} from "../utils/schemas"

export type {
  UpdateCustomersWorkflowInput,
  UpdateCustomersWorkflowOutput,
} from "../utils/schemas"

export const updateCustomersWorkflowId = "update-customers"
/**
 * This workflow updates one or more customers. It's used by the [Update Customer Admin API Route](https://docs.medusajs.com/api/admin#customers_postcustomersid) and
 * the [Update Customer Store API Route](https://docs.medusajs.com/api/store#customers_postcustomersme).
 * 
 * This workflow has a hook that allows you to perform custom actions on the updated customer. For example, you can pass under `additional_data` custom data to update
 * custom data models linked to the customers.
 * 
 * You can also use this workflow within your customizations or your own custom workflows, allowing you to wrap custom logic around updating customers.
 * 
 * @example
 * const { result } = await updateCustomersWorkflow(container)
 * .run({
 *   input: {
 *     selector: {
 *       id: ["cus_123"]
 *     },
 *     update: {
 *       first_name: "John"
 *     }
 *   }
 * })
 * 
 * @summary
 * 
 * Update one or more customers.
 * 
 * @property hooks.customersUpdated - This hook is executed after the customers are updated. You can consume this hook to perform custom actions on the updated customers.
 */
export const updateCustomersWorkflow = createWorkflow(
  {
    name: updateCustomersWorkflowId,
    description: "Update one or more customers",
    inputSchema: updateCustomersWorkflowInputSchema,
    outputSchema: updateCustomersWorkflowOutputSchema,
  },
  (input) => {
    const updatedCustomers = updateCustomersStep(input)
    const customersUpdated = createHook("customersUpdated", {
      customers: updatedCustomers,
      additional_data: input.additional_data,
    })

    const customerIdEvents = transform(
      { updatedCustomers },
      ({ updatedCustomers }) => {
        const arr = Array.isArray(updatedCustomers)
          ? updatedCustomers
          : [updatedCustomers]

        return arr?.map((customer) => {
          return { id: customer.id }
        })
      }
    )

    emitEventStep({
      eventName: CustomerWorkflowEvents.UPDATED,
      data: customerIdEvents,
    })

    return new WorkflowResponse(updatedCustomers, {
      hooks: [customersUpdated],
    })
  }
)
