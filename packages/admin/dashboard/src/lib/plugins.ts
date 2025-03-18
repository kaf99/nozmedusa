import { HttpTypes } from "@medusajs/types"

export const getLoyaltyPlugin = (plugins: HttpTypes.AdminPlugin[]) => {
  return plugins?.find((plugin) => plugin.name === "@medusajs/loyalty")
}
