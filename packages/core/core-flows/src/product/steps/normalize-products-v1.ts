import { CSVNormalizer } from "@medusajs/framework/utils"
import { StepResponse, createStep } from "@medusajs/framework/workflows-sdk"
import { convertCsvToJson } from "../utlils"
import { GroupProductsForBatchStepOutput } from "./group-products-for-batch"

/**
 * The CSV file content to parse.
 */
export type NormalizeProductCsvStepInput = string

export const normalizeCsvStepId = "normalize-product-csv"
/**
 * This step parses a CSV file holding products to import, returning the products as
 * objects that can be imported.
 *
 * @example
 * const data = parseProductCsvStep("products.csv")
 */
export const normalizeCsvStep = createStep(
  normalizeCsvStepId,
  async (fileContent: NormalizeProductCsvStepInput, { container }) => {
    const csvProducts = convertCsvToJson(fileContent)
    const normalizer = new CSVNormalizer(csvProducts as any)
    const projects = normalizer.proccess()

    const create = Object.keys(projects.toCreate).reduce<
      (typeof projects)["toCreate"][keyof (typeof projects)["toCreate"]][]
    >((result, toCreateId) => {
      result.push(projects.toCreate[toCreateId])
      return result
    }, [])

    const update = Object.keys(projects.toUpdate).reduce<
      (typeof projects)["toUpdate"][keyof (typeof projects)["toUpdate"]][]
    >((result, toCreateId) => {
      result.push(projects.toUpdate[toCreateId])
      return result
    }, [])

    return new StepResponse({
      create,
      update,
    } as GroupProductsForBatchStepOutput)
  }
)
