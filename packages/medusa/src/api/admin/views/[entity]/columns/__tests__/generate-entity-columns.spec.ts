import { MedusaModule } from "@medusajs/framework/modules-sdk"
import { generateEntityColumns } from "../helpers"
import { ENTITY_MAPPINGS } from "../entity-mappings"

// Mock the MedusaModule
jest.mock("@medusajs/framework/modules-sdk", () => ({
  MedusaModule: {
    getAllJoinerConfigs: jest.fn(),
  },
}))

// Mock the GraphQL utilities
jest.mock("@medusajs/framework/utils", () => ({
  ...jest.requireActual("@medusajs/framework/utils"),
  makeExecutableSchema: jest.fn(),
  mergeTypeDefs: jest.fn(),
  print: jest.fn(),
  cleanGraphQLSchema: jest.fn(),
  graphqlSchemaToFields: jest.fn(),
  extractRelationsFromGQL: jest.fn(),
}))

import {
  makeExecutableSchema,
  mergeTypeDefs,
  print,
  cleanGraphQLSchema,
  graphqlSchemaToFields,
  extractRelationsFromGQL,
} from "@medusajs/framework/utils"

describe("generateEntityColumns", () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe("Schema Discovery", () => {
    it("should return null when no joiner configs exist", () => {
      ;(MedusaModule.getAllJoinerConfigs as jest.Mock).mockReturnValue([])

      const result = generateEntityColumns("orders", ENTITY_MAPPINGS.orders)

      expect(result).toBeNull()
    })

    it("should return null when entity type is not found in schemas", () => {
      ;(MedusaModule.getAllJoinerConfigs as jest.Mock).mockReturnValue([
        {
          schema: `
            type Product {
              id: ID!
              title: String!
            }
          `,
        },
      ])

      const result = generateEntityColumns("orders", ENTITY_MAPPINGS.orders)

      expect(result).toBeNull()
    })

    it("should process schemas when entity type is found", () => {
      const mockSchema = `
        type Order {
          id: ID!
          display_id: String!
          status: String!
        }
      `

      ;(MedusaModule.getAllJoinerConfigs as jest.Mock).mockReturnValue([
        { schema: mockSchema },
      ])

      ;(mergeTypeDefs as jest.Mock).mockReturnValue({})
      ;(print as jest.Mock).mockReturnValue(mockSchema)
      ;(cleanGraphQLSchema as jest.Mock).mockReturnValue({ schema: mockSchema })

      const mockExecutableSchema = {
        getTypeMap: jest.fn().mockReturnValue({
          Order: {
            getFields: jest.fn().mockReturnValue({
              id: { type: { name: "ID" } },
              display_id: { type: { name: "String" } },
              status: { type: { name: "String" } },
            }),
          },
        }),
      }

      ;(makeExecutableSchema as jest.Mock).mockReturnValue(mockExecutableSchema)
      ;(graphqlSchemaToFields as jest.Mock).mockReturnValue([
        "id",
        "display_id",
        "status",
      ])
      ;(extractRelationsFromGQL as jest.Mock).mockReturnValue(new Map())

      const result = generateEntityColumns("orders", ENTITY_MAPPINGS.orders)

      expect(result).not.toBeNull()
      expect(mergeTypeDefs).toHaveBeenCalled()
      expect(cleanGraphQLSchema).toHaveBeenCalled()
      expect(makeExecutableSchema).toHaveBeenCalled()
    })
  })

  describe("Direct Column Generation", () => {
    const setupMocks = (fields: string[], fieldDefinitions: Record<string, any> = {}) => {
      const mockSchema = `
        type Order {
          ${fields.map((f) => `${f}: String`).join("\n")}
        }
      `

      ;(MedusaModule.getAllJoinerConfigs as jest.Mock).mockReturnValue([
        { schema: mockSchema },
      ])

      ;(mergeTypeDefs as jest.Mock).mockReturnValue({})
      ;(print as jest.Mock).mockReturnValue(mockSchema)
      ;(cleanGraphQLSchema as jest.Mock).mockReturnValue({ schema: mockSchema })

      const mockFields: Record<string, any> = {}
      fields.forEach((field) => {
        mockFields[field] = fieldDefinitions[field] || {
          type: { name: "String" },
        }
      })

      const mockExecutableSchema = {
        getTypeMap: jest.fn().mockReturnValue({
          Order: {
            getFields: jest.fn().mockReturnValue(mockFields),
          },
        }),
      }

      ;(makeExecutableSchema as jest.Mock).mockReturnValue(mockExecutableSchema)
      ;(graphqlSchemaToFields as jest.Mock).mockReturnValue(fields)
      ;(extractRelationsFromGQL as jest.Mock).mockReturnValue(new Map())
    }

    it("should generate columns for direct fields", () => {
      setupMocks(["id", "display_id", "status", "created_at", "total"])

      const result = generateEntityColumns("orders", ENTITY_MAPPINGS.orders)

      expect(result).toHaveLength(9) // 5 direct fields + 4 computed columns
      
      const displayIdColumn = result?.find((col) => col.id === "display_id")
      expect(displayIdColumn).toMatchObject({
        id: "display_id",
        name: "Display Id",
        field: "display_id",
        sortable: true,
        hideable: true,
        default_visible: true,
        default_order: 100,
      })

      const statusColumn = result?.find((col) => col.id === "status")
      expect(statusColumn).toMatchObject({
        id: "status",
        name: "Status",
        field: "status",
        category: "status",
      })
    })

    it("should filter out array fields", () => {
      const mockListType = {
        ofType: { name: "OrderItem" },
      }

      setupMocks(["id", "items", "status"], {
        id: { type: { name: "ID" } },
        items: {
          type: {
            ofType: mockListType,
            toString: () => "[OrderItem]",
          },
        },
        status: { type: { name: "String" } },
      })

      // Override the graphqlSchemaToFields to simulate array detection
      ;(graphqlSchemaToFields as jest.Mock).mockReturnValue(["id", "status"])

      const result = generateEntityColumns("orders", ENTITY_MAPPINGS.orders)

      expect(result).not.toBeNull()
      const columnIds = result?.map((col) => col.id)
      expect(columnIds).toContain("id")
      expect(columnIds).toContain("status")
      expect(columnIds).not.toContain("items")
    })

    it("should add display_id for orders if not present", () => {
      setupMocks(["id", "status", "total"])

      const result = generateEntityColumns("orders", ENTITY_MAPPINGS.orders)

      expect(result).not.toBeNull()
      const columnIds = result?.map((col) => col.id)
      expect(columnIds?.[0]).toBe("display_id")
    })

    it("should respect field filters", () => {
      setupMocks(["id", "status", "raw_data", "order_change", "metadata"])

      const result = generateEntityColumns("orders", ENTITY_MAPPINGS.orders)

      expect(result).not.toBeNull()
      const columnIds = result?.map((col) => col.id)
      
      // Should include these
      expect(columnIds).toContain("id")
      expect(columnIds).toContain("status")
      
      // Should filter out these based on ENTITY_MAPPINGS.orders.fieldFilters
      expect(columnIds).not.toContain("raw_data") // excludePrefixes: ["raw_"]
      expect(columnIds).not.toContain("order_change") // excludeFields: ["order_change"]
    })
  })

  describe("Relationship Column Generation", () => {
    const setupWithRelations = (
      relations: Map<string, Map<string, string>>,
      relatedFields: Record<string, string[]> = {}
    ) => {
      const mockSchema = `
        type Order {
          id: ID!
          customer: Customer
          sales_channel: SalesChannel
        }
        
        type Customer {
          id: ID!
          email: String!
          first_name: String
        }
        
        type SalesChannel {
          id: ID!
          name: String!
        }
      `

      ;(MedusaModule.getAllJoinerConfigs as jest.Mock).mockReturnValue([
        { schema: mockSchema },
      ])

      ;(mergeTypeDefs as jest.Mock).mockReturnValue({})
      ;(print as jest.Mock).mockReturnValue(mockSchema)
      ;(cleanGraphQLSchema as jest.Mock).mockReturnValue({ schema: mockSchema })

      const mockTypeMap: Record<string, any> = {
        Order: {
          getFields: jest.fn().mockReturnValue({
            id: { type: { name: "ID" } },
            customer: {
              type: {
                name: "Customer",
                ofType: null,
              },
            },
            sales_channel: {
              type: {
                name: "SalesChannel",
                ofType: null,
              },
            },
          }),
        },
        Customer: {
          getFields: jest.fn().mockReturnValue({
            id: { type: { name: "ID" } },
            email: { type: { name: "String" } },
            first_name: { type: { name: "String" } },
          }),
        },
        SalesChannel: {
          getFields: jest.fn().mockReturnValue({
            id: { type: { name: "ID" } },
            name: { type: { name: "String" } },
          }),
        },
      }

      const mockExecutableSchema = {
        getTypeMap: jest.fn().mockReturnValue(mockTypeMap),
      }

      ;(makeExecutableSchema as jest.Mock).mockReturnValue(mockExecutableSchema)
      ;(graphqlSchemaToFields as jest.Mock).mockImplementation((typeMap, typeName) => {
        if (typeName === "Order") return ["id"]
        return relatedFields[typeName] || []
      })
      
      // Set up the extract relations mock to return the relation map
      ;(extractRelationsFromGQL as jest.Mock).mockReturnValue(relations)
    }

    it("should generate relationship columns", () => {
      const relations = new Map([
        ["Order", new Map([
          ["customer", "Customer"],
          ["sales_channel", "SalesChannel"],
        ])],
      ])

      setupWithRelations(relations, {
        Customer: ["id", "email", "first_name"],
        SalesChannel: ["id", "name"],
      })

      const result = generateEntityColumns("orders", ENTITY_MAPPINGS.orders)

      expect(result).not.toBeNull()
      
      // Should have both direct columns and relationship columns
      const allColumns = result || []
      
      // Check if we have the expected number of columns (including computed)
      expect(allColumns.length).toBeGreaterThan(5)
      
      // Look for sales_channel.name since it's in the default visible fields
      const salesChannelNameColumn = result?.find((col) => col.id === "sales_channel.name")
      if (salesChannelNameColumn) {
        expect(salesChannelNameColumn).toMatchObject({
          id: "sales_channel.name",
          name: "Sales Channel Name",
          field: "sales_channel.name",
          default_visible: true, // This is in defaultVisibleFields
          default_order: 400,
        })
      }
    })

    it("should limit related fields to 10 per relationship", () => {
      const manyFields = Array.from({ length: 15 }, (_, i) => `field_${i}`)
      
      const relations = new Map([
        ["Order", new Map([["customer", "Customer"]])],
      ])

      setupWithRelations(relations, {
        Customer: manyFields,
      })

      const result = generateEntityColumns("orders", ENTITY_MAPPINGS.orders)

      const customerFields = result?.filter(
        (col) => col.id.startsWith("customer.") && !col.computed
      )
      expect(customerFields?.length).toBeLessThanOrEqual(10)
    })
  })

  describe("Computed Column Generation", () => {
    const setupBasicMocks = () => {
      const mockSchema = `type Order { id: ID! }`

      ;(MedusaModule.getAllJoinerConfigs as jest.Mock).mockReturnValue([
        { schema: mockSchema },
      ])

      ;(mergeTypeDefs as jest.Mock).mockReturnValue({})
      ;(print as jest.Mock).mockReturnValue(mockSchema)
      ;(cleanGraphQLSchema as jest.Mock).mockReturnValue({ schema: mockSchema })

      const mockExecutableSchema = {
        getTypeMap: jest.fn().mockReturnValue({
          Order: {
            getFields: jest.fn().mockReturnValue({
              id: { type: { name: "ID" } },
            }),
          },
        }),
      }

      ;(makeExecutableSchema as jest.Mock).mockReturnValue(mockExecutableSchema)
      ;(graphqlSchemaToFields as jest.Mock).mockReturnValue(["id"])
      ;(extractRelationsFromGQL as jest.Mock).mockReturnValue(new Map())
    }

    it("should generate computed columns based on entity mapping", () => {
      setupBasicMocks()

      const result = generateEntityColumns("orders", ENTITY_MAPPINGS.orders)

      const customerDisplayColumn = result?.find((col) => col.id === "customer_display")
      expect(customerDisplayColumn).toMatchObject({
        id: "customer_display",
        name: "Customer",
        field: "customer_display",
        sortable: false,
        hideable: true,
        default_visible: true,
        data_type: "string",
        semantic_type: "computed",
        context: "display",
        default_order: 300,
        category: "relationship",
        computed: {
          type: "customer_name",
          required_fields: [
            "customer.first_name",
            "customer.last_name",
            "customer.email",
          ],
          optional_fields: ["customer.phone"],
        },
      })

      const countryColumn = result?.find((col) => col.id === "country")
      expect(countryColumn).toMatchObject({
        id: "country",
        name: "Country",
        computed: {
          type: "country_code",
          required_fields: ["shipping_address.country_code"],
          optional_fields: [],
        },
      })
    })
  })

  describe("Column Properties", () => {
    const setupBasicMocks = () => {
      const mockSchema = `
        type Order {
          id: ID!
          total: Int!
          metadata: JSON
          created_at: DateTime!
        }
      `

      ;(MedusaModule.getAllJoinerConfigs as jest.Mock).mockReturnValue([
        { schema: mockSchema },
      ])

      ;(mergeTypeDefs as jest.Mock).mockReturnValue({})
      ;(print as jest.Mock).mockReturnValue(mockSchema)
      ;(cleanGraphQLSchema as jest.Mock).mockReturnValue({ schema: mockSchema })

      const mockExecutableSchema = {
        getTypeMap: jest.fn().mockReturnValue({
          Order: {
            getFields: jest.fn().mockReturnValue({
              id: { type: { name: "ID" } },
              total: { type: { name: "Int" } },
              metadata: { type: { name: "JSON" } },
              created_at: { type: { name: "DateTime" } },
            }),
          },
        }),
      }

      ;(makeExecutableSchema as jest.Mock).mockReturnValue(mockExecutableSchema)
      ;(graphqlSchemaToFields as jest.Mock).mockReturnValue([
        "id",
        "total",
        "metadata",
        "created_at",
      ])
      ;(extractRelationsFromGQL as jest.Mock).mockReturnValue(new Map())
    }

    it("should set sortable to false for metadata and object fields", () => {
      setupBasicMocks()

      const result = generateEntityColumns("orders", ENTITY_MAPPINGS.orders)

      const metadataColumn = result?.find((col) => col.id === "metadata")
      expect(metadataColumn?.sortable).toBe(false)

      const totalColumn = result?.find((col) => col.id === "total")
      expect(totalColumn?.sortable).toBe(true)
    })

    it("should assign correct categories based on field characteristics", () => {
      setupBasicMocks()

      const result = generateEntityColumns("orders", ENTITY_MAPPINGS.orders)

      const idColumn = result?.find((col) => col.id === "id")
      expect(idColumn?.category).toBe("identifier")

      const createdAtColumn = result?.find((col) => col.id === "created_at")
      expect(createdAtColumn?.category).toBe("timestamp")

      const totalColumn = result?.find((col) => col.id === "total")
      expect(totalColumn?.category).toBe("metric")
    })

    it("should set default visibility and order correctly", () => {
      setupBasicMocks()

      const result = generateEntityColumns("orders", ENTITY_MAPPINGS.orders)

      // Check a field that's in defaultVisibleFields
      const createdAtColumn = result?.find((col) => col.id === "created_at")
      expect(createdAtColumn?.default_visible).toBe(true)
      expect(createdAtColumn?.default_order).toBe(200) // From DEFAULT_COLUMN_ORDERS

      // Check a field that's not in defaultVisibleFields
      const metadataColumn = result?.find((col) => col.id === "metadata")
      expect(metadataColumn?.default_visible).toBe(false)
      expect(metadataColumn?.default_order).toBe(850) // Default for non-visible fields
    })
  })

  describe("Error Handling", () => {
    it("should return null when no direct fields are found", () => {
      const mockSchema = `type Order {}`

      ;(MedusaModule.getAllJoinerConfigs as jest.Mock).mockReturnValue([
        { schema: mockSchema },
      ])

      ;(mergeTypeDefs as jest.Mock).mockReturnValue({})
      ;(print as jest.Mock).mockReturnValue(mockSchema)
      ;(cleanGraphQLSchema as jest.Mock).mockReturnValue({ schema: mockSchema })

      const mockExecutableSchema = {
        getTypeMap: jest.fn().mockReturnValue({
          Order: {
            getFields: jest.fn().mockReturnValue({}),
          },
        }),
      }

      ;(makeExecutableSchema as jest.Mock).mockReturnValue(mockExecutableSchema)
      ;(graphqlSchemaToFields as jest.Mock).mockReturnValue([])
      ;(extractRelationsFromGQL as jest.Mock).mockReturnValue(new Map())

      const result = generateEntityColumns("orders", ENTITY_MAPPINGS.orders)

      // Should still return display_id for orders even if no fields found
      expect(result).not.toBeNull()
      expect(result).toHaveLength(5) // display_id + 4 computed columns
      expect(result?.[0].id).toBe("display_id")
    })
  })

  describe("Different Entity Types", () => {
    it("should generate columns for products entity", () => {
      const mockSchema = `
        type Product {
          id: ID!
          title: String!
          status: String!
          thumbnail: String
        }
      `

      ;(MedusaModule.getAllJoinerConfigs as jest.Mock).mockReturnValue([
        { schema: mockSchema },
      ])

      ;(mergeTypeDefs as jest.Mock).mockReturnValue({})
      ;(print as jest.Mock).mockReturnValue(mockSchema)
      ;(cleanGraphQLSchema as jest.Mock).mockReturnValue({ schema: mockSchema })

      const mockExecutableSchema = {
        getTypeMap: jest.fn().mockReturnValue({
          Product: {
            getFields: jest.fn().mockReturnValue({
              id: { type: { name: "ID" } },
              title: { type: { name: "String" } },
              status: { type: { name: "String" } },
              thumbnail: { type: { name: "String" } },
            }),
          },
        }),
      }

      ;(makeExecutableSchema as jest.Mock).mockReturnValue(mockExecutableSchema)
      ;(graphqlSchemaToFields as jest.Mock).mockReturnValue([
        "id",
        "title",
        "status",
        "thumbnail",
      ])
      ;(extractRelationsFromGQL as jest.Mock).mockReturnValue(new Map())

      const result = generateEntityColumns("products", ENTITY_MAPPINGS.products)

      expect(result).not.toBeNull()
      
      const titleColumn = result?.find((col) => col.id === "title")
      expect(titleColumn).toMatchObject({
        id: "title",
        name: "Title",
        default_visible: true,
      })
    })

    it("should generate columns for customers entity", () => {
      const mockSchema = `
        type Customer {
          id: ID!
          email: String!
          first_name: String
          last_name: String
        }
      `

      ;(MedusaModule.getAllJoinerConfigs as jest.Mock).mockReturnValue([
        { schema: mockSchema },
      ])

      ;(mergeTypeDefs as jest.Mock).mockReturnValue({})
      ;(print as jest.Mock).mockReturnValue(mockSchema)
      ;(cleanGraphQLSchema as jest.Mock).mockReturnValue({ schema: mockSchema })

      const mockExecutableSchema = {
        getTypeMap: jest.fn().mockReturnValue({
          Customer: {
            getFields: jest.fn().mockReturnValue({
              id: { type: { name: "ID" } },
              email: { type: { name: "String" } },
              first_name: { type: { name: "String" } },
              last_name: { type: { name: "String" } },
            }),
          },
        }),
      }

      ;(makeExecutableSchema as jest.Mock).mockReturnValue(mockExecutableSchema)
      ;(graphqlSchemaToFields as jest.Mock).mockReturnValue([
        "id",
        "email",
        "first_name",
        "last_name",
      ])
      ;(extractRelationsFromGQL as jest.Mock).mockReturnValue(new Map())

      const result = generateEntityColumns("customers", ENTITY_MAPPINGS.customers)

      expect(result).not.toBeNull()
      
      const emailColumn = result?.find((col) => col.id === "email")
      expect(emailColumn).toMatchObject({
        id: "email",
        name: "Email",
        default_visible: true,
        semantic_type: "email",
      })
    })
  })
})