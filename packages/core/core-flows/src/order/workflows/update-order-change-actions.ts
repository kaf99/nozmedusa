import {
  OrderChangeActionDTO,
  UpdateOrderChangeActionDTO,
} from "@medusajs/framework/types"
import {
  WorkflowResponse,
  createWorkflow,
} from "@medusajs/framework/workflows-sdk"
import { updateOrderChangeActionsStep } from "../steps"
import {
  updateOrderChangeActionsWorkflowInputSchema,
  updateOrderChangeActionsWorkflowOutputSchema,
  type UpdateOrderChangeActionsWorkflowInput as SchemaInput,
  type UpdateOrderChangeActionsWorkflowOutput as SchemaOutput,
} from "../utils/schemas"

export {
  type UpdateOrderChangeActionsWorkflowInput,
  type UpdateOrderChangeActionsWorkflowOutput,
} from "../utils/schemas"

// Type verification - CORRECT ORDER!
const _in: SchemaInput = {} as UpdateOrderChangeActionDTO[]
const _inRev: UpdateOrderChangeActionDTO[] = {} as SchemaInput
const _out: OrderChangeActionDTO[] = {} as SchemaOutput
const _outRev: SchemaOutput = {} as OrderChangeActionDTO[]
void _in, _out, _outRev, _inRev

export const updateOrderChangeActionsWorkflowId = "update-order-change-actions"
/**
 * This workflow updates one or more order change actions.
 *
 * You can use this workflow within your customizations or your own custom workflows, allowing you to wrap custom logic around
 * updating order change actions.
 *
 * @summary
 *
 * Update one or more order change actions.
 */
export const updateOrderChangeActionsWorkflow = createWorkflow(
  {
    name: updateOrderChangeActionsWorkflowId,
    description: "Update one or more order change actions",
    inputSchema: updateOrderChangeActionsWorkflowInputSchema,
    outputSchema: updateOrderChangeActionsWorkflowOutputSchema,
  },
  (input) => {
    return new WorkflowResponse(updateOrderChangeActionsStep(input))
  }
)
