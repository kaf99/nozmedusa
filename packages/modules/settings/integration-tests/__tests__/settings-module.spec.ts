import { Module } from "@medusajs/framework/utils"
import { Modules } from "@medusajs/utils"
import { moduleIntegrationTestRunner } from "@medusajs/test-utils"
import { SettingsModuleService } from "@services"
import { SettingsTypes } from "@medusajs/types"

jest.setTimeout(30000)

moduleIntegrationTestRunner<SettingsTypes.ISettingsModuleService>({
  moduleName: Modules.SETTINGS,
  testSuite: ({ service }) => {
    describe("SettingsModuleService", function () {
      it(`should export the appropriate linkable configuration`, () => {
        const linkable = Module(Modules.SETTINGS, {
          service: SettingsModuleService,
        }).linkable

        expect(Object.keys(linkable)).toEqual([
          "viewConfiguration",
          "userPreference",
        ])

        Object.keys(linkable).forEach((key) => {
          delete linkable[key].toJSON
        })

        expect(linkable).toEqual({
          viewConfiguration: {
            id: {
              linkable: "view_configuration_id",
              entity: "ViewConfiguration",
              primaryKey: "id",
              serviceName: "settings",
              field: "viewConfiguration",
            },
          },
          userPreference: {
            id: {
              linkable: "user_preference_id",
              entity: "UserPreference",
              primaryKey: "id",
              serviceName: "settings",
              field: "userPreference",
            },
          },
        })
      })

      describe("ViewConfiguration", function () {
        it("should create a view configuration", async () => {
          const viewConfig = await service.createViewConfigurations({
            entity: "orders",
            name: "My Orders View",
            user_id: "user_123",
            configuration: {
              visible_columns: ["id", "status", "created_at"],
              column_order: ["id", "status", "created_at"],
              column_widths: { id: 100, status: 150 },
              filters: { status: ["pending", "completed"] },
              sorting: { id: "created_at", desc: true },
              search: "",
            },
          })

          expect(viewConfig).toEqual(
            expect.objectContaining({
              id: expect.any(String),
              entity: "orders",
              name: "My Orders View",
              user_id: "user_123",
            })
          )
        })

        it("should update a view configuration and remove filters", async () => {
          // Create a view with filters
          const viewConfig = await service.createViewConfigurations({
            entity: "products",
            name: "Filtered Products View",
            user_id: "user_456",
            configuration: {
              visible_columns: ["id", "title", "status"],
              column_order: ["id", "title", "status"],
              filters: { 
                status: ["draft", "published"],
                collection_id: ["col_123", "col_456"]
              },
              sorting: { id: "created_at", desc: true },
            },
          })

          expect(viewConfig.configuration.filters).toEqual({
            status: ["draft", "published"],
            collection_id: ["col_123", "col_456"]
          })

          // Update the view to remove filters
          const updatedConfig = await service.updateViewConfigurations(
            viewConfig.id,
            {
              configuration: {
                visible_columns: ["id", "title", "status"],
                column_order: ["id", "title", "status"],
                filters: {},  // Empty filters object
                sorting: { id: "created_at", desc: true },
              },
            }
          )

          expect(updatedConfig.configuration.filters).toEqual({})

          // Retrieve the view again to ensure filters were persisted as empty
          const retrievedConfig = await service.retrieveViewConfiguration(
            viewConfig.id
          )

          expect(retrievedConfig.configuration.filters).toEqual({})
        })

        it("should update view configuration with partial configuration updates", async () => {
          // Create a view with full configuration
          const viewConfig = await service.createViewConfigurations({
            entity: "customers",
            name: "Customer View",
            user_id: "user_789",
            configuration: {
              visible_columns: ["id", "name", "email"],
              column_order: ["id", "name", "email"],
              filters: { 
                has_account: true,
                groups: ["vip", "regular"]
              },
              sorting: { id: "created_at", desc: false },
              search: "test search",
            },
          })

          // Update only filters (should preserve other configuration)
          const updatedConfig = await service.updateViewConfigurations(
            viewConfig.id,
            {
              configuration: {
                visible_columns: ["id", "name", "email"],
                column_order: ["id", "name", "email"],
                filters: { has_account: false },  // Changed filters
                sorting: { id: "created_at", desc: false },
                search: "test search",
              },
            }
          )

          expect(updatedConfig.configuration).toEqual({
            visible_columns: ["id", "name", "email"],
            column_order: ["id", "name", "email"],
            filters: { has_account: false },
            sorting: { id: "created_at", desc: false },
            search: "test search",
            column_widths: {},  // Default value when not provided
          })
        })
      })
    })
  },
})