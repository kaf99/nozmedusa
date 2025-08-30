import { InviteWorkflowEvents } from "@medusajs/framework/utils"
import {
  WorkflowResponse,
  createWorkflow,
  transform,
} from "@medusajs/framework/workflows-sdk"
import { emitEventStep } from "../../common/steps/emit-event"
import { createInviteStep } from "../steps"
import {
  createInvitesWorkflowInputSchema,
  createInvitesWorkflowOutputSchema,
} from "../utils/schemas"

export type {
  CreateInvitesWorkflowInput,
  CreateInvitesWorkflowOutput,
} from "../utils/schemas"
export const createInvitesWorkflowId = "create-invite-step"
/**
 * This workflow creates one or more user invites. It's used by the
 * [Create Invite Admin API Route](https://docs.medusajs.com/api/admin#invites_postinvites).
 * 
 * You can use this workflow within your customizations or your own custom workflows, allowing you to
 * create invites within your custom flows.
 * 
 * @example
 * const { result } = await createInvitesWorkflow(container)
 * .run({
 *   input: {
 *     invites: [
 *       {
 *         email: "example@gmail.com"
 *       }
 *     ]
 *   }
 * })
 * 
 * @summary
 * 
 * Create one or more user invites.
 */
export const createInvitesWorkflow = createWorkflow(
  {
    name: createInvitesWorkflowId,
    description: "Create one or more user invites",
    inputSchema: createInvitesWorkflowInputSchema,
    outputSchema: createInvitesWorkflowOutputSchema,
  },
  (input) => {
    const createdInvites = createInviteStep(input.invites)

    const invitesIdEvents = transform(
      { createdInvites },
      ({ createdInvites }) => {
        return createdInvites.map((v) => {
          return { id: v.id }
        })
      }
    )

    emitEventStep({
      eventName: InviteWorkflowEvents.CREATED,
      data: invitesIdEvents,
    })

    return new WorkflowResponse(createdInvites)
  }
)
