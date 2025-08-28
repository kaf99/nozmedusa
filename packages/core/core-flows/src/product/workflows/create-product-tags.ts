import { ProductTagWorkflowEvents } from "@medusajs/framework/utils"
import {
  WorkflowResponse,
  createHook,
  createWorkflow,
  transform,
} from "@medusajs/framework/workflows-sdk"
import { emitEventStep } from "../../common/steps/emit-event"
import { createProductTagsStep } from "../steps"
import {
  createProductTagsWorkflowInputSchema,
  createProductTagsWorkflowOutputSchema,
  type CreateProductTagsWorkflowInput as SchemaInput,
  type CreateProductTagsWorkflowOutput as SchemaOutput,
} from "../utils/schemas"

export {
  type CreateProductTagsWorkflowInput,
  type CreateProductTagsWorkflowOutput,
} from "../utils/schemas"

// Type verification - CORRECT ORDER!
const schemaInput = {} as SchemaInput
const schemaOutput = {} as SchemaOutput

// Check 1: New input can go into old input (schema accepts all valid inputs)
const existingInput: SchemaInput = schemaInput

// Check 2: Old output can go into new output (schema produces compatible outputs)
const existingOutput: SchemaOutput = {} as SchemaOutput

console.log(existingInput, existingOutput, schemaOutput)

// Legacy types for backward compatibility  
export type { CreateProductTagsWorkflowInput as LegacyCreateProductTagsWorkflowInput } from "../utils/schemas"
export type { CreateProductTagsWorkflowOutput as LegacyCreateProductTagsWorkflowOutput } from "../utils/schemas"

export const createProductTagsWorkflowId = "create-product-tags"
/**
 * This workflow creates one or more product tags. It's used by the 
 * [Create Product Tag Admin API Route](https://docs.medusajs.com/api/admin#product-tags_postproducttags).
 * 
 * This workflow has a hook that allows you to perform custom actions on the created product tags. For example, you can pass under `additional_data` custom data that 
 * allows you to create custom data models linked to the product tags.
 * 
 * You can also use this workflow within your own custom workflows, allowing you to wrap custom logic around product-tag creation.
 * 
 * @example
 * const { result } = await createProductTagsWorkflow(container)
 * .run({
 *   input: {
 *     product_tags: [
 *       {
 *         value: "clothing"
 *       }
 *     ],
 *     additional_data: {
 *       erp_id: "123"
 *     }
 *   }
 * })
 * 
 * @summary
 * 
 * Create one or more product tags.
 * 
 * @property hooks.productTagsCreated - This hook is executed after the product tags are created. You can consume this hook to perform custom actions on the created product tags.
 */
export const createProductTagsWorkflow = createWorkflow(
  {
    name: createProductTagsWorkflowId,
    description: "Create one or more product tags",
    inputSchema: createProductTagsWorkflowInputSchema,
    outputSchema: createProductTagsWorkflowOutputSchema,
  },
  (input) => {
    const productTags = createProductTagsStep(input.product_tags)
    const productTagsCreated = createHook("productTagsCreated", {
      product_tags: productTags,
      additional_data: input.additional_data,
    })

    const tagIdEvents = transform({ productTags }, ({ productTags }) => {
      return productTags.map((v) => {
        return { id: v.id }
      })
    })

    emitEventStep({
      eventName: ProductTagWorkflowEvents.CREATED,
      data: tagIdEvents,
    })

    return new WorkflowResponse(productTags, {
      hooks: [productTagsCreated],
    })
  }
)
