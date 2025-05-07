import { isPresent } from "../common"
import { AdminCreateProduct, AdminCreateProductVariant } from "@medusajs/types"

/**
 * Column processor is a function that process the CSV column
 * and writes its value to the output
 */
type ColumnProcessor<Output> = (
  csvRow: Record<string, string | boolean | number>,
  rowColumns: string[],
  output: Output
) => void

/**
 * Collection of static product columns whose values must be copied
 * as it is without any further processing.
 */
const productStaticColumns: {
  [columnName: string]: ColumnProcessor<{
    [K in keyof AdminCreateProduct]?: any
  }>
} = {
  "Product Id": (csvRow, _, output) => {
    if (isPresent(csvRow["Product Id"])) {
      output["id"] = csvRow["Product Id"]
    }
  },
  "Product Handle": (csvRow, _, output) => {
    if (isPresent(csvRow["Product Handle"])) {
      output["handle"] = csvRow["Product Handle"]
    }
  },
  "Product Title": (csvRow, _, output) => {
    if (isPresent(csvRow["Product Title"])) {
      output["title"] = csvRow["Product Title"]
    }
  },
  "Product Status": (csvRow, _, output) => {
    if (isPresent(csvRow["Product Status"])) {
      output["status"] = csvRow["Product Status"]
    }
  },
  "Product Description": (csvRow, _, output) => {
    if (isPresent(csvRow["Product Description"])) {
      output["description"] = csvRow["Product Description"]
    }
  },
  "Product Subtitle": (csvRow, _, output) => {
    if (isPresent(csvRow["Product Subtitle"])) {
      output["subtitle"] = csvRow["Product Subtitle"]
    }
  },
  "Product External Id": (csvRow, _, output) => {
    if (isPresent(csvRow["Product External Id"])) {
      output["external_id"] = csvRow["Product External Id"]
    }
  },
  "Product Thumbnail": (csvRow, _, output) => {
    if (isPresent(csvRow["Product Thumbnail"])) {
      output["thumbnail"] = csvRow["Product Thumbnail"]
    }
  },
  "Product Collection Id": (csvRow, _, output) => {
    if (isPresent(csvRow["Product Collection Id"])) {
      output["collection_id"] = csvRow["Product Collection Id"]
    }
  },
  "Product Type Id": (csvRow, _, output) => {
    if (isPresent(csvRow["Product Type Id"])) {
      output["type_id"] = csvRow["Product Type Id"]
    }
  },
  "Product Discountable": (csvRow, _, output) => {
    if (isPresent(csvRow["Product Discountable"])) {
      output["discountable"] = csvRow["Product Discountable"]
    }
  },
  "Product Height": (csvRow, _, output) => {
    if (isPresent(csvRow["Product Height"])) {
      output["height"] = csvRow["Product Height"]
    }
  },
  "Product Hs Code": (csvRow, _, output) => {
    if (isPresent(csvRow["Product Hs Code"])) {
      output["hs_code"] = csvRow["Product Hs Code"]
    }
  },
  "Product Length": (csvRow, _, output) => {
    if (isPresent(csvRow["Product Length"])) {
      output["length"] = csvRow["Product Length"]
    }
  },
  "Product Material": (csvRow, _, output) => {
    if (isPresent(csvRow["Product Material"])) {
      output["material"] = csvRow["Product Material"]
    }
  },
  "Product Mid Code": (csvRow, _, output) => {
    if (isPresent(csvRow["Product Mid Code"])) {
      output["mid_code"] = csvRow["Product Mid Code"]
    }
  },
  "Product Origin Country": (csvRow, _, output) => {
    if (isPresent(csvRow["Product Origin Country"])) {
      output["origin_country"] = csvRow["Product Origin Country"]
    }
  },
  "Product Weight": (csvRow, _, output) => {
    if (isPresent(csvRow["Product Weight"])) {
      output["weight"] = csvRow["Product Weight"]
    }
  },
  "Product Width": (csvRow, _, output) => {
    if (isPresent(csvRow["Product Width"])) {
      output["width"] = csvRow["Product Width"]
    }
  },
  "Product Metadata": (csvRow, _, output) => {
    if (isPresent(csvRow["Product Metadata"])) {
      output["metadata"] = csvRow["Product Metadata"]
    }
  },
  "Shipping Profile Id": (csvRow, _, output) => {
    if (isPresent(csvRow["Shipping Profile Id"])) {
      output["shipping_profile_id"] = csvRow["Shipping Profile Id"]
    }
  },
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
  "Product Category": (csvRow, rowColumns, output) => {
    const matcher = /Product Category \d/
    output["categories"] = rowColumns
      .filter((rowKey) => matcher.test(rowKey) && isPresent(csvRow[rowKey]))
      .map((rowKey) => ({
        id: csvRow[rowKey],
      }))
  },
  "Product Image": (csvRow, rowColumns, output) => {
    const matcher = /Product Image \d/
    output["images"] = rowColumns
      .filter((rowKey) => matcher.test(rowKey) && isPresent(csvRow[rowKey]))
      .map((rowKey) => ({
        url: csvRow[rowKey],
      }))
  },
  "Product Tag": (csvRow, rowColumns, output) => {
    const matcher = /Product Tag \d/
    output["tags"] = rowColumns
      .filter((rowKey) => matcher.test(rowKey) && isPresent(csvRow[rowKey]))
      .map((rowKey) => ({
        id: csvRow[rowKey],
      }))
  },
  "Product Sales Channel": (csvRow, rowColumns, output) => {
    const matcher = /Product Sales Channel \d/
    output["sales_channels"] = rowColumns
      .filter((rowKey) => matcher.test(rowKey) && isPresent(csvRow[rowKey]))
      .map((rowKey) => ({
        id: csvRow[rowKey],
      }))
  },
}

