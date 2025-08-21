import { createWorkflow } from "../create-workflow"
import { WorkflowResponse } from "../helpers/workflow-response"
import { WorkflowManager } from "@medusajs/orchestration"
import { z } from "zod"

describe("createWorkflow with description", () => {

  it("should store description when provided", () => {
    const workflowDescription = "This workflow processes customer orders and sends notifications"
    
    createWorkflow(
      {
        name: "test-workflow-with-description",
        description: workflowDescription,
      },
      () => {
        return new WorkflowResponse({
          result: "success",
        })
      }
    )

    const description = WorkflowManager.getWorkflowDescription("test-workflow-with-description")
    
    expect(description).toBe(workflowDescription)
  })

  it("should work without description (backward compatibility)", () => {
    createWorkflow("test-workflow-no-description", () => {
      return new WorkflowResponse({
        result: "test",
      })
    })

    const description = WorkflowManager.getWorkflowDescription("test-workflow-no-description")
    
    expect(description).toBeUndefined()
  })

  it("should work with description and schemas together", () => {
    const inputSchema = z.object({
      orderId: z.string(),
    })
    
    const outputSchema = z.object({
      status: z.string(),
    })
    
    createWorkflow(
      {
        name: "test-workflow-full-metadata",
        description: "Processes order status updates",
        inputSchema,
        outputSchema,
      },
      () => {
        return new WorkflowResponse({
          status: `Order processed`,
        })
      }
    )

    const description = WorkflowManager.getWorkflowDescription("test-workflow-full-metadata")
    const schemas = WorkflowManager.getWorkflowSchemas("test-workflow-full-metadata")
    
    expect(description).toBe("Processes order status updates")
    expect(schemas?.inputSchema).toBe(inputSchema)
    expect(schemas?.outputSchema).toBe(outputSchema)
  })
})