import { medusaIntegrationTestRunner } from "@medusajs/test-utils"
import {
  adminHeaders,
  createAdminUser,
} from "../../helpers/create-admin-user"
import { Modules, ContainerRegistrationKeys } from "@medusajs/framework/utils"
import Scrypt from "scrypt-kdf"
import jwt from "jsonwebtoken"
import { resolve } from "path"

jest.setTimeout(50000)

const env = { MEDUSA_FF_MEDUSA_V2: true, MEDUSA_FF_VIEW_CONFIGURATIONS: true }

medusaIntegrationTestRunner({
  env,
  testSuite: ({ dbConnection, api, getContainer }) => {
    describe("View Configurations API", () => {
      let adminHeader
      let nonAdminHeader
      let nonAdminUserId
      let adminUserId

      beforeEach(async () => {
        const container = getContainer()
        const { user: adminUser } = await createAdminUser(dbConnection, adminHeaders, container)
        adminHeader = adminHeaders.headers
        adminUserId = adminUser.id
        
        // Create a non-admin user
        const userModule = container.resolve(Modules.USER)
        const authModule = container.resolve(Modules.AUTH)
        
        const nonAdminUser = await userModule.createUsers({
          email: "regular@test.com",
          first_name: "Regular",
          last_name: "User",
        })
        nonAdminUserId = nonAdminUser.id
        
        // Set password for non-admin user
        const hashConfig = { logN: 15, r: 8, p: 1 }
        const passwordHash = await Scrypt.kdf("password", hashConfig)
        
        const authIdentity = await authModule.createAuthIdentities({
          provider_identities: [
            {
              provider: "emailpass",
              entity_id: "regular@test.com",
              provider_metadata: {
                password: passwordHash.toString("base64"),
              },
            },
          ],
          app_metadata: {
            user_id: nonAdminUser.id,
          },
        })
        
        // Create JWT token for non-admin user
        const config = container.resolve(ContainerRegistrationKeys.CONFIG_MODULE)
        const { projectConfig } = config
        const { jwtSecret, jwtOptions } = projectConfig.http
        const token = jwt.sign(
          {
            actor_id: nonAdminUser.id,
            actor_type: "user",
            auth_identity_id: authIdentity.id,
          },
          jwtSecret,
          {
            expiresIn: "1d",
            ...jwtOptions,
          }
        )
        
        nonAdminHeader = {
          Authorization: `Bearer ${token}`,
        }
      })

      describe("POST /admin/view-configurations", () => {
        it("should create a personal view configuration", async () => {
          const payload = {
            entity: "orders",
            name: "My Order View",
            configuration: {
              visible_columns: ["id", "display_id", "created_at"],
              column_order: ["display_id", "id", "created_at"],
            },
          }

          const response = await api.post(
            "/admin/view-configurations",
            payload,
            {
              headers: nonAdminHeader,
            }
          )

          expect(response.status).toBe(201)
          expect(response.data.view_configuration).toMatchObject({
            entity: "orders",
            name: "My Order View",
            user_id: nonAdminUserId,
            configuration: payload.configuration,
          })
          expect(response.data.view_configuration.is_system_default).toBeFalsy()
        })

        it("should create a system default view as admin", async () => {
          const payload = {
            entity: "orders",
            name: "Default Order View",
            is_system_default: true,
            configuration: {
              visible_columns: ["id", "display_id", "created_at", "total"],
              column_order: ["display_id", "created_at", "total", "id"],
            },
          }

          const response = await api.post(
            "/admin/view-configurations",
            payload,
            {
              headers: adminHeader,
            }
          )

          expect(response.status).toBe(201)
          expect(response.data.view_configuration).toMatchObject({
            entity: "orders",
            name: "Default Order View",
            user_id: null,
            is_system_default: true,
            configuration: payload.configuration,
          })
        })

      })

      describe("GET /admin/view-configurations", () => {
        let systemView
        let personalView
        let otherUserView

        beforeEach(async () => {
          const container = getContainer()
          const settingsService = container.resolve("settings")

          // Create system default view
          systemView = await settingsService.createViewConfigurations({
            entity: "orders",
            name: "System Default",
            is_system_default: true,
            user_id: null,
            configuration: {
              visible_columns: ["id", "display_id"],
              column_order: ["display_id", "id"],
            },
          })

          // Create personal view for non-admin user
          personalView = await settingsService.createViewConfigurations({
            entity: "orders",
            name: "My Personal View",
            is_system_default: false,
            user_id: nonAdminUserId,
            configuration: {
              visible_columns: ["id", "total"],
              column_order: ["total", "id"],
            },
          })

          // Create view for another user
          otherUserView = await settingsService.createViewConfigurations({
            entity: "orders",
            name: "Other User View",
            is_system_default: false,
            user_id: "other-user-id",
            configuration: {
              visible_columns: ["id"],
              column_order: ["id"],
            },
          })
        })

        it("should list system defaults and personal views", async () => {
          const response = await api.get("/admin/view-configurations", {
            headers: nonAdminHeader,
          })

          expect(response.status).toBe(200)
          expect(response.data.view_configurations).toHaveLength(2)
          expect(response.data.view_configurations).toEqual(
            expect.arrayContaining([
              expect.objectContaining({ id: systemView.id }),
              expect.objectContaining({ id: personalView.id }),
            ])
          )
          // Should not include other user's view
          expect(response.data.view_configurations).not.toEqual(
            expect.arrayContaining([
              expect.objectContaining({ id: otherUserView.id }),
            ])
          )
        })

        it("should filter by entity", async () => {
          const response = await api.get("/admin/view-configurations?entity=products", {
            headers: nonAdminHeader,
          })

          expect(response.status).toBe(200)
          expect(response.data.view_configurations).toHaveLength(0)
        })
      })

      describe("GET /admin/view-configurations/:id", () => {
        let viewConfig

        beforeEach(async () => {
          const container = getContainer()
          const settingsService = container.resolve("settings")

          viewConfig = await settingsService.createViewConfigurations({
            entity: "orders",
            name: "Test View",
            is_system_default: false,
            user_id: nonAdminUserId,
            configuration: {
              visible_columns: ["id"],
              column_order: ["id"],
            },
          })
        })

        it("should retrieve own view configuration", async () => {
          const response = await api.get(
            `/admin/view-configurations/${viewConfig.id}`,
            {
              headers: nonAdminHeader,
            }
          )

          expect(response.status).toBe(200)
          expect(response.data.view_configuration).toMatchObject({
            id: viewConfig.id,
            entity: "orders",
            name: "Test View",
          })
        })

        it("should prevent access to other user's view", async () => {
          const container = getContainer()
          const settingsService = container.resolve("settings")

          const otherView = await settingsService.createViewConfigurations({
            entity: "orders",
            name: "Other View",
            is_system_default: false,
            user_id: "other-user-id",
            configuration: {
              visible_columns: ["id"],
              column_order: ["id"],
            },
          })

          const response = await api.get(
            `/admin/view-configurations/${otherView.id}`,
            {
              headers: nonAdminHeader,
            }
          ).catch(e => e.response)

          expect(response.status).toBe(400)
        })
      })

      describe("POST /admin/view-configurations/:id", () => {
        let viewConfig

        beforeEach(async () => {
          const container = getContainer()
          const settingsService = container.resolve("settings")

          viewConfig = await settingsService.createViewConfigurations({
            entity: "orders",
            name: "Test View",
            is_system_default: false,
            user_id: nonAdminUserId,
            configuration: {
              visible_columns: ["id"],
              column_order: ["id"],
            },
          })
        })

        it("should update own view configuration", async () => {
          const payload = {
            name: "Updated View",
            configuration: {
              visible_columns: ["id", "total"],
              column_order: ["total", "id"],
            },
          }

          const response = await api.post(
            `/admin/view-configurations/${viewConfig.id}`,
            payload,
            {
              headers: nonAdminHeader,
            }
          )

          expect(response.status).toBe(200)
          expect(response.data.view_configuration).toMatchObject({
            id: viewConfig.id,
            name: "Updated View",
            configuration: payload.configuration,
          })
        })

      })

      describe("DELETE /admin/view-configurations/:id", () => {
        let viewConfig

        beforeEach(async () => {
          const container = getContainer()
          const settingsService = container.resolve("settings")

          viewConfig = await settingsService.createViewConfigurations({
            entity: "orders",
            name: "Test View",
            is_system_default: false,
            user_id: nonAdminUserId,
            configuration: {
              visible_columns: ["id"],
              column_order: ["id"],
            },
          })
        })

        it("should delete own view configuration", async () => {
          const response = await api.delete(
            `/admin/view-configurations/${viewConfig.id}`,
            {
              headers: nonAdminHeader,
            }
          )

          expect(response.status).toBe(200)
          expect(response.data).toMatchObject({
            id: viewConfig.id,
            object: "view_configuration",
            deleted: true,
          })

          // Verify it's deleted
          const getResponse = await api.get(
            `/admin/view-configurations/${viewConfig.id}`,
            {
              headers: nonAdminHeader,
            }
          ).catch(e => e.response)

          expect(getResponse.status).toBe(404)
        })
      })

      describe("GET /admin/view-configurations/active", () => {
        beforeEach(async () => {
          const container = getContainer()
          const settingsService = container.resolve("settings")

          // Create and set active view
          const viewConfig = await settingsService.createViewConfigurations({
            entity: "orders",
            name: "Active View",
            is_system_default: false,
            user_id: nonAdminUserId,
            configuration: {
              visible_columns: ["id", "total"],
              column_order: ["total", "id"],
            },
          })

          await settingsService.setActiveViewConfiguration(
            "orders",
            nonAdminUserId,
            viewConfig.id
          )
        })

        it("should retrieve active view configuration", async () => {
          const response = await api.get(
            "/admin/view-configurations/active?entity=orders",
            {
              headers: nonAdminHeader,
            }
          )

          expect(response.status).toBe(200)
          expect(response.data.view_configuration).toMatchObject({
            entity: "orders",
            name: "Active View",
            user_id: nonAdminUserId,
          })
        })

        it("should return null when no active view", async () => {
          const response = await api.get(
            "/admin/view-configurations/active?entity=products",
            {
              headers: nonAdminHeader,
            }
          )

          expect(response.status).toBe(200)
          expect(response.data.view_configuration).toBeNull()
        })
      })

      describe("POST /admin/view-configurations/active", () => {
        let viewConfig

        beforeEach(async () => {
          const container = getContainer()
          const settingsService = container.resolve("settings")

          viewConfig = await settingsService.createViewConfigurations({
            entity: "orders",
            name: "Test View",
            is_system_default: false,
            user_id: nonAdminUserId,
            configuration: {
              visible_columns: ["id"],
              column_order: ["id"],
            },
          })
        })

        it("should set active view configuration", async () => {
          const response = await api.post(
            "/admin/view-configurations/active",
            {
              entity: "orders",
              view_configuration_id: viewConfig.id,
            },
            {
              headers: nonAdminHeader,
            }
          )

          expect(response.status).toBe(200)
          expect(response.data.success).toBe(true)

          // Verify it's active
          const activeResponse = await api.get(
            "/admin/view-configurations/active?entity=orders",
            {
              headers: nonAdminHeader,
            }
          )

          expect(activeResponse.data.view_configuration.id).toBe(viewConfig.id)
        })

        it("should clear active view and return to default when setting view_configuration_id to null", async () => {
          // First set an active view
          await api.post(
            "/admin/view-configurations/active",
            {
              entity: "orders",
              view_configuration_id: viewConfig.id,
            },
            {
              headers: nonAdminHeader,
            }
          )

          // Verify it's active
          let activeResponse = await api.get(
            "/admin/view-configurations/active?entity=orders",
            {
              headers: nonAdminHeader,
            }
          )
          expect(activeResponse.data.view_configuration.id).toBe(viewConfig.id)

          // Now clear the active view
          const clearResponse = await api.post(
            "/admin/view-configurations/active",
            {
              entity: "orders",
              view_configuration_id: null,
            },
            {
              headers: nonAdminHeader,
            }
          )

          expect(clearResponse.status).toBe(200)
          expect(clearResponse.data.success).toBe(true)

          // Verify the active view is cleared
          activeResponse = await api.get(
            "/admin/view-configurations/active?entity=orders",
            {
              headers: nonAdminHeader,
            }
          )

          // Debug output
          if (activeResponse.data.view_configuration) {
            console.log("Active view after clearing:", {
              id: activeResponse.data.view_configuration.id,
              name: activeResponse.data.view_configuration.name,
              is_system_default: activeResponse.data.view_configuration.is_system_default
            })
          }

          // Should either return null or a system default if one exists
          if (activeResponse.data.view_configuration) {
            expect(activeResponse.data.view_configuration.is_system_default).toBe(true)
          } else {
            expect(activeResponse.data.view_configuration).toBeNull()
          }
          expect(activeResponse.data.is_default_active).toBe(true)
        })
      })

      describe("System Default Views", () => {
        it("should make system default views available to all users", async () => {
          const container = getContainer()
          const userModule = container.resolve(Modules.USER)
          const authModule = container.resolve(Modules.AUTH)
          
          // Create a second admin user
          const secondAdminUser = await userModule.createUsers({
            email: "admin2@test.com",
            first_name: "Admin",
            last_name: "Two",
          })

          const secondAdminAuthIdentity = await authModule.createAuthIdentities({
            provider_identities: [{
              provider: "store",
              entity_id: secondAdminUser.id,
            }],
            app_metadata: {
              user_id: secondAdminUser.id,
              admin: true,
            },
          })

          const config = container.resolve(ContainerRegistrationKeys.CONFIG_MODULE)
          const { projectConfig } = config
          const { jwtSecret, jwtOptions } = projectConfig.http
          const secondAdminJWT = jwt.sign(
            {
              actor_id: secondAdminUser.id,
              actor_type: "user",
              auth_identity_id: secondAdminAuthIdentity.id,
            },
            jwtSecret,
            {
              expiresIn: "1d",
              ...jwtOptions,
            }
          )

          // Admin 1 creates a system default view
          const systemDefaultView = await api.post(
            "/admin/view-configurations",
            {
              entity: "orders",
              name: "System Default View",
              configuration: {
                visible_columns: ["id", "display_id", "created_at"],
                column_order: ["display_id", "id", "created_at"],
              },
              is_system_default: true,
            },
            adminHeaders
          )

          expect(systemDefaultView.status).toEqual(201)
          expect(systemDefaultView.data.view_configuration.user_id).toBeNull()

          // Admin 2 should be able to see this view
          const viewsForAdmin2 = await api.get(
            "/admin/view-configurations?entity=orders",
            { headers: { authorization: `Bearer ${secondAdminJWT}` } }
          )

          expect(viewsForAdmin2.status).toEqual(200)
          const systemDefaults = viewsForAdmin2.data.view_configurations.filter(
            (v: any) => v.is_system_default
          )
          expect(systemDefaults).toHaveLength(1)
          expect(systemDefaults[0].name).toEqual("System Default View")

          // Admin 2 should also be able to retrieve it directly
          const directRetrieve = await api.get(
            `/admin/view-configurations/${systemDefaultView.data.view_configuration.id}`,
            { headers: { authorization: `Bearer ${secondAdminJWT}` } }
          )

          expect(directRetrieve.status).toEqual(200)
          expect(directRetrieve.data.view_configuration.name).toEqual("System Default View")
        })

        it("should allow converting personal view to system default", async () => {
          const container = getContainer()
          const userModule = container.resolve(Modules.USER)
          const authModule = container.resolve(Modules.AUTH)
          
          // Create a personal view first
          const personalView = await api.post(
            "/admin/view-configurations",
            {
              entity: "orders",
              name: "My Personal View",
              configuration: {
                visible_columns: ["id", "status"],
                column_order: ["status", "id"],
              },
              is_system_default: false,
            },
            adminHeaders
          )

          expect(personalView.status).toEqual(201)
          expect(personalView.data.view_configuration.user_id).toEqual(adminUserId)

          // Update it to be a system default
          const updatedView = await api.post(
            `/admin/view-configurations/${personalView.data.view_configuration.id}`,
            {
              is_system_default: true,
            },
            adminHeaders
          )

          expect(updatedView.status).toEqual(200)
          expect(updatedView.data.view_configuration.user_id).toBeNull()
          expect(updatedView.data.view_configuration.is_system_default).toBe(true)

          // Create another user and verify they can see it
          const anotherUser = await userModule.createUsers({
            email: "another@test.com",
            first_name: "Another",
            last_name: "User",
          })

          const anotherAuthIdentity = await authModule.createAuthIdentities({
            provider_identities: [{
              provider: "store",
              entity_id: anotherUser.id,
            }],
            app_metadata: {
              user_id: anotherUser.id,
            },
          })

          const config = container.resolve(ContainerRegistrationKeys.CONFIG_MODULE)
          const { projectConfig } = config
          const { jwtSecret, jwtOptions } = projectConfig.http
          const anotherJWT = jwt.sign(
            {
              actor_id: anotherUser.id,
              actor_type: "user",
              auth_identity_id: anotherAuthIdentity.id,
            },
            jwtSecret,
            {
              expiresIn: "1d",
              ...jwtOptions,
            }
          )

          const viewsForAnother = await api.get(
            "/admin/view-configurations?entity=orders",
            { headers: { authorization: `Bearer ${anotherJWT}` } }
          )

          const foundView = viewsForAnother.data.view_configurations.find(
            (v: any) => v.id === personalView.data.view_configuration.id
          )
          expect(foundView).toBeDefined()
          expect(foundView.is_system_default).toBe(true)
        })

        it("should allow creating system default without name", async () => {
          // Create a system default view without providing a name
          const systemDefaultView = await api.post(
            "/admin/view-configurations",
            {
              entity: "customers",
              is_system_default: true,
              configuration: {
                visible_columns: ["id", "email", "first_name", "last_name"],
                column_order: ["email", "first_name", "last_name", "id"],
              },
              // Note: no name field
            },
            adminHeaders
          )

          expect(systemDefaultView.status).toEqual(201)
          expect(systemDefaultView.data.view_configuration.user_id).toBeNull()
          expect(systemDefaultView.data.view_configuration.is_system_default).toBe(true)
          // Name should be undefined/null when not provided
          expect(systemDefaultView.data.view_configuration.name).toBeFalsy()
        })

        it("should set view as active when created with set_active flag", async () => {
          // Create a view with set_active = true
          const viewConfig = await api.post(
            "/admin/view-configurations",
            {
              entity: "orders",
              name: "Auto-Active View",
              configuration: {
                visible_columns: ["id", "display_id", "status"],
                column_order: ["display_id", "status", "id"],
              },
              set_active: true,
            },
            { headers: nonAdminHeader }
          )

          expect(viewConfig.status).toEqual(201)
          
          // Verify the view is now active
          const activeView = await api.get(
            "/admin/view-configurations/active?entity=orders",
            { headers: nonAdminHeader }
          )

          expect(activeView.status).toEqual(200)
          expect(activeView.data.view_configuration).toBeTruthy()
          expect(activeView.data.view_configuration.id).toEqual(viewConfig.data.view_configuration.id)
          expect(activeView.data.view_configuration.name).toEqual("Auto-Active View")
        })

        it("should set view as active when updated with set_active flag", async () => {
          const container = getContainer()
          const settingsService = container.resolve("settings")

          // Create two views
          const view1 = await settingsService.createViewConfigurations({
            entity: "orders",
            name: "View 1",
            is_system_default: false,
            user_id: nonAdminUserId,
            configuration: {
              visible_columns: ["id"],
              column_order: ["id"],
            },
          })

          const view2 = await settingsService.createViewConfigurations({
            entity: "orders",
            name: "View 2",
            is_system_default: false,
            user_id: nonAdminUserId,
            configuration: {
              visible_columns: ["id", "total"],
              column_order: ["total", "id"],
            },
          })

          // Set view1 as active initially
          await settingsService.setActiveViewConfiguration(
            "orders",
            nonAdminUserId,
            view1.id
          )

          // Update view2 with set_active flag
          const updateResponse = await api.post(
            `/admin/view-configurations/${view2.id}`,
            {
              name: "Updated View 2",
              set_active: true,
            },
            { headers: nonAdminHeader }
          )

          expect(updateResponse.status).toEqual(200)

          // Verify view2 is now the active view
          const activeView = await api.get(
            "/admin/view-configurations/active?entity=orders",
            { headers: nonAdminHeader }
          )

          expect(activeView.status).toEqual(200)
          expect(activeView.data.view_configuration.id).toEqual(view2.id)
          expect(activeView.data.view_configuration.name).toEqual("Updated View 2")
        })

        it("should allow updating only the system default flag without name", async () => {
          // Create a personal view first
          const personalView = await api.post(
            "/admin/view-configurations",
            {
              entity: "products",
              name: "Product View",
              configuration: {
                visible_columns: ["id", "title", "status"],
                column_order: ["title", "status", "id"],
              },
              is_system_default: false,
            },
            adminHeaders
          )

          expect(personalView.status).toEqual(201)
          const originalName = personalView.data.view_configuration.name

          // Update only the system default flag
          const updatedView = await api.post(
            `/admin/view-configurations/${personalView.data.view_configuration.id}`,
            {
              is_system_default: true,
              // Note: not providing name or configuration
            },
            adminHeaders
          )

          expect(updatedView.status).toEqual(200)
          expect(updatedView.data.view_configuration.user_id).toBeNull()
          expect(updatedView.data.view_configuration.is_system_default).toBe(true)
          expect(updatedView.data.view_configuration.name).toEqual(originalName)
          expect(updatedView.data.view_configuration.configuration).toEqual(
            personalView.data.view_configuration.configuration
          )
        })

        it("should allow resetting system default to code-level defaults", async () => {
          // Create a system default view
          const systemDefaultView = await api.post(
            "/admin/view-configurations",
            {
              entity: "orders",
              name: "Custom System Default",
              is_system_default: true,
              configuration: {
                visible_columns: ["id", "status", "total"],
                column_order: ["status", "total", "id"],
              },
            },
            adminHeaders
          )

          expect(systemDefaultView.status).toEqual(201)
          const viewId = systemDefaultView.data.view_configuration.id

          // Verify it exists
          let viewsList = await api.get(
            "/admin/view-configurations?entity=orders",
            adminHeaders
          )
          expect(viewsList.data.view_configurations.some((v: any) => v.id === viewId)).toBe(true)

          // Delete the system default view (reset to code defaults)
          const deleteResponse = await api.delete(
            `/admin/view-configurations/${viewId}`,
            adminHeaders
          )

          expect(deleteResponse.status).toEqual(200)
          expect(deleteResponse.data.deleted).toBe(true)

          // Verify it's gone
          viewsList = await api.get(
            "/admin/view-configurations?entity=orders",
            adminHeaders
          )
          expect(viewsList.data.view_configurations.some((v: any) => v.id === viewId)).toBe(false)

          // Getting active view should return null (falls back to code defaults)
          const activeView = await api.get(
            "/admin/view-configurations/active?entity=orders",
            adminHeaders
          )
          expect(activeView.data.view_configuration).toBeNull()
        })

        it("should return system default view when created and no user view is active", async () => {
          // Step 1: Create a system default view
          const systemDefaultView = await api.post(
            "/admin/view-configurations",
            {
              entity: "orders",
              name: "System Default Orders",
              is_system_default: true,
              configuration: {
                visible_columns: ["id", "display_id", "created_at", "customer", "total"],
                column_order: ["display_id", "customer", "total", "created_at", "id"],
                filters: {},
                sorting: { id: "created_at", desc: true },
                search: "",
              },
            },
            adminHeaders
          )

          expect(systemDefaultView.status).toEqual(201)
          expect(systemDefaultView.data.view_configuration.is_system_default).toBe(true)

          // Step 2: Retrieve active view - should return the system default
          const activeView = await api.get(
            "/admin/view-configurations/active?entity=orders",
            { headers: nonAdminHeader }
          )

          expect(activeView.status).toEqual(200)
          expect(activeView.data.view_configuration).toBeTruthy()
          expect(activeView.data.view_configuration.id).toEqual(systemDefaultView.data.view_configuration.id)
          expect(activeView.data.view_configuration.name).toEqual("System Default Orders")
          expect(activeView.data.view_configuration.is_system_default).toBe(true)
          expect(activeView.data.is_default_active).toBe(true)
          expect(activeView.data.default_type).toEqual("system")
        })
      })
    })
  },
})