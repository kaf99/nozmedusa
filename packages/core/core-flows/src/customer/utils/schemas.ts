import { z } from "zod"

/**
 * Metadata type schema
 */
const metadataSchema = z.record(z.unknown()).nullable().optional()

/**
 * Schema for CreateCustomerAddressDTO (without customer_id for nested use)
 */
const createCustomerAddressDTOSchemaWithoutCustomerId = z.object({
  address_name: z.string().nullable().optional(),
  is_default_shipping: z.boolean().optional(),
  is_default_billing: z.boolean().optional(),
  company: z.string().nullable().optional(),
  first_name: z.string().nullable().optional(),
  last_name: z.string().nullable().optional(),
  address_1: z.string().nullable().optional(),
  address_2: z.string().nullable().optional(),
  city: z.string().nullable().optional(),
  country_code: z.string().nullable().optional(),
  province: z.string().nullable().optional(),
  postal_code: z.string().nullable().optional(),
  phone: z.string().nullable().optional(),
  metadata: metadataSchema,
})

/**
 * Schema for CreateCustomerAddressDTO (with customer_id)
 */
const createCustomerAddressDTOSchema =
  createCustomerAddressDTOSchemaWithoutCustomerId.extend({
    customer_id: z.string(),
  })

/**
 * Schema for CustomerAddressDTO
 */
const customerAddressDTOSchema = z.object({
  id: z.string(),
  address_name: z.string().optional(),
  is_default_shipping: z.boolean(),
  is_default_billing: z.boolean(),
  customer_id: z.string(),
  company: z.string().optional(),
  first_name: z.string().optional(),
  last_name: z.string().optional(),
  address_1: z.string().optional(),
  address_2: z.string().optional(),
  city: z.string().optional(),
  country_code: z.string().optional(),
  province: z.string().optional(),
  postal_code: z.string().optional(),
  phone: z.string().optional(),
  metadata: z.record(z.unknown()).optional(),
  created_at: z.string(),
  updated_at: z.string(),
})

/**
 * Schema for CreateCustomerDTO
 */
const createCustomerDTOSchema = z.object({
  company_name: z.string().nullable().optional(),
  first_name: z.string().nullable().optional(),
  last_name: z.string().nullable().optional(),
  email: z.string().nullable().optional(),
  phone: z.string().nullable().optional(),
  created_by: z.string().nullable().optional(),
  has_account: z.boolean().optional(),
  addresses: z
    .array(createCustomerAddressDTOSchemaWithoutCustomerId)
    .optional(),
  metadata: metadataSchema,
})

/**
 * Schema for CustomerDTO
 */
const customerDTOSchema = z.object({
  id: z.string(),
  email: z.string(),
  has_account: z.boolean(),
  default_billing_address_id: z.string().nullable(),
  default_shipping_address_id: z.string().nullable(),
  company_name: z.string().nullable(),
  first_name: z.string().nullable(),
  last_name: z.string().nullable(),
  addresses: z.array(customerAddressDTOSchema),
  phone: z.string().nullable(),
  groups: z.array(
    z.object({
      id: z.string(),
      name: z.string(),
    })
  ),
  metadata: z.record(z.unknown()),
  created_by: z.string().nullable(),
  deleted_at: z.union([z.date(), z.string()]).nullable(),
  created_at: z.union([z.date(), z.string()]),
  updated_at: z.union([z.date(), z.string()]),
})

/**
 * Schema for AdditionalData
 */
const additionalDataSchema = z.object({
  additional_data: z.record(z.string(), z.unknown()).optional(),
})

/**
 * Schema for CreateCustomersWorkflowInput
 */
export const createCustomersWorkflowInputSchema = z
  .object({
    customersData: z.array(createCustomerDTOSchema),
  })
  .and(additionalDataSchema)

/**
 * Schema for CreateCustomersWorkflowOutput
 */
export const createCustomersWorkflowOutputSchema = z.array(customerDTOSchema)

/**
 * Schema for CreateCustomerAddressesWorkflowInput
 */
export const createCustomerAddressesWorkflowInputSchema = z
  .object({
    addresses: z.array(createCustomerAddressDTOSchema),
  })
  .and(additionalDataSchema)

/**
 * Schema for CreateCustomerAddressesWorkflowOutput
 */
