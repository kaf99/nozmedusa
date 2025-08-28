import { AdditionalData, CreatePromotionDTO, PromotionDTO } from "@medusajs/framework/types"
import {
  WorkflowResponse,
  createHook,
  createWorkflow,
} from "@medusajs/framework/workflows-sdk"
import { createPromotionsStep } from "../steps"
import {
  createPromotionsWorkflowInputSchema,
  createPromotionsWorkflowOutputSchema,
  type CreatePromotionsWorkflowInput as SchemaInput,
  type CreatePromotionsWorkflowOutput as SchemaOutput,
} from "../utils/schemas"

export {
  type CreatePromotionsWorkflowInput,
  type CreatePromotionsWorkflowOutput,
} from "../utils/schemas"

// Type verification - CORRECT ORDER!
const schemaInput = {} as SchemaInput
const schemaOutput = {} as SchemaOutput

// Check 1: New input can go into old input (schema accepts all valid inputs)
const existingInput: {
  promotionsData: CreatePromotionDTO[]
} & AdditionalData = schemaInput

// Check 2: Old output can go into new output (schema produces compatible outputs)
const existingOutput: SchemaOutput = {} as PromotionDTO[]

console.log(existingInput, existingOutput, schemaOutput)

export const createPromotionsWorkflowId = "create-promotions"
/**
 * This workflow creates one or more promotions. It's used by the [Create Promotion Admin API Route](https://docs.medusajs.com/api/admin#promotions_postpromotions).
 * 
 * This workflow has a hook that allows you to perform custom actions on the created promotion. For example, you can pass under `additional_data` custom data that
 * allows you to create custom data models linked to the promotions.
 * 
 * You can also use this workflow within your customizations or your own custom workflows, allowing you to wrap custom logic around creating promotions.
 * 
 * @example
 * const { result } = await createPromotionsWorkflow(container)
 * .run({
 *   input: {
 *     promotionsData: [
 *       {
 *         code: "10OFF",
 *         type: "standard",
 *         status: "active",
 *         application_method: {
 *           type: "percentage",
 *           target_type: "items",
 *           allocation: "across",
 *           value: 10,
 *           currency_code: "usd"
 *         }
 *       }
 *     ],
 *     additional_data: {
 *       external_id: "123"
 *     }
 *   }
 * })
 * 
 * @summary
 * 
 * Create one or more promotions.
 * 
 * @property hooks.promotionsCreated - This hook is executed after the promotions are created. You can consume this hook to perform custom actions on the created promotions.
 */
export const createPromotionsWorkflow = createWorkflow(
  {
    name: createPromotionsWorkflowId,
    description: "Create one or more promotions",
    inputSchema: createPromotionsWorkflowInputSchema,
    outputSchema: createPromotionsWorkflowOutputSchema,
  },
  (input) => {
    const createdPromotions = createPromotionsStep(input.promotionsData)
    const promotionsCreated = createHook("promotionsCreated", {
      promotions: createdPromotions,
      additional_data: input.additional_data,
    })

    return new WorkflowResponse(createdPromotions, {
      hooks: [promotionsCreated],
    })
  }
)
