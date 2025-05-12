import { isPresent, tryConvertToNumber, tryConvertToBoolean } from "../common"
import { AdminCreateProduct, AdminCreateProductVariant } from "@medusajs/types"

/**
 * Column processor is a function that process the CSV column
 * and writes its value to the output
 */
type ColumnProcessor<Output> = (
  csvRow: Record<string, string | boolean | number>,
  rowColumns: string[],
  rowNumber: number,
  output: Output
) => void

/**
 * Creates an error with the CSV row number
 */
function createError(rowNumber: number, message: string) {
  return new Error(`Row ${rowNumber}: ${message}`)
}

/**
 * Normalizes a CSV value by removing the leading "\r" from the
 * value.
 */
function normalizeValue<T>(value: T): T {
  if (typeof value === "string") {
    return value.replace(/\\r$/, "") as T
  }
  return value
}

/**
 * Parses different patterns to extract variant price iso
 * and the region name. The iso is converted to lowercase
 */
function parseVariantPriceColumn(columnName: string, rowNumber: number) {
  const priceTokens = normalizeValue(columnName)
    .replace("Variant Price ", "")
    .split(" ")

  /**
   * The price was specified as "Variant Price EUR" or "Variant Price USD"
   */
  if (priceTokens.length === 1) {
    return {
      region: null,
      iso: priceTokens[0].toLowerCase(),
    }
  }

  /**
   * The price was specified as "Variant Price [EUR]" or "Variant Price Europe [EUR]"
   */
  if (priceTokens.length === 2) {
    const iso = priceTokens.find(
      (token) => token.startsWith("[") && token.endsWith("]")
    )

    if (!iso) {
      throw createError(
        rowNumber,
        `Invalid price format used by "${columnName}". Expect column name to contain the ISO code inside square brackets. For example: "Variant Price [USD]"`
      )
    }

    return {
      iso: iso
        .replace(new RegExp(`^[`), "")
        .replace(new RegExp(`]$`), "")
        .toLowerCase(),
      region: priceTokens.find((token) => token !== iso),
    }
  }

  throw createError(
    rowNumber,
    `Invalid price format used by "${columnName}". Expect column name to contain the ISO code. For example: "Variant Price USD"`
  )
}

/**
 * Processes a column value as a string
 */
function processAsString<Output>(
  inputKey: string,
  outputKey: keyof Output
): ColumnProcessor<Output> {
  return (csvRow, _, __, output) => {
    const value = normalizeValue(csvRow[inputKey])
    if (isPresent(value)) {
      output[outputKey as any] = value
    }
  }
}

/**
 * Processes the column value as a string
 */
function processAsBoolean<Output>(
  inputKey: string,
  outputKey: keyof Output
): ColumnProcessor<Output> {
  return (csvRow, _, __, output) => {
    const value = normalizeValue(csvRow[inputKey])
    if (isPresent(value)) {
      output[outputKey as any] = tryConvertToBoolean(value, value)
    }
  }
}

/**
 * Processes the column value as a number
 */
function processAsNumber<Output>(
  inputKey: string,
  outputKey: keyof Output
): ColumnProcessor<Output> {
  return (csvRow, _, rowNumber, output) => {
    const value = normalizeValue(csvRow[inputKey])
    if (isPresent(value)) {
      const numericValue = tryConvertToNumber(value)
      if (numericValue === undefined) {
        throw createError(
          rowNumber,
          `Invalid value provided for "${inputKey}". Expected value to be a number`
        )
      } else {
        output[outputKey as any] = numericValue
      }
    }
  }
}

/**
 * Processes the CSV column as a counter value. The counter values
 * are defined as "<Column Name> <1>". Duplicate values are not
 * added twice.
 */
function processAsCounterValue<Output extends Record<string, any[]>>(
  inputMatcher: RegExp,
  arrayItemKey: string,
  outputKey: keyof Output
): ColumnProcessor<Output> {
  return (csvRow, rowColumns, _, output) => {
    output[outputKey] = output[outputKey] ?? []
    const existingIds = output[outputKey].map((item) => item[arrayItemKey])

    rowColumns
      .filter((rowKey) => inputMatcher.test(rowKey))
      .forEach((rowKey) => {
        const value = normalizeValue(csvRow[rowKey])
        if (!existingIds.includes(value) && isPresent(value)) {
          output[outputKey].push({ [arrayItemKey]: value })
        }
      })
  }
}

/**
 * Collection of static product columns whose values must be copied
 * as it is without any further processing.
 */
