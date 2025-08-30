import { Modules } from "@medusajs/framework/utils"
import {
  WorkflowResponse,
  createWorkflow,
} from "@medusajs/framework/workflows-sdk"
import { deleteEntitiesStep } from "../../common/steps/delete-entities"
import {
  deleteCartCreditLinesWorkflowInputSchema,
  deleteCartCreditLinesWorkflowOutputSchema,
} from "../utils/schemas"


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
