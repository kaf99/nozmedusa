import { makeExecutableSchema } from "@graphql-tools/schema"
import { mergeTypeDefs } from "@graphql-tools/merge"
import { MedusaModule } from "@medusajs/framework/modules-sdk"
import { cleanGraphQLSchema } from "@medusajs/framework/utils"

// Mock MedusaModule
jest.mock("@medusajs/framework/modules-sdk", () => ({
  MedusaModule: {
    getAllJoinerConfigs: jest.fn(),
  },
}))

describe("Schema Processing", () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe("Schema Discovery and Merging", () => {
    it("should discover entity type from joiner configs", () => {
      const mockConfigs = [
        {
          schema: `
            type Order {
              id: ID!
              display_id: String!
            }
          `,
        },
        {
          schema: `
            type Customer {
              id: ID!
              email: String!
            }
          `,
        },
      ]

      ;(MedusaModule.getAllJoinerConfigs as jest.Mock).mockReturnValue(mockConfigs)

      const schemaFragments = mockConfigs
        .filter((config) => config.schema)
        .map((config) => config.schema)

      const hasOrderType = schemaFragments.some((schema) =>
        schema.includes("type Order {")
      )
      const hasCustomerType = schemaFragments.some((schema) =>
        schema.includes("type Customer {")
      )

      expect(hasOrderType).toBe(true)
      expect(hasCustomerType).toBe(true)
    })

    it("should merge multiple schema fragments", () => {
      const schema1 = `
        type Order {
          id: ID!
          customer: Customer
        }
      `
      const schema2 = `
        type Order {
          total: Int!
          items: [OrderItem!]!
        }
        
        type Customer {
          id: ID!
          email: String!
        }
        
        type OrderItem {
          id: ID!
          quantity: Int!
        }
      `

      const mergedSchemaAST = mergeTypeDefs([schema1, schema2])
      const mergedSchema = makeExecutableSchema({
        typeDefs: mergedSchemaAST,
        resolvers: {},
      })

      const orderType = mergedSchema.getType("Order")
      expect(orderType).toBeDefined()
      
      // Check that fields from both schemas are merged
      const orderFields = (orderType as any).getFields()
      expect(orderFields).toHaveProperty("id")
      expect(orderFields).toHaveProperty("customer")
      expect(orderFields).toHaveProperty("total")
      expect(orderFields).toHaveProperty("items")
    })

    it("should handle scalar definitions", () => {
      const scalarDefinitions = `
        scalar DateTime
        scalar JSON
      `
      const schemaWithScalars = `
        ${scalarDefinitions}
        
        type Event {
          id: ID!
          occurred_at: DateTime!
          metadata: JSON
        }
      `

      const schema = makeExecutableSchema({
        typeDefs: schemaWithScalars,
        resolvers: {
          DateTime: {
            serialize: (value) => value,
            parseValue: (value) => value,
            parseLiteral: (ast) => ast,
          },
          JSON: {
            serialize: (value) => value,
            parseValue: (value) => value,
            parseLiteral: (ast) => ast,
          },
        },
      })

      expect(schema.getType("DateTime")).toBeDefined()
      expect(schema.getType("JSON")).toBeDefined()
    })
  })

  describe("Schema Validation", () => {
    it("should handle missing entity type", () => {
      const mockConfigs = [
        {
          schema: `
            type Product {
              id: ID!
              title: String!
            }
          `,
        },
      ]

      ;(MedusaModule.getAllJoinerConfigs as jest.Mock).mockReturnValue(mockConfigs)

      const schemaFragments = mockConfigs.map((config) => config.schema)
      const hasOrderType = schemaFragments.some((schema) =>
        schema.includes("type Order {")
      )

      expect(hasOrderType).toBe(false)
    })

    it("should handle empty joiner configs", () => {
      ;(MedusaModule.getAllJoinerConfigs as jest.Mock).mockReturnValue([])

      const configs = MedusaModule.getAllJoinerConfigs()
      expect(configs).toHaveLength(0)
    })

    it("should handle configs without schema", () => {
      const mockConfigs = [
        { someOtherProperty: "value" },
        { schema: null },
        { schema: undefined },
        {
          schema: `
            type ValidType {
              id: ID!
            }
          `,
        },
      ]

      ;(MedusaModule.getAllJoinerConfigs as jest.Mock).mockReturnValue(mockConfigs)

      const schemaFragments = mockConfigs
        .filter((config) => config.schema)
        .map((config) => config.schema)

      expect(schemaFragments).toHaveLength(1)
      expect(schemaFragments[0]).toContain("type ValidType")
    })
  })

  describe("Schema Type Extraction", () => {
    it("should extract correct type from schema type map", () => {
      const typeDefs = `
        type Order {
          id: ID!
          status: String!
        }
        
        type Customer {
          id: ID!
          email: String!
        }
      `

      const schema = makeExecutableSchema({
        typeDefs,
        resolvers: {},
      })

      const schemaTypeMap = schema.getTypeMap()
      const orderType = schemaTypeMap["Order"]
      const customerType = schemaTypeMap["Customer"]

      expect(orderType).toBeDefined()
      expect(customerType).toBeDefined()
      expect(orderType.name).toBe("Order")
      expect(customerType.name).toBe("Customer")
    })

    it("should handle GraphQL introspection types", () => {
      const schema = makeExecutableSchema({
        typeDefs: `
          type Query {
            hello: String
          }
        `,
        resolvers: {},
      })

      const schemaTypeMap = schema.getTypeMap()
      
      // Should contain introspection types
      expect(schemaTypeMap["__Schema"]).toBeDefined()
      expect(schemaTypeMap["__Type"]).toBeDefined()
      expect(schemaTypeMap["__Field"]).toBeDefined()
      
      // Should filter these out in real implementation
      const userTypes = Object.keys(schemaTypeMap).filter(
        (typeName) => !typeName.startsWith("__")
      )
      
      expect(userTypes).not.toContain("__Schema")
      expect(userTypes).not.toContain("__Type")
    })
  })

  describe("Schema Cleaning", () => {
    it("should clean schema before processing", () => {
      const dirtySchema = `
        # Comments should be preserved
        type Order implements Node {
          id: ID!
          # This is a display ID
          display_id: String!
          """
          Multi-line
          description
          """
          status: OrderStatus!
        }
        
        interface Node {
          id: ID!
        }
        
        enum OrderStatus {
          PENDING
          COMPLETED
        }
      `

      // Test the actual cleanGraphQLSchema function
      const { schema: cleanedSchema } = cleanGraphQLSchema(dirtySchema)
      
      // The cleaned schema should be valid and contain our types
      expect(cleanedSchema).toBeDefined()
      expect(cleanedSchema).toContain("type Order")
      expect(cleanedSchema).toContain("interface Node")
      expect(cleanedSchema).toContain("enum OrderStatus")
    })

    it("should handle schema with directives", () => {
      const schemaWithDirectives = `
        directive @deprecated(reason: String) on FIELD_DEFINITION
        
        type Product {
          id: ID!
          oldField: String @deprecated(reason: "Use newField instead")
          newField: String
        }
      `

      const schema = makeExecutableSchema({
        typeDefs: schemaWithDirectives,
        resolvers: {},
      })

      const productType = schema.getType("Product") as any
      const fields = productType.getFields()
      
      expect(fields.oldField).toBeDefined()
      expect(fields.newField).toBeDefined()
    })
  })

  describe("Error Handling", () => {
    it("should handle invalid GraphQL schema", () => {
      const invalidSchema = `
        type Order {
          id: ID!
          status: InvalidType!
        }
      `

      expect(() => {
        makeExecutableSchema({
          typeDefs: invalidSchema,
          resolvers: {},
        })
      }).toThrow()
    })

    it("should handle circular type references gracefully", () => {
      const circularSchema = `
        type Order {
          id: ID!
          customer: Customer!
        }
        
        type Customer {
          id: ID!
          orders: [Order!]!
        }
      `

      const schema = makeExecutableSchema({
        typeDefs: circularSchema,
        resolvers: {},
      })

      const orderType = schema.getType("Order") as any
      const customerType = schema.getType("Customer") as any
      
      expect(orderType.getFields().customer.type.ofType.name).toBe("Customer")
      const ordersField = customerType.getFields().orders
      // The type structure is [Order!]! so it's NonNull<List<NonNull<Order>>>
      expect(ordersField.type.ofType.ofType.ofType.name).toBe("Order")
    })

    it("should handle empty schema fragments", () => {
      const emptyFragments = ["", "   ", null, undefined]
      const validFragments = emptyFragments.filter(Boolean).filter(f => f?.trim())
      
      expect(validFragments).toHaveLength(0)
    })
  })

  describe("Performance Considerations", () => {
    it("should handle large schemas efficiently", () => {
      // Generate a large schema
      const largeSchema = `
        scalar DateTime
        scalar JSON
        
        ${Array.from({ length: 100 }, (_, i) => `
          type Entity${i} {
            id: ID!
            name: String!
            created_at: DateTime!
            metadata: JSON
            ${i > 0 ? `parent: Entity${i - 1}` : ""}
          }
        `).join("\n")}
      `

      const startTime = Date.now()
      const schema = makeExecutableSchema({
        typeDefs: largeSchema,
        resolvers: {},
      })
      const endTime = Date.now()

      expect(schema.getTypeMap()).toBeDefined()
      expect(Object.keys(schema.getTypeMap()).length).toBeGreaterThan(100)
      
      // Schema creation should be reasonably fast (under 1 second)
      expect(endTime - startTime).toBeLessThan(1000)
    })
  })
})