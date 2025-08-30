import { CustomerWorkflowEvents } from "@medusajs/framework/utils"
import {
  WorkflowResponse,
  createHook,
  createWorkflow,
  transform,
} from "@medusajs/framework/workflows-sdk"
import { emitEventStep } from "../../common/steps/emit-event"
import { deleteCustomersStep } from "../steps"
import {
  deleteCustomersWorkflowInputSchema,
  deleteCustomersWorkflowOutputSchema,
} from "../utils/schemas"

export type {
  DeleteCustomersWorkflowInput,
  DeleteCustomersWorkflowOutput,
} from "../utils/schemas"

export const deleteCustomersWorkflowId = "delete-customers"
/**
 * This workflow deletes one or more customers. It's used by the 
 * {@link removeCustomerAccountWorkflow}.
 * 
 * You can use this workflow within your customizations or your own custom workflows, allowing you to 
 * delete customers in your custom flows.
 * 
 * @example
 * const { result } = await deleteCustomersWorkflow(container)
 * .run({
 *   input: {
 *     ids: [
 *       "cus_123",
 *     ]
 *   }
 * })
 * 
 * @summary
 * 
 * Delete one or more customers.
 * 
 * @property hooks.customersDeleted - This hook is executed after the customers are deleted. You can consume this hook to perform custom actions.
 */
export const deleteCustomersWorkflow = createWorkflow(
  {
    name: deleteCustomersWorkflowId,
    description: "Delete one or more customers",
    inputSchema: deleteCustomersWorkflowInputSchema,
    outputSchema: deleteCustomersWorkflowOutputSchema,
  },
  (input) => {
    const deletedCustomers = deleteCustomersStep(input.ids)
    const customersDeleted = createHook("customersDeleted", {
      ids: input.ids,
    })

    const customerIdEvents = transform({ input }, ({ input }) => {
      return input.ids?.map((id) => {
        return { id }
      })
    })

    emitEventStep({
      eventName: CustomerWorkflowEvents.DELETED,
      data: customerIdEvents,
    })

    return new WorkflowResponse(deletedCustomers, {
      hooks: [customersDeleted],
    })
  }
)
