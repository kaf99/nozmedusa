import { medusaIntegrationTestRunner } from "@medusajs/test-utils"
import path from "path"
import {
  adminHeaders,
  createAdminUser,
} from "../../../../helpers/create-admin-user"

jest.setTimeout(30000)

medusaIntegrationTestRunner({
  env: {},
  medusaConfigFile: path.join(__dirname),
  testSuite: ({ dbConnection, getContainer, api }) => {
    beforeEach(async () => {
      const container = getContainer()
      await createAdminUser(dbConnection, adminHeaders, container)
    })

    describe("GET /admin/plugins", () => {
      it("should retrieve all plugins of the project", async () => {
        const response = await api.get("/admin/plugins", adminHeaders)

        expect(response.status).toEqual(200)
        expect(response.data.plugins).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              name: "medusa-plugin-navigation",
            }),
          ])
        )
      })
    })
  },
})
