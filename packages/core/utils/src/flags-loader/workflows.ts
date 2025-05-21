import { FlagsLoaderTypes } from "@medusajs/types"

export const WorkflowsFeatureFlag: FlagsLoaderTypes.FlagSettings = {
  key: "workflows",
  default_val: false,
  env_key: "MEDUSA_FF_WORKFLOWS",
  description: "[WIP] Enable workflows",
}
