import {
  WorkflowResponse,
  createWorkflow,
} from "@medusajs/framework/workflows-sdk"
import { updatePriceListsStep, validatePriceListsStep } from "../steps"
import {
  updatePriceListsWorkflowInputSchema,
  updatePriceListsWorkflowOutputSchema,
} from "../utils/schemas"

export {
  type UpdatePriceListsWorkflowInput,
  type UpdatePriceListsWorkflowOutput,

} from "../utils/schemas"

export const updatePriceListsWorkflowId = "update-price-lists"
/**
 * This workflow updates one or more price lists. It's used by the
 * [Update Price List Admin API Route](https://docs.medusajs.com/api/admin#price-lists_postpricelistsid).
 *
 * You can use this workflow within your customizations or your own custom workflows, allowing you to
 * update price lists in your custom flows.
 *
 * @example
 * const { result } = await updatePriceListsWorkflow(container)
 * .run({
 *   input: {
 *     price_lists_data: [
 *       {
 *         id: "plist_123",
 *         title: "Test Price List",
 *       }
 *     ]
 *   }
 * })
 *
 * @summary
 *
 * Update one or more price lists.
 */
export const updatePriceListsWorkflow = createWorkflow(
  {
    name: updatePriceListsWorkflowId,
    description: "Update one or more price lists",
    inputSchema: updatePriceListsWorkflowInputSchema,
    outputSchema: updatePriceListsWorkflowOutputSchema,
  },
  (input) => {
    validatePriceListsStep(input.price_lists_data)

    return new WorkflowResponse(updatePriceListsStep(input.price_lists_data))
  }
)
