import { medusaIntegrationTestRunner } from "@medusajs/test-utils"
import { Modules } from "@medusajs/utils"

jest.setTimeout(1000000)

medusaIntegrationTestRunner({
  testSuite: ({ getContainer }) => {
    describe("Caching", () => {
      let cacheModuleService: any

      beforeAll(() => {
        cacheModuleService = getContainer().resolve(Modules.CACHING)
      })

      it("should test", async () => {
        console.log("test")
      })
    })
  },
})
