import {
  OrderChangeActionDTO,
  OrderChangeDTO,
  OrderPreviewDTO,
  OrderWorkflow,
} from "@medusajs/framework/types"
import { ChangeActionType, OrderChangeStatus } from "@medusajs/framework/utils"
import {
  WorkflowResponse,
  createStep,
  createWorkflow,
  parallelize,
  transform,
} from "@medusajs/framework/workflows-sdk"
import {
  deleteOrderEditShippingMethodWorkflowInputSchema,
  deleteOrderEditShippingMethodWorkflowOutputSchema,
  type DeleteOrderEditShippingMethodWorkflowInput as SchemaInput,
  type DeleteOrderEditShippingMethodWorkflowOutput as SchemaOutput,
} from "../../utils/schemas"
import { useRemoteQueryStep } from "../../../common"
import { deleteOrderShippingMethods } from "../../steps"
import { deleteOrderChangeActionsStep } from "../../steps/delete-order-change-actions"
import { previewOrderChangeStep } from "../../steps/preview-order-change"
import { throwIfOrderChangeIsNotActive } from "../../utils/order-validation"

/**
 * The data to validate that a shipping method can be removed from an order edit.
 */
export type RemoveOrderEditShippingMethodValidationStepInput = {
  /**
   * The order change's details.
   */
  orderChange: OrderChangeDTO
  /**
   * The details of the shipping method to be removed.
   */
  input: Pick<OrderWorkflow.DeleteOrderEditShippingMethodWorkflowInput, "order_id" | "action_id">
}

/**
 * This step validates that a shipping method can be removed from an order edit.
 * If the order change is not active, the shipping method isn't in the exchange,
 * or the action doesn't add a shipping method, the step will throw an error.
 * 
 * :::note
 * 
 * You can retrieve an order change details using [Query](https://docs.medusajs.com/learn/fundamentals/module-links/query),
 * or [useQueryGraphStep](https://docs.medusajs.com/resources/references/medusa-workflows/steps/useQueryGraphStep).
 * 
 * :::
 * 
 * @example
 * const data = removeOrderEditShippingMethodValidationStep({
 *   orderChange: {
 *     id: "orch_123",
 *     // other order change details...
 *   },
 *   input: {
 *     order_id: "order_123",
 *     action_id: "orchact_123",
 *   }
 * })
 */
export const removeOrderEditShippingMethodValidationStep = createStep(
  "validate-remove-order-edit-shipping-method",
  async function ({
    orderChange,
    input,
  }: RemoveOrderEditShippingMethodValidationStepInput) {
    throwIfOrderChangeIsNotActive({ orderChange })

    const associatedAction = (orderChange.actions ?? []).find(
      (a) => a.id === input.action_id
    ) as OrderChangeActionDTO

    if (!associatedAction) {
      throw new Error(
        `No shipping method found for order ${input.order_id} in order change ${orderChange.id}`
      )
    } else if (associatedAction.action !== ChangeActionType.SHIPPING_ADD) {
      throw new Error(
        `Action ${associatedAction.id} is not adding a shipping method`
      )
    }
  }
)

// Type verification - CORRECT ORDER!
const _schemaInput = {} as SchemaInput
const _schemaOutput = {} as SchemaOutput

// Check 1: New input can go into old input (schema accepts all valid inputs)
const _existingInput: OrderWorkflow.DeleteOrderEditShippingMethodWorkflowInput = _schemaInput

// Check 2: Old output can go into new output (schema produces compatible outputs)
const _existingOutput: SchemaOutput = {} as OrderPreviewDTO

void _schemaInput
void _schemaOutput
void _existingInput
void _existingOutput

export const removeOrderEditShippingMethodWorkflowId =
  "remove-order-edit-shipping-method"
/**
 * This workflow removes a shipping method of an order edit. It's used by the 
 * [Remove Shipping Method Admin API Route](https://docs.medusajs.com/api/admin#order-edits_deleteordereditsidshippingmethodaction_id).
 * 
 * You can use this workflow within your customizations or your own custom workflows, allowing you to remove a 
 * shipping method from an order edit in your custom flows.
 * 
 * @example
 * const { result } = await removeOrderEditShippingMethodWorkflow(container)
 * .run({
 *   input: {
 *     order_id: "order_123",
 *     action_id: "orchact_123",
 *   }
 * })
 * 
 * @summary
 * 
 * Remove a shipping method from an order edit.
 */
export const removeOrderEditShippingMethodWorkflow = createWorkflow(
  {
    name: removeOrderEditShippingMethodWorkflowId,
    inputSchema: deleteOrderEditShippingMethodWorkflowInputSchema,
    outputSchema: deleteOrderEditShippingMethodWorkflowOutputSchema,
  },
  function (
    input
  ): WorkflowResponse<OrderPreviewDTO> {
    const orderChange: OrderChangeDTO = useRemoteQueryStep({
      entry_point: "order_change",
      fields: ["id", "status", "version", "actions.*"],
      variables: {
        filters: {
          order_id: input.order_id,
          status: [OrderChangeStatus.PENDING, OrderChangeStatus.REQUESTED],
        },
      },
      list: false,
    }).config({ name: "order-change-query" })

    removeOrderEditShippingMethodValidationStep({
      orderChange,
      input,
    })

    const dataToRemove = transform(
      { orderChange, input },
      ({ orderChange, input }) => {
        const associatedAction = (orderChange.actions ?? []).find(
          (a) => a.id === input.action_id
        ) as OrderChangeActionDTO

        return {
          actionId: associatedAction.id,
          shippingMethodId: associatedAction.reference_id,
        }
      }
    )

    parallelize(
      deleteOrderChangeActionsStep({ ids: [dataToRemove.actionId] }),
      deleteOrderShippingMethods({ ids: [dataToRemove.shippingMethodId] })
    )

    return new WorkflowResponse(previewOrderChangeStep(input.order_id))
  }
)
