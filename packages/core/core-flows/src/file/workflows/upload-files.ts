import { FileDTO } from "@medusajs/framework/types"
import {
  WorkflowResponse,
  createWorkflow,
} from "@medusajs/framework/workflows-sdk"
import { uploadFilesStep } from "../steps"
import {
  uploadFilesWorkflowInputSchema,
  uploadFilesWorkflowOutputSchema,
  type UploadFilesWorkflowInput as SchemaInput,
  type UploadFilesWorkflowOutput as SchemaOutput,
} from "../utils/schemas"

export {
  type UploadFilesWorkflowInput,
  type UploadFilesWorkflowOutput,
} from "../utils/schemas"

// Type verification - CORRECT ORDER!
const schemaInput = {} as SchemaInput
const schemaOutput = {} as SchemaOutput

// Check 1: New input can go into old input (schema accepts all valid inputs)
const existingInput: {
  files: {
    filename: string
    mimeType: string
    content: string
    access: "public" | "private"
  }[]
} = schemaInput

// Check 2: Old output can go into new output (schema produces compatible outputs)
const existingOutput: SchemaOutput = {} as FileDTO[]

console.log(existingInput, existingOutput, schemaOutput)

export const uploadFilesWorkflowId = "upload-files"
/**
 * This workflow uploads one or more files using the installed 
 * [File Module Provider](https://docs.medusajs.com/resources/infrastructure-modules/file). The workflow is used by the
 * [Upload Files Admin API Route](https://docs.medusajs.com/api/admin#uploads_postuploads).
 * 
 * You can use this workflow within your customizations or your own custom workflows, allowing you to
 * upload files within your custom flows.
 * 
 * @example
 * const { result } = await uploadFilesWorkflow(container)
 * .run({
 *   input: {
 *     files: [
 *       {
 *         filename: "test.jpg",
 *         mimeType: "img/jpg",
 *         content: "binary-string",
 *         access: "public"
 *       }
 *     ]
 *   }
 * })
 * 
 * @summary
 * 
 * Upload files using the installed File Module Provider.
 */
export const uploadFilesWorkflow = createWorkflow(
  {
    name: uploadFilesWorkflowId,
    description: "Upload files using the installed File Module Provider",
    inputSchema: uploadFilesWorkflowInputSchema,
    outputSchema: uploadFilesWorkflowOutputSchema,
  },
  (input) => {
    return new WorkflowResponse(uploadFilesStep(input))
  }
)
