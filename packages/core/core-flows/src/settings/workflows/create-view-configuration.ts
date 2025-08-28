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
const schemaInput = {} as SchemaInput
const schemaOutput = {} as SchemaOutput

// Check 1: New input can go into old input (schema accepts all valid inputs)
const existingInput: CreateViewConfigurationDTO & {
  set_active?: boolean
} = schemaInput

// Check 2: Old output can go into new output (schema produces compatible outputs)
const existingOutput: SchemaOutput = {} as ViewConfigurationDTO

console.log(existingInput, existingOutput, schemaOutput)

// Legacy types for backward compatibility  
export type { CreateViewConfigurationWorkflowInput as LegacyCreateViewConfigurationWorkflowInput } from "../utils/schemas"
export type { CreateViewConfigurationWorkflowOutput as LegacyCreateViewConfigurationWorkflowOutput } from "../utils/schemas"

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
