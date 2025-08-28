import {
  FilterableTaxRateProps,
  ITaxModuleService,
  TaxRateDTO,
  UpdateTaxRateDTO,
} from "@medusajs/framework/types"
import { Modules } from "@medusajs/framework/utils"
import {
  StepResponse,
  WorkflowResponse,
  createStep,
  createWorkflow,
  transform,
} from "@medusajs/framework/workflows-sdk"
import {
  createTaxRateRulesStep,
  deleteTaxRateRulesStep,
  updateTaxRatesStep,
} from "../steps"
import {
  updateTaxRatesWorkflowInputSchema,
  updateTaxRatesWorkflowOutputSchema,
  type UpdateTaxRatesWorkflowInput as SchemaInput,
  type UpdateTaxRatesWorkflowOutput as SchemaOutput,
} from "../utils/schemas"
// import { setTaxRateRulesWorkflow } from "./set-tax-rate-rules"

export {
  type UpdateTaxRatesWorkflowInput,
  type UpdateTaxRatesWorkflowOutput,
} from "../utils/schemas"

// Type verification - CORRECT ORDER!
const _in: SchemaInput = {} as {
  selector: FilterableTaxRateProps
  update: UpdateTaxRateDTO
}
const _out: SchemaOutput = {} as TaxRateDTO[]
void _in, _out

/**
 * The data to retrieve the IDs of tax rate rules.
 */
export type MaybeListTaxRateRuleIdsStepInput = {
  /**
   * The IDs of the tax rates to retrieve their rules.
   */
  tax_rate_ids: string[]
  /**
   * The data to update in the tax rates.
   */
  update: UpdateTaxRateDTO
}

// TODO: When we figure out how to compensate nested workflows, we can use this
//
// export const maybeSetTaxRateRulesStepId = "maybe-set-tax-rate-rules"
// const maybeSetTaxRateRules = createStep(
//   maybeSetTaxRateRulesStepId,
//   async (input: StepInput, { container }) => {
//     const { update } = input
//
//     if (!update.rules) {
//       return new StepResponse([], "")
//     }
//
//     const { result, transaction } = await setTaxRateRulesWorkflow(
//       container
//     ).run({
//       input: {
//         tax_rate_ids: input.tax_rate_ids,
//         rules: update.rules,
//       },
//     })
//
//     return new StepResponse(result, transaction.transactionId)
//   },
//   async (transactionId, { container }) => {
//     if (!transactionId) {
//       return
//     }
//
//     await setTaxRateRulesWorkflow(container).cancel(transactionId)
//   }
// )

const maybeListTaxRateRuleIdsStepId = "maybe-list-tax-rate-rule-ids"
/**
 * This step lists the rules to update in a tax rate update object.
 *
 * @example
 * const data = maybeListTaxRateRuleIdsStep({
 *   tax_rate_ids: ["txr_123"],
 *   update: {
 *     code: "VAT",
 *   }
 * })
 */
export const maybeListTaxRateRuleIdsStep = createStep(
  maybeListTaxRateRuleIdsStepId,
  async (input: MaybeListTaxRateRuleIdsStepInput, { container }) => {
    const { update, tax_rate_ids } = input

    if (!update.rules) {
      return new StepResponse([])
    }

    const service = container.resolve<ITaxModuleService>(Modules.TAX)

    const rules = await service.listTaxRateRules(
      { tax_rate_id: tax_rate_ids },
      { select: ["id"] }
    )

    return new StepResponse(rules.map((r) => r.id))
  }
)

export const updateTaxRatesWorkflowId = "update-tax-rates"
/**
 * This workflow updates tax rates matching specified filters. It's used by the
 * [Update Tax Rates Admin API Route](https://docs.medusajs.com/api/admin#tax-rates_posttaxratesid).
 *
 * You can use this workflow within your own customizations or custom workflows, allowing you
 * to update tax rates in your custom flows.
 *
 * @example
 * const { result } = await updateTaxRatesWorkflow(container)
 * .run({
 *   input: {
 *     selector: {
 *       id: ["txr_123"]
 *     },
 *     update: {
 *       code: "VAT"
 *     }
 *   }
 * })
 *
 * @summary
 *
 * Update tax rates.
 */
export const updateTaxRatesWorkflow = createWorkflow(
  {
    name: updateTaxRatesWorkflowId,
    description: "Update tax rates matching specified filters",
    inputSchema: updateTaxRatesWorkflowInputSchema,
    outputSchema: updateTaxRatesWorkflowOutputSchema,
  },
  (input) => {
    const cleanedUpdateInput = transform(input, (data) => {
      // Transform clones data so we can safely modify it
      if (data.update.rules) {
        delete data.update.rules
      }

      return {
        selector: data.selector,
        update: data.update,
      }
    })

    const updatedRates = updateTaxRatesStep(cleanedUpdateInput)
    const rateIds = transform(updatedRates, (rates) => rates.map((r) => r.id))

    // TODO: Use when we figure out how to compensate nested workflows
    // maybeSetTaxRateRules({
    //   tax_rate_ids: rateIds,
    //   update: input.update,
    // })

    // COPY-PASTE from set-tax-rate-rules.ts
    const ruleIds = maybeListTaxRateRuleIdsStep({
      tax_rate_ids: rateIds,
      update: input.update,
    })

    deleteTaxRateRulesStep(ruleIds)

    const rulesWithRateId = transform(
      { update: input.update, rateIds },
      ({ update, rateIds }) => {
        if (!update.rules) {
          return []
        }

        const updatedBy = update.updated_by

        return update.rules
          .map((r) => {
            return rateIds.map((id) => {
              return {
                ...r,
                created_by: updatedBy,
                tax_rate_id: id,
              }
            })
          })
          .flat()
      }
    )

    createTaxRateRulesStep(rulesWithRateId)
    // end of COPY-PASTE from set-tax-rate-rules.ts

    return new WorkflowResponse(updatedRates)
  }
)
