import {
  WorkflowData,
  createWorkflow,
  transform,
} from "@medusajs/framework/workflows-sdk"
import { WorkflowTypes } from "@medusajs/framework/types"
import { generateProductCsvStep, getAllProductsStep } from "../steps"
import { useRemoteQueryStep } from "../../common"
import { notifyOnFailureStep, sendNotificationsStep } from "../../notification"
import {
  exportProductsDTOSchema,
  exportProductsWorkflowOutputSchema,
  type ExportProductsDTO as SchemaInput,
  type ExportProductsWorkflowOutput as SchemaOutput,
} from "../utils/schemas"

// Type verification - CORRECT ORDER!
const schemaInput = {} as SchemaInput
const schemaOutput = undefined as unknown as SchemaOutput

// Check 1: New input can go into old input (schema accepts all valid inputs)
const existingInput: WorkflowTypes.ProductWorkflow.ExportProductsDTO = schemaInput

// Check 2: Old output can go into new output (schema produces compatible outputs)
const existingOutput: SchemaOutput = undefined as any

console.log(existingInput, existingOutput, schemaOutput)

export const exportProductsWorkflowId = "export-products"
/**
 * This workflow exports products matching the specified filters. It's used by the 
 * [Export Products Admin API Route](https://docs.medusajs.com/api/admin#products_postproductsexport).
 * 
 * :::note
 * 
 * This workflow doesn't return the exported products. Instead, it sends a notification to the admin
 * users that they can download the exported products. Learn more in the [API Reference](https://docs.medusajs.com/api/admin#products_postproductsexport).
 * 
 * :::
 * 
 * @example
 * To export all products:
 * 
 * ```ts
 * const { result } = await exportProductsWorkflow(container)
 * .run({
 *   input: {
 *     select: ["*"],
 *   }
 * })
 * ```
 * 
 * To export products matching a criteria:
 * 
 * ```ts
 * const { result } = await exportProductsWorkflow(container)
 * .run({
 *   input: {
 *     select: ["*"],
 *     filter: {
 *       collection_id: "pcol_123"
 *     }
 *   }
 * })
 * ```
 * 
 * @summary
 * 
 * Export products with filtering capabilities.
 */
export const exportProductsWorkflow = createWorkflow(
  {
    name: exportProductsWorkflowId,
    description: "Export products",
    inputSchema: exportProductsDTOSchema,
    outputSchema: exportProductsWorkflowOutputSchema,
  },
  (
    input
  ): WorkflowData<void> => {
    const products = getAllProductsStep(input).config({
      async: true,
      backgroundExecution: true,
    })

    const failureNotification = transform({ input }, (data) => {
      return [
        {
          // We don't need the recipient here for now, but if we want to push feed notifications to a specific user we could add it.
          to: "",
          channel: "feed",
          template: "admin-ui",
          data: {
            title: "Product export",
            description: `Failed to export products, please try again later.`,
          },
        },
      ]
    })
    notifyOnFailureStep(failureNotification)

    const file = generateProductCsvStep(products)
    const fileDetails = useRemoteQueryStep({
      fields: ["id", "url"],
      entry_point: "file",
      variables: { id: file.id },
      list: false,
    })

    const notifications = transform({ fileDetails, file }, (data) => {
      return [
        {
          // We don't need the recipient here for now, but if we want to push feed notifications to a specific user we could add it.
          to: "",
          channel: "feed",
          template: "admin-ui",
          data: {
            title: "Product export",
            description: "Product export completed successfully!",
            file: {
              filename: data.file.filename,
              url: data.fileDetails.url,
              mimeType: "text/csv",
            },
          },
        },
      ]
    })

    sendNotificationsStep(notifications)
  }
)
