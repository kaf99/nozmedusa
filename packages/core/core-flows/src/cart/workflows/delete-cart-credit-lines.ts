import { Modules } from "@medusajs/framework/utils"
import {
  WorkflowResponse,
  createWorkflow,
} from "@medusajs/framework/workflows-sdk"
import { deleteEntitiesStep } from "../../common/steps/delete-entities"
import {
  deleteCartCreditLinesWorkflowInputSchema,
  deleteCartCreditLinesWorkflowOutputSchema,
  type DeleteCartCreditLinesWorkflowInput as SchemaInput,
  type DeleteCartCreditLinesWorkflowOutput as SchemaOutput,
} from "../utils/schemas"
export {
  type DeleteCartCreditLinesWorkflowInput,
  type DeleteCartCreditLinesWorkflowOutput,
} from "../utils/schemas"

// Type verification
type OldDeleteCartCreditLinesWorkflowInput = {
  /**
   * The IDs of the credit lines to delete.
   */ 
  id: string[]
}

const schemaInput = {} as SchemaInput
const schemaOutput = undefined as SchemaOutput
const existingInput: OldDeleteCartCreditLinesWorkflowInput = schemaInput
const existingOutput: void = schemaOutput

// Check reverse too
const oldInput = {} as OldDeleteCartCreditLinesWorkflowInput
const oldOutput = undefined as void
const newInput: SchemaInput = oldInput
const newOutput: SchemaOutput = oldOutput

console.log(existingInput, existingOutput, newInput, newOutput)

export const deleteCartCreditLinesWorkflowId = "delete-cart-credit-lines"
/**
 * This workflow deletes one or more credit lines from a cart.
 */
export const deleteCartCreditLinesWorkflow = createWorkflow(
  {
    name: deleteCartCreditLinesWorkflowId,
    inputSchema: deleteCartCreditLinesWorkflowInputSchema,
    outputSchema: deleteCartCreditLinesWorkflowOutputSchema,
  },
  (input) => {
    deleteEntitiesStep({
      moduleRegistrationName: Modules.CART,
      invokeMethod: "softDeleteCreditLines",
      compensateMethod: "restoreCreditLines",
      data: input.id,
    })

    return new WorkflowResponse(void 0)
  }
)