export const createCustomerAddressesWorkflowOutputSchema = z.array(
  customerAddressDTOSchema
)

/**
 * Schema for UpdateCustomersWorkflowInput
 */
export const updateCustomersWorkflowInputSchema = z
  .object({
    selector: z.record(z.any()),
    update: z.record(z.any()),
  })
  .and(additionalDataSchema)

/**
 * Schema for UpdateCustomersWorkflowOutput
 */
export const updateCustomersWorkflowOutputSchema = z.array(customerDTOSchema)

/**
 * Schema for UpdateAddressesWorkflowInput
 */
export const updateAddressesWorkflowInputSchema = z.object({
  selector: z.record(z.any()),
  update: z.record(z.any()),
})

/**
 * Schema for UpdateAddressesWorkflowOutput
 */
export const updateAddressesWorkflowOutputSchema = z.array(
  customerAddressDTOSchema
)

/**
 * Schema for DeleteCustomersWorkflowInput
 */
export const deleteCustomersWorkflowInputSchema = z.object({
  ids: z.array(z.string()),
})

/**
 * Schema for DeleteCustomersWorkflowOutput
 */
export const deleteCustomersWorkflowOutputSchema = z.void()

/**
 * Schema for DeleteAddressesWorkflowInput
 */
export const deleteAddressesWorkflowInputSchema = z.object({
  ids: z.array(z.string()),
})

/**
 * Schema for DeleteAddressesWorkflowOutput
 */
export const deleteAddressesWorkflowOutputSchema = z.void()

/**
 * Schema for CreateCustomerAccountWorkflowInput
 */
export const createCustomerAccountWorkflowInputSchema = z.object({
  authIdentityId: z.string(),
  customerData: createCustomerDTOSchema,
})

/**
 * Schema for CreateCustomerAccountWorkflowOutput
 */
export const createCustomerAccountWorkflowOutputSchema = customerDTOSchema

/**
 * Schema for RemoveCustomerAccountWorkflowInput
 */
export const removeCustomerAccountWorkflowInputSchema = z.object({
  customerId: z.string(),
})

/**
 * Schema for RemoveCustomerAccountWorkflowOutput
 */
export const removeCustomerAccountWorkflowOutputSchema = z.string()

// Type exports for workflow input/output types
export type CreateCustomersWorkflowInput = z.infer<
  typeof createCustomersWorkflowInputSchema
>
export type CreateCustomersWorkflowOutput = z.infer<
  typeof createCustomersWorkflowOutputSchema
>
export type CreateCustomerAddressesWorkflowInput = z.infer<
  typeof createCustomerAddressesWorkflowInputSchema
>
export type CreateCustomerAddressesWorkflowOutput = z.infer<
  typeof createCustomerAddressesWorkflowOutputSchema
>
export type UpdateCustomersWorkflowInput = z.infer<
  typeof updateCustomersWorkflowInputSchema
>
export type UpdateCustomersWorkflowOutput = z.infer<
  typeof updateCustomersWorkflowOutputSchema
>
export type UpdateAddressesWorkflowInput = z.infer<
  typeof updateAddressesWorkflowInputSchema
>
export type UpdateAddressesWorkflowOutput = z.infer<
  typeof updateAddressesWorkflowOutputSchema
>
export type DeleteCustomersWorkflowInput = z.infer<
  typeof deleteCustomersWorkflowInputSchema
>
export type DeleteCustomersWorkflowOutput = z.infer<
  typeof deleteCustomersWorkflowOutputSchema
>
export type DeleteAddressesWorkflowInput = z.infer<
  typeof deleteAddressesWorkflowInputSchema
>
export type DeleteAddressesWorkflowOutput = z.infer<
  typeof deleteAddressesWorkflowOutputSchema
>
export type CreateCustomerAccountWorkflowInput = z.infer<
  typeof createCustomerAccountWorkflowInputSchema
>
export type CreateCustomerAccountWorkflowOutput = z.infer<
  typeof createCustomerAccountWorkflowOutputSchema
>
export type RemoveCustomerAccountWorkflowInput = z.infer<
  typeof removeCustomerAccountWorkflowInputSchema
>
export type RemoveCustomerAccountWorkflowOutput = z.infer<
  typeof removeCustomerAccountWorkflowOutputSchema
>
