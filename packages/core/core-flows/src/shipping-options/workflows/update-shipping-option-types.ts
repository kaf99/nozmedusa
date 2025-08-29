import { ShippingOptionTypeWorkflowEvents } from "@medusajs/framework/utils"
import {
  createHook,
  createWorkflow,
  transform,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk"
import { emitEventStep } from "../../common/steps/emit-event"
import { updateShippingOptionTypesStep } from "../steps"
import {
  updateShippingOptionTypesWorkflowInputSchema,
  updateShippingOptionTypesWorkflowOutputSchema,
} from "../utils/schemas"

export {
  type UpdateShippingOptionTypesWorkflowInput,
  type UpdateShippingOptionTypesWorkflowOutput,

} from "../utils/schemas"

export const updateShippingOptionTypesWorkflowId =
  "update-shipping-option-types"
/**
 * This workflow updates one or more shipping option types. It's used by the
 * [Update Shipping Option Type Admin API Route](TODO HERE).
 *
 * This workflow has a hook that allows you to perform custom actions on the updated shipping option types. For example, you can pass under `additional_data` custom data that
 * allows you to update custom data models linked to the shipping option types.
 *
 * You can also use this workflow within your own custom workflows, allowing you to wrap custom logic around shipping option type updates.
 *
 * @example
 * const { result } = await updateShippingOptionTypesWorkflow(container)
 * .run({
 *   input: {
 *     selector: {
 *       id: "ptyp_123"
 *     },
 *     update: {
 *       value: "clothing"
 *     },
 *     additional_data: {
 *       erp_id: "123"
 *     }
 *   }
 * })
 *
 * @summary
 *
 * Update one or more shipping option types.
 *
 * @property hooks.shippingOptionTypesUpdated - This hook is executed after the shipping option types are updated. You can consume this hook to perform custom actions on the updated shipping option types.
 */
export const updateShippingOptionTypesWorkflow = createWorkflow(
  {
    name: updateShippingOptionTypesWorkflowId,
    description: "Update shipping option types",
    inputSchema: updateShippingOptionTypesWorkflowInputSchema,
    outputSchema: updateShippingOptionTypesWorkflowOutputSchema,
  },
  (input) => {
    const updatedShippingOptionTypes = updateShippingOptionTypesStep(input)
    const shippingOptionTypesUpdated = createHook(
      "shippingOptionTypesUpdated",
      {
        shipping_option_types: updatedShippingOptionTypes,
        additional_data: input.additional_data,
      }
    )

    const typeIdEvents = transform(
      { updatedShippingOptionTypes },
      ({ updatedShippingOptionTypes }) => {
        const arr = Array.isArray(updatedShippingOptionTypes)
          ? updatedShippingOptionTypes
          : [updatedShippingOptionTypes]

        return arr?.map((v) => {
          return { id: v.id }
        })
      }
    )

    emitEventStep({
      eventName: ShippingOptionTypeWorkflowEvents.UPDATED,
      data: typeIdEvents,
    })

    return new WorkflowResponse(updatedShippingOptionTypes, {
      hooks: [shippingOptionTypesUpdated],
    })
  }
)
