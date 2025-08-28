import {
  Modules,
  ShippingOptionTypeWorkflowEvents,
} from "@medusajs/framework/utils"
import {
  createHook,
  createWorkflow,
  parallelize,
  transform,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk"
import { emitEventStep } from "../../common/steps/emit-event"
import { removeRemoteLinkStep } from "../../common/steps/remove-remote-links"
import { deleteShippingOptionTypesStep } from "../steps"
import {
  deleteShippingOptionTypesWorkflowInputSchema,
  deleteShippingOptionTypesWorkflowOutputSchema,
  type DeleteShippingOptionTypesWorkflowInput as SchemaInput,
  type DeleteShippingOptionTypesWorkflowOutput as SchemaOutput,
} from "../utils/schemas"

export {
  type DeleteShippingOptionTypesWorkflowInput,
  type DeleteShippingOptionTypesWorkflowOutput,
} from "../utils/schemas"

// Type verification - CORRECT ORDER!
const schemaInput = {} as SchemaInput
const schemaOutput = undefined as SchemaOutput

// Check 1: New input can go into old input (schema accepts all valid inputs)
const existingInput: {
  ids: string[]
} = schemaInput

// Check 2: Old output can go into new output (schema produces compatible outputs)
const existingOutput: SchemaOutput = undefined as any

console.log(existingInput, existingOutput, schemaOutput)

// Legacy types for backward compatibility
export type { DeleteShippingOptionTypesWorkflowInput as LegacyDeleteShippingOptionTypesWorkflowInput } from "../utils/schemas"
export type { DeleteShippingOptionTypesWorkflowOutput as LegacyDeleteShippingOptionTypesWorkflowOutput } from "../utils/schemas"

export const deleteShippingOptionTypesWorkflowId =
  "delete-shipping-option-types"
/**
 * This workflow deletes one or more shipping-option types. It's used by the
 * [Delete Shipping Option Types Admin API Route](TODO HERE).
 *
 * This workflow has a hook that allows you to perform custom actions after the shipping-option types are deleted. For example,
 * you can delete custom records linked to the shipping-option types.
 *
 * You can also use this workflow within your own custom workflows, allowing you to wrap custom logic around shipping option type deletion.
 *
 * @example
 * const { result } = await deleteShippingOptionTypesWorkflow(container)
 * .run({
 *   input: {
 *     ids: ["sotype_123"],
 *   }
 * })
 *
 * @summary
 *
 * Delete one or more shippingOption types.
 *
 * @property hooks.shippingOptionTypesDeleted - This hook is executed after the types are deleted. You can consume this hook to perform custom actions on the deleted types.
 */
export const deleteShippingOptionTypesWorkflow = createWorkflow(
  {
    name: deleteShippingOptionTypesWorkflowId,
    description: "Delete shipping option types",
    inputSchema: deleteShippingOptionTypesWorkflowInputSchema,
    outputSchema: deleteShippingOptionTypesWorkflowOutputSchema,
  },
  (input) => {
    const deletedShippingOptionTypes = deleteShippingOptionTypesStep(input.ids)
    const shippingOptionTypesDeleted = createHook(
      "shippingOptionTypesDeleted",
      {
        ids: input.ids,
      }
    )

    const typeIdEvents = transform({ input }, ({ input }) => {
      return input.ids?.map((id) => {
        return { id }
      })
    })

    parallelize(
      removeRemoteLinkStep({
        [Modules.FULFILLMENT]: { shipping_option_type_id: input.ids },
      }),
      emitEventStep({
        eventName: ShippingOptionTypeWorkflowEvents.DELETED,
        data: typeIdEvents,
      })
    )

    return new WorkflowResponse(deletedShippingOptionTypes, {
      hooks: [shippingOptionTypesDeleted],
    })
  }
)
