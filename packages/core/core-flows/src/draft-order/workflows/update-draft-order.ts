import { Modules, OrderWorkflowEvents } from "@medusajs/framework/utils"
import {
  createStep,
  createWorkflow,
  StepResponse,
  transform,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk"
import {
  IOrderModuleService,
  OrderDTO,
  RegisterOrderChangeDTO,
  UpdateOrderDTO,
} from "@medusajs/types"
import { emitEventStep, useRemoteQueryStep } from "../../common"
import { previewOrderChangeStep, registerOrderChangesStep } from "../../order"
import { validateDraftOrderStep } from "../steps/validate-draft-order"
import {
  updateDraftOrderWorkflowInputSchema,
  updateDraftOrderWorkflowOutputSchema,
  type UpdateDraftOrderWorkflowInput,
  type UpdateDraftOrderWorkflowOutput,
} from "../utils/schemas"

updateDraftOrderWorkflowInputSchema._def satisfies import("zod").ZodTypeDef
updateDraftOrderWorkflowOutputSchema._def satisfies import("zod").ZodTypeDef

export const updateDraftOrderWorkflowId = "update-draft-order"

/**
 * The input for the update draft order step.
 */
export interface UpdateDraftOrderStepInput {
  /**
   * The draft order to update.
   */
  order: OrderDTO
  /**
   * The details to update in the draft order.
   */
  input: UpdateOrderDTO
}

/**
 * This step updates a draft order's details.
 * 
 * :::note
 * 
 * You can retrieve a draft order's details using [Query](https://docs.medusajs.com/learn/fundamentals/module-links/query),
 * or [useQueryGraphStep](https://docs.medusajs.com/resources/references/medusa-workflows/steps/useQueryGraphStep).
 * 
 * :::
 * 
 * @example
 * const data = updateDraftOrderStep({
 *   order: {
 *     id: "order_123",
 *     // other order details...
 *   },
 *   input: {
 *     // details to update...
 *   }
 * })
 */
export const updateDraftOrderStep = createStep(
  "update-draft-order",
  async ({ order, input }: UpdateDraftOrderStepInput, { container }) => {
    const service = container.resolve<IOrderModuleService>(Modules.ORDER)

    const updatedOrders = await service.updateOrders([
      {
        id: order.id,
        ...input,
      },
    ])

    const updatedOrder = updatedOrders[0]

    return new StepResponse(updatedOrder, order)
  },
  async function (prevData, { container }) {
    if (!prevData) {
      return
    }

    const service = container.resolve<IOrderModuleService>(Modules.ORDER)

    await service.updateOrders([prevData as UpdateOrderDTO])
  }
)

/**
 * This workflow updates a draft order's details. It's used by the
 * [Update Draft Order Admin API Route](https://docs.medusajs.com/api/admin#draft-orders_postdraftordersid).
 * 
 * This workflow doesn't update the draft order's items, shipping methods, or promotions. Instead, you have to 
 * create a draft order edit using {@link beginDraftOrderEditWorkflow} and make updates in the draft order edit.
 * Then, you can confirm the draft order edit using {@link confirmDraftOrderEditWorkflow} or request a draft order edit
 * using {@link requestDraftOrderEditWorkflow}.
 * 
 * You can use this workflow within your customizations or your own custom workflows, allowing you to wrap custom logic around
 * updating a draft order.
 * 
 * @example
 * const { result } = await updateDraftOrderWorkflow(container)
 * .run({
 *   input: {
 *     id: "order_123",
 *     user_id: "user_123",
 *     customer_id: "cus_123",
 *   }
 * })
 * 
 * @summary
 * 
 * Update a draft order's details.
 */
export const updateDraftOrderWorkflow = createWorkflow(
  {
    name: updateDraftOrderWorkflowId,
    inputSchema: updateDraftOrderWorkflowInputSchema,
    outputSchema: updateDraftOrderWorkflowOutputSchema,
    description: "Update a draft order's details",
  },
  function (
    input: UpdateDraftOrderWorkflowInput
  ): WorkflowResponse<UpdateDraftOrderWorkflowOutput> {
    const order = useRemoteQueryStep({
      entry_point: "orders",
      fields: [
        "id",
        "customer_id",
        "status",
        "is_draft_order",
        "sales_channel_id",
        "email",
        "customer_id",
        "shipping_address.*",
        "billing_address.*",
        "metadata",
      ],
      variables: {
        id: input.order_id,
      },
      list: false,
      throw_if_key_not_found: true,
    }).config({ name: "order-query" })

    validateDraftOrderStep({ order })

    const updateInput = transform(
      { input, order },
      ({
        input,
        order,
      }: {
        input: UpdateDraftOrderWorkflowInput
        order: OrderDTO
      }) => {
        const update: UpdateOrderDTO = {}

        if (input.shipping_address) {
          const address = {
            ...order.shipping_address,
            ...input.shipping_address,
          }
          delete address.id
          update.shipping_address = address
        }

        if (input.billing_address) {
          const address = {
            ...order.billing_address,
            ...input.billing_address,
          }
          delete address.id
          update.billing_address = address
        }

        const { order_id, ...restInput } = input
        return { ...restInput, ...update }
      }
    )

    const updateStepInput = transform(
      { order, updateInput },
      ({ order, updateInput }) => ({
        order,
        input: updateInput,
      })
    )

    const updatedOrder = updateDraftOrderStep(updateStepInput)

    const orderChangeInput = transform(
      { input, updatedOrder, order },
      ({ input, updatedOrder, order }) => {
        const changes: RegisterOrderChangeDTO[] = []

        if (input.shipping_address) {
          changes.push({
            change_type: "update_order" as const,
            order_id: input.order_id,
            created_by: undefined,
            confirmed_by: undefined,
            details: {
              type: "shipping_address",
              old: order.shipping_address,
              new: updatedOrder.shipping_address,
            },
          })
        }

        if (input.billing_address) {
          changes.push({
            change_type: "update_order" as const,
            order_id: input.order_id,
            created_by: undefined,
            confirmed_by: undefined,
            details: {
              type: "billing_address",
              old: order.billing_address,
              new: updatedOrder.billing_address,
            },
          })
        }

        if (input.customer_id) {
          changes.push({
            change_type: "update_order" as const,
            order_id: input.order_id,
            created_by: undefined,
            confirmed_by: undefined,
            details: {
              type: "customer_id",
              old: order.customer_id,
              new: updatedOrder.customer_id,
            },
          })
        }

        if (input.email) {
          changes.push({
            change_type: "update_order" as const,
            order_id: input.order_id,
            created_by: undefined,
            confirmed_by: undefined,
            details: {
              type: "email",
              old: order.email,
              new: updatedOrder.email,
            },
          })
        }

        if (input.sales_channel_id) {
          changes.push({
            change_type: "update_order" as const,
            order_id: input.order_id,
            created_by: undefined,
            confirmed_by: undefined,
            details: {
              type: "sales_channel_id",
              old: order.sales_channel_id,
              new: updatedOrder.sales_channel_id,
            },
          })
        }

        if (input.metadata) {
          changes.push({
            change_type: "update_order" as const,
            order_id: input.order_id,
            created_by: undefined,
            confirmed_by: undefined,
            details: {
              type: "metadata",
              old: order.metadata,
              new: updatedOrder.metadata,
            },
          })
        }

        return changes
      }
    )

    registerOrderChangesStep(orderChangeInput)

    emitEventStep({
      eventName: OrderWorkflowEvents.UPDATED,
      data: { id: input.order_id },
    })

    const preview = previewOrderChangeStep(input.order_id)

    return new WorkflowResponse(preview)
  }
)
