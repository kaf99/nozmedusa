import { z } from "zod"

/**
 * Schema for CreateTaxRatesWorkflowInput
 */
export const createTaxRatesWorkflowInputSchema = z.array(
  z.object({
    tax_region_id: z.string(),
    name: z.string(), // name is required in CreateTaxRateDTO
    code: z.string().nullable().optional(),
    rate: z.number().nullable().optional(),
    is_default: z.boolean().optional(),
    is_combinable: z.boolean().optional(),
    rules: z.array(z.object({
      reference: z.string(),
      reference_id: z.string(),
    })).optional(),
    metadata: z.record(z.unknown()).optional(),
  })
)

/**
 * Schema for CreateTaxRatesWorkflowOutput
 */
export const createTaxRatesWorkflowOutputSchema = z.array(
  z.object({
    id: z.string(),
    rate: z.number().nullable(),
    code: z.string().nullable(),
    name: z.string(),
    is_default: z.boolean(),
    is_combinable: z.boolean().optional(),
    tax_region_id: z.string(),
    tax_region: z.any().optional(),
    created_at: z.union([z.date(), z.string()]),
    updated_at: z.union([z.date(), z.string()]),
    created_by: z.string().nullable().optional(),
    rules: z.array(z.any()).optional(),
    metadata: z.record(z.unknown()).nullable().optional(),
  })
)

export type CreateTaxRatesWorkflowInput = z.infer<typeof createTaxRatesWorkflowInputSchema>
export type CreateTaxRatesWorkflowOutput = z.infer<typeof createTaxRatesWorkflowOutputSchema>

/**
 * Schema for UpdateTaxRatesWorkflowInput
 */
export const updateTaxRatesWorkflowInputSchema = z.object({
  selector: z.object({
    id: z.union([z.string(), z.array(z.string())]).optional(),
    tax_region_id: z.union([z.string(), z.array(z.string())]).optional(),
    rate: z.union([z.number(), z.array(z.number()), z.record(z.unknown())]).optional(),
    code: z.union([z.string(), z.array(z.string())]).optional(),
    name: z.union([z.string(), z.array(z.string())]).optional(),
    created_by: z.union([z.string(), z.array(z.string())]).optional(),
  }).passthrough(),
  update: z.object({
    name: z.string().optional(),
    rate: z.number().optional(),
    code: z.string().optional(),
    rules: z.array(z.object({
      reference: z.string(),
      reference_id: z.string(),
    })).optional(),
    is_default: z.boolean().optional(),
    is_combinable: z.boolean().optional(),
    metadata: z.record(z.unknown()).optional(),
    updated_by: z.string().optional(),
  }),
})

/**
 * Schema for UpdateTaxRatesWorkflowOutput
 */
export const updateTaxRatesWorkflowOutputSchema = z.array(
  z.object({
    id: z.string(),
    rate: z.number().nullable(),
    code: z.string().nullable(),
    name: z.string(),
    is_default: z.boolean(),
    is_combinable: z.boolean().optional(),
    tax_region_id: z.string(),
    tax_region: z.any().optional(),
    created_at: z.union([z.date(), z.string()]),
    updated_at: z.union([z.date(), z.string()]),
    created_by: z.string().nullable().optional(),
    rules: z.array(z.any()).optional(),
    metadata: z.record(z.unknown()).nullable().optional(),
  })
)

export type UpdateTaxRatesWorkflowInput = z.infer<typeof updateTaxRatesWorkflowInputSchema>
export type UpdateTaxRatesWorkflowOutput = z.infer<typeof updateTaxRatesWorkflowOutputSchema>

/**
 * Schema for CreateTaxRegionsWorkflowInput
 */
export const createTaxRegionsWorkflowInputSchema = z.array(
  z.object({
    country_code: z.string(),
    province_code: z.string().nullable().optional(),
    parent_id: z.string().nullable().optional(),
    default_tax_rate: z.object({
      name: z.string(),
      rate: z.number().nullable().optional(),
      code: z.string().nullable().optional(),
      is_combinable: z.boolean().optional(),
      metadata: z.record(z.unknown()).optional(),
    }).optional(),
    metadata: z.record(z.unknown()).optional(),
  })
)

/**
 * Schema for CreateTaxRegionsWorkflowOutput
 */
export const createTaxRegionsWorkflowOutputSchema = z.array(
  z.object({
    id: z.string(),
    country_code: z.string(),
    province_code: z.string().nullable(),
    parent_id: z.string().nullable(),
    created_at: z.union([z.date(), z.string()]),
    updated_at: z.union([z.date(), z.string()]),
    deleted_at: z.union([z.date(), z.string()]).nullable().optional(),
    created_by: z.string().nullable().optional(),
    metadata: z.record(z.unknown()).nullable().optional(),
  })
)

export type CreateTaxRegionsWorkflowInput = z.infer<typeof createTaxRegionsWorkflowInputSchema>
export type CreateTaxRegionsWorkflowOutput = z.infer<typeof createTaxRegionsWorkflowOutputSchema>

/**
 * Schema for CreateTaxRateRulesWorkflowInput
 */
