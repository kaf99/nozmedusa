import { moduleIntegrationTestRunner } from "@medusajs/test-utils"
import { Modules } from "@medusajs/framework/utils"
import { resolve } from "path"
import { IFeatureFlagModuleService } from "@medusajs/types"
import { FeatureFlagProviderServiceFixtures } from "../__fixtures__/providers/default-provider"

jest.setTimeout(100000)

const moduleOptions = {
  providers: [
    {
      resolve: resolve(
        process.cwd() +
          "/integration-tests/__fixtures__/providers/default-provider"
      ),
      id: "default-provider",
    },
  ],
}

moduleIntegrationTestRunner<IFeatureFlagModuleService>({
  moduleName: Modules.FEATURE_FLAG,
  moduleOptions: moduleOptions,
  testSuite: ({ service }) => {
    describe("Feature Flag Module Service", () => {
      let spies: {
        retrieveFeatureFlag: jest.SpyInstance
      }

      beforeAll(async () => {
        spies = {
          retrieveFeatureFlag: jest.spyOn(
            FeatureFlagProviderServiceFixtures.prototype,
            "retrieveFeatureFlag"
          ),
        }
      })

      afterEach(async () => {
        jest.clearAllMocks()
      })

      it("should call the provider's retrieveFeatureFlag method", async () => {
        await service.retrieveFeatureFlag({
          feature_flag: "test-flag",
          context: {
            actor_id: "test-user",
          },
        })

        expect(spies.retrieveFeatureFlag).toHaveBeenCalledWith({
          feature_flag: "test-flag",
          context: {
            actor_id: "test-user",
          },
        })
      })
    })
  },
})
