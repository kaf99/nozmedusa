import { ILockingModule } from "@medusajs/framework/types"
import { Modules, promiseAll } from "@medusajs/framework/utils"
import { moduleIntegrationTestRunner } from "@medusajs/test-utils"
import { setTimeout } from "node:timers/promises"

jest.setTimeout(10000)

moduleIntegrationTestRunner<any>({
  moduleName: Modules.CACHING,
  testSuite: ({ service }) => {
    describe("Caching Module Service", () => {
      it("should run", async () => {
        expect(true).toBe(true)
      })
    })
  },
})
