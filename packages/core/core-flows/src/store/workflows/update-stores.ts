import {
  WorkflowResponse,
  createWorkflow,
  transform,
  when,
} from "@medusajs/framework/workflows-sdk"
import { updateStoresStep } from "../steps"
import { updatePricePreferencesAsArrayStep } from "../../pricing"
import {
  updateStoresWorkflowInputSchema,
  updateStoresWorkflowOutputSchema,
} from "../utils/schemas"

// Re-export types from schemas for backward compatibility
export type { UpdateStoresWorkflowInput, UpdateStoresWorkflowOutput 
} from "../utils/schemas"

export const updateStoresWorkflowId = "update-stores"
/**
 * This workflow updates stores matching the specified filters. It's used by the
 * [Update Store Admin API Route](https://docs.medusajs.com/api/admin#stores_poststoresid).
 * 
 * You can use this workflow within your customizations or your own custom workflows, allowing you to
 * update stores within your custom flows.
 * 
 * @example
 * const { result } = await updateStoresWorkflow(container)
 * .run({
 *   input: {
 *     selector: {
 *       id: "store_123"
 *     },
 *     update: {
 *       name: "Acme"
 *     }
 *   }
 * })
 * 
 * @summary
 * 
 * Update stores.
 */
export const updateStoresWorkflow = createWorkflow(
  {
    name: updateStoresWorkflowId,
    description: "Update stores matching specified filters",
    inputSchema: updateStoresWorkflowInputSchema,
    outputSchema: updateStoresWorkflowOutputSchema,
  },
  (input) => {
    const normalizedInput = transform({ input }, (data) => {
      if (!data.input.update.supported_currencies?.length) {
        return data.input
      }

      return {
        selector: data.input.selector,
        update: {
          ...data.input.update,
          supported_currencies: data.input.update.supported_currencies.map(
            (currency) => {
              return {
                currency_code: currency.currency_code,
                is_default: currency.is_default,
              }
            }
          ),
        },
      }
    })

    const stores = updateStoresStep(normalizedInput)

    when({ input }, (data) => {
      return !!data.input.update.supported_currencies?.length
    }).then(() => {
      const upsertPricePreferences = transform({ input }, (data) => {
        return data.input.update.supported_currencies!.map((currency) => {
          return {
            attribute: "currency_code",
            value: currency.currency_code,
            is_tax_inclusive: currency.is_tax_inclusive,
          }
        })
      })

      updatePricePreferencesAsArrayStep(upsertPricePreferences)
    })

    return new WorkflowResponse(stores)
  }
)
