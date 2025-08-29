import {
  createHook,
  createWorkflow,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk"
import { deletePromotionsStep } from "../steps"
import {
  deletePromotionsWorkflowInputSchema,
  deletePromotionsWorkflowOutputSchema,
} from "../utils/schemas"

export const deletePromotionsWorkflowId = "delete-promotions"
/**
 * This workflow deletes one or more promotions. It's used by the
 * [Delete Promotions Admin API Route](https://docs.medusajs.com/api/admin#promotions_deletepromotionsid).
 *
 * You can use this workflow within your own customizations or custom workflows, allowing you to
 * delete promotions within your custom flows.
 *
 * @example
 * const { result } = await deletePromotionsWorkflow(container)
 * .run({
 *   input: {
 *     ids: ["promo_123"]
 *   }
 * })
 *
 * @summary
 *
 * Delete one or more promotions.
 */
export const deletePromotionsWorkflow = createWorkflow(
  {
    name: deletePromotionsWorkflowId,
    description: "Delete one or more promotions",
    inputSchema: deletePromotionsWorkflowInputSchema,
    outputSchema: deletePromotionsWorkflowOutputSchema,
  },
  (input) => {
    const deletedPromotions = deletePromotionsStep(input.ids)
    const promotionsDeleted = createHook("promotionsDeleted", {
      ids: input.ids,
    })

    return new WorkflowResponse(deletedPromotions, {
      hooks: [promotionsDeleted],
    })
  }
)
