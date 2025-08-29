import { Modules, UserWorkflowEvents } from "@medusajs/framework/utils"
import {
  createWorkflow,
  parallelize,
  transform,
} from "@medusajs/framework/workflows-sdk"
import { emitEventStep, removeRemoteLinkStep } from "../../common"
import { deleteUsersStep } from "../steps"
import {
  deleteUsersWorkflowInputSchema,
  deleteUsersWorkflowOutputSchema,
} from "../utils/schemas"

export {
  type DeleteUsersWorkflowInput,
  type DeleteUsersWorkflowOutput,

} from "../utils/schemas"

export const deleteUsersWorkflowId = "delete-user"
/**
 * This workflow deletes one or more users. It's used by other workflows
 * like {@link removeUserAccountWorkflow}. If you use this workflow directly,
 * you must also remove the association to the auth identity using the
 * {@link setAuthAppMetadataStep}. Learn more about auth identities in
 * [this documentation](https://docs.medusajs.com/resources/commerce-modules/auth/auth-identity-and-actor-types).
 *
 * You can use this workflow within your customizations or your own custom workflows, allowing you to
 * delete users within your custom flows.
 *
 * @example
 * const { result } = await deleteUsersWorkflow(container)
 * .run({
 *   input: {
 *     ids: ["user_123"]
 *   }
 * })
 *
 * @summary
 *
 * Delete one or more users.
 */
export const deleteUsersWorkflow = createWorkflow(
  {
    name: deleteUsersWorkflowId,
    description: "Delete one or more users",
    inputSchema: deleteUsersWorkflowInputSchema,
    outputSchema: deleteUsersWorkflowOutputSchema,
  },
  (input) => {
    deleteUsersStep(input.ids)

    const userIdEvents = transform({ input }, ({ input }) => {
      return input.ids?.map((id) => {
        return { id }
      })
    })

    parallelize(
      removeRemoteLinkStep({
        [Modules.USER]: {
          user_id: input.ids,
        },
      }),
      emitEventStep({
        eventName: UserWorkflowEvents.DELETED,
        data: userIdEvents,
      })
    )
  }
)
