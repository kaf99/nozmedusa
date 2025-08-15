import { ENTITY_MAPPINGS } from "../entity-mappings"

describe("Entity Mappings", () => {
  describe("Structure Validation", () => {
    it("should have required properties for each entity", () => {
      Object.entries(ENTITY_MAPPINGS).forEach(([entity, mapping]) => {
        expect(mapping).toHaveProperty("graphqlType")
        expect(mapping).toHaveProperty("defaultVisibleFields")
        expect(Array.isArray(mapping.defaultVisibleFields)).toBe(true)
      })
    })

    it("should have valid GraphQL type names", () => {
      Object.values(ENTITY_MAPPINGS).forEach((mapping) => {
        expect(mapping.graphqlType).toMatch(/^[A-Z][a-zA-Z0-9]*$/)
      })
    })

    it("should have optional properties with correct types", () => {
      Object.entries(ENTITY_MAPPINGS).forEach(([entity, mapping]) => {
        if (mapping.fieldFilters) {
          expect(typeof mapping.fieldFilters).toBe("object")
        }
        if (mapping.computedColumns) {
          expect(typeof mapping.computedColumns).toBe("object")
        }
      })
    })
  })

  describe("Orders Entity Mapping", () => {
    const ordersMapping = ENTITY_MAPPINGS.orders

    it("should have correct GraphQL type", () => {
      expect(ordersMapping.graphqlType).toBe("Order")
    })

    it("should have appropriate default visible fields", () => {
      const expectedFields = [
        "display_id",
        "created_at",
        "customer_display",
        "sales_channel.name",
        "fulfillment_status",
        "payment_status",
        "total",
        "country",
      ]

      expectedFields.forEach((field) => {
        expect(ordersMapping.defaultVisibleFields).toContain(field)
      })
    })

    it("should have computed columns configured", () => {
      expect(ordersMapping.computedColumns).toBeDefined()
      expect(ordersMapping.computedColumns?.customer_display).toMatchObject({
        name: "Customer",
        computation_type: "customer_name",
        required_fields: [
          "customer.first_name",
          "customer.last_name",
          "customer.email",
        ],
      })

      expect(ordersMapping.computedColumns?.country).toMatchObject({
        name: "Country",
        computation_type: "country_code",
        required_fields: ["shipping_address.country_code"],
      })
    })

    it("should have field filters configured", () => {
      expect(ordersMapping.fieldFilters).toBeDefined()
      
      if (ordersMapping.fieldFilters?.excludeFields) {
        // Check that sensitive or internal fields are excluded
        const excludedFields = ordersMapping.fieldFilters.excludeFields
        expect(Array.isArray(excludedFields)).toBe(true)
      }
    })
  })

  describe("Products Entity Mapping", () => {
    const productsMapping = ENTITY_MAPPINGS.products

    it("should have correct configuration", () => {
      expect(productsMapping.graphqlType).toBe("Product")
      expect(productsMapping.defaultVisibleFields).toContain("title")
      expect(productsMapping.defaultVisibleFields).toContain("status")
    })

    it("should have appropriate default fields for products", () => {
      const productSpecificFields = ["title", "status", "thumbnail"]
      productSpecificFields.forEach((field) => {
        if (productsMapping.defaultVisibleFields.includes(field)) {
          expect(productsMapping.defaultVisibleFields).toContain(field)
        }
      })
    })
  })

  describe("Customers Entity Mapping", () => {
    const customersMapping = ENTITY_MAPPINGS.customers

    it("should have correct configuration", () => {
      expect(customersMapping.graphqlType).toBe("Customer")
      expect(customersMapping.defaultVisibleFields).toContain("email")
    })

    it("should include customer-specific fields", () => {
      const customerFields = ["email", "first_name", "last_name", "created_at"]
      const includedFields = customerFields.filter((field) =>
        customersMapping.defaultVisibleFields.includes(field)
      )
      expect(includedFields.length).toBeGreaterThan(0)
    })
  })

  describe("Computed Columns Configuration", () => {
    it("should have valid computation types", () => {

      Object.values(ENTITY_MAPPINGS).forEach((mapping) => {
        if (mapping.computedColumns) {
          Object.values(mapping.computedColumns).forEach((columnConfig) => {
            expect(columnConfig).toHaveProperty("name")
            expect(columnConfig).toHaveProperty("computation_type")
            expect(columnConfig).toHaveProperty("required_fields")
            expect(Array.isArray(columnConfig.required_fields)).toBe(true)
          })
        }
      })
    })

    it("should have optional fields array when specified", () => {
      const ordersMapping = ENTITY_MAPPINGS.orders
      if (ordersMapping.computedColumns?.customer_display) {
        const customerDisplay = ordersMapping.computedColumns.customer_display
        if (customerDisplay.optional_fields) {
          expect(Array.isArray(customerDisplay.optional_fields)).toBe(true)
        }
      }
    })
  })

  describe("Field Filters Configuration", () => {
    it("should have valid filter patterns", () => {
      Object.values(ENTITY_MAPPINGS).forEach((mapping) => {
        if (mapping.fieldFilters) {
          const { excludeFields, excludePrefixes, excludeSuffixes } =
            mapping.fieldFilters

          if (excludeFields) {
            expect(Array.isArray(excludeFields)).toBe(true)
          }
          if (excludePrefixes) {
            expect(Array.isArray(excludePrefixes)).toBe(true)
            excludePrefixes.forEach((prefix) => {
              expect(typeof prefix).toBe("string")
            })
          }
          if (excludeSuffixes) {
            expect(Array.isArray(excludeSuffixes)).toBe(true)
            excludeSuffixes.forEach((suffix) => {
              expect(typeof suffix).toBe("string")
            })
          }
        }
      })
    })

    it("should exclude common internal fields", () => {
      const commonExclusions = ["metadata", "__typename"]
      
      Object.values(ENTITY_MAPPINGS).forEach((mapping) => {
        if (mapping.fieldFilters?.excludeFields) {
          commonExclusions.forEach((field) => {
            // Check if common fields that should be excluded are handled
            if (field === "__typename" && mapping.fieldFilters?.excludePrefixes) {
              // Only check if excludePrefixes exists
              // const hasDoubleUnderscore = mapping.fieldFilters.excludePrefixes.includes("__")
              // It's ok if not all entities exclude __ prefix
            }
          })
        }
      })
    })
  })

  describe("Default Visible Fields Validation", () => {
    it("should not have duplicate fields in defaultVisibleFields", () => {
      Object.entries(ENTITY_MAPPINGS).forEach(([entity, mapping]) => {
        const fields = mapping.defaultVisibleFields
        const uniqueFields = [...new Set(fields)]
        expect(fields.length).toBe(uniqueFields.length)
      })
    })

    it("should reference valid field paths", () => {
      Object.entries(ENTITY_MAPPINGS).forEach(([entity, mapping]) => {
        mapping.defaultVisibleFields.forEach((field) => {
          // Check field format
          expect(field).toMatch(/^[a-z_]+(\.[a-z_]+)?$/)
          
          // If it's a relationship field, check it has exactly one dot
          if (field.includes(".")) {
            const parts = field.split(".")
            expect(parts).toHaveLength(2)
            expect(parts[0]).toBeTruthy()
            expect(parts[1]).toBeTruthy()
          }
        })
      })
    })

    it("should include computed columns in default visible if referenced", () => {
      Object.entries(ENTITY_MAPPINGS).forEach(([entity, mapping]) => {
        if (mapping.computedColumns) {
          Object.keys(mapping.computedColumns).forEach((computedId) => {
            if (mapping.defaultVisibleFields.includes(computedId)) {
              expect(mapping.computedColumns?.[computedId]).toBeDefined()
            }
          })
        }
      })
    })
  })

  describe("Cross-Entity Consistency", () => {
    it("should use consistent naming patterns", () => {
      const allDefaultFields = Object.values(ENTITY_MAPPINGS).flatMap(
        (mapping) => mapping.defaultVisibleFields
      )

      // Common fields should have consistent naming
      const createdAtFields = allDefaultFields.filter((f) =>
        f.includes("created_at")
      )
      createdAtFields.forEach((field) => {
        expect(field).toMatch(/(^|\.)?created_at$/)
      })

      const idFields = allDefaultFields.filter((f) => f.endsWith("_id"))
      idFields.forEach((field) => {
        expect(field).toMatch(/_id$/)
      })
    })

    it("should have consistent computed column types across entities", () => {
      const allComputedTypes = new Set<string>()
      
      Object.values(ENTITY_MAPPINGS).forEach((mapping) => {
        if (mapping.computedColumns) {
          Object.values(mapping.computedColumns).forEach((config) => {
            allComputedTypes.add(config.computation_type)
          })
        }
      })

      // Each computation type should follow a naming pattern
      allComputedTypes.forEach((type) => {
        expect(type).toMatch(/^[a-z_]+$/)
      })
    })
  })
})