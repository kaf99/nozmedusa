import {
  CartCreditLineDTO,
  CreateCartCreditLinesWorkflowInput as OldCreateCartCreditLinesWorkflowInput,
} from "@medusajs/framework/types"
import { Modules } from "@medusajs/framework/utils"
import {
  WorkflowResponse,
  createWorkflow,
} from "@medusajs/framework/workflows-sdk"
import { createEntitiesStep } from "../../common/steps/create-entities"
import {
  createCartCreditLinesWorkflowInputSchema,
  createCartCreditLinesWorkflowOutputSchema,
  type CreateCartCreditLinesWorkflowInput as SchemaInput,
  type CreateCartCreditLinesWorkflowOutput as SchemaOutput,
} from "../utils/schemas"
export {
  type CreateCartCreditLinesWorkflowInput,
  type CreateCartCreditLinesWorkflowOutput,
} from "../utils/schemas"

// Type verification
const schemaInput = {} as SchemaInput
const schemaOutput = {} as SchemaOutput
const existingInput: OldCreateCartCreditLinesWorkflowInput = schemaInput
const existingOutput: CartCreditLineDTO[] = schemaOutput

// Check reverse too
const oldInput = {} as OldCreateCartCreditLinesWorkflowInput
const oldOutput = {} as CartCreditLineDTO[]
const newInput: SchemaInput = oldInput
const newOutput: SchemaOutput = oldOutput

console.log(existingInput, existingOutput, newInput, newOutput)

export const createCartCreditLinesWorkflowId = "create-cart-credit-lines"
/**
 * This workflow creates one or more credit lines for a cart.
 * 
 * @example
 * const { result } = await createCartCreditLinesWorkflow(container)
 * .run({
 *   input: {
 *     cart_id: "cart_123",
 *     amount: 10,
 *     reference: "payment",
 *     reference_id: "payment_123",
 *     metadata: {
 *       key: "value",
 *     },
 *   }
 * })
 */
export const createCartCreditLinesWorkflow = createWorkflow(
  {
    name: createCartCreditLinesWorkflowId,
    inputSchema: createCartCreditLinesWorkflowInputSchema,
    outputSchema: createCartCreditLinesWorkflowOutputSchema,
  },
  (input) => {
    const creditLines = createEntitiesStep({
      moduleRegistrationName: Modules.CART,
      invokeMethod: "createCreditLines",
      compensateMethod: "deleteCreditLines",
      data: input,
    })

    return new WorkflowResponse(creditLines)
  }
)
