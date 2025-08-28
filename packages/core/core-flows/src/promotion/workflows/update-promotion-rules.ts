import {
  UpdatePromotionRulesWorkflowDTO,
  PromotionRuleDTO,
} from "@medusajs/framework/types"
import {
  WorkflowResponse,
  createWorkflow,
} from "@medusajs/framework/workflows-sdk"
import { updatePromotionRulesStep } from "../steps"
import {
  updatePromotionRulesWorkflowInputSchema,
  updatePromotionRulesWorkflowOutputSchema,
  type UpdatePromotionRulesWorkflowInput as SchemaInput,
  type UpdatePromotionRulesWorkflowOutput as SchemaOutput,
} from "../utils/schemas"

export {
  type UpdatePromotionRulesWorkflowInput,
  type UpdatePromotionRulesWorkflowOutput,
} from "../utils/schemas"

// Type verification - CORRECT ORDER!
const schemaInput = {} as SchemaInput
const schemaOutput = {} as SchemaOutput

// Check 1: New input can go into old input (schema accepts all valid inputs)
const existingInput: UpdatePromotionRulesWorkflowDTO = schemaInput

// Check 2: Old output can go into new output (schema produces compatible outputs)
const existingOutput: SchemaOutput = {} as PromotionRuleDTO[]

console.log(existingInput, existingOutput, schemaOutput)

export const updatePromotionRulesWorkflowId = "update-promotion-rules-workflow"
/**
 * This workflow updates one or more promotion rules. It's used by other workflows,
 * such as {@link batchPromotionRulesWorkflow} that manages the rules of a promotion.
 * 
 * You can use this workflow within your own customizations or custom workflows, allowing you to
 * update promotion rules within your custom flows.
 * 
 * @example
 * const { result } = await updatePromotionRulesWorkflow(container)
 * .run({
 *   input: {
 *     data: [
 *       {
 *         id: "prule_123",
 *         attribute: "cusgrp_123",
 *       }
 *     ]
 *   }
 * })
 * 
 * @summary
 * 
 * Update one or more promotion rules.
 */
export const updatePromotionRulesWorkflow = createWorkflow(
  {
    name: updatePromotionRulesWorkflowId,
    description: "Update one or more promotion rules",
    inputSchema: updatePromotionRulesWorkflowInputSchema,
    outputSchema: updatePromotionRulesWorkflowOutputSchema,
  },
  (input) => {
    return new WorkflowResponse(updatePromotionRulesStep(input))
  }
)
