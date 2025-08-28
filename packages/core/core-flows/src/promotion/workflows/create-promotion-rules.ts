import {
  AddPromotionRulesWorkflowDTO,
  PromotionRuleDTO,
} from "@medusajs/framework/types"
import {
  WorkflowResponse,
  createWorkflow,
} from "@medusajs/framework/workflows-sdk"
import { addRulesToPromotionsStep } from "../steps"
import {
  createPromotionRulesWorkflowInputSchema,
  createPromotionRulesWorkflowOutputSchema,
  type CreatePromotionRulesWorkflowInput as SchemaInput,
  type CreatePromotionRulesWorkflowOutput as SchemaOutput,
} from "../utils/schemas"

export {
  type CreatePromotionRulesWorkflowInput,
  type CreatePromotionRulesWorkflowOutput,
} from "../utils/schemas"

// Type verification - CORRECT ORDER!
const schemaInput = {} as SchemaInput
const schemaOutput = {} as SchemaOutput

// Check 1: New input can go into old input (schema accepts all valid inputs)
const existingInput: AddPromotionRulesWorkflowDTO = schemaInput

// Check 2: Old output can go into new output (schema produces compatible outputs)
const existingOutput: SchemaOutput = {} as PromotionRuleDTO[]

console.log(existingInput, existingOutput, schemaOutput)

export const createPromotionRulesWorkflowId = "create-promotion-rules-workflow"
/**
 * This workflow creates one or more promotion rules. It's used by other workflows,
 * such as {@link batchPromotionRulesWorkflow} that manages the rules of a promotion.
 * 
 * You can use this workflow within your own customizations or custom workflows, allowing you to
 * create promotion rules within your custom flows.
 * 
 * @example
 * const { result } = await createPromotionRulesWorkflow(container)
 * .run({
 *   input: {
 *     // import { RuleType } from "@medusajs/framework/utils"
 *     rule_type: RuleType.RULES,
 *     data: {
 *       id: "promo_123",
 *       rules: [
 *         {
 *           attribute: "cusgrp_123",
 *           operator: "eq",
 *           values: ["cusgrp_123"],
 *         }
 *       ],
 *     }
 *   }
 * })
 * 
 * @summary
 * 
 * Create one or more promotion rules.
 */
export const createPromotionRulesWorkflow = createWorkflow(
  {
    name: createPromotionRulesWorkflowId,
    description: "Create one or more promotion rules",
    inputSchema: createPromotionRulesWorkflowInputSchema,
    outputSchema: createPromotionRulesWorkflowOutputSchema,
  },
  (input) => {
    return new WorkflowResponse(addRulesToPromotionsStep(input))
  }
)