const productStaticColumns: {
  [columnName: string]: ColumnProcessor<{
    [K in keyof AdminCreateProduct | "id"]?: any
  }>
} = {
  "Product Id": processAsString("Product Id", "id"),
  "Product Handle": processAsString("Product Handle", "handle"),
  "Product Title": processAsString("Product Title", "title"),
  "Product Status": processAsString("Product Status", "status"),
  "Product Description": processAsString("Product Description", "description"),
  "Product Subtitle": processAsString("Product Subtitle", "subtitle"),
  "Product External Id": processAsString("Product External Id", "external_id"),
  "Product Thumbnail": processAsString("Product Thumbnail", "thumbnail"),
  "Product Collection Id": processAsString(
    "Product Collection Id",
    "collection_id"
  ),
  "Product Type Id": processAsString("Product Type Id", "type_id"),
  "Product Discountable": processAsBoolean(
    "Product Discountable",
    "discountable"
  ),
  "Product Height": processAsNumber("Product Height", "height"),
  "Product Hs Code": processAsString("Product Hs Code", "hs_code"),
  "Product Length": processAsNumber("Product Length", "length"),
  "Product Material": processAsString("Product Material", "material"),
  "Product Mid Code": processAsString("Product Mid Code", "mid_code"),
  "Product Origin Country": processAsString(
    "Product Origin Country",
    "origin_country"
  ),
  "Product Weight": processAsNumber("Product Weight", "weight"),
  "Product Width": processAsNumber("Product Width", "width"),
  "Product Metadata": processAsString("Product Metadata", "metadata"),
  "Shipping Profile Id": processAsString(
    "Shipping Profile Id",
    "shipping_profile_id"
  ),
}

/**
 * Collection of wildcard product columns whose values will be computed by
 * one or more columns from the CSV row.
 */
const productWildcardColumns: {
  [columnName: string]: ColumnProcessor<{
    [K in keyof AdminCreateProduct]?: any
  }>
} = {
  "Product Category": processAsCounterValue(
    /Product Category \d/,
    "id",
    "categories"
  ),
  "Product Image": processAsCounterValue(/Product Image \d/, "url", "images"),
  "Product Tag": processAsCounterValue(/Product Tag \d/, "id", "tags"),
  "Product Sales Channel": processAsCounterValue(
    /Product Sales Channel \d/,
    "id",
    "sales_channels"
  ),
}

/**
 * Collection of static variant columns whose values must be copied
 * as it is without any further processing.
 */
const variantStaticColumns: {
  [columnName: string]: ColumnProcessor<{
    [K in keyof AdminCreateProductVariant | "id"]?: any
  }>
} = {
  "Variant Id": processAsString("Variant Id", "id"),
  "Variant Title": processAsString("Variant Title", "title"),
  "Variant Sku": processAsString("Variant Sku", "sku"),
  "Variant Upc": processAsString("Variant Upc", "upc"),
  "Variant Ean": processAsString("Variant Ean", "ean"),
  "Variant Hs Code": processAsString("Variant Hs Code", "hs_code"),
  "Variant Mid Code": processAsString("Variant Mid Code", "mid_code"),
  "Variant Manage Inventory": processAsBoolean(
    "Variant Manage Inventory",
    "manage_inventory"
  ),
  "Variant Allow Backorder": processAsBoolean(
    "Variant Allow Backorder",
    "allow_backorder"
  ),
  "Variant Barcode": processAsString("Variant Barcode", "barcode"),
  "Variant Height": processAsNumber("Variant Height", "height"),
  "Variant Length": processAsNumber("Variant Length", "length"),
  "Variant Material": processAsString("Variant Material", "material"),
  "Variant Metadata": processAsString("Variant Metadata", "metadata"),
  "Variant Origin Country": processAsString(
    "Variant Origin Country",
    "origin_country"
  ),
  "Variant Variant Rank": processAsString(
    "Variant Variant Rank",
    "variant_rank"
  ),
  "Variant Width": processAsNumber("Variant Width", "width"),
  "Variant Weight": processAsNumber("Variant Weight", "weight"),
}

/**
 * Collection of wildcard variant columns whose values will be computed by
 * one or more columns from the CSV row.
 */
const variantWildcardColumns: {
  [columnName: string]: ColumnProcessor<{
    [K in keyof AdminCreateProductVariant]?: any
  }>
} = {
  "Variant Price": (csvRow, rowColumns, rowNumber, output) => {
    const pricesColumns = rowColumns.filter((rowKey) => {
      return rowKey.startsWith("Variant Price ") && isPresent(csvRow[rowKey])
    })
    output["prices"] = output["prices"] ?? []

    pricesColumns.forEach((columnName) => {
      const { iso } = parseVariantPriceColumn(columnName, rowNumber)
      const value = normalizeValue(csvRow[columnName])

      output["prices"].push({
        currency_code: iso,
        amount: value,
      })
    })
  },
}

/**
 * Options are processed separately and then defined on both the products and
 * the variants.
 */
