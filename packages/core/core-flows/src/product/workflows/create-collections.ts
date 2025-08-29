import { ProductCollectionWorkflowEvents } from "@medusajs/framework/utils"
import {
  WorkflowResponse,
  createHook,
  createWorkflow,
  transform,
} from "@medusajs/framework/workflows-sdk"
import { emitEventStep } from "../../common"
import { createCollectionsStep } from "../steps"
import {
  createCollectionsWorkflowInputSchema,
  createCollectionsWorkflowOutputSchema,
} from "../utils/schemas"

export {
  type CreateCollectionsWorkflowInput,
  type CreateCollectionsWorkflowOutput,

} from "../utils/schemas"

export const createCollectionsWorkflowId = "create-collections"
/**
 * This workflow creates one or more collections. It's used by the
 * [Create Collection Admin API Route](https://docs.medusajs.com/api/admin#collections_postcollections).
 *
 * This workflow has a hook that allows you to perform custom actions on the created collections. For example, you can pass under `additional_data` custom data that
 * allows you to create custom data models linked to the product collections.
 *
 * You can also use this workflow within your own custom workflows, allowing you to wrap custom logic around product-collection creation.
 *
 * @example
 * const { result } = await createCollectionsWorkflow(container)
 * .run({
 *   input: {
 *     collections: [
 *       {
 *         title: "Summer Clothing"
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
 * Create one or more product collections.
 *
 * @property hooks.collectionsCreated - This hook is executed after the collections are created. You can consume this hook to perform custom actions on the created collections.
 */
export const createCollectionsWorkflow = createWorkflow(
  {
    name: createCollectionsWorkflowId,
    description: "Create one or more product collections",
    inputSchema: createCollectionsWorkflowInputSchema,
    outputSchema: createCollectionsWorkflowOutputSchema,
  },
  (input) => {
    const collections = createCollectionsStep(input.collections)

    const collectionIdEvents = transform({ collections }, ({ collections }) => {
      return collections.map((v) => {
        return { id: v.id }
      })
    })

    emitEventStep({
      eventName: ProductCollectionWorkflowEvents.CREATED,
      data: collectionIdEvents,
    })

    const collectionsCreated = createHook("collectionsCreated", {
      collections,
      additional_data: input.additional_data,
    })

    return new WorkflowResponse(collections, {
      hooks: [collectionsCreated],
    })
  }
)
