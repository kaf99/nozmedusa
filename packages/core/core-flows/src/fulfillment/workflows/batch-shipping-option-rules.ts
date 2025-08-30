import {
  createWorkflow,
  parallelize,
  transform,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk"
import {
  createShippingOptionRulesStep,
  deleteShippingOptionRulesStep,
} from "../steps"
import { updateShippingOptionRulesStep } from "../steps/update-shipping-option-rules"
import {
  batchShippingOptionRulesWorkflowInputSchema,
  batchShippingOptionRulesWorkflowOutputSchema,
} from "../utils/schemas"

export type {
  BatchShippingOptionRulesWorkflowInput,
  BatchShippingOptionRulesWorkflowOutput,
} from "../utils/schemas"

export const batchShippingOptionRulesWorkflowId = "batch-shipping-option-rules"
/**
 * This workflow manages shipping option rules allowing you to create, update, or delete them. It's used by the
 * [Manage the Rules of Shipping Option Admin API Route](https://docs.medusajs.com/api/admin#shipping-options_postshippingoptionsidrulesbatch).
 * 
 * You can use this workflow within your own customizations or custom workflows, allowing you to 
 * manage shipping option rules within your custom flows.
 * 
 * @example
 * const { result } = await batchShippingOptionRulesWorkflow(container)
 * .run({
 *   input: {
 *     create: [
 *       {
 *         attribute: "customer_group",
 *         value: "cusgrp_123",
 *         operator: "eq",
 *         shipping_option_id: "so_123"
 *       }
 *     ],
 *     update: [
 *       {
 *         id: "sor_123",
 *         operator: "in"
 *       }
 *     ],
 *     delete: ["sor_321"]
 *   }
 * })
 * 
 * @summary
 * 
 * Manage shipping option rules.
 */
export const batchShippingOptionRulesWorkflow = createWorkflow(
  {
    name: batchShippingOptionRulesWorkflowId,
    description: "Manage shipping option rules",
    inputSchema: batchShippingOptionRulesWorkflowInputSchema,
    outputSchema: batchShippingOptionRulesWorkflowOutputSchema,
  },
  (input) => {
    const actionInputs = transform({ input }, (data) => {
      const { create, update, delete: del } = data.input
      return {
        createInput: { data: create ?? [] },
        updateInput: { data: update ?? [] },
        deleteInput: { ids: del ?? [] },
      }
    })

    const [created, updated, deleted] = parallelize(
      createShippingOptionRulesStep(actionInputs.createInput),
      updateShippingOptionRulesStep(actionInputs.updateInput),
      deleteShippingOptionRulesStep(actionInputs.deleteInput)
    )

    return new WorkflowResponse(
      transform({ created, deleted, updated }, (data) => data)
    )
  }
)
