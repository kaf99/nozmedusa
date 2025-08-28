import {
  OrderChangeDTO,
  UpdateOrderChangeActionDTO,
} from "@medusajs/framework/types"
import {
  WorkflowResponse,
  createWorkflow,
} from "@medusajs/framework/workflows-sdk"
import { updateOrderChangesStep } from "../steps"
import {
  updateOrderChangesWorkflowInputSchema,
  updateOrderChangesWorkflowOutputSchema,
  type UpdateOrderChangesWorkflowInput as SchemaInput,
  type UpdateOrderChangesWorkflowOutput as SchemaOutput,
} from "../utils/schemas"

const _inputSchemaCheck: UpdateOrderChangeActionDTO[] = {} as SchemaInput
const _outputSchemaCheck: SchemaOutput = {} as OrderChangeDTO[]

void _inputSchemaCheck
void _outputSchemaCheck

export const updateOrderChangesWorkflowId = "update-order-change"

/**
 * This workflow updates one or more order changes.
 *
 * You can use this workflow within your customizations or your own custom workflows, allowing you to wrap custom logic around
 * updating order changes.
 *
 * @summary
 *
 * Update one or more order changes.
 */
export const updateOrderChangesWorkflow = createWorkflow(
  {
    name: updateOrderChangesWorkflowId,
    description: "Update one or more order changes",
    inputSchema: updateOrderChangesWorkflowInputSchema,
    outputSchema: updateOrderChangesWorkflowOutputSchema,
  },
  (input: UpdateOrderChangeActionDTO[]): WorkflowResponse<OrderChangeDTO[]> => {
    return new WorkflowResponse(updateOrderChangesStep(input))
  }
)
