import { compressName } from "@medusajs/framework/utils"

export function normalizeTableName(name: string): string {
  return compressName(name.toLowerCase(), 58).replace(/[^a-z0-9_]/g, "_")
}
