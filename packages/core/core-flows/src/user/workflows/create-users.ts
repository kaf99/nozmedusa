import { UserWorkflowEvents } from "@medusajs/framework/utils"
import {
  WorkflowData,
  WorkflowResponse,
  createWorkflow,
  transform,
} from "@medusajs/framework/workflows-sdk"
import { emitEventStep } from "../../common/steps/emit-event"
import { createUsersStep } from "../steps"
import {
  createUsersWorkflowInputSchema,
  createUsersWorkflowOutputSchema,
  type CreateUsersWorkflowInput,
  type CreateUsersWorkflowOutput,
} from "../utils/schemas"

export const createUsersWorkflowId = "create-users-workflow"
/**
 * This workflow creates one or more users. It's used by other workflows, such
 * as {@link acceptInviteWorkflow} to create a user for an invite.
 * 
 * You can attach an auth identity to each user to allow the user to log in using the 
 * {@link setAuthAppMetadataStep}. Learn more about auth identities in
 * [this documentation](https://docs.medusajs.com/resources/commerce-modules/auth/auth-identity-and-actor-types).
 * 
 * You can use this workflow within your customizations or your own custom workflows, allowing you to 
 * create users within your custom flows.
 * 
 * @example
 * const { result } = await createUsersWorkflow(container)
 * .run({
 *   input: {
 *     users: [{
 *       email: "example@gmail.com",
 *       first_name: "John",
 *       last_name: "Doe",
 *     }]
 *   }
 * })
 * 
 * @summary
 * 
 * Create one or more users.
 */
export const createUsersWorkflow = createWorkflow(
  {
    name: createUsersWorkflowId,
    description: "Create one or more users",
    inputSchema: createUsersWorkflowInputSchema,
    outputSchema: createUsersWorkflowOutputSchema,
  },
  (
    input: WorkflowData<CreateUsersWorkflowInput>
  ): WorkflowResponse<CreateUsersWorkflowOutput> => {
    const createdUsers = createUsersStep(input.users)

    const userIdEvents = transform({ createdUsers }, ({ createdUsers }) => {
      return createdUsers.map((v) => {
        return { id: v.id }
      })
    })

    emitEventStep({
      eventName: UserWorkflowEvents.CREATED,
      data: userIdEvents,
    })

    return new WorkflowResponse(createdUsers)
  }
)
