import { Modules } from "@medusajs/framework/utils"
import {
  WorkflowResponse,
  createWorkflow,
} from "@medusajs/framework/workflows-sdk"
import { createEntitiesStep } from "../../common/steps/create-entities"
import {
  createOrderChangeActionsWorkflowInputSchema,
  createOrderChangeActionsWorkflowOutputSchema,
} from "../utils/schemas"

export type {
  CreateOrderChangeActionsWorkflowInput,
  CreateOrderChangeActionsWorkflowOutput,
} from "../utils/schemas"


export const createOrderChangeActionsWorkflowId = "create-order-change-actions"
/**
 * This workflow creates order change actions. It's used by other order-related workflows,
 * such as {@link requestItemReturnWorkflow} to create an order change action based on changes made to the order.
 *
 * You can use this workflow within your customizations or your own custom workflows, allowing you to wrap custom logic around
 * creating an order change action.
 *
 * @summary
 *
 * Create an order change action.
 */
export const createOrderChangeActionsWorkflow = createWorkflow(
  {
    name: createOrderChangeActionsWorkflowId,
    description: "Create order change actions",
    inputSchema: createOrderChangeActionsWorkflowInputSchema,
    outputSchema: createOrderChangeActionsWorkflowOutputSchema,
  },
  (input) => {
    const orderChangeActions = createEntitiesStep({
      moduleRegistrationName: Modules.ORDER,
      invokeMethod: "addOrderAction",
      compensateMethod: "deleteOrderChangeActions",
      data: input,
    })

    return new WorkflowResponse(orderChangeActions)
  }
)