export const createTaxRateRulesWorkflowInputSchema = z.object({
  rules: z.array(
    z.object({
      tax_rate_id: z.string(),
      reference: z.string(),
      reference_id: z.string(),
      created_by: z.string().optional(),
    })
  ),
})

/**
 * Schema for CreateTaxRateRulesWorkflowOutput
 */
export const createTaxRateRulesWorkflowOutputSchema = z.array(
  z.object({
    id: z.string(),
    tax_rate_id: z.string(),
    reference: z.string(),
    reference_id: z.string(),
    tax_rate: z.any().optional(),
    created_at: z.union([z.date(), z.string()]),
    updated_at: z.union([z.date(), z.string()]),
    created_by: z.string().nullable().optional(),
    metadata: z.record(z.unknown()).nullable().optional(),
  })
)

export type CreateTaxRateRulesWorkflowInput = z.infer<typeof createTaxRateRulesWorkflowInputSchema>
export type CreateTaxRateRulesWorkflowOutput = z.infer<typeof createTaxRateRulesWorkflowOutputSchema>

/**
 * Schema for SetTaxRatesRulesWorkflowInput
 */
export const setTaxRateRulesWorkflowInputSchema = z.object({
  tax_rate_ids: z.array(z.string()),
  rules: z.array(
    z.object({
      reference: z.string(),
      reference_id: z.string(),
      created_by: z.string().optional(),
    })
  ),
})

/**
 * Schema for SetTaxRatesRulesWorkflowOutput
 */
export const setTaxRateRulesWorkflowOutputSchema = z.array(
  z.object({
    id: z.string(),
    tax_rate_id: z.string(),
    reference: z.string(),
    reference_id: z.string(),
    tax_rate: z.any().optional(),
    created_at: z.union([z.date(), z.string()]),
    updated_at: z.union([z.date(), z.string()]),
    created_by: z.string().nullable().optional(),
    metadata: z.record(z.unknown()).nullable().optional(),
  })
)

export type SetTaxRatesRulesWorkflowInput = z.infer<typeof setTaxRateRulesWorkflowInputSchema>
export type SetTaxRatesRulesWorkflowOutput = z.infer<typeof setTaxRateRulesWorkflowOutputSchema>

/**
 * Schema for UpdateTaxRegionsWorkflowInput
 */
export const updateTaxRegionsWorkflowInputSchema = z.array(
  z.object({
    id: z.string(),
    country_code: z.string().optional(),
    province_code: z.string().nullable().optional(),
    parent_id: z.string().nullable().optional(),
    metadata: z.record(z.unknown()).optional(),
  })
)

/**
 * Schema for UpdateTaxRegionsWorkflowOutput
 */
export const updateTaxRegionsWorkflowOutputSchema = z.array(
  z.object({
    id: z.string(),
    country_code: z.string(),
    province_code: z.string().nullable(),
    parent_id: z.string().nullable(),
    created_at: z.union([z.date(), z.string()]),
    updated_at: z.union([z.date(), z.string()]),
    deleted_at: z.union([z.date(), z.string()]).nullable().optional(),
    created_by: z.string().nullable().optional(),
    metadata: z.record(z.unknown()).nullable().optional(),
  })
)

export type UpdateTaxRegionsWorkflowInput = z.infer<typeof updateTaxRegionsWorkflowInputSchema>
export type UpdateTaxRegionsWorkflowOutput = z.infer<typeof updateTaxRegionsWorkflowOutputSchema>

/**
 * Schema for DeleteTaxRegionsWorkflowInput
 */
export const deleteTaxRegionsWorkflowInputSchema = z.object({
  ids: z.array(z.string()),
})

/**
 * Schema for DeleteTaxRegionsWorkflowOutput
 */
export const deleteTaxRegionsWorkflowOutputSchema = z.void()

export type DeleteTaxRegionsWorkflowInput = z.infer<typeof deleteTaxRegionsWorkflowInputSchema>
export type DeleteTaxRegionsWorkflowOutput = z.infer<typeof deleteTaxRegionsWorkflowOutputSchema>

/**
 * Schema for DeleteTaxRatesWorkflowInput
 */
export const deleteTaxRatesWorkflowInputSchema = z.object({
  ids: z.array(z.string()),
})

/**
 * Schema for DeleteTaxRatesWorkflowOutput
 */
export const deleteTaxRatesWorkflowOutputSchema = z.void()

export type DeleteTaxRatesWorkflowInput = z.infer<typeof deleteTaxRatesWorkflowInputSchema>
export type DeleteTaxRatesWorkflowOutput = z.infer<typeof deleteTaxRatesWorkflowOutputSchema>

/**
 * Schema for DeleteTaxRateRulesWorkflowInput
 */
export const deleteTaxRateRulesWorkflowInputSchema = z.object({
  ids: z.array(z.string()),
})

/**
 * Schema for DeleteTaxRateRulesWorkflowOutput
 */
export const deleteTaxRateRulesWorkflowOutputSchema = z.void()

export type DeleteTaxRateRulesWorkflowInput = z.infer<typeof deleteTaxRateRulesWorkflowInputSchema>
export type DeleteTaxRateRulesWorkflowOutput = z.infer<typeof deleteTaxRateRulesWorkflowOutputSchema>