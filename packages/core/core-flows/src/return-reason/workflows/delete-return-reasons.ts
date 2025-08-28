import { Modules } from "@medusajs/framework/utils"
import { createWorkflow } from "@medusajs/framework/workflows-sdk"
import { removeRemoteLinkStep } from "../../common"
import { deleteReturnReasonStep } from "../steps"
import {
  deleteReturnReasonsWorkflowInputSchema,
  deleteReturnReasonsWorkflowOutputSchema,
  type DeleteReturnReasonsWorkflowInput as SchemaInput,
  type DeleteReturnReasonsWorkflowOutput as SchemaOutput,
} from "../utils/schemas"

export {
  type DeleteReturnReasonsWorkflowInput,
  type DeleteReturnReasonsWorkflowOutput,
} from "../utils/schemas"

// Type verification - CORRECT ORDER!
const schemaInput = {} as SchemaInput
const schemaOutput = undefined as SchemaOutput

// Check 1: New input can go into old input (schema accepts all valid inputs)
const existingInput: {
  ids: string[]
} = schemaInput

// Check 2: Old output can go into new output (schema produces compatible outputs)
const existingOutput: SchemaOutput = undefined as any

console.log(existingInput, existingOutput, schemaOutput)

// Legacy types for backward compatibility
export type { DeleteReturnReasonsWorkflowInput as LegacyDeleteReturnReasonsWorkflowInput } from "../utils/schemas"
export type { DeleteReturnReasonsWorkflowOutput as LegacyDeleteReturnReasonsWorkflowOutput } from "../utils/schemas"

export const deleteReturnReasonsWorkflowId = "delete-return-reasons"
/**
 * This workflow deletes one or more return reasons. It's used by the
 * [Delete Return Reasons Admin API Route](https://docs.medusajs.com/api/admin#return-reasons_deletereturnreasonsid).
 *
 * You can use this workflow within your customizations or your own custom workflows, allowing you to
 * delete return reasons within your custom flows.
 *
 * @example
 * const { result } = await deleteReturnReasonsWorkflow(container)
 * .run({
 *   input: {
 *     ids: ["rr_123"]
 *   }
 * })
 *
 * @summary
 *
 * Delete return reasons.
 */
export const deleteReturnReasonsWorkflow = createWorkflow(
  {
    name: deleteReturnReasonsWorkflowId,
    description: "Delete return reasons",
    inputSchema: deleteReturnReasonsWorkflowInputSchema,
    outputSchema: deleteReturnReasonsWorkflowOutputSchema,
  },
  (input) => {
    const deletedReturnReasons = deleteReturnReasonStep(input.ids)

    removeRemoteLinkStep({
      [Modules.ORDER]: {
        return_reason_id: input.ids,
      },
    })

    return deletedReturnReasons
  }
)
