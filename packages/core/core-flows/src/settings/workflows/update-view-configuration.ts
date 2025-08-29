import {
  WorkflowResponse,
  createWorkflow,
  when,
  transform,
} from "@medusajs/framework/workflows-sdk"
import {
  updateViewConfigurationStep,
  setActiveViewConfigurationStep,
} from "../steps"
import {
  updateViewConfigurationWorkflowInputSchema,
  updateViewConfigurationWorkflowOutputSchema,
} from "../utils/schemas"

export {
  type UpdateViewConfigurationWorkflowInput,
  type UpdateViewConfigurationWorkflowOutput,

} from "../utils/schemas"

export const updateViewConfigurationWorkflowId = "update-view-configuration"

export const updateViewConfigurationWorkflow = createWorkflow(
  {
    name: updateViewConfigurationWorkflowId,
    description: "Update view configuration",
    inputSchema: updateViewConfigurationWorkflowInputSchema,
    outputSchema: updateViewConfigurationWorkflowOutputSchema,
  },
  (input) => {
    const updateData = transform({ input }, ({ input }) => {
      const { id, set_active, ...data } = input
      return data
    })

    const viewConfig = updateViewConfigurationStep({
      id: input.id,
      data: updateData,
    })

    when({ input, viewConfig }, ({ input, viewConfig }) => {
      return !!input.set_active && !!viewConfig.user_id
    }).then(() => {
      setActiveViewConfigurationStep({
        id: viewConfig.id,
        entity: viewConfig.entity,
        user_id: viewConfig.user_id as string,
      })
    })

    return new WorkflowResponse(viewConfig)
  }
)
