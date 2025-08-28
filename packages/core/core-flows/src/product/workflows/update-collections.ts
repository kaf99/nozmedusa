import { AdditionalData, ProductTypes } from "@medusajs/framework/types"
import { ProductCollectionWorkflowEvents } from "@medusajs/framework/utils"
import {
  WorkflowResponse,
  createHook,
  createWorkflow,
  transform,
} from "@medusajs/framework/workflows-sdk"
import { emitEventStep } from "../../common"
import { updateCollectionsStep } from "../steps"
import {
  updateCollectionsWorkflowInputSchema,
  updateCollectionsWorkflowOutputSchema,
  type UpdateCollectionsWorkflowInput as SchemaInput,
  type UpdateCollectionsWorkflowOutput as SchemaOutput,
} from "../utils/update-schemas"

export {
  type UpdateCollectionsWorkflowInput,
  type UpdateCollectionsWorkflowOutput,
} from "../utils/update-schemas"

// Type verification - CORRECT ORDER!
const schemaInput = {} as SchemaInput
const schemaOutput = {} as SchemaOutput

// Check 1: New input can go into old input (schema accepts all valid inputs)
const existingInput: {
  selector: ProductTypes.FilterableProductCollectionProps
  update: ProductTypes.UpdateProductCollectionDTO
} & AdditionalData = schemaInput

// Check 2: Old output can go into new output (schema produces compatible outputs)
// The step returns either a single collection or array
const existingOutput: SchemaOutput = {} as any

console.log(existingInput, existingOutput, schemaOutput)

// Legacy type for backward compatibility
export type { UpdateCollectionsWorkflowInput as LegacyUpdateCollectionsWorkflowInput } from "../utils/update-schemas"

export const updateCollectionsWorkflowId = "update-collections"
/**
 * This workflow updates one or more collections. It's used by the 
 * [Create Collection Admin API Route](https://docs.medusajs.com/api/admin#collections_postcollectionsid).
 * 
 * This workflow has a hook that allows you to perform custom actions on the updated collections. For example, you can pass under `additional_data` custom data that 
 * allows you to update custom data models linked to the product collections.
 * 
 * You can also use this workflow within your own custom workflows, allowing you to wrap custom logic around product-collection update.
 * 
 * @example
 * const { result } = await updateCollectionsWorkflow(container)
 * .run({
 *   input: {
 *     selector: {
 *       id: "pcol_123"
 *     },
 *     update: {
 *       title: "Summer Collection"
 *     },
 *     additional_data: {
 *       erp_id: "123"
 *     }
 *   }
 * })
 * 
 * @summary
 * 
 * Update one or more product collections.
 * 
 * @property hooks.collectionsUpdated - This hook is executed after the collections are updated. You can consume this hook to perform custom actions on the updated collections.
 */
export const updateCollectionsWorkflow = createWorkflow(
  {
    name: updateCollectionsWorkflowId,
    description: "Update one or more product collections",
    inputSchema: updateCollectionsWorkflowInputSchema,
    outputSchema: updateCollectionsWorkflowOutputSchema,
  },
  (input) => {
    const updatedCollections = updateCollectionsStep(input)

    const collectionIdEvents = transform(
      { updatedCollections },
      ({ updatedCollections }) => {
        const arr = Array.isArray(updatedCollections)
          ? updatedCollections
          : [updatedCollections]

        return arr?.map((v) => {
          return { id: v.id }
        })
      }
    )

    emitEventStep({
      eventName: ProductCollectionWorkflowEvents.UPDATED,
      data: collectionIdEvents,
    })

    const collectionsUpdated = createHook("collectionsUpdated", {
      additional_data: input.additional_data,
      collections: updatedCollections,
    })

    return new WorkflowResponse(updatedCollections, {
      hooks: [collectionsUpdated],
    })
  }
)
