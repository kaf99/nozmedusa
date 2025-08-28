import { CSVNormalizer, productValidators } from "@medusajs/framework/utils"
import { StepResponse, createStep } from "@medusajs/framework/workflows-sdk"
import { convertCsvToJson } from "../utils"
import { z } from "zod"

/**
 * The CSV file content to parse.
 */
export type NormalizeProductCsvStepInput = string

export const normalizeCsvStepId = "normalize-product-csv"

type CreateType = z.infer<typeof productValidators.CreateProduct>
type UpdateType = z.infer<typeof productValidators.UpdateProduct>

/**
 * This step parses a CSV file holding products to import, returning the products as
 * objects that can be imported.
 *
 * @example
 * const data = parseProductCsvStep("products.csv")
 */
export const normalizeCsvStep = createStep(
  normalizeCsvStepId,
  async (fileContent: NormalizeProductCsvStepInput) => {
    const csvProducts =
      convertCsvToJson<Record<string, number | string | boolean>>(fileContent)
    const normalizer = new CSVNormalizer(
      csvProducts.map((row, index) => CSVNormalizer.preProcess(row, index + 1))
    )
    const products = normalizer.proccess()

    const create = Object.keys(products.toCreate).reduce<CreateType[]>(
      (result, toCreateHandle) => {
        result.push(
          productValidators.CreateProduct.parse(
            products.toCreate[toCreateHandle]
          )
        )
        return result
      },
      []
    )

    const update = Object.keys(products.toUpdate).reduce<UpdateType[]>(
      (result, toUpdateId) => {
        result.push(
          productValidators.UpdateProduct.parse(products.toUpdate[toUpdateId])
        )
        return result
      },
      []
    )

    return new StepResponse({
      create,
      update,
    })
  }
)
