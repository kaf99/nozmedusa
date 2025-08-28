import {
  UpdateViewConfigurationDTO,
  ViewConfigurationDTO,
} from "@medusajs/framework/types"
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
  type UpdateViewConfigurationWorkflowInput as SchemaInput,
  type UpdateViewConfigurationWorkflowOutput as SchemaOutput,
} from "../utils/schemas"

export {
  type UpdateViewConfigurationWorkflowInput,
  type UpdateViewConfigurationWorkflowOutput,
} from "../utils/schemas"

// Type verification - CORRECT ORDER!
const schemaInput = {} as SchemaInput
const schemaOutput = {} as SchemaOutput

// Check 1: New input can go into old input (schema accepts all valid inputs)
const existingInput: {
  id: string
  set_active?: boolean
} & UpdateViewConfigurationDTO = schemaInput

// Check 2: Old output can go into new output (schema produces compatible outputs)
const existingOutput: SchemaOutput = {} as ViewConfigurationDTO

console.log(existingInput, existingOutput, schemaOutput)

// Legacy types for backward compatibility  
export type { UpdateViewConfigurationWorkflowInput as LegacyUpdateViewConfigurationWorkflowInput } from "../utils/schemas"
export type { UpdateViewConfigurationWorkflowOutput as LegacyUpdateViewConfigurationWorkflowOutput } from "../utils/schemas"

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
