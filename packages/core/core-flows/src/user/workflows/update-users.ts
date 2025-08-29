import { UserWorkflowEvents } from "@medusajs/framework/utils"
import {
  WorkflowResponse,
  createWorkflow,
  transform,
} from "@medusajs/framework/workflows-sdk"
import { emitEventStep } from "../../common/steps/emit-event"
import { updateUsersStep } from "../steps"
import {
  updateUsersWorkflowInputSchema,
  updateUsersWorkflowOutputSchema,
} from "../utils/schemas"
export {
  type UpdateUsersWorkflowInput,
  type UpdateUsersWorkflowOutput,

} from "../utils/schemas"

export const updateUsersWorkflowId = "update-users-workflow"
/**
 * This workflow updates one or more users. It's used by the
 * [Update User Admin API Route](https://docs.medusajs.com/api/admin#users_postusersid).
 *
 * You can use this workflow within your customizations or your own custom workflows, allowing you to
 * update users within your custom flows.
 *
 * @example
 * const { result } = await updateUsersWorkflow(container)
 * .run({
 *   input: {
 *     updates: [
 *       {
 *         id: "user_123",
 *         first_name: "John"
 *       }
 *     ]
 *   }
 * })
 *
 * @summary
 *
 * Update one or more users.
 */
export const updateUsersWorkflow = createWorkflow(
  {
    name: updateUsersWorkflowId,
    description: "Update one or more users",
    inputSchema: updateUsersWorkflowInputSchema,
    outputSchema: updateUsersWorkflowOutputSchema,
  },
  (input) => {
    const updatedUsers = updateUsersStep(input.updates)

    const userIdEvents = transform({ updatedUsers }, ({ updatedUsers }) => {
      const arr = Array.isArray(updatedUsers) ? updatedUsers : [updatedUsers]

      return arr?.map((user) => {
        return { id: user.id }
      })
    })

    emitEventStep({
      eventName: UserWorkflowEvents.UPDATED,
      data: userIdEvents,
    })

    return new WorkflowResponse(updatedUsers)
  }
)
