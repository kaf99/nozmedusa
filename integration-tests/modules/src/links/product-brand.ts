import ProductModule from "@medusajs/medusa/product"
import { defineLink } from "@medusajs/utils"
import BrandModule from "../modules/brand"

export default defineLink(
  {
    linkable: ProductModule.linkable.product.id,
    filterable: ["description", "material"],
    isList: true,
  },
  {
    linkable: BrandModule.linkable.brand.id,
    filterable: ["id", "name"],
    isList: false,
  }
)
