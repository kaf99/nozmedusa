import { medusaIntegrationTestRunner } from "@medusajs/test-utils"
import {
  adminHeaders,
  createAdminUser,
} from "../helpers/create-admin-user"
import { Modules, ContainerRegistrationKeys } from "@medusajs/framework/utils"
import Scrypt from "scrypt-kdf"
import jwt from "jsonwebtoken"
import { resolve } from "path"

jest.setTimeout(50000)

const env = { MEDUSA_FF_MEDUSA_V2: true }

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

        it.skip("should prevent non-admin from creating system default view", async () => {
          const payload = {
            entity: "orders",
            name: "Default Order View",
            is_system_default: true,
            configuration: {
              visible_columns: ["id", "display_id"],
              column_order: ["display_id", "id"],
            },
          }

          const response = await api.post(
            "/admin/view-configurations",
            payload,
            {
              headers: nonAdminHeader,
            }
          ).catch(e => e.response)

          expect(response.status).toBe(403)
          expect(response.data.message).toBe("Only administrators can create system default views")
        })
      })

      describe("GET /admin/view-configurations", () => {
        let systemView
        let personalView
        let otherUserView

        beforeEach(async () => {
          const container = getContainer()
          const settingsService = container.resolve(Modules.SETTINGS)

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
          const settingsService = container.resolve(Modules.SETTINGS)

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
          const settingsService = container.resolve(Modules.SETTINGS)

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
          const settingsService = container.resolve(Modules.SETTINGS)

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

        it.skip("should prevent updating system default as non-admin", async () => {
          const container = getContainer()
          const settingsService = container.resolve(Modules.SETTINGS)

          const systemView = await settingsService.createViewConfigurations({
            entity: "orders",
            name: "System Default",
            is_system_default: true,
            user_id: null,
            configuration: {
              visible_columns: ["id"],
              column_order: ["id"],
            },
          })

          const response = await api.post(
            `/admin/view-configurations/${systemView.id}`,
            { name: "Hacked" },
            {
              headers: nonAdminHeader,
            }
          ).catch(e => e.response)

          expect(response.status).toBe(404)
        })
      })

      describe("DELETE /admin/view-configurations/:id", () => {
        let viewConfig

        beforeEach(async () => {
          const container = getContainer()
          const settingsService = container.resolve(Modules.SETTINGS)

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
          const settingsService = container.resolve(Modules.SETTINGS)

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
          const settingsService = container.resolve(Modules.SETTINGS)

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
      })
    })
  },
})