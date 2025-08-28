import { z } from "zod"

/**
 * Schema for CampaignBudgetTypeValues
 */
const campaignBudgetTypeSchema = z.enum(["spend", "usage"])

/**
 * Schema for CampaignBudget
 */
const campaignBudgetSchema = z.object({
  type: campaignBudgetTypeSchema.optional(),
  limit: z.number().nullable().optional(),
  used: z.number().optional(),
  currency_code: z.string().optional(),
})

/**
 * Schema for CreateCampaignDTO
 */
const createCampaignDTOSchema = z.object({
  name: z.string(),
  description: z.string().optional(),
  campaign_identifier: z.string(),
  starts_at: z.date().nullable().optional(),
  ends_at: z.date().nullable().optional(),
  budget: campaignBudgetSchema.optional(),
  promotions: z
    .array(
      z.object({
        id: z.string(),
      })
    )
    .optional(),
})

/**
 * Schema for CampaignDTO
 */
const campaignDTOSchema = z.object({
  id: z.string(),
  name: z.string().nullable().optional(),
  description: z.string().nullable().optional(),
  campaign_identifier: z.string().optional(),
  starts_at: z.union([z.date(), z.string()]).nullable().optional(),
  ends_at: z.union([z.date(), z.string()]).nullable().optional(),
  budget: campaignBudgetSchema.nullable().optional(),
  created_at: z.union([z.date(), z.string()]).optional(),
  updated_at: z.union([z.date(), z.string()]).optional(),
  deleted_at: z.union([z.date(), z.string()]).nullable().optional(),
})

/**
 * Schema for CreateCampaignsWorkflowInput
 */
export const createCampaignsWorkflowInputSchema = z
  .object({
    campaignsData: z.array(createCampaignDTOSchema),
  })
  .and(
    z.object({
      additional_data: z.record(z.unknown()).optional(),
    })
  )

/**
 * Schema for CreateCampaignsWorkflowOutput
 */
export const createCampaignsWorkflowOutputSchema = z.array(campaignDTOSchema)

export type CreateCampaignsWorkflowInput = z.infer<
  typeof createCampaignsWorkflowInputSchema
>
export type CreateCampaignsWorkflowOutput = z.infer<
  typeof createCampaignsWorkflowOutputSchema
>

/**
 * Schema for ApplicationMethodDTO
 */
const createApplicationMethodDTOSchema = z.object({
  id: z.string().optional(),
  type: z.enum(["fixed", "percentage"]),
  target_type: z.enum(["order", "shipping_methods", "items"]),
  allocation: z.enum(["each", "across"]).optional(),
  value: z.number().optional(),
  currency_code: z.string().optional(),
  max_quantity: z.number().nullable().optional(),
  buy_rules_min_quantity: z.number().nullable().optional(),
  apply_to_quantity: z.number().nullable().optional(),
  created_at: z.union([z.date(), z.string()]).optional(),
  updated_at: z.union([z.date(), z.string()]).optional(),
  deleted_at: z.union([z.date(), z.string()]).nullable().optional(),
})

/**
 * Schema for ApplicationMethodDTO
 */
const applicationMethodDTOSchema = z.object({
  id: z.string().optional(),
  type: z.enum(["fixed", "percentage"]).optional(),
  target_type: z.enum(["order", "shipping_methods", "items"]).optional(),
  allocation: z.enum(["each", "across"]).optional(),
  value: z.number().optional(),
  currency_code: z.string().optional(),
  max_quantity: z.number().nullable().optional(),
  buy_rules_min_quantity: z.number().nullable().optional(),
  apply_to_quantity: z.number().nullable().optional(),
  created_at: z.union([z.date(), z.string()]).optional(),
  updated_at: z.union([z.date(), z.string()]).optional(),
  deleted_at: z.union([z.date(), z.string()]).nullable().optional(),
})

/**
 * Schema for CreatePromotionDTO
 */
const createPromotionDTOSchema = z.object({
  code: z.string(),
  type: z.enum(["standard", "buyget"]),
  status: z.enum(["active", "inactive"]),
  is_automatic: z.boolean().optional(),
  campaign_id: z.string().optional(),
  campaign: z
    .object({
      name: z.string(),
      campaign_identifier: z.string(),
      description: z.string().optional(),
      starts_at: z.date().optional(),
      ends_at: z.date().optional(),
      budget: campaignBudgetSchema.optional(),
    })
    .optional(),
  application_method: createApplicationMethodDTOSchema,
  rules: z.array(z.any()).optional(),
})

/**
 * Schema for PromotionDTO
 */
const promotionDTOSchema = z.object({
  id: z.string(),
  code: z.string().optional(),
  type: z.enum(["standard", "buyget"]).optional(),
  status: z.enum(["draft", "active", "inactive"]).optional(),
  is_automatic: z.boolean().optional(),
  campaign_id: z.string().nullable().optional(),
  campaign: campaignDTOSchema.optional(),
  application_method: applicationMethodDTOSchema.nullable().optional(),
  rules: z.array(z.any()).optional(),
  created_at: z.union([z.date(), z.string()]).optional(),
  updated_at: z.union([z.date(), z.string()]).optional(),
  deleted_at: z.union([z.date(), z.string()]).nullable().optional(),
})

