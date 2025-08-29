import {
  WorkflowResponse,
  createWorkflow,
} from "@medusajs/framework/workflows-sdk"
import { createReturnReasonsStep } from "../steps"
import {
  createReturnReasonsWorkflowInputSchema,
  createReturnReasonsWorkflowOutputSchema,
} from "../utils/schemas"

export {
  type CreateReturnReasonsWorkflowInput,
  type CreateReturnReasonsWorkflowOutput,

} from "../utils/schemas"

export const createReturnReasonsWorkflowId = "create-return-reasons"
/**
 * This workflow creates one or more return reasons. It's used by the
 * [Create Return Reason Admin API Route](https://docs.medusajs.com/api/admin#return-reasons_postreturnreasons).
 *
 * You can use this workflow within your customizations or your own custom workflows, allowing you to
 * create return reasons within your custom flows.
 *
 * @example
 * const { result } = await createReturnReasonsWorkflow(container)
 * .run({
 *   input: {
 *     data: [
 *       {
 *         label: "Damaged",
 *         value: "damaged",
 *       }
 *     ]
 *   }
 * })
 *
 * @summary
 *
 * Create return reasons.
 */
export const createReturnReasonsWorkflow = createWorkflow(
  {
    name: createReturnReasonsWorkflowId,
    description: "Create return reasons",
    inputSchema: createReturnReasonsWorkflowInputSchema,
    outputSchema: createReturnReasonsWorkflowOutputSchema,
  },
  (input) => {
    return new WorkflowResponse(createReturnReasonsStep(input.data))
  }
)
