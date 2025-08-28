import {
  BatchWorkflowInput,
  BatchWorkflowOutput,
  CreatePromotionRuleDTO,
  PromotionRuleDTO,
  UpdatePromotionRuleDTO,
} from "@medusajs/framework/types"
import {
  WorkflowResponse,
  createWorkflow,
  parallelize,
  transform,
} from "@medusajs/framework/workflows-sdk"
import { deletePromotionRulesWorkflowStep } from "../steps/delete-promotion-rules-workflow"
import { createPromotionRulesWorkflow } from "./create-promotion-rules"
import { updatePromotionRulesWorkflow } from "./update-promotion-rules"
import {
  batchPromotionRulesWorkflowInputSchema,
  batchPromotionRulesWorkflowOutputSchema,
  type BatchPromotionRulesWorkflowInput as SchemaInput,
  type BatchPromotionRulesWorkflowOutput as SchemaOutput,
} from "../utils/schemas"

export {
  type BatchPromotionRulesWorkflowInput,
  type BatchPromotionRulesWorkflowOutput,
} from "../utils/schemas"

// Type verification - CORRECT ORDER!
const schemaInput = {} as SchemaInput
const schemaOutput = {} as SchemaOutput

// Check 1: New input can go into old input (schema accepts all valid inputs)
const existingInput: BatchWorkflowInput<
  CreatePromotionRuleDTO,
  UpdatePromotionRuleDTO
> & {
  id: string
  rule_type: "buy_rules" | "target_rules" | "rules"
} = schemaInput

// Check 2: Old output can go into new output (schema produces compatible outputs)
const existingOutput: SchemaOutput = {} as BatchWorkflowOutput<PromotionRuleDTO>

console.log(existingInput, existingOutput, schemaOutput)

export const batchPromotionRulesWorkflowId = "batch-promotion-rules"
/**
 * This workflow manages a promotion's rules. It's used by the
 * [Manage Promotion Rules Admin API Route](https://docs.medusajs.com/api/admin#promotions_postpromotionsidrulesbatch),
 * [Manage Promotion Buy Rules Admin API Route](https://docs.medusajs.com/api/admin#promotions_postpromotionsidbuyrulesbatch),
 * and [Manage Promotion Target Rules Admin API Route](https://docs.medusajs.com/api/admin#promotions_postpromotionsidtargetrulesbatch).
 *
 * You can use this workflow within your own customizations or custom workflows, allowing you to
 * manage promotion rules within your custom flows.
 *
 * @example
 * const { result } = await batchPromotionRulesWorkflow(container)
 * .run({
 *   input: {
 *     id: "promo_123",
 *     // import { RuleType } from "@medusajs/framework/utils"
 *     rule_type: RuleType.RULES,
 *     create: [
 *       {
 *         attribute: "cusgrp_123",
 *         operator: "eq",
 *         values: ["cusgrp_123"],
 *       }
 *     ],
 *     update: [
 *       {
 *         id: "prule_123",
 *         attribute: "cusgrp_123"
 *       }
 *     ],
 *     delete: ["prule_123"]
 *   }
 * })
 *
 * @summary
 *
 * Manage the rules of a promotion.
 */
export const batchPromotionRulesWorkflow = createWorkflow(
  {
    name: batchPromotionRulesWorkflowId,
    description: "Manage the rules of a promotion",
    inputSchema: batchPromotionRulesWorkflowInputSchema,
    outputSchema: batchPromotionRulesWorkflowOutputSchema,
  },
  (input) => {
    const createInput = transform({ input }, (data) => ({
      rule_type: data.input.rule_type,
      data: { id: data.input.id, rules: data.input.create ?? [] },
    }))

    const updateInput = transform({ input }, (data) => ({
      data: data.input.update ?? [],
    }))

    const deleteInput = transform({ input }, (data) => ({
      rule_type: data.input.rule_type,
      data: { id: data.input.id, rule_ids: data.input.delete ?? [] },
    }))

    const [created, updated, deleted] = parallelize(
      createPromotionRulesWorkflow.runAsStep({
        input: createInput,
      }),
      updatePromotionRulesWorkflow.runAsStep({
        input: updateInput,
      }),
      deletePromotionRulesWorkflowStep(deleteInput)
    )

    return new WorkflowResponse(
      transform({ created, updated, deleted }, (data) => data)
    )
  }
)