/**
 * Schema for CreatePromotionsWorkflowInput
 */
export const createPromotionsWorkflowInputSchema = z
  .object({
    promotionsData: z.array(createPromotionDTOSchema),
  })
  .and(
    z.object({
      additional_data: z.record(z.unknown()).optional(),
    })
  )

/**
 * Schema for CreatePromotionsWorkflowOutput
 */
export const createPromotionsWorkflowOutputSchema = z.array(promotionDTOSchema)

export type CreatePromotionsWorkflowInput = z.infer<
  typeof createPromotionsWorkflowInputSchema
>
export type CreatePromotionsWorkflowOutput = z.infer<
  typeof createPromotionsWorkflowOutputSchema
>

/**
 * Schema for UpdateCampaignDTO
 */
const updateCampaignDTOSchema = z.object({
  id: z.string(),
  name: z.string().optional(),
  description: z.string().optional(),
  campaign_identifier: z.string().optional(),
  starts_at: z.date().optional(),
  ends_at: z.date().optional(),
  budget: campaignBudgetSchema.optional(),
  promotions: z
    .array(
      z.object({
        id: z.string(),
      })
    )
    .optional(),
})

/**
 * Schema for UpdateCampaignsWorkflowInput
 */
export const updateCampaignsWorkflowInputSchema = z
  .object({
    campaignsData: z.array(updateCampaignDTOSchema),
  })
  .passthrough() // Allow additional_data

/**
 * Schema for UpdateCampaignsWorkflowOutput
 */
export const updateCampaignsWorkflowOutputSchema = z.array(campaignDTOSchema)

export type UpdateCampaignsWorkflowInput = z.infer<
  typeof updateCampaignsWorkflowInputSchema
>
export type UpdateCampaignsWorkflowOutput = z.infer<
  typeof updateCampaignsWorkflowOutputSchema
>

/**
 * Schema for UpdatePromotionDTO
 */
const updatePromotionDTOSchema = z.object({
  id: z.string(),
  code: z.string().optional(),
  type: z.enum(["standard", "buyget"]).optional(),
  status: z.enum(["active", "inactive"]).optional(),
  is_automatic: z.boolean().optional(),
  campaign_id: z.string().nullable().optional(),
  application_method: applicationMethodDTOSchema.optional(),
  rules: z.array(z.any()).optional(),
})

/**
 * Schema for UpdatePromotionsWorkflowInput
 */
export const updatePromotionsWorkflowInputSchema = z
  .object({
    promotionsData: z.array(updatePromotionDTOSchema),
  })
  .passthrough() // Allow additional_data

/**
 * Schema for UpdatePromotionsWorkflowOutput
 */
export const updatePromotionsWorkflowOutputSchema = z.array(promotionDTOSchema)

export type UpdatePromotionsWorkflowInput = z.infer<
  typeof updatePromotionsWorkflowInputSchema
>
export type UpdatePromotionsWorkflowOutput = z.infer<
  typeof updatePromotionsWorkflowOutputSchema
>

const promotionRuleOperatorType = z.enum([
  "gt",
  "lt",
  "eq",
  "ne",
  "in",
  "lte",
  "gte",
])

const promotionRuleValueType = z.object({
  id: z.string(),
  value: z.string().optional(),
})

/**
 * Schema for PromotionRuleDTO
 */
const promotionRuleDTOSchema = z.object({
  id: z.string(),
  attribute: z.string().optional(),
  operator: promotionRuleOperatorType.optional(),
  values: z.array(promotionRuleValueType),
  created_at: z.union([z.date(), z.string()]).optional(),
  updated_at: z.union([z.date(), z.string()]).optional(),
  deleted_at: z.union([z.date(), z.string()]).nullable().optional(),
})

const batchUpdatePromotionRuleDTOSchema = z.object({
  id: z.string(),
  attribute: z.string().optional(),
  operator: promotionRuleOperatorType,
  values: z.array(z.string()).optional(),
})

/**
 * Schema for CreatePromotionRuleDTO
 */
const createPromotionRuleDTOSchema = z.object({
  attribute: z.string(),
  operator: promotionRuleOperatorType,
  values: z.array(z.string()),
})

const batchCreatePromotionRuleDTOSchema = z.object({
  attribute: z.string(),
  operator: promotionRuleOperatorType,
  values: z.array(z.string()),
})

/**
 * Schema for AddPromotionRulesWorkflowDTO / CreatePromotionRulesWorkflowInput
 */
export const createPromotionRulesWorkflowInputSchema = z.object({
  rule_type: z.enum(["buy_rules", "target_rules", "rules"]),
  data: z.object({
    id: z.string(),
    rules: z.array(createPromotionRuleDTOSchema),
  }),
})

/**
 * Schema for CreatePromotionRulesWorkflowOutput
 */
export const createPromotionRulesWorkflowOutputSchema = z.array(
  promotionRuleDTOSchema
)

