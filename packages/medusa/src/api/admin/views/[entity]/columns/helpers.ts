import {
  GraphQLObjectType,
  isEnumType,
  isListType,
  isNonNullType,
  isScalarType,
} from "@medusajs/framework/utils"
import { HttpTypes } from "@medusajs/types"

// Determine column category based on field characteristics
export const getColumnCategory = (
  fieldName: string,
  dataType: string,
  semanticType?: string
): HttpTypes.AdminColumn["category"] => {
  // Check semantic type first
  if (semanticType === "timestamp") return "timestamp"
  if (semanticType === "status") return "status"

  // Check field name patterns
  if (
    fieldName.includes("_id") ||
    fieldName === "id" ||
    fieldName.includes("display_id") ||
    fieldName === "code"
  ) {
    return "identifier"
  }

  if (fieldName.includes("status") || fieldName === "state") {
    return "status"
  }

  if (fieldName.includes("_at") || fieldName.includes("date")) {
    return "timestamp"
  }

  if (
    fieldName.includes("total") ||
    fieldName.includes("amount") ||
    fieldName.includes("price") ||
    semanticType === "currency"
  ) {
    return "metric"
  }

  if (dataType === "object" || fieldName.includes("_display")) {
    return "relationship"
  }

  return "metadata"
}

// Helper function to format field name for display
export const formatFieldName = (field: string): string => {
  return field
    .split(/[._]/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ")
}

// Helper function to get the underlying type from wrapped types (NonNull, List)
export const getUnderlyingType = (type: any): any => {
  if (type.ofType) {
    return getUnderlyingType(type.ofType)
  }
  return type
}

// Helper function to check if a field type is an array/list
export const isArrayField = (type: any): boolean => {
  if (isListType(type)) {
    return true
  }
  if (isNonNullType(type)) {
    return isArrayField(type.ofType)
  }
  return false
}

// Helper function to check if a field is a single relationship (many-to-one, one-to-one)
export const isSingleRelationship = (type: any): boolean => {
  // If it's a list, it's a one-to-many or many-to-many relationship
  if (isArrayField(type)) {
    return false
  }

  // Get the underlying type (removing NonNull wrappers)
  const underlyingType = getUnderlyingType(type)

  // Check if it's a GraphQL object type (relationship)
  return underlyingType instanceof GraphQLObjectType
}

// Helper function to check if a field should be excluded based on filtering rules
export const shouldExcludeField = (
  fieldName: string,
  fieldFilters: any
): boolean => {
  // Check if field matches any exclude suffixes
  if (
    fieldFilters.excludeSuffixes?.some((suffix: string) =>
      fieldName.endsWith(suffix)
    )
  ) {
    return true
  }

  // Check if field matches any exclude prefixes
  if (
    fieldFilters.excludePrefixes?.some((prefix: string) =>
      fieldName.startsWith(prefix)
    )
  ) {
    return true
  }

  // Check if field is in the exclude fields list
  if (fieldFilters.excludeFields?.includes(fieldName)) {
    return true
  }

  return false
}

// Helper function to determine data type and semantic type from GraphQL type
export const getTypeInfoFromGraphQLType = (
  type: any,
  fieldName: string
): {
  data_type: HttpTypes.AdminColumn["data_type"]
  semantic_type: string
  context?: string
} => {
  const underlyingType = type ? getUnderlyingType(type) : null

  // Check field name patterns first for more specific types
  if (fieldName.includes("_at") || fieldName.includes("date")) {
    return {
      data_type: "date",
      semantic_type: "timestamp",
      context: fieldName.includes("created")
        ? "creation"
        : fieldName.includes("updated")
        ? "update"
        : "generic",
    }
  } else if (
    fieldName.includes("total") ||
    fieldName.includes("amount") ||
    fieldName.includes("price")
  ) {
    return {
      data_type: "currency",
      semantic_type: "currency",
      context: fieldName.includes("total") ? "total" : "amount",
    }
  } else if (fieldName.includes("count") || fieldName.includes("quantity")) {
    return {
      data_type: "number",
      semantic_type: "count",
      context: fieldName.includes("quantity") ? "quantity" : "count",
    }
  } else if (fieldName.includes("status")) {
    return {
      data_type: "enum",
      semantic_type: "status",
      context: fieldName.includes("payment")
        ? "payment"
        : fieldName.includes("fulfillment")
        ? "fulfillment"
        : "generic",
    }
  } else if (fieldName.includes("type") || fieldName.includes("is_")) {
    return {
      data_type: "enum",
      semantic_type: "enum",
      context: "generic",
    }
  } else if (fieldName === "metadata" || fieldName.includes("json")) {
    return {
      data_type: "object",
      semantic_type: "object",
      context: "metadata",
    }
  } else if (fieldName === "display_id") {
    return {
      data_type: "string",
      semantic_type: "identifier",
      context: "order",
    }
  } else if (fieldName === "email") {
    return {
      data_type: "string",
      semantic_type: "email",
      context: "contact",
    }
  }

  // Then check GraphQL type
  if (underlyingType && isScalarType(underlyingType)) {
    switch (underlyingType.name) {
      case "Int":
      case "Float":
        return {
          data_type: "number",
          semantic_type: "number",
          context: "generic",
        }
      case "Boolean":
        return {
          data_type: "boolean",
          semantic_type: "boolean",
          context: "generic",
        }
      case "DateTime":
        return {
          data_type: "date",
          semantic_type: "timestamp",
          context: "generic",
        }
      case "JSON":
        return {
          data_type: "object",
          semantic_type: "object",
          context: "json",
        }
      default:
        return {
          data_type: "string",
          semantic_type: "string",
          context: "generic",
        }
    }
  } else if (underlyingType && isEnumType(underlyingType)) {
    return {
      data_type: "enum",
      semantic_type: "enum",
      context: "generic",
    }
  } else {
    return {
      data_type: "object",
      semantic_type: "object",
      context: "relationship",
    }
  }
}
