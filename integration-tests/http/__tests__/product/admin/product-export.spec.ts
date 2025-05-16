import { IEventBusModuleService } from "@medusajs/types"
import { CommonEvents, Modules } from "@medusajs/utils"
import fs from "fs/promises"
import {
  TestEventUtils,
  medusaIntegrationTestRunner,
} from "@medusajs/test-utils"
import path from "path"
import {
  adminHeaders,
  createAdminUser,
} from "../../../../helpers/create-admin-user"
import { getProductFixture } from "../../../../helpers/fixtures"
import { csv2json } from "json-2-csv"

jest.setTimeout(50000)

const EXPORTED_COLUMNS = [
  "Product Collection Id",
  "Product Created At",
  "Product Deleted At",
  "Product Description",
  "Product Discountable",
  "Product External Id",
  "Product Handle",
  "Product Height",
  "Product Hs Code",
  "Product Id",
  "Product Image *",
  "Product Is Giftcard",
  "Product Length",
  "Product Material",
  "Product Mid Code",
  "Product Origin Country",
  "Product Status",
  "Product Subtitle",
  "Product Tag *",
  "Product Thumbnail",
  "Product Title",
  "Product Type Id",
  "Product Updated At",
  "Product Weight",
  "Product Width",
  "Variant Allow Backorder",
  "Variant Barcode",
  "Variant Created At",
  "Variant Deleted At",
  "Variant Ean",
  "Variant Height",
  "Variant Hs Code",
  "Variant Id",
  "Variant Length",
  "Variant Manage Inventory",
  "Variant Material",
  "Variant Metadata",
  "Variant Mid Code",
  "Variant Option * Name",
  "Variant Option * Value",
  "Variant Origin Country",
  "Variant Price [ISO]",
  "Variant Product Id",
  "Variant Sku",
  "Variant Title",
  "Variant Upc",
  "Variant Updated At",
  "Variant Variant Rank",
  "Variant Weight",
  "Variant Width",
]

const getCSVContents = async (filePath: string) => {
  const asLocalPath = filePath.replace("http://localhost:9000", process.cwd())
  const fileContent = await fs.readFile(asLocalPath, { encoding: "utf-8" })
  await fs.rm(path.dirname(asLocalPath), { recursive: true, force: true })
  const csvRows = csv2json(fileContent)

  return csvRows.reduce<any[]>((result, row) => {
    const rowCopy = { ...row }
    Object.keys(rowCopy).forEach((col) => {
      if (
        col.includes("Updated At") ||
        col.includes("Created At") ||
        col.includes("Deleted At")
      ) {
        rowCopy[col] = "<DateTime>"
      }
      if (col.includes("Id") || col.startsWith("Product Category ")) {
        rowCopy[col] = "<ID>"
      }
    })

    result.push(rowCopy)
    return result
  }, [])
}

const assertExportedColumns = (rows: any[]) => {
  rows.forEach((row) => {
    EXPORTED_COLUMNS.forEach((column) => {
      if (column.includes("[ISO]")) {
        expect(
          Object.keys(row).filter((rowCol) =>
            rowCol.startsWith("Variant Price ")
          ).length
        ).toBeGreaterThanOrEqual(1)
      } else {
        expect(row).toHaveProperty(column.replace("*", "1"))
      }
    })
  })
}

medusaIntegrationTestRunner({
  testSuite: ({ dbConnection, getContainer, api }) => {
    let baseProduct
    let proposedProduct

    let baseCollection
    let publishedCollection

    let baseType
    let baseRegion
    let baseCategory
    let baseTag1
    let baseTag2
    let newTag
    let shippingProfile

    let eventBus: IEventBusModuleService
    beforeAll(async () => {
      eventBus = getContainer().resolve(Modules.EVENT_BUS)
    })

    beforeEach(async () => {
      await createAdminUser(dbConnection, adminHeaders, getContainer())

      baseRegion = (
        await api.post(
          "/admin/regions",
          {
            name: "Test region",
            currency_code: "USD",
          },
          adminHeaders
        )
      ).data.region

      baseCollection = (
        await api.post(
          "/admin/collections",
          { title: "base-collection" },
          adminHeaders
        )
      ).data.collection

      publishedCollection = (
        await api.post(
          "/admin/collections",
          { title: "proposed-collection" },
          adminHeaders
        )
      ).data.collection

      shippingProfile = (
        await api.post(
          `/admin/shipping-profiles`,
          { name: "Test", type: "default" },
          adminHeaders
        )
      ).data.shipping_profile

      baseType = (
        await api.post(
          "/admin/product-types",
          { value: "test-type" },
          adminHeaders
        )
      ).data.product_type

      baseCategory = (
        await api.post(
          "/admin/product-categories",
          { name: "Test", is_internal: false, is_active: true },
          adminHeaders
        )
      ).data.product_category

      baseTag1 = (
        await api.post(
          "/admin/product-tags",
          { value: "tag-123" },
          adminHeaders
        )
      ).data.product_tag

      baseTag2 = (
        await api.post(
          "/admin/product-tags",
          { value: "tag-456" },
          adminHeaders
        )
      ).data.product_tag

      newTag = (
        await api.post(
          "/admin/product-tags",
          { value: "new-tag" },
          adminHeaders
        )
      ).data.product_tag

      baseProduct = (
        await api.post(
          "/admin/products",
          getProductFixture({
            title: "Base product",
            description: "test-product-description\ntest line 2",
            shipping_profile_id: shippingProfile.id,
            collection_id: baseCollection.id,
            type_id: baseType.id,
            categories: [{ id: baseCategory.id }],
            tags: [{ id: baseTag1.id }, { id: baseTag2.id }],
            variants: [
              {
                title: "Test variant",
                prices: [
                  {
                    currency_code: "usd",
                    amount: 100,
                  },
                  {
                    currency_code: "eur",
                    amount: 45,
                  },
                  {
                    currency_code: "dkk",
                    amount: 30,
                  },
                ],
                options: {
                  size: "large",
                  color: "green",
                },
              },
              {
                title: "Test variant 2",
                prices: [
                  {
                    currency_code: "usd",
                    amount: 200,
                  },
                  {
                    currency_code: "eur",
                    amount: 65,
                  },
                  {
                    currency_code: "dkk",
                    amount: 50,
                  },
                ],
                options: {
                  size: "small",
                  color: "green",
                },
              },
            ],
          }),
          adminHeaders
        )
      ).data.product

      proposedProduct = (
        await api.post(
          "/admin/products",
          getProductFixture({
            title: "Proposed product",
            status: "proposed",
            tags: [{ id: newTag.id }],
            type_id: baseType.id,
            shipping_profile_id: shippingProfile.id,
          }),
          adminHeaders
        )
      ).data.product
    })

    afterEach(() => {
      ;(eventBus as any).eventEmitter_.removeAllListeners()
    })

    describe("POST /admin/products/export", () => {
      it("should export a csv file containing the expected products", async () => {
        const subscriberExecution = TestEventUtils.waitSubscribersExecution(
          `${Modules.NOTIFICATION}.notification.${CommonEvents.CREATED}`,
          eventBus
        )

        // BREAKING: The batch endpoints moved to the domain routes (admin/batch-jobs -> /admin/products/export). The payload and response changed as well.
        const batchJobRes = await api.post(
          "/admin/products/export",
          {},
          adminHeaders
        )

        const transactionId = batchJobRes.data.transaction_id
        expect(transactionId).toBeTruthy()

        await subscriberExecution
        const notifications = (
          await api.get("/admin/notifications", adminHeaders)
        ).data.notifications

        expect(notifications.length).toBe(1)
        expect(notifications[0]).toEqual(
          expect.objectContaining({
            data: expect.objectContaining({
              title: "Product export",
              description: "Product export completed successfully!",
              file: expect.objectContaining({
                url: expect.stringContaining("-product-exports.csv"),
                filename: expect.any(String),
                mimeType: "text/csv",
              }),
            }),
          })
        )

        const exportedFileContents = await getCSVContents(
          notifications[0].data.file.url
        )

        assertExportedColumns(exportedFileContents)
        expect(exportedFileContents).toMatchSnapshot()
      })

      it("should export a csv file with categories", async () => {
        const subscriberExecution = TestEventUtils.waitSubscribersExecution(
          `${Modules.NOTIFICATION}.notification.${CommonEvents.CREATED}`,
          eventBus
        )

        const batchJobRes = await api.post(
          `/admin/products/export?id=${baseProduct.id}&fields=*categories`,
          {},
          adminHeaders
        )

        const transactionId = batchJobRes.data.transaction_id
        expect(transactionId).toBeTruthy()

        await subscriberExecution
        const notifications = (
          await api.get("/admin/notifications", adminHeaders)
        ).data.notifications

        const exportedFileContents = await getCSVContents(
          notifications[0].data.file.url
        )

        assertExportedColumns(exportedFileContents)
        expect(exportedFileContents).toMatchSnapshot()
      })

      it("should export a csv file with region prices", async () => {
        const subscriberExecution = TestEventUtils.waitSubscribersExecution(
          `${Modules.NOTIFICATION}.notification.${CommonEvents.CREATED}`,
          eventBus
        )

        const productWithRegionPrices = (
          await api.post(
            "/admin/products",
            getProductFixture({
              title: "Product with prices",
              shipping_profile_id: shippingProfile.id,
              tags: [{ id: baseTag1.id }, { id: baseTag2.id }],
              variants: [
                {
                  title: "Test variant",
                  prices: [
                    {
                      currency_code: "usd",
                      amount: 100,
                    },
                    {
                      currency_code: "usd",
                      rules: {
                        region_id: baseRegion.id,
                      },
                      amount: 45,
                    },
                  ],
                  options: {
                    size: "large",
                    color: "green",
                  },
                },
              ],
            }),
            adminHeaders
          )
        ).data.product

        const batchJobRes = await api.post(
          "/admin/products/export?id=" + productWithRegionPrices.id,
          {},
          adminHeaders
        )

        const transactionId = batchJobRes.data.transaction_id
        expect(transactionId).toBeTruthy()

        await subscriberExecution
        const notifications = (
          await api.get("/admin/notifications", adminHeaders)
        ).data.notifications

        const exportedFileContents = await getCSVContents(
          notifications[0].data.file.url
        )

        assertExportedColumns(exportedFileContents)
        expect(exportedFileContents).toMatchSnapshot()
      })

      it("should export a csv file filtered by specific products", async () => {
        const subscriberExecution = TestEventUtils.waitSubscribersExecution(
          `${Modules.NOTIFICATION}.notification.${CommonEvents.CREATED}`,
          eventBus
        )

        // BREAKING: We don't support setting batch size in the export anymore
        const batchJobRes = await api.post(
          `/admin/products/export?id=${proposedProduct.id}`,
          {},
          adminHeaders
        )

        const transactionId = batchJobRes.data.transaction_id
        expect(transactionId).toBeTruthy()

        await subscriberExecution
        const notifications = (
          await api.get("/admin/notifications", adminHeaders)
        ).data.notifications

        expect(notifications.length).toBe(1)

        const exportedFileContents = await getCSVContents(
          notifications[0].data.file.url
        )

        assertExportedColumns(exportedFileContents)
        expect(exportedFileContents).toMatchSnapshot()
      })
    })
  },
})
