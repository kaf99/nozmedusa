import { AdditionalData, FulfillmentTypes, } from "@medusajs/framework/types"
import { ShippingOptionTypeWorkflowEvents } from "@medusajs/framework/utils"
import {
  createHook,
  createWorkflow,
  transform,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk"
import { emitEventStep } from "../../common"
import { createShippingOptionTypesStep } from "../steps"
import {
  createShippingOptionTypesWorkflowInputSchema,
  createShippingOptionTypesWorkflowOutputSchema,
  type CreateShippingOptionTypesWorkflowInput as SchemaInput,
  type CreateShippingOptionTypesWorkflowOutput as SchemaOutput,
} from "../utils/schemas"

export {
  type CreateShippingOptionTypesWorkflowInput,
  type CreateShippingOptionTypesWorkflowOutput,
} from "../utils/schemas"

// Type verification - CORRECT ORDER!
const schemaInput = {} as SchemaInput
const schemaOutput = {} as SchemaOutput

// Check 1: New input can go into old input (schema accepts all valid inputs)
const existingInput: {
  shipping_option_types: FulfillmentTypes.CreateShippingOptionTypeDTO[]
} & AdditionalData = schemaInput

// Check 2: Old output can go into new output (schema produces compatible outputs)
const existingOutput: SchemaOutput = {} as FulfillmentTypes.ShippingOptionTypeDTO[]

console.log(existingInput, existingOutput, schemaOutput)

// Legacy types for backward compatibility  
export type { CreateShippingOptionTypesWorkflowInput as LegacyCreateShippingOptionTypesWorkflowInput } from "../utils/schemas"
export type { CreateShippingOptionTypesWorkflowOutput as LegacyCreateShippingOptionTypesWorkflowOutput } from "../utils/schemas"

export const createShippingOptionTypesWorkflowId = "create-shipping-option-types"
/**
 * This workflow creates one or more shipping option types. It's used by the
 * [Create Shipping Option Type Admin API Route](TODO HERE).
 * 
 * This workflow has a hook that allows you to perform custom actions on the created shipping option types. For example, you can pass under `additional_data` custom data that
 * allows you to create custom data models linked to the shipping option types.
 * 
 * You can also use this workflow within your own custom workflows, allowing you to wrap custom logic around shipping option type creation.
 * 
 * @example
 * const { result } = await createShippingOptionTypesWorkflow(container)
 * .run({
 *   input: {
 *     shipping_option_types: [
 *       {
 *         label: "Standard ",
 *         code: "standard",
 *         description: "Ship in 2-3 days."
 *       }
 *     ],
 *     additional_data: {
 *       erp_id: "123"
 *     }
 *   }
 * })
 * 
 * @summary
 * 
 * Create one or more shipping option types.
 * 
 * @property hooks.shippingOptionTypesCreated - This hook is executed after the shipping option types are created. You can consume this hook to perform custom actions on the created shipping option types.
 */
export const createShippingOptionTypesWorkflow = createWorkflow(
  {
    name: createShippingOptionTypesWorkflowId,
    description: "Create shipping option types",
    inputSchema: createShippingOptionTypesWorkflowInputSchema,
    outputSchema: createShippingOptionTypesWorkflowOutputSchema,
  },
  (input) => {
    const shippingOptionTypes = createShippingOptionTypesStep(input.shipping_option_types)
    const shippingOptionTypesCreated = createHook("shippingOptionTypesCreated", {
      shipping_option_types: shippingOptionTypes,
      additional_data: input.additional_data,
    })

    const typeIdEvents = transform({ shippingOptionTypes }, ({ shippingOptionTypes }) => {
      return shippingOptionTypes.map((v) => {
        return { id: v.id }
      })
    })

    emitEventStep({
      eventName: ShippingOptionTypeWorkflowEvents.CREATED,
      data: typeIdEvents,
    })

    return new WorkflowResponse(shippingOptionTypes, {
      hooks: [shippingOptionTypesCreated],
    })
  }
)