/**
 * Collection of static variant columns whose values must be copied
 * as it is without any further processing.
 */
const variantStaticColumns: {
  [columnName: string]: ColumnProcessor<{
    [K in keyof AdminCreateProductVariant]?: any
  }>
} = {
  "Variant Id": (csvRow, _, output) => {
    if (isPresent(csvRow["Variant Id"])) {
      output["id"] = csvRow["Variant Id"]
    }
  },
  "Variant Title": (csvRow, _, output) => {
    if (isPresent(csvRow["Variant Title"])) {
      output["title"] = csvRow["Variant Title"]
    }
  },
  "Variant Sku": (csvRow, _, output) => {
    if (isPresent(csvRow["Variant Sku"])) {
      output["sku"] = csvRow["Variant Sku"]
    }
  },
  "Variant Upc": (csvRow, _, output) => {
    if (isPresent(csvRow["Variant Upc"])) {
      output["upc"] = csvRow["Variant Upc"]
    }
  },
  "Variant Ean": (csvRow, _, output) => {
    if (isPresent(csvRow["Variant Ean"])) {
      output["ean"] = csvRow["Variant Ean"]
    }
  },
  "Variant Hs Code": (csvRow, _, output) => {
    if (isPresent(csvRow["Variant Hs Code"])) {
      output["hs_code"] = csvRow["Variant Hs Code"]
    }
  },
  "Variant Mid Code": (csvRow, _, output) => {
    if (isPresent(csvRow["Variant Mid Code"])) {
      output["mid_code"] = csvRow["Variant Mid Code"]
    }
  },
  "Variant Manage Inventory": (csvRow, _, output) => {
    if (isPresent(csvRow["Variant Manage Inventory"])) {
      output["manage_inventory"] = csvRow["Variant Manage Inventory"]
    }
  },
  "Variant Allow Backorder": (csvRow, _, output) => {
    if (isPresent(csvRow["Variant Allow Backorder"])) {
      output["allow_backorder"] = csvRow["Variant Allow Backorder"]
    }
  },
  "Variant Barcode": (csvRow, _, output) => {
    if (isPresent(csvRow["Variant Barcode"])) {
      output["barcode"] = csvRow["Variant Barcode"]
    }
  },
  "Variant Height": (csvRow, _, output) => {
    if (isPresent(csvRow["Variant Height"])) {
      output["height"] = csvRow["Variant Height"]
    }
  },
  "Variant Length": (csvRow, _, output) => {
    if (isPresent(csvRow["Variant Length"])) {
      output["length"] = csvRow["Variant Length"]
    }
  },
  "Variant Material": (csvRow, _, output) => {
    if (isPresent(csvRow["Variant Material"])) {
      output["material"] = csvRow["Variant Material"]
    }
  },
  "Variant Metadata": (csvRow, _, output) => {
    if (isPresent(csvRow["Variant Metadata"])) {
      output["metadata"] = csvRow["Variant Metadata"]
    }
  },
  "Variant Origin Country": (csvRow, _, output) => {
    if (isPresent(csvRow["Variant Origin Country"])) {
      output["origin_country"] = csvRow["Variant Origin Country"]
    }
  },
  "Variant Variant Rank": (csvRow, rowColumns, output) => {
    if (isPresent(csvRow["Variant Variant Rank"])) {
      output["variant_rank"] = csvRow["Variant Variant Rank"]
    }
  },
  "Variant Width": (csvRow, _, output) => {
    if (isPresent(csvRow["Variant Width"])) {
      output["width"] = csvRow["Variant Width"]
    }
  },
  "Variant Weight": (csvRow, _, output) => {
    if (isPresent(csvRow["Variant Weight"])) {
      output["weight"] = csvRow["Variant Weight"]
    }
  },
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
  "Variant Price": (csvRow, rowColumns, output) => {
    const pricesColumns = rowColumns.filter((rowKey) => {
      return rowKey.startsWith("Variant Price ") && isPresent(csvRow[rowKey])
    })

    output["prices"] = pricesColumns.map((columnName) => {
      const priceTokens = columnName.replace("Variant Price ", "").split(" ")
      if (priceTokens.length === 1) {
        return {
          currency_code: priceTokens[0],
          amount: csvRow[columnName],
        }
      }

      if (priceTokens.length === 2) {
        const currencyCode = priceTokens.find(
          (token) => token.startsWith("[") && token.endsWith("]")
        )
        return {
          currency_code: currencyCode
            ?.replace(new RegExp(`^[`), "")
            .replace(new RegExp(`]$`), ""),
          amount: csvRow[columnName],
        }
      }

      throw new Error(`Invalid format for pricing column "${columnName}"`)
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
  "Variant Option": (csvRow, rowColumns, output) => {
    const matcher = /Variant Option \d+ Name/
    const optionNameColumns = rowColumns.filter((rowKey) => {
      return matcher.test(rowKey) && isPresent(csvRow[rowKey])
    })

    output["options"] = optionNameColumns.map((columnName) => {
      const [, , counter] = columnName.split(" ")
      const key = csvRow[columnName]
      const value = csvRow[`Variant Option ${counter} Value`]
      if (!isPresent(value)) {
        throw new Error(`Missing option value for "${columnName}"`)
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
      throw new Error(
        `Row ${rowNumber}: Missing product id and handle. One of them are required to process the row`
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
      productStaticColumns[column](row, rowColumns, product)
    })
    Object.keys(productWildcardColumns).forEach((column) => {
      productWildcardColumns[column](row, rowColumns, product)
    })

    /**
     * Create representation of a variant and process
     * its static + wildcard columns
     */
    const variant: {
      [K in keyof AdminCreateProductVariant]?: any
    } = {}
    Object.keys(variantStaticColumns).forEach((column) => {
      variantStaticColumns[column](row, rowColumns, variant)
    })
    Object.keys(variantWildcardColumns).forEach((column) => {
      variantWildcardColumns[column](row, rowColumns, variant)
    })

    /**
     * Process variant options as a standalone array
     */
    const options = { options: [] }
    Object.keys(optionColumns).forEach((column) => {
      optionColumns[column](row, rowColumns, options)
    })

    /**
     * Specify options on both the variant and the product
     */
    options.options.forEach(({ key, value }) => {
      variant.options = variant.options ?? {}
      variant.options[key] = value

      product.options = product.options ?? []
      const matchingKey = product.options.find((option) => option.title === key)
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
