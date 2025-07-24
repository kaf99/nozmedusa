/**
 * @oas [post] /admin/workflows-executions/{workflow_id}/steps/failure
 * operationId: PostWorkflowsExecutionsWorkflow_idStepsFailure
 * summary: Fail a Step in a Workflow's Execution
 * x-sidebar-summary: Fail a Step
 * description: Set the status of a step in a workflow's execution as failed. This is useful for long-running workflows.
 * x-authenticated: true
 * parameters:
 *   - name: workflow_id
 *     in: path
 *     description: The workflows execution's workflow id.
 *     required: true
 *     schema:
 *       type: string
 * security:
 *   - api_token: []
 *   - cookie_auth: []
 *   - jwt_token: []
 * requestBody:
 *   content:
 *     application/json:
 *       schema:
 *         type: object
 *         description: The details of changing a workflow execution's step status.
 *         required:
 *           - transaction_id
 *           - step_id
 *         properties:
 *           transaction_id:
 *             type: string
 *             title: transaction_id
 *             description: The workflows execution's transaction ID.
 *           step_id:
 *             type: string
 *             title: step_id
 *             description: The ID of the step whose status was changed.
 *           response:
 *             description: Sets the step's response. It accepts any type.
 *           compensate_input:
 *             description: Sets the compensation function's input. It accepts any response.
 *           action:
 *             type: string
 *             description: Whether to invoke or compensate the step.
 *             enum:
 *               - invoke
 *               - compensate
 * x-codeSamples:
 *   - lang: Shell
 *     label: cURL
 *     source: |-
 *       curl -X POST '{backend_url}/admin/workflows-executions/{workflow_id}/steps/failure' \
 *       -H 'Authorization: Bearer {access_token}' \
 *       -H 'Content-Type: application/json' \
 *       --data-raw '{
 *         "transaction_id": "{value}",
 *         "step_id": "{value}"
 *       }'
 * tags:
 *   - Workflows Executions
 * responses:
 *   "200":
 *     description: OK
 *     content:
 *       application/json:
 *         schema:
 *           type: object
 *           description: The details of failing the workflow step.
 *           required:
 *             - success
 *           properties:
 *             success:
 *               type: boolean
 *               title: success
 *               description: Whether the workflow step has failed successfully.
 *   "400":
 *     $ref: "#/components/responses/400_error"
 *   "401":
 *     $ref: "#/components/responses/unauthorized"
 *   "404":
 *     $ref: "#/components/responses/not_found_error"
 *   "409":
 *     $ref: "#/components/responses/invalid_state_error"
 *   "422":
 *     $ref: "#/components/responses/invalid_request_error"
 *   "500":
 *     $ref: "#/components/responses/500_error"
 * 
*/

