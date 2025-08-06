import { model } from "@medusajs/utils"

export const Brand = model.define("brand", {
  id: model.id({ prefix: "brand" }).primaryKey(),
  name: model.text(),
})