export type CreatePromotionRulesWorkflowInput = z.infer<
  typeof createPromotionRulesWorkflowInputSchema
>
export type CreatePromotionRulesWorkflowOutput = z.infer<
  typeof createPromotionRulesWorkflowOutputSchema
>

/**
 * Schema for UpdatePromotionRuleDTO
 */
const updatePromotionRuleDTOSchema = z.object({
  id: z.string(),
  attribute: z.string().optional(),
  operator: z.enum(["gt", "lt", "eq", "ne", "in", "lte", "gte"]).optional(),
  values: z.array(z.string()).optional(),
})

/**
 * Schema for BatchPromotionRulesWorkflowInput
 */
export const batchPromotionRulesWorkflowInputSchema = z.object({
  id: z.string(),
  rule_type: z.enum(["buy_rules", "target_rules", "rules"]),
  create: z.array(batchCreatePromotionRuleDTOSchema).optional(),
  update: z.array(batchUpdatePromotionRuleDTOSchema).optional(),
  delete: z.array(z.string()).optional(),
})

/**
 * Schema for BatchPromotionRulesWorkflowOutput
 */
export const batchPromotionRulesWorkflowOutputSchema = z.object({
  created: z.array(promotionRuleDTOSchema),
  updated: z.array(promotionRuleDTOSchema),
  deleted: z.array(z.string()),
})

export type BatchPromotionRulesWorkflowInput = z.infer<
  typeof batchPromotionRulesWorkflowInputSchema
>
export type BatchPromotionRulesWorkflowOutput = z.infer<
  typeof batchPromotionRulesWorkflowOutputSchema
>

/**
 * Schema for UpdatePromotionRulesWorkflowInput
 */
export const updatePromotionRulesWorkflowInputSchema = z.object({
  data: z.array(updatePromotionRuleDTOSchema),
})

/**
 * Schema for UpdatePromotionRulesWorkflowOutput
 */
export const updatePromotionRulesWorkflowOutputSchema = z.array(
  promotionRuleDTOSchema
)

export type UpdatePromotionRulesWorkflowInput = z.infer<
  typeof updatePromotionRulesWorkflowInputSchema
>
export type UpdatePromotionRulesWorkflowOutput = z.infer<
  typeof updatePromotionRulesWorkflowOutputSchema
>

/**
 * Schema for AddOrRemoveCampaignPromotionsWorkflowInput (LinkWorkflowInput)
 */
export const addOrRemoveCampaignPromotionsWorkflowInputSchema = z.object({
  id: z.string(),
  add: z.array(z.string()).optional(),
  remove: z.array(z.string()).optional(),
})

/**
 * Schema for AddOrRemoveCampaignPromotionsWorkflowOutput
 */
export const addOrRemoveCampaignPromotionsWorkflowOutputSchema = z.void()

export type AddOrRemoveCampaignPromotionsWorkflowInput = z.infer<
  typeof addOrRemoveCampaignPromotionsWorkflowInputSchema
>
export type AddOrRemoveCampaignPromotionsWorkflowOutput = z.infer<
  typeof addOrRemoveCampaignPromotionsWorkflowOutputSchema
>

/**
 * Schema for DeletePromotionRulesWorkflowInput (RemovePromotionRulesWorkflowDTO)
 */
export const deletePromotionRulesWorkflowInputSchema = z.object({
  rule_type: z.enum(["buy_rules", "target_rules", "rules"]),
  data: z.object({
    id: z.string(),
    rule_ids: z.array(z.string()),
  }),
})

/**
 * Schema for DeletePromotionRulesWorkflowOutput
 */
export const deletePromotionRulesWorkflowOutputSchema = z.void()

/**
 * Schema for DeletePromotionsWorkflowInput
 */
export const deletePromotionsWorkflowInputSchema = z.object({
  ids: z.array(z.string()),
})

/**
 * Schema for DeletePromotionsWorkflowOutput
 */
export const deletePromotionsWorkflowOutputSchema = z.void()

/**
 * Schema for DeleteCampaignsWorkflowInput
 */
export const deleteCampaignsWorkflowInputSchema = z.object({
  ids: z.array(z.string()),
})

/**
 * Schema for DeleteCampaignsWorkflowOutput
 */
export const deleteCampaignsWorkflowOutputSchema = z.void()

/**
 * Schema for UpdatePromotionsStatusWorkflowInput
 */
export const updatePromotionsStatusWorkflowInputSchema = z
  .object({
    promotionsData: z.array(
      z.object({
        id: z.string(),
        status: z.enum(["draft", "active", "inactive"]),
      })
    ),
  })
  .and(
    z.object({
      additional_data: z.record(z.unknown()).optional(),
    })
  )

/**
 * Schema for UpdatePromotionsStatusWorkflowOutput
 */
export const updatePromotionsStatusWorkflowOutputSchema = z.array(promotionDTOSchema)

export type UpdatePromotionsStatusWorkflowInput = z.infer<
  typeof updatePromotionsStatusWorkflowInputSchema
>
export type UpdatePromotionsStatusWorkflowOutput = z.infer<
  typeof updatePromotionsStatusWorkflowOutputSchema
>
