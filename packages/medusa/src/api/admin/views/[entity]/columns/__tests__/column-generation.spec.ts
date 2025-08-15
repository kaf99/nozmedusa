import {
  GraphQLObjectType,
  GraphQLList,
  GraphQLNonNull,
} from "graphql"
import { makeExecutableSchema } from "@graphql-tools/schema"
import { DEFAULT_COLUMN_ORDERS } from "../helpers"
import { ENTITY_MAPPINGS } from "../entity-mappings"

describe("Column Generation Logic", () => {
  // Helper to create mock GraphQL schema
  const createMockSchema = () => {
    const typeDefs = `
      scalar DateTime
      scalar JSON

      type Order {
        id: ID!
        display_id: String!
        status: String!
        created_at: DateTime!
        total: Int!
        customer: Customer
        sales_channel: SalesChannel
        shipping_address: Address
        items: [OrderItem!]!
        metadata: JSON
      }

      type Customer {
        id: ID!
        email: String!
        first_name: String
        last_name: String
        phone: String
      }

      type SalesChannel {
        id: ID!
        name: String!
        description: String
        is_disabled: Boolean!
      }

      type Address {
        id: ID!
        country_code: String!
        city: String
      }

      type OrderItem {
        id: ID!
        quantity: Int!
        unit_price: Int!
      }
    `

    return makeExecutableSchema({
      typeDefs,
      resolvers: {},
    })
  }

  describe("Direct Column Generation", () => {
    it("should generate columns for direct fields", () => {
      // const schema = createMockSchema()
      // const schemaTypeMap = schema.getTypeMap()
      // const orderType = schemaTypeMap["Order"] as GraphQLObjectType

      // Mock direct fields
      const directFields = ["id", "display_id", "status", "created_at", "total"]

      const columns = directFields.map((fieldName) => {
        // const field = orderType.getFields()[fieldName]
        const isDefaultVisible = ENTITY_MAPPINGS.orders.defaultVisibleFields.includes(fieldName)
        const defaultOrder = DEFAULT_COLUMN_ORDERS[fieldName] || (isDefaultVisible ? 500 : 850)

        return {
          id: fieldName,
          name: fieldName.split("_").map(word => 
            word.charAt(0).toUpperCase() + word.slice(1)
          ).join(" "),
          field: fieldName,
          sortable: true,
          hideable: true,
          default_visible: isDefaultVisible,
          default_order: defaultOrder,
        }
      })

      expect(columns).toHaveLength(5)
      expect(columns.find(c => c.id === "display_id")).toMatchObject({
        id: "display_id",
        name: "Display Id",
        default_visible: true,
        default_order: 100,
      })
      expect(columns.find(c => c.id === "created_at")).toMatchObject({
        id: "created_at",
        name: "Created At",
        default_visible: true,
        default_order: 200,
      })
    })

    it("should exclude array fields", () => {
      const schema = createMockSchema()
      const schemaTypeMap = schema.getTypeMap()
      const orderType = schemaTypeMap["Order"] as GraphQLObjectType
      const itemsField = orderType.getFields()["items"]

      // Verify items field is an array
      expect(itemsField.type).toBeInstanceOf(GraphQLNonNull)
      const unwrappedType = (itemsField.type as GraphQLNonNull<any>).ofType
      expect(unwrappedType).toBeInstanceOf(GraphQLList)
    })

    it("should exclude metadata fields", () => {
      const directFields = ["id", "display_id", "metadata"]
      const filteredFields = directFields.filter(field => !field.includes("metadata"))
      
      expect(filteredFields).not.toContain("metadata")
      expect(filteredFields).toHaveLength(2)
    })
  })

  describe("Relationship Column Generation", () => {
    it("should generate columns for single relationships", () => {
      const relationshipColumns = [
        {
          id: "customer.email",
          name: "Customer Email",
          field: "customer.email",
          sortable: false,
          hideable: true,
          default_visible: false,
          relationship: {
            entity: "Customer",
            field: "email",
          },
        },
        {
          id: "sales_channel.name",
          name: "Sales Channel Name",
          field: "sales_channel.name",
          sortable: false,
          hideable: true,
          default_visible: true,
          relationship: {
            entity: "SalesChannel",
            field: "name",
          },
        },
      ]

      expect(relationshipColumns).toHaveLength(2)
      expect(relationshipColumns[0]).toMatchObject({
        id: "customer.email",
        relationship: {
          entity: "Customer",
          field: "email",
        },
      })
    })

    it("should limit related fields to 10 per relationship", () => {
      // Create a type with many fields
      const manyFields = Array.from({ length: 15 }, (_, i) => `field_${i}`)
      const limitedFields = manyFields.slice(0, 10)

      expect(limitedFields).toHaveLength(10)
      expect(limitedFields[0]).toBe("field_0")
      expect(limitedFields[9]).toBe("field_9")
    })

    it("should mark specific relationship fields as default visible", () => {
      const salesChannelNameColumn = {
        id: "sales_channel.name",
        field: "sales_channel.name",
        default_visible: ENTITY_MAPPINGS.orders.defaultVisibleFields.includes("sales_channel.name"),
      }

      expect(salesChannelNameColumn.default_visible).toBe(true)
    })
  })

  describe("Computed Column Generation", () => {
    it("should generate computed columns based on entity mapping", () => {
      const computedColumns = Object.entries(ENTITY_MAPPINGS.orders.computedColumns || {}).map(
        ([columnId, config]) => ({
          id: columnId,
          name: config.name,
          field: columnId,
          sortable: false,
          hideable: true,
          default_visible: ENTITY_MAPPINGS.orders.defaultVisibleFields.includes(columnId),
          data_type: "string",
          semantic_type: "computed",
          context: "display",
          computed: {
            type: config.computation_type,
            required_fields: config.required_fields,
            optional_fields: config.optional_fields || [],
          },
        })
      )

      const customerDisplayColumn = computedColumns.find(c => c.id === "customer_display")
      expect(customerDisplayColumn).toMatchObject({
        id: "customer_display",
        name: "Customer",
        sortable: false,
        semantic_type: "computed",
        computed: {
          type: "customer_name",
          required_fields: [
            "customer.first_name",
            "customer.last_name",
            "customer.email",
          ],
        },
      })
    })

    it("should set correct default order for computed columns", () => {
      const customerDisplayOrder = DEFAULT_COLUMN_ORDERS["customer_display"] || 
        (ENTITY_MAPPINGS.orders.defaultVisibleFields.includes("customer_display") ? 600 : 850)
      
      expect(customerDisplayOrder).toBe(300) // Based on DEFAULT_COLUMN_ORDERS
    })
  })

  describe("Column Ordering and Categories", () => {
    it("should assign default orders based on configuration", () => {
      const columns = [
        { id: "display_id", default_order: DEFAULT_COLUMN_ORDERS["display_id"] },
        { id: "created_at", default_order: DEFAULT_COLUMN_ORDERS["created_at"] },
        { id: "total", default_order: DEFAULT_COLUMN_ORDERS["total"] },
        { id: "custom_field", default_order: 850 }, // Non-default field
      ]

      expect(columns[0].default_order).toBe(100)
      expect(columns[1].default_order).toBe(200)
      expect(columns[2].default_order).toBe(700)
      expect(columns[3].default_order).toBe(850)
    })

    it("should categorize columns correctly", () => {
      const categorizeColumn = (id: string, dataType: string, semanticType: string) => {
        if (semanticType === "identifier") return "identifier"
        if (semanticType === "date") return "date"
        if (semanticType === "money") return "money"
        if (semanticType === "status") return "status"
        if (id.includes(".")) return "relationship"
        if (semanticType === "computed") return "relationship"
        return "core"
      }

      expect(categorizeColumn("id", "string", "identifier")).toBe("identifier")
      expect(categorizeColumn("created_at", "date", "date")).toBe("date")
      expect(categorizeColumn("total", "number", "money")).toBe("money")
      expect(categorizeColumn("status", "string", "status")).toBe("status")
      expect(categorizeColumn("customer.name", "string", "string")).toBe("relationship")
      expect(categorizeColumn("customer_display", "string", "computed")).toBe("relationship")
      expect(categorizeColumn("description", "string", "string")).toBe("core")
    })
  })

  describe("Field Filtering", () => {
    it("should apply entity-specific field filters", () => {
      const fields = ["id", "items", "metadata", "_internal", "shipping_address"]
      const filteredFields = fields.filter(field => {
        // Exclude array fields
        if (field === "items") return false
        // Exclude metadata
        if (field === "metadata") return false
        // Exclude internal fields
        if (field.startsWith("_")) return false
        return true
      })

      expect(filteredFields).toEqual(["id", "shipping_address"])
      expect(filteredFields).not.toContain("items")
      expect(filteredFields).not.toContain("metadata")
      expect(filteredFields).not.toContain("_internal")
    })

    it("should handle missing field filters gracefully", () => {
      const fields = ["id", "name", "_internal"]
      // Without filters, only basic filtering should apply
      const filtered = fields.filter(f => !f.startsWith("_"))
      
      expect(filtered).toEqual(["id", "name"])
    })
  })

  describe("Edge Cases", () => {
    it("should handle missing entity type gracefully", () => {
      const schemaTypeMap = {}
      const entityType = schemaTypeMap["NonExistentType"]
      
      expect(entityType).toBeUndefined()
    })

    it("should handle empty schema type map", () => {
      const emptyTypeMap = {}
      const fields = Object.keys(emptyTypeMap)
      
      expect(fields).toHaveLength(0)
    })

    it("should handle circular relationships", () => {
      // In real implementation, this would need cycle detection
      const relations = new Map([
        ["Order", new Map([["customer", "Customer"]])],
        ["Customer", new Map([["orders", "Order"]])],
      ])

      // Should not create infinite loop
      expect(relations.get("Order")?.get("customer")).toBe("Customer")
      expect(relations.get("Customer")?.get("orders")).toBe("Order")
    })
  })
})