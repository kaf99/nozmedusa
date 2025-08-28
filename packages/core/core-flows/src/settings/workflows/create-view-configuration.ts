import {
  CreateViewConfigurationDTO,
  ViewConfigurationDTO,
} from "@medusajs/framework/types"
import {
  WorkflowResponse,
  createWorkflow,
  when,
} from "@medusajs/framework/workflows-sdk"
import {
  createViewConfigurationStep,
  setActiveViewConfigurationStep,
} from "../steps"
import {
  createViewConfigurationWorkflowInputSchema,
  createViewConfigurationWorkflowOutputSchema,
  type CreateViewConfigurationWorkflowInput as SchemaInput,
  type CreateViewConfigurationWorkflowOutput as SchemaOutput,
} from "../utils/schemas"

export {
  type CreateViewConfigurationWorkflowInput,
  type CreateViewConfigurationWorkflowOutput,
} from "../utils/schemas"

// Type verification - CORRECT ORDER!
const _in: SchemaInput = {} as CreateViewConfigurationDTO
const _out: ViewConfigurationDTO = {} as SchemaOutput
void _in, _out

export const createViewConfigurationWorkflowId = "create-view-configuration"

export const createViewConfigurationWorkflow = createWorkflow(
  {
    name: createViewConfigurationWorkflowId,
    description: "Create view configuration",
    inputSchema: createViewConfigurationWorkflowInputSchema,
    outputSchema: createViewConfigurationWorkflowOutputSchema,
  },
  (input) => {
    const viewConfig = createViewConfigurationStep(input)

    when({ input, viewConfig }, ({ input }) => {
      return !!input.set_active && !!input.user_id
    }).then(() => {
      setActiveViewConfigurationStep({
        id: viewConfig.id,
        entity: viewConfig.entity,
        user_id: input.user_id as string,
      })
    })

    return new WorkflowResponse(viewConfig)
  }
)
