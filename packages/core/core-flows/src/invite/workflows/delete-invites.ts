import { InviteWorkflowEvents } from "@medusajs/framework/utils"
import {
  createWorkflow,
  transform,
} from "@medusajs/framework/workflows-sdk"
import { emitEventStep } from "../../common/steps/emit-event"
import { deleteInvitesStep } from "../steps"
import {
  deleteInvitesWorkflowInputSchema,
  deleteInvitesWorkflowOutputSchema,
} from "../utils/schemas"

export type {
  DeleteInvitesWorkflowInput,
  DeleteInvitesWorkflowOutput,
} from "../utils/schemas"

export const deleteInvitesWorkflowId = "delete-invites-workflow"
/**
 * This workflow deletes one or more user invites. It's used by the
 * [Delete Invites Admin API Route](https://docs.medusajs.com/api/admin#invites_deleteinvitesid).
 * 
 * You can use this workflow within your customizations or your own custom workflows, allowing you to
 * delete invites within your custom flows.
 * 
 * @example
 * const { result } = await deleteInvitesWorkflow(container)
 * .run({
 *   input: {
 *     ids: ["invite_123"]
 *   }
 * })
 * 
 * @summary
 * 
 * Delete one or more user invites.
 */
export const deleteInvitesWorkflow = createWorkflow(
  {
    name: deleteInvitesWorkflowId,
    description: "Delete one or more user invites",
    inputSchema: deleteInvitesWorkflowInputSchema,
    outputSchema: deleteInvitesWorkflowOutputSchema,
  },
  (input) => {
    deleteInvitesStep(input.ids)

    const invitesIdEvents = transform({ input }, ({ input }) => {
      return input.ids?.map((id) => {
        return { id }
      })
    })

    emitEventStep({
      eventName: InviteWorkflowEvents.DELETED,
      data: invitesIdEvents,
    })
  }
)
