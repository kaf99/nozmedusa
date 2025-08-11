import { z } from "zod"
import { createSelectParams } from "../../../../utils/validators"

export type AdminGetColumnsParamsType = z.infer<typeof AdminGetColumnsParams>
export const AdminGetColumnsParams = createSelectParams()

export type AdminUpdateColumnVisibilityType = z.infer<typeof AdminUpdateColumnVisibility>
export const AdminUpdateColumnVisibility = z.object({
  visible_columns: z.array(z.string()),
})