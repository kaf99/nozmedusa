import {
  WorkflowData,
  WorkflowResponse,
  createHook,
  createWorkflow,
} from "@medusajs/framework/workflows-sdk"
import { expectTypeOf } from "expect-type"
import { deleteCustomerAddressesStep } from "../steps"
import {
  deleteAddressesWorkflowInputSchema,
  deleteAddressesWorkflowOutputSchema,
  type DeleteAddressesWorkflowInput as SchemaInput,
  type DeleteAddressesWorkflowOutput as SchemaOutput,
} from "../utils/schemas"

/**
 * The details of the addresses to delete.
 */
export type DeleteCustomerAddressesWorkflowInput = { 
  /**
   * The IDs of the addresses to delete.
   */
  ids: string[]
}

export type DeleteCustomerAddressesWorkflowOutput = void

// Type verification
expectTypeOf<SchemaInput>().toEqualTypeOf<DeleteCustomerAddressesWorkflowInput>()
expectTypeOf<SchemaOutput>().toEqualTypeOf<DeleteCustomerAddressesWorkflowOutput>()

export const deleteCustomerAddressesWorkflowId = "delete-customer-addresses"
/**
 * This workflow deletes one or more customer addresses. It's used by the
 * [Remove Customer Addresses Admin API Route](https://docs.medusajs.com/api/admin#customers_deletecustomersidaddressesaddress_id)
 * and the [Remove Customer Addresses Store API Route](https://docs.medusajs.com/api/store#customers_deletecustomersmeaddressesaddress_id).
 * 
 * :::note
 * 
 * This workflow deletes addresses created by the [Customer Module](https://docs.medusajs.com/resources/commerce-modules/customer)
 * only. So, you can't delete addresses attached to a cart, for example. To do that, use the workflow
 * relevant to that module.
 * 
 * :::
 * 
 * You can use this workflow within your customizations or your own custom workflows, allowing you to 
 * delete customer addresses in your custom flows.
 * 
 * @example
 * const { result } = await deleteCustomerAddressesWorkflow(container)
 * .run({
 *   input: {
 *     ids: [
 *       "cuaddress_123"
 *     ]
 *   }
 * })
 * 
 * @summary
 * 
 * Delete one or more customer addresses.
 * 
 * @property hooks.addressesDeleted - This hook is executed after the addresses are deleted. You can consume this hook to perform custom actions.
 */
export const deleteCustomerAddressesWorkflow = createWorkflow(
  {
    name: deleteCustomerAddressesWorkflowId,
    description: "Delete one or more customer addresses",
    inputSchema: deleteAddressesWorkflowInputSchema,
    outputSchema: deleteAddressesWorkflowOutputSchema,
  },
  (input: WorkflowData<DeleteCustomerAddressesWorkflowInput>) => {
    const deletedAddresses = deleteCustomerAddressesStep(input.ids)
    const addressesDeleted = createHook("addressesDeleted", {
      ids: input.ids,
    })

    return new WorkflowResponse(deletedAddresses, {
      hooks: [addressesDeleted],
    })
  }
)
