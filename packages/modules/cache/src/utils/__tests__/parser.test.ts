import { GraphQLSchema, buildSchema } from "graphql"
import { CacheInvalidationParser, EntityReference } from "../parser"

describe("CacheInvalidationParser", () => {
  let parser: CacheInvalidationParser
  let schema: GraphQLSchema

  beforeEach(() => {
    const schemaDefinition = `
      type Product {
        id: ID!
        title: String
        description: String
        collection: ProductCollection
        categories: [ProductCategory!]
        variants: [ProductVariant!]
        created_at: String
        updated_at: String
      }

      type ProductCollection {
        id: ID!
        title: String
        products: [Product!]
        created_at: String
        updated_at: String
      }

      type ProductCategory {
        id: ID!
        name: String
        products: [Product!]
        parent: ProductCategory
        children: [ProductCategory!]
        created_at: String
        updated_at: String
      }

      type ProductVariant {
        id: ID!
        title: String
        sku: String
        product: Product!
        prices: [Price!]
        created_at: String
        updated_at: String
      }

      type Price {
        id: ID!
        amount: Int
        currency_code: String
        variant: ProductVariant!
        created_at: String
        updated_at: String
      }

      type Order {
        id: ID!
        status: String
        items: [OrderItem!]
        customer: Customer
        created_at: String
        updated_at: String
      }

      type OrderItem {
        id: ID!
        quantity: Int
        order: Order!
        variant: ProductVariant!
        created_at: String
        updated_at: String
      }

      type Customer {
        id: ID!
        first_name: String
        last_name: String
        email: String
        orders: [Order!]
        created_at: String
        updated_at: String
      }
    `

    schema = buildSchema(schemaDefinition)
    parser = new CacheInvalidationParser(schema)
  })

  describe("parseObjectForEntities", () => {
    it("should identify a simple product entity", () => {
      const product = {
        id: "prod_123",
        title: "Test Product",
        description: "A test product",
      }

      const entities = parser.parseObjectForEntities(product)

      expect(entities).toHaveLength(1)
      expect(entities[0]).toEqual({
        type: "Product",
        id: "prod_123",
      })
    })

    it("should identify nested entities in a product with collection", () => {
      const product = {
        id: "prod_123",
        title: "Test Product",
        collection: {
          id: "col_456",
          title: "Test Collection",
        },
      }

      const entities = parser.parseObjectForEntities(product)

      expect(entities).toHaveLength(2)
      expect(entities).toContainEqual({
        type: "Product",
        id: "prod_123",
      })
      expect(entities).toContainEqual({
        type: "ProductCollection",
        id: "col_456",
      })
    })

    it("should identify entities in arrays", () => {
      const product = {
        id: "prod_123",
        title: "Test Product",
        variants: [
          {
            id: "var_789",
            title: "Variant 1",
            sku: "SKU-001",
          },
          {
            id: "var_790",
            title: "Variant 2",
            sku: "SKU-002",
          },
        ],
      }

      const entities = parser.parseObjectForEntities(product)

      expect(entities).toHaveLength(3)
      expect(entities).toContainEqual({
        type: "Product",
        id: "prod_123",
      })
      expect(entities).toContainEqual({
        type: "ProductVariant",
        id: "var_789",
      })
      expect(entities).toContainEqual({
        type: "ProductVariant",
        id: "var_790",
      })
    })

    it("should handle deeply nested entities", () => {
      const order = {
        id: "order_123",
        status: "completed",
        items: [
          {
            id: "item_456",
            quantity: 2,
            variant: {
              id: "var_789",
              title: "Variant 1",
              product: {
                id: "prod_123",
                title: "Test Product",
                collection: {
                  id: "col_456",
                  title: "Test Collection",
                },
              },
            },
          },
        ],
        customer: {
          id: "cus_789",
          email: "test@example.com",
          first_name: "John",
        },
      }

      const entities = parser.parseObjectForEntities(order)

      expect(entities).toHaveLength(6)
      expect(entities).toContainEqual({ type: "Order", id: "order_123" })
      expect(entities).toContainEqual({ type: "OrderItem", id: "item_456" })
      expect(entities).toContainEqual({ type: "ProductVariant", id: "var_789" })
      expect(entities).toContainEqual({ type: "Product", id: "prod_123" })
      expect(entities).toContainEqual({
        type: "ProductCollection",
        id: "col_456",
      })
      expect(entities).toContainEqual({ type: "Customer", id: "cus_789" })
    })

    it("should return empty array for null or primitive values", () => {
      expect(parser.parseObjectForEntities(null)).toEqual([])
      expect(parser.parseObjectForEntities(undefined)).toEqual([])
      expect(parser.parseObjectForEntities("string")).toEqual([])
      expect(parser.parseObjectForEntities(123)).toEqual([])
      expect(parser.parseObjectForEntities(true)).toEqual([])
    })

    it("should ignore objects without id field", () => {
      const invalidObject = {
        title: "No ID Object",
        description: "This object has no ID",
      }

      const entities = parser.parseObjectForEntities(invalidObject)
      expect(entities).toEqual([])
    })

    it("should handle objects with partial field matches", () => {
      const partialProduct = {
        id: "prod_123",
        title: "Test Product",
        unknown_field: "Should still work",
      }

      const entities = parser.parseObjectForEntities(partialProduct)

      expect(entities).toHaveLength(1)
      expect(entities[0]).toEqual({
        type: "Product",
        id: "prod_123",
      })
    })
  })

  describe("buildInvalidationEvents", () => {
    it("should build invalidation events for a single entity", () => {
      const entities: EntityReference[] = [{ type: "Product", id: "prod_123" }]

      const events = parser.buildInvalidationEvents(
        entities,
        "cache:product:prod_123"
      )

      expect(events).toHaveLength(1)
      expect(events[0]).toMatchObject({
        entityType: "Product",
        entityId: "prod_123",
        relatedEntities: [],
      })

      expect(events[0].cacheKeys).toContain("cache:product:prod_123")
      expect(events[0].cacheKeys).toContain("Product:prod_123")
      expect(events[0].cacheKeys).toContain("Product:*")
      expect(events[0].cacheKeys).toContain("*:prod_123")
      // Should always contain collection keys since product changes can impact collections
      expect(events[0].cacheKeys).toContain("Product:collection")
      expect(events[0].cacheKeys).toContain("Product:list:*")
      // Should contain operation-specific keys (defaults to 'update')
      expect(events[0].cacheKeys).toContain("Product:update")
      expect(events[0].cacheKeys).toContain("Product:prod_123:update")
    })

    it("should build invalidation events with related entities", () => {
      const entities: EntityReference[] = [
        { type: "Product", id: "prod_123" },
        { type: "ProductCollection", id: "col_456" },
        { type: "ProductVariant", id: "var_789" },
      ]

      const events = parser.buildInvalidationEvents(
        entities,
        "cache:product:prod_123:full"
      )

      expect(events).toHaveLength(3)

      const productEvent = events.find((e) => e.entityType === "Product")
      expect(productEvent).toBeDefined()
      expect(productEvent!.relatedEntities).toHaveLength(2)
      expect(productEvent!.cacheKeys).toContain(
        "Product:prod_123:ProductCollection:col_456"
      )
      expect(productEvent!.cacheKeys).toContain(
        "Product:prod_123:ProductVariant:var_789"
      )
    })

    it("should avoid duplicate entities in events", () => {
      const entities: EntityReference[] = [
        { type: "Product", id: "prod_123" },
        { type: "Product", id: "prod_123" }, // Duplicate
        { type: "ProductCollection", id: "col_456" },
      ]

      const events = parser.buildInvalidationEvents(entities, "cache:test")

      expect(events).toHaveLength(2) // Should only have Product and ProductCollection events
      expect(events.map((e) => e.entityType).sort()).toEqual([
        "Product",
        "ProductCollection",
      ])
    })

    it("should generate comprehensive cache keys", () => {
      const entities: EntityReference[] = [
        { type: "Product", id: "prod_123" },
        { type: "ProductCollection", id: "col_456" },
      ]

      const events = parser.buildInvalidationEvents(
        entities,
        "original:cache:key"
      )
      const productEvent = events.find((e) => e.entityType === "Product")!

      const expectedKeys = [
        "original:cache:key",
        "Product:prod_123",
        "Product:*",
        "*:prod_123",
        "Product:prod_123:ProductCollection:col_456",
        "ProductCollection:col_456:Product:prod_123",
        "Product:collection",
        "Product:list:*",
      ]

      expectedKeys.forEach((key) => {
        expect(productEvent.cacheKeys).toContain(key)
      })
    })
  })

  describe("generateInvalidationEventName", () => {
    it("should generate event names for different operations", () => {
      expect(parser.generateInvalidationEventName("Product", "create")).toBe(
        "cache.invalidate.Product.create"
      )

      expect(parser.generateInvalidationEventName("Product", "update")).toBe(
        "cache.invalidate.Product.update"
      )

      expect(parser.generateInvalidationEventName("Product", "delete")).toBe(
        "cache.invalidate.Product.delete"
      )
    })

    it("should default to update operation", () => {
      expect(parser.generateInvalidationEventName("Product")).toBe(
        "cache.invalidate.Product.update"
      )
    })
  })

  describe("integration scenarios", () => {
    it("should handle a complete product update scenario", () => {
      const productData = {
        id: "prod_123",
        title: "Updated Product Title",
        collection: {
          id: "col_456",
          title: "Fashion Collection",
        },
        categories: [
          { id: "cat_789", name: "Shirts" },
          { id: "cat_790", name: "Casual" },
        ],
        variants: [
          {
            id: "var_111",
            title: "Size S",
            prices: [{ id: "price_222", amount: 2999, currency_code: "USD" }],
          },
        ],
      }

      const entities = parser.parseObjectForEntities(productData)
      const events = parser.buildInvalidationEvents(
        entities,
        "cache:product:prod_123:details"
      )

      // Should identify all nested entities
      expect(entities).toHaveLength(6) // Product, Collection, 2 Categories, Variant, Price

      // Should create events for each entity type
      expect(events).toHaveLength(6)

      // Product event should have all related entities
      const productEvent = events.find((e) => e.entityType === "Product")!
      expect(productEvent.relatedEntities).toHaveLength(5)

      // Event names should be generated correctly
      expect(parser.generateInvalidationEventName("Product", "update")).toBe(
        "cache.invalidate.Product.update"
      )
    })

    it("should handle order with customer and items scenario", () => {
      const orderData = {
        id: "order_123",
        status: "completed",
        customer: {
          id: "cus_456",
          email: "customer@example.com",
        },
        items: [
          {
            id: "item_789",
            quantity: 2,
            variant: {
              id: "var_111",
              sku: "SHIRT-S-BLUE",
            },
          },
        ],
      }

      const entities = parser.parseObjectForEntities(orderData)
      const events = parser.buildInvalidationEvents(
        entities,
        "cache:order:order_123"
      )

      expect(entities).toHaveLength(4) // Order, Customer, OrderItem, ProductVariant
      expect(events).toHaveLength(4)

      // Check that customer cache would be invalidated when order changes
      const customerEvent = events.find((e) => e.entityType === "Customer")!
      expect(customerEvent.cacheKeys).toContain("Customer:cus_456")
      // Customer event should include collection keys since it has related entities
      expect(customerEvent.cacheKeys).toContain("Customer:collection")
    })

    it("should include create-specific cache keys for create operation", () => {
      const entities: EntityReference[] = [{ type: "Product", id: "prod_123" }]

      const events = parser.buildInvalidationEvents(
        entities,
        "cache:product:prod_123",
        "create"
      )

      const productEvent = events[0]
      expect(productEvent.cacheKeys).toContain("Product:create")
      expect(productEvent.cacheKeys).toContain("Product:prod_123:create")
      expect(productEvent.cacheKeys).toContain("Product:count")
      expect(productEvent.cacheKeys).toContain("Product:total:*")
    })

    it("should include delete-specific cache keys for delete operation", () => {
      const entities: EntityReference[] = [{ type: "Product", id: "prod_123" }]

      const events = parser.buildInvalidationEvents(
        entities,
        "cache:product:prod_123",
        "delete"
      )

      const productEvent = events[0]
      expect(productEvent.cacheKeys).toContain("Product:delete")
      expect(productEvent.cacheKeys).toContain("Product:prod_123:delete")
      expect(productEvent.cacheKeys).toContain("Product:exists:prod_123")
      expect(productEvent.cacheKeys).toContain("Product:active:*")
    })

    it("should include update-specific cache keys for update operation", () => {
      const entities: EntityReference[] = [{ type: "Product", id: "prod_123" }]

      const events = parser.buildInvalidationEvents(
        entities,
        "cache:product:prod_123",
        "update"
      )

      const productEvent = events[0]
      expect(productEvent.cacheKeys).toContain("Product:update")
      expect(productEvent.cacheKeys).toContain("Product:prod_123:update")
      // Update should not include create/delete specific keys
      expect(productEvent.cacheKeys).not.toContain("Product:count")
      expect(productEvent.cacheKeys).not.toContain("Product:exists:prod_123")
    })
  })
})
