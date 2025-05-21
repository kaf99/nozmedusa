import { FlagsLoaderTypes } from "@medusajs/types"

export const TaxInclusivePricingFeatureFlag: FlagsLoaderTypes.FlagSettings = {
  key: "tax_inclusive_pricing",
  default_val: false,
  env_key: "MEDUSA_FF_TAX_INCLUSIVE_PRICING",
  description: "[WIP] Enable tax inclusive pricing",
}
