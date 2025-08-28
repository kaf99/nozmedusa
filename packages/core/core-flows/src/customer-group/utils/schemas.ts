import { z } from "zod"

/**
 * Metadata type schema
 */
const metadataSchema = z.record(z.unknown()).nullable().optional()

/**
 * Schema for CreateCustomerGroupDTO
 */
const createCustomerGroupDTOSchema = z.object({
  name: z.string(),
  metadata: metadataSchema,
  created_by: z.string().optional(),
})

/**
 * Schema for CustomerGroupDTO
 */
const customerGroupDTOSchema = z.object({
  id: z.string(),
  name: z.string(),
  customers: z.array(z.record(z.any())).optional(), // Partial<CustomerDTO>[]
  metadata: z.record(z.unknown()).optional(),
  created_by: z.string().nullable().optional(),
  deleted_at: z.union([z.date(), z.string()]).nullable().optional(),
  created_at: z.union([z.date(), z.string()]).optional(),
  updated_at: z.union([z.date(), z.string()]).optional(),
})

/**
 * Schema for CustomerGroupUpdatableFields
 */
const customerGroupUpdatableFieldsSchema = z.object({
  name: z.string().optional(),
  metadata: metadataSchema,
})

/**
 * Schema for CreateCustomerGroupsWorkflowInput
 */
export const createCustomerGroupsWorkflowInputSchema = z.object({
  customersData: z.array(createCustomerGroupDTOSchema),
})

/**
 * Schema for CreateCustomerGroupsWorkflowOutput
 */
export const createCustomerGroupsWorkflowOutputSchema = z.array(
  customerGroupDTOSchema
)

/**
 * Schema for UpdateCustomerGroupsWorkflowInput
 */
export const updateCustomerGroupsWorkflowInputSchema = z.object({
  selector: z.record(z.any()),
  update: customerGroupUpdatableFieldsSchema,
})

/**
 * Schema for UpdateCustomerGroupsWorkflowOutput
 */
export const updateCustomerGroupsWorkflowOutputSchema = z.array(
  customerGroupDTOSchema
)

/**
 * Schema for DeleteCustomerGroupsWorkflowInput
 */
export const deleteCustomerGroupsWorkflowInputSchema = z.object({
  ids: z.array(z.string()),
})

/**
 * Schema for DeleteCustomerGroupsWorkflowOutput
 */
export const deleteCustomerGroupsWorkflowOutputSchema = z.void()

/**
 * Schema for LinkCustomerGroupsCustomerWorkflowInput
 */
export const linkCustomerGroupsCustomerWorkflowInputSchema = z.object({
  id: z.string(),
  add: z.array(z.string()).optional(),
  remove: z.array(z.string()).optional(),
})

/**
 * Schema for LinkCustomerGroupsCustomerWorkflowOutput
 */
export const linkCustomerGroupsCustomerWorkflowOutputSchema = z.void()

/**
 * Schema for LinkCustomersCustomerGroupWorkflowInput
 */
export const linkCustomersCustomerGroupWorkflowInputSchema = z.object({
  id: z.string(),
  add: z.array(z.string()).optional(),
  remove: z.array(z.string()).optional(),
})

/**
 * Schema for LinkCustomersCustomerGroupWorkflowOutput
 */
export const linkCustomersCustomerGroupWorkflowOutputSchema = z.void()

// Type exports for workflow input/output types
export type CreateCustomerGroupsWorkflowInput = z.infer<
  typeof createCustomerGroupsWorkflowInputSchema
>
export type CreateCustomerGroupsWorkflowOutput = z.infer<
  typeof createCustomerGroupsWorkflowOutputSchema
>
export type UpdateCustomerGroupsWorkflowInput = z.infer<
  typeof updateCustomerGroupsWorkflowInputSchema
>
export type UpdateCustomerGroupsWorkflowOutput = z.infer<
  typeof updateCustomerGroupsWorkflowOutputSchema
>
export type DeleteCustomerGroupsWorkflowInput = z.infer<
  typeof deleteCustomerGroupsWorkflowInputSchema
>
export type DeleteCustomerGroupsWorkflowOutput = z.infer<
  typeof deleteCustomerGroupsWorkflowOutputSchema
>
export type LinkCustomerGroupsCustomerWorkflowInput = z.infer<
  typeof linkCustomerGroupsCustomerWorkflowInputSchema
>
export type LinkCustomerGroupsCustomerWorkflowOutput = z.infer<
  typeof linkCustomerGroupsCustomerWorkflowOutputSchema
>
export type LinkCustomersCustomerGroupWorkflowInput = z.infer<
  typeof linkCustomersCustomerGroupWorkflowInputSchema
>
export type LinkCustomersCustomerGroupWorkflowOutput = z.infer<
  typeof linkCustomersCustomerGroupWorkflowOutputSchema
>
