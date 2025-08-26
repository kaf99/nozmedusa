import { medusaIntegrationTestRunner } from "@medusajs/test-utils"
import { createAdminUser } from "../../../../helpers/create-admin-user"

jest.setTimeout(50000)

const env = {}
const adminHeaders = {
  headers: { "x-medusa-access-token": "test_token" },
}

medusaIntegrationTestRunner({
  env,
  testSuite: ({ dbConnection, getContainer, api }) => {
    describe("POST /admin/customer-groups", () => {
      let appContainer

      beforeAll(async () => {
        appContainer = getContainer()
      })

      beforeEach(async () => {
        await createAdminUser(dbConnection, adminHeaders, appContainer)
        // await adminSeeder(dbConnection)
      })

      it("should create a customer group", async () => {
        const response = await api.post(
          `/admin/customer-groups`,
          {
            name: "VIP",
          },
          adminHeaders
        )

        expect(response.status).toEqual(200)
        expect(response.data.customer_group).toEqual(
          expect.objectContaining({
            id: expect.any(String),
            name: "VIP",
            created_by: expect.any(String),
          })
        )
      })
    })
  },
})
