import {
  WorkflowResponse,
  createWorkflow,
} from "@medusajs/framework/workflows-sdk"
import { uploadFilesStep } from "../steps"
import {
  uploadFilesWorkflowInputSchema,
  uploadFilesWorkflowOutputSchema,
} from "../utils/schemas"

export type {
  UploadFilesWorkflowInput,
  UploadFilesWorkflowOutput,
} from "../utils/schemas"

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