const optionColumns: {
  [columnName: string]: ColumnProcessor<{
    options: { key: any; value: any }[]
  }>
} = {
  "Variant Option": (csvRow, rowColumns, rowNumber, output) => {
    const matcher = /Variant Option \d+ Name/
    const optionNameColumns = rowColumns.filter((rowKey) => {
      return matcher.test(rowKey) && isPresent(normalizeValue(csvRow[rowKey]))
    })

    output["options"] = optionNameColumns.map((columnName) => {
      const [, , counter] = columnName.split(" ")
      const key = normalizeValue(csvRow[columnName])
      const value = normalizeValue(csvRow[`Variant Option ${counter} Value`])

      if (!isPresent(value)) {
        throw createError(rowNumber, `Missing option value for "${columnName}"`)
      }

      return {
        key,
        value,
      }
    })
  },
}

/**
 * CSV normalizer processes all the allowed columns from a CSV file and remaps
 * them into a new object with properties matching the "AdminCreateProduct".
 *
 * However, further validations must be performed to validate the format and
 * the required fields in the normalized output.
 */
export class CSVNormalizer {
  #rows: Record<string, string | boolean | number>[]

  #products: {
    toCreate: {
      [handle: string]: {
        [K in keyof AdminCreateProduct]?: any
      }
    }
    toUpdate: {
      [id: string]: {
        [K in keyof AdminCreateProduct]?: any
      }
    }
  } = {
    toCreate: {},
    toUpdate: {},
  }

  constructor(rows: Record<string, string | boolean | number>[]) {
    this.#rows = rows
  }

  /**
   * Ensures atleast one of the product id or the handle is provided. Otherwise
   * we cannot process the row
   */
  #ensureRowHasProductIdentifier(
    row: Record<string, string | boolean | number>,
    rowNumber: number
  ) {
    const productId = row["Product Id"]
    const productHandle = row["Product Handle"]
    if (!isPresent(productId) && !isPresent(productHandle)) {
      throw createError(
        rowNumber,
        "Missing product id and handle. One of them are required to process the row"
      )
    }

    return { productId, productHandle }
  }

  /**
   * Initializes a product object or returns an existing one
   * by its id. The products with ids are treated as updates
   */
  #getOrInitializeProductById(id: string) {
    if (!this.#products.toUpdate[id]) {
      this.#products.toUpdate[id] = {
        variants: [],
      }
    }
    return this.#products.toUpdate[id]!
  }

  /**
   * Initializes a product object or returns an existing one
   * by its handle. The products with handle are treated as creates
   */
  #getOrInitializeProductByHandle(handle: string) {
    if (!this.#products.toCreate[handle]) {
      this.#products.toCreate[handle] = {
        variants: [],
      }
    }
    return this.#products.toCreate[handle]!
  }

  /**
   * Processes a given CSV row
   */
  #processRow(
    row: Record<string, string | boolean | number>,
    rowNumber: number
  ) {
    const rowColumns = Object.keys(row)
    const { productHandle, productId } = this.#ensureRowHasProductIdentifier(
      row,
      rowNumber
    )

    /**
     * Create representation of a product by its id or handle and process
     * its static + wildcard columns
     */
    const product = productId
      ? this.#getOrInitializeProductById(String(productId))
      : this.#getOrInitializeProductByHandle(String(productHandle))
    Object.keys(productStaticColumns).forEach((column) => {
      productStaticColumns[column](row, rowColumns, rowNumber, product)
    })
    Object.keys(productWildcardColumns).forEach((column) => {
      productWildcardColumns[column](row, rowColumns, rowNumber, product)
    })

    /**
     * Create representation of a variant and process
     * its static + wildcard columns
     */
    const variant: {
      [K in keyof AdminCreateProductVariant]?: any
    } = {}
    Object.keys(variantStaticColumns).forEach((column) => {
      variantStaticColumns[column](row, rowColumns, rowNumber, variant)
    })
    Object.keys(variantWildcardColumns).forEach((column) => {
      variantWildcardColumns[column](row, rowColumns, rowNumber, variant)
    })

    /**
     * Process variant options as a standalone array
     */
    const options: { options: { key: any; value: any }[] } = { options: [] }
    Object.keys(optionColumns).forEach((column) => {
      optionColumns[column](row, rowColumns, rowNumber, options)
    })

    /**
     * Specify options on both the variant and the product
     */
    options.options.forEach(({ key, value }) => {
      variant.options = variant.options ?? {}
      variant.options[key] = value

      product.options = product.options ?? []
      const matchingKey = product.options.find(
        (option: any) => option.title === key
      )
      if (!matchingKey) {
        product.options.push({ title: key, values: [value] })
      } else {
        matchingKey.values.push(value)
      }
    })

    /**
     * Assign variant to the product
     */
    product.variants.push(variant)
  }

  /**
   * Process CSV rows. The return value is a tree of products
   */
  proccess() {
    this.#rows.forEach((row, index) => this.#processRow(row, index + 1))
    return this.#products
  }
}
