import { WorkflowManager } from "@medusajs/orchestration"

// Import all compiled workflow modules
import "../dist"

const registeredWorkflows = WorkflowManager.getWorkflows()

console.log("Registered Workflows:")
let workflowCount = 0
let schemifiedCount = 0

for (const [wfId, workflow] of registeredWorkflows) {
  workflowCount++
  const hasInputSchema = !!workflow.inputSchema
  const hasOutputSchema = !!workflow.outputSchema
  if (hasInputSchema && hasOutputSchema) {
    schemifiedCount++
  }

  // Print check if both, red if neither, or yellow if only one of the two
  const hasI =
    hasInputSchema && hasOutputSchema
      ? "✅"
      : !hasInputSchema && !hasOutputSchema
      ? "❌"
      : "⚠️"
  console.log(
    `${hasI} - ${wfId} (has input schema: ${hasInputSchema}, has output schema: ${hasOutputSchema})`
  )
}

console.log(`\nTotal Workflows: ${workflowCount}`)
console.log(`Workflows with Schema: ${schemifiedCount}`)
console.log(
  `Progress: ${((schemifiedCount / workflowCount) * 100).toFixed(2)}%`
)
