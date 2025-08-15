import {
  formatFieldName,
  getColumnCategory,
  getTypeInfoFromGraphQLType,
  getUnderlyingType,
  isArrayField,
  isSingleRelationship,
  shouldExcludeField,
} from "../helpers"
import {
  GraphQLString,
  GraphQLInt,
  GraphQLFloat,
  GraphQLBoolean,
  GraphQLID,
  GraphQLList,
  GraphQLNonNull,
  GraphQLObjectType,
  GraphQLScalarType,
} from "graphql"

describe("Column Extraction Helpers", () => {
  describe("formatFieldName", () => {
    it("should format snake_case to Title Case", () => {
      expect(formatFieldName("customer_name")).toBe("Customer Name")
      expect(formatFieldName("created_at")).toBe("Created At")
      expect(formatFieldName("is_active")).toBe("Is Active")
    })

    it("should format camelCase to Title Case", () => {
      expect(formatFieldName("customerName")).toBe("CustomerName")
      expect(formatFieldName("createdAt")).toBe("CreatedAt")
      expect(formatFieldName("isActive")).toBe("IsActive")
    })

    it("should handle single words", () => {
      expect(formatFieldName("name")).toBe("Name")
      expect(formatFieldName("id")).toBe("Id")
      expect(formatFieldName("total")).toBe("Total")
    })

    it("should handle empty strings", () => {
      expect(formatFieldName("")).toBe("")
    })

    it("should handle special cases", () => {
      expect(formatFieldName("display_id")).toBe("Display Id")
      expect(formatFieldName("user_id")).toBe("User Id")
      expect(formatFieldName("ISO_code")).toBe("ISO Code")
    })
  })

  describe("getColumnCategory", () => {
    it("should categorize identifier fields", () => {
      expect(getColumnCategory("id", "string", "identifier")).toBe("identifier")
      expect(getColumnCategory("display_id", "string", "identifier")).toBe(
        "identifier"
      )
    })

    it("should categorize date fields", () => {
      expect(getColumnCategory("created_at", "date")).toBe("timestamp")
      expect(getColumnCategory("updated_at", "date")).toBe("timestamp")
      expect(getColumnCategory("deleted_at", "date")).toBe("timestamp")
    })

    it("should categorize money fields", () => {
      expect(getColumnCategory("total", "number")).toBe("metric")
      expect(getColumnCategory("subtotal", "number")).toBe("metric")
      expect(getColumnCategory("tax_total", "number")).toBe("metric")
    })

    it("should categorize status fields", () => {
      expect(getColumnCategory("status", "string", "status")).toBe("status")
      expect(getColumnCategory("payment_status", "string", "status")).toBe(
        "status"
      )
      expect(getColumnCategory("fulfillment_status", "string", "status")).toBe(
        "status"
      )
    })

    it("should categorize relationship fields", () => {
      expect(getColumnCategory("customer.name", "string", "string")).toBe(
        "metadata"
      )
      expect(getColumnCategory("sales_channel.id", "string", "identifier")).toBe(
        "metadata"
      )
    })

    it("should categorize computed fields", () => {
      expect(getColumnCategory("customer_display", "string")).toBe(
        "relationship"
      )
    })

    it("should default to metadata for unmatched fields", () => {
      expect(getColumnCategory("random_field", "string", "string")).toBe("metadata")
      expect(getColumnCategory("description", "string", "string")).toBe("metadata")
    })
  })

  describe("isArrayField", () => {
    it("should identify GraphQL list types", () => {
      const listType = new GraphQLList(GraphQLString)
      expect(isArrayField(listType)).toBe(true)
    })

    it("should identify non-null list types", () => {
      const nonNullListType = new GraphQLNonNull(
        new GraphQLList(GraphQLString)
      )
      expect(isArrayField(nonNullListType)).toBe(true)
    })

    it("should identify list of non-null types", () => {
      const listOfNonNullType = new GraphQLList(
        new GraphQLNonNull(GraphQLString)
      )
      expect(isArrayField(listOfNonNullType)).toBe(true)
    })

    it("should return false for scalar types", () => {
      expect(isArrayField(GraphQLString)).toBe(false)
      expect(isArrayField(GraphQLInt)).toBe(false)
      expect(isArrayField(GraphQLBoolean)).toBe(false)
    })

    it("should return false for object types", () => {
      const objectType = new GraphQLObjectType({
        name: "TestObject",
        fields: { id: { type: GraphQLID } },
      })
      expect(isArrayField(objectType)).toBe(false)
    })
  })

  describe("isSingleRelationship", () => {
    const objectType = new GraphQLObjectType({
      name: "RelatedObject",
      fields: { id: { type: GraphQLID } },
    })

    it("should identify single object relationships", () => {
      expect(isSingleRelationship(objectType)).toBe(true)
    })

    it("should identify non-null single object relationships", () => {
      const nonNullObject = new GraphQLNonNull(objectType)
      expect(isSingleRelationship(nonNullObject)).toBe(true)
    })

    it("should return false for list relationships", () => {
      const listType = new GraphQLList(objectType)
      expect(isSingleRelationship(listType)).toBe(false)
    })

    it("should return false for scalar types", () => {
      expect(isSingleRelationship(GraphQLString)).toBe(false)
      expect(isSingleRelationship(GraphQLInt)).toBe(false)
    })
  })

  describe("getUnderlyingType", () => {
    const objectType = new GraphQLObjectType({
      name: "TestType",
      fields: { id: { type: GraphQLID } },
    })

    it("should unwrap non-null types", () => {
      const nonNullType = new GraphQLNonNull(objectType)
      expect(getUnderlyingType(nonNullType)).toBe(objectType)
    })

    it("should unwrap list types", () => {
      const listType = new GraphQLList(objectType)
      expect(getUnderlyingType(listType)).toBe(objectType)
    })

    it("should unwrap nested types", () => {
      const nestedType = new GraphQLNonNull(
        new GraphQLList(new GraphQLNonNull(objectType))
      )
      expect(getUnderlyingType(nestedType)).toBe(objectType)
    })

    it("should return the type itself if not wrapped", () => {
      expect(getUnderlyingType(objectType)).toBe(objectType)
      expect(getUnderlyingType(GraphQLString)).toBe(GraphQLString)
    })
  })

  describe("shouldExcludeField", () => {
    const fieldFilters = {
      excludeFields: ["internal_field", "deprecated_field"],
      excludePrefixes: ["_", "__"],
      excludeSuffixes: ["_internal", "_deprecated"],
    }

    it("should exclude fields in the exclude list", () => {
      expect(shouldExcludeField("internal_field", fieldFilters)).toBe(true)
      expect(shouldExcludeField("deprecated_field", fieldFilters)).toBe(true)
    })

    it("should exclude fields with excluded prefixes", () => {
      expect(shouldExcludeField("_privateField", fieldFilters)).toBe(true)
      expect(shouldExcludeField("__typename", fieldFilters)).toBe(true)
    })

    it("should exclude fields with excluded suffixes", () => {
      expect(shouldExcludeField("field_internal", fieldFilters)).toBe(true)
      expect(shouldExcludeField("old_api_deprecated", fieldFilters)).toBe(true)
    })

    it("should not exclude fields with specific prefixes/suffixes that don't match", () => {
      expect(shouldExcludeField("temp_storage", fieldFilters)).toBe(false)
      expect(shouldExcludeField("unit_test", fieldFilters)).toBe(false)
    })

    it("should not exclude allowed fields", () => {
      expect(shouldExcludeField("id", fieldFilters)).toBe(false)
      expect(shouldExcludeField("name", fieldFilters)).toBe(false)
      expect(shouldExcludeField("created_at", fieldFilters)).toBe(false)
    })

    it("should handle empty filters", () => {
      expect(shouldExcludeField("any_field", {})).toBe(false)
    })

    it("should handle undefined filters", () => {
      expect(shouldExcludeField("any_field", {})).toBe(false)
    })
  })

  describe("getTypeInfoFromGraphQLType", () => {
    it("should map scalar types correctly", () => {
      expect(getTypeInfoFromGraphQLType(GraphQLString, "name")).toEqual({
        data_type: "string",
        semantic_type: "string",
        context: "generic",
      })

      expect(getTypeInfoFromGraphQLType(GraphQLInt, "quantity")).toEqual({
        data_type: "number",
        semantic_type: "count",
        context: "quantity",
      })

      expect(getTypeInfoFromGraphQLType(GraphQLFloat, "price")).toEqual({
        data_type: "currency",
        semantic_type: "currency",
        context: "amount",
      })

      expect(getTypeInfoFromGraphQLType(GraphQLBoolean, "is_active")).toEqual({
        data_type: "enum",
        semantic_type: "enum",
        context: "generic",
      })

      expect(getTypeInfoFromGraphQLType(GraphQLID, "id")).toEqual({
        data_type: "string",
        semantic_type: "string",
        context: "generic",
      })
    })

    it("should handle non-null types", () => {
      const nonNullString = new GraphQLNonNull(GraphQLString)
      expect(getTypeInfoFromGraphQLType(nonNullString, "name")).toEqual({
        data_type: "string",
        semantic_type: "string",
        context: "generic",
      })
    })

    it("should handle custom scalar types", () => {
      const dateTimeScalar = new GraphQLScalarType({
        name: "DateTime",
      })
      expect(getTypeInfoFromGraphQLType(dateTimeScalar, "created_at")).toEqual({
        data_type: "date",
        semantic_type: "timestamp",
        context: "creation",
      })

      const jsonScalar = new GraphQLScalarType({
        name: "JSON",
      })
      expect(getTypeInfoFromGraphQLType(jsonScalar, "metadata")).toEqual({
        data_type: "object",
        semantic_type: "object",
        context: "metadata",
      })
    })

    it("should handle field name patterns", () => {
      expect(getTypeInfoFromGraphQLType(GraphQLString, "email")).toEqual({
        data_type: "string",
        semantic_type: "email",
        context: "contact",
      })

      expect(getTypeInfoFromGraphQLType(GraphQLString, "status")).toEqual({
        data_type: "enum",
        semantic_type: "status",
        context: "generic",
      })

      expect(getTypeInfoFromGraphQLType(GraphQLString, "country_code")).toEqual({
        data_type: "number",
        semantic_type: "count",
        context: "count",
      })
    })

    it("should handle money fields", () => {
      expect(getTypeInfoFromGraphQLType(GraphQLInt, "total")).toEqual({
        data_type: "currency",
        semantic_type: "currency",
        context: "total",
      })

      expect(getTypeInfoFromGraphQLType(GraphQLInt, "subtotal")).toEqual({
        data_type: "currency",
        semantic_type: "currency",
        context: "total",
      })

      expect(getTypeInfoFromGraphQLType(GraphQLInt, "tax_total")).toEqual({
        data_type: "currency",
        semantic_type: "currency",
        context: "total",
      })
    })

    it("should handle null type gracefully", () => {
      expect(getTypeInfoFromGraphQLType(null, "unknown")).toEqual({
        data_type: "object",
        semantic_type: "object",
        context: "relationship",
      })
    })

    it("should handle object types", () => {
      const objectType = new GraphQLObjectType({
        name: "TestObject",
        fields: { id: { type: GraphQLID } },
      })
      expect(getTypeInfoFromGraphQLType(objectType, "relation")).toEqual({
        data_type: "object",
        semantic_type: "object",
        context: "relationship",
      })
    })
  })
})