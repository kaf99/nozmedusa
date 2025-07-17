import { HttpTypes } from "@medusajs/framework/types"
import {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"
import { MedusaModule } from "@medusajs/framework/modules-sdk"
import {
  GraphQLObjectType,
  isScalarType,
  isEnumType,
  isListType,
  isNonNullType,
  makeExecutableSchema,
  mergeTypeDefs,
  graphqlSchemaToFields,
  extractRelationsFromGQL,
  cleanGraphQLSchema,
  print,
} from "@medusajs/framework/utils"

// Entity name mappings from URL parameter to GraphQL type and service name
const ENTITY_MAPPINGS = {
  orders: {
    serviceName: "order",
    graphqlType: "Order",
    defaultVisibleFields: [
      "display_id",
      "created_at",
      "payment_status",
      "fulfillment_status",
      "total",
      "customer_display",
      "country",
      "sales_channel.name",
    ],
    fieldFilters: {
      // Fields that end with these suffixes will be excluded
      excludeSuffixes: ["_link"],
      // Fields that start with these prefixes will be excluded
      excludePrefixes: ["raw_"],
      // Specific field names to exclude
      excludeFields: ["order_change"],
    },
    computedColumns: {
      customer_display: {
        name: "Customer",
        computation_type: "customer_name",
        required_fields: ["customer.first_name", "customer.last_name", "customer.email"],
        optional_fields: ["customer.phone"],
        default_visible: true,
      },
      shipping_address_display: {
        name: "Shipping Address",
        computation_type: "address_summary",
        required_fields: ["shipping_address.city", "shipping_address.country_code"],
        optional_fields: ["shipping_address.address_1", "shipping_address.province", "shipping_address.postal_code"],
        default_visible: false,
      },
      billing_address_display: {
        name: "Billing Address",
        computation_type: "address_summary",
        required_fields: ["billing_address.city", "billing_address.country_code"],
        optional_fields: ["billing_address.address_1", "billing_address.province", "billing_address.postal_code"],
        default_visible: false,
      },
      country: {
        name: "Country",
        computation_type: "country_code",
        required_fields: ["shipping_address.country_code"],
        optional_fields: [],
        default_visible: true,
      },
    },
  },
  products: {
    serviceName: "product",
    graphqlType: "Product",
    defaultVisibleFields: [
      "title",
      "handle",
      "status",
      "created_at",
      "updated_at",
    ],
    fieldFilters: {
      excludeSuffixes: ["_link"],
      excludePrefixes: ["raw_"],
      excludeFields: [],
    },
    computedColumns: {},
  },
  customers: {
    serviceName: "customer",
    graphqlType: "Customer",
    defaultVisibleFields: [
      "email",
      "first_name",
      "last_name",
      "created_at",
      "updated_at",
    ],
    fieldFilters: {
      excludeSuffixes: ["_link"],
      excludePrefixes: ["raw_"],
      excludeFields: [],
    },
    computedColumns: {},
  },
  users: {
    serviceName: "user",
    graphqlType: "User",
    defaultVisibleFields: [
      "email",
      "first_name",
      "last_name",
      "created_at",
      "updated_at",
    ],
    fieldFilters: {
      excludeSuffixes: ["_link"],
      excludePrefixes: ["raw_"],
      excludeFields: [],
    },
    computedColumns: {},
  },
  regions: {
    serviceName: "region",
    graphqlType: "Region",
    defaultVisibleFields: ["name", "currency_code", "created_at", "updated_at"],
    fieldFilters: {
      excludeSuffixes: ["_link"],
      excludePrefixes: ["raw_"],
      excludeFields: [],
    },
    computedColumns: {},
  },
  "sales-channels": {
    serviceName: "salesChannel",
    graphqlType: "SalesChannel",
    defaultVisibleFields: [
      "name",
      "description",
      "is_disabled",
      "created_at",
      "updated_at",
    ],
    fieldFilters: {
      excludeSuffixes: ["_link"],
      excludePrefixes: ["raw_"],
      excludeFields: [],
    },
    computedColumns: {},
  },
}

// Helper function to get the underlying type from wrapped types (NonNull, List)
const getUnderlyingType = (type: any): any => {
  if (type.ofType) {
    return getUnderlyingType(type.ofType)
  }
  return type
}

// Helper function to check if a field type is an array/list
const isArrayField = (type: any): boolean => {
  if (isListType(type)) {
    return true
  }
  if (isNonNullType(type)) {
    return isArrayField(type.ofType)
  }
  return false
}

// Helper function to check if a field is a single relationship (many-to-one, one-to-one)
const isSingleRelationship = (type: any): boolean => {
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
const shouldExcludeField = (fieldName: string, fieldFilters: any): boolean => {
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
const getTypeInfoFromGraphQLType = (
  type: any,
  fieldName: string
): {
  data_type: HttpTypes.AdminViews.AdminOrderColumn["data_type"]
  semantic_type: string
  context?: string
} => {
  const underlyingType = getUnderlyingType(type)

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
  if (isScalarType(underlyingType)) {
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
  } else if (isEnumType(underlyingType)) {
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

// Default column orders for common fields
export const DEFAULT_COLUMN_ORDERS: Record<string, number> = {
  // Primary identifier
  display_id: 100,
  
  // Timestamp
  created_at: 200,
  
  // Customer info
  customer_display: 300,
  
  // Sales channel
  'sales_channel.name': 400,
  
  // Status fields
  fulfillment_status: 500,
  payment_status: 600,
  
  // Financial
  total: 700,
  
  // Location
  country: 800,
  
  // Other fields get default 500
}

// Determine column category based on field characteristics
const getColumnCategory = (fieldName: string, dataType: string, semanticType?: string): HttpTypes.AdminViews.AdminColumn['category'] => {
  // Check semantic type first
  if (semanticType === 'timestamp') return 'timestamp'
  if (semanticType === 'status') return 'status'
  
  // Check field name patterns
  if (fieldName.includes('_id') || fieldName === 'id' || fieldName.includes('display_id') || fieldName === 'code') {
    return 'identifier'
  }
  
  if (fieldName.includes('status') || fieldName === 'state') {
    return 'status'
  }
  
  if (fieldName.includes('_at') || fieldName.includes('date')) {
    return 'timestamp'
  }
  
  if (fieldName.includes('total') || fieldName.includes('amount') || fieldName.includes('price') || semanticType === 'currency') {
    return 'metric'
  }
  
  if (dataType === 'object' || fieldName.includes('_display')) {
    return 'relationship'
  }
  
  return 'metadata'
}

// Helper function to format field name for display
const formatFieldName = (field: string): string => {
  return field
    .split(/[._]/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ")
}

export const GET = async (
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse<HttpTypes.AdminViews.AdminOrderColumnsResponse>
) => {
  const entity = req.params.entity as string

  // Validate entity parameter
  if (!entity) {
    return res.status(400).json({
      message: "Entity parameter is required",
      type: "invalid_data",
    } as any)
  }

  // Get entity mapping
  const entityMapping = ENTITY_MAPPINGS[entity as keyof typeof ENTITY_MAPPINGS]
  if (!entityMapping) {
    return res.status(400).json({
      message: `Unsupported entity: ${entity}`,
      type: "invalid_data",
    } as any)
  }

  // Try to use schema introspection first
  try {
    // Get all joiner configurations which contain GraphQL schemas
    const joinerConfigs = MedusaModule.getAllJoinerConfigs()

    console.log(
      `🔍 Found ${joinerConfigs.length} joiner configs for schema introspection`
    )

    // Collect all schema fragments and check for our entity type
    const schemaFragments: string[] = []
    let hasEntityType = false

    for (const config of joinerConfigs) {
      if (config.schema) {
        schemaFragments.push(config.schema)

        // Check if this specific schema contains our entity type definition
        if (config.schema.includes(`type ${entityMapping.graphqlType} {`)) {
          hasEntityType = true
          console.log(
            `📋 Found schema for ${entityMapping.graphqlType} in joiner config`
          )
        }
      }
    }

    if (hasEntityType && schemaFragments.length > 0) {
      // Add scalar type definitions that are commonly used in Medusa
      const scalarDefinitions = `
        scalar DateTime
        scalar JSON
      `

      // Merge all schema fragments with scalar definitions
      const allSchemas = [scalarDefinitions, ...schemaFragments]
      const mergedSchemaAST = mergeTypeDefs(allSchemas)
      const mergedSchemaString = print(mergedSchemaAST)

      // Clean the schema to remove undefined types and invalid references
      const { schema: cleanedSchemaString } =
        cleanGraphQLSchema(mergedSchemaString)

      // Create executable schema from the cleaned schema
      const schema = makeExecutableSchema({
        typeDefs: cleanedSchemaString,
        resolvers: {}, // Empty resolvers since we only need the schema for introspection
      })

      // Get type map from schema
      const schemaTypeMap = schema.getTypeMap()

      // Debug the entity type structure
      const entityType = schemaTypeMap[
        entityMapping.graphqlType
      ] as GraphQLObjectType

      // Use the battle-tested utility to extract fields
      const allDirectFields = graphqlSchemaToFields(
        schemaTypeMap,
        entityMapping.graphqlType,
        [] // No relations for direct fields
      )

      // Filter out problematic fields
      const directFields = allDirectFields.filter((fieldName) => {
        const field = entityType?.getFields()[fieldName]
        if (!field) return true // Keep field if we can't determine its type

        const isArray = isArrayField(field.type)
        if (isArray) {
          console.log(`❌ Filtering out array field: ${fieldName}`)
          return false
        }

        // Apply entity-specific field filters
        if (shouldExcludeField(fieldName, entityMapping.fieldFilters)) {
          console.log(`❌ Filtering out field based on rules: ${fieldName}`)
          return false
        }

        return true
      })

      console.log(
        `📋 Filtered direct fields (${directFields.length}/${allDirectFields.length}):`,
        directFields
      )
      if (entityType) {
        const fields = entityType.getFields()
        console.log(
          `🔍 All fields in ${entityMapping.graphqlType}:`,
          Object.keys(fields)
        )

        // Manually check for relationships
        console.log(`🔍 Field types in ${entityMapping.graphqlType}:`)
        Object.entries(fields).forEach(([fieldName, field]) => {
          const fieldType = getUnderlyingType(field.type)
          const isObject = fieldType instanceof GraphQLObjectType
          const isArray = isArrayField(field.type)
          const isSingleRel = isSingleRelationship(field.type)
          console.log(
            `  ${fieldName}: ${fieldType.name} (isObject: ${isObject}, isArray: ${isArray}, isSingleRel: ${isSingleRel})`
          )
        })
      }

      // Extract relationships using the battle-tested utility
      const relationMap = extractRelationsFromGQL(
        new Map(Object.entries(schemaTypeMap))
      )
      const allEntityRelations = relationMap.get(entityMapping.graphqlType)

      console.log(
        `🔗 Found ${allEntityRelations?.size || 0} total relationships for ${
          entityMapping.graphqlType
        }:`,
        allEntityRelations ? Array.from(allEntityRelations.entries()) : "none"
      )

      // Filter out array relationships and excluded fields from the extracted relations
      const filteredUtilityRelations = new Map<string, string>()
      if (allEntityRelations && entityType) {
        const fields = entityType.getFields()
        for (const [fieldName, relatedTypeName] of allEntityRelations) {
          const field = fields[fieldName]

          // Apply field exclusion rules
          if (shouldExcludeField(fieldName, entityMapping.fieldFilters)) {
            console.log(
              `❌ Filtering out utility relationship based on rules: ${fieldName} -> ${relatedTypeName}`
            )
            continue
          }

          if (field && isSingleRelationship(field.type)) {
            filteredUtilityRelations.set(fieldName, relatedTypeName)
            console.log(
              `✅ Utility single relationship: ${fieldName} -> ${relatedTypeName}`
            )
          } else if (field && isArrayField(field.type)) {
            console.log(
              `❌ Filtering out utility array relationship: ${fieldName} -> [${relatedTypeName}]`
            )
          }
        }
      }

      // Manual relationship extraction as fallback (only single relationships)
      const manualRelations = new Map<string, string>()
      if (entityType) {
        const fields = entityType.getFields()
        Object.entries(fields).forEach(([fieldName, field]) => {
          // Apply field exclusion rules
          if (shouldExcludeField(fieldName, entityMapping.fieldFilters)) {
            console.log(
              `❌ Filtering out manual relationship based on rules: ${fieldName}`
            )
            return
          }

          // Only include single relationships (many-to-one, one-to-one)
          if (isSingleRelationship(field.type)) {
            const fieldType = getUnderlyingType(field.type)
            manualRelations.set(fieldName, fieldType.name)
            console.log(
              `🔗 Manual single relationship found: ${fieldName} -> ${fieldType.name}`
            )
          } else if (isArrayField(field.type)) {
            const fieldType = getUnderlyingType(field.type)
            console.log(
              `❌ Skipping array relationship: ${fieldName} -> [${fieldType.name}]`
            )
          }
        })
      }

      // Use filtered utility relations if available, otherwise use manual relations
      const finalRelations =
        filteredUtilityRelations.size > 0
          ? filteredUtilityRelations
          : manualRelations
      console.log(
        `🎯 Using ${finalRelations.size} final relationships:`,
        Array.from(finalRelations.entries())
      )

      if (directFields.length > 0) {
        // Generate columns from schema fields
        const directColumns = directFields.map((fieldName) => {
          const displayName = formatFieldName(fieldName)

          // Get the field type from schema for better type inference
          const type = schemaTypeMap[
            entityMapping.graphqlType
          ] as GraphQLObjectType
          const fieldDef = type?.getFields()?.[fieldName]
          const typeInfo = fieldDef
            ? getTypeInfoFromGraphQLType(fieldDef.type, fieldName)
            : {
                data_type: "string" as const,
                semantic_type: "string",
                context: "generic",
              }

          // Simple sortability rules
          const sortable =
            !fieldName.includes("metadata") && typeInfo.data_type !== "object"

          // Get default order and category
          // If field is not in default visible fields, place it after country (850)
          const isDefaultField = entityMapping.defaultVisibleFields.includes(fieldName)
          const defaultOrder = DEFAULT_COLUMN_ORDERS[fieldName] || (isDefaultField ? 500 : 850)
          const category = getColumnCategory(fieldName, typeInfo.data_type, typeInfo.semantic_type)

          return {
            id: fieldName,
            name: displayName,
            description: `${displayName} field`,
            field: fieldName,
            sortable,
            hideable: true,
            default_visible:
              entityMapping.defaultVisibleFields.includes(fieldName),
            data_type: typeInfo.data_type,
            semantic_type: typeInfo.semantic_type,
            context: typeInfo.context,
            default_order: defaultOrder,
            category,
          }
        })

        // Generate relationship columns from schema
        const relationshipColumns: HttpTypes.AdminViews.AdminOrderColumn[] = []

        if (finalRelations.size > 0) {
          for (const [relationName, relatedTypeName] of finalRelations) {
            console.log(
              `📊 Processing relationship: ${relationName} -> ${relatedTypeName}`
            )

            // Skip adding the relationship object itself - we only want nested fields
            // Get fields for the related type
            const allRelatedFields = graphqlSchemaToFields(
              schemaTypeMap,
              relatedTypeName,
              []
            )

            // Filter out problematic fields from related type
            const relatedType = schemaTypeMap[
              relatedTypeName
            ] as GraphQLObjectType
            const relatedFields = allRelatedFields.filter((fieldName) => {
              const field = relatedType?.getFields()[fieldName]
              if (!field) return true // Keep field if we can't determine its type

              const isArray = isArrayField(field.type)
              if (isArray) {
                console.log(
                  `❌ Filtering out array field in ${relatedTypeName}: ${fieldName}`
                )
                return false
              }

              // Apply entity-specific field filters to related fields as well
              if (shouldExcludeField(fieldName, entityMapping.fieldFilters)) {
                console.log(
                  `❌ Filtering out field based on rules in ${relatedTypeName}: ${fieldName}`
                )
                return false
              }

              return true
            })

            console.log(
              `📋 Found ${relatedFields.length}/${allRelatedFields.length} non-array fields in ${relatedTypeName}:`,
              relatedFields.slice(0, 5)
            )

            // Only take first 10 fields and limit to scalars
            const limitedFields = relatedFields.slice(0, 10)

            limitedFields.forEach((fieldName) => {
              const fieldPath = `${relationName}.${fieldName}`
              const displayName = `${formatFieldName(
                relationName
              )} ${formatFieldName(fieldName)}`

              // Get field type for better type inference
              const relatedType = schemaTypeMap[
                relatedTypeName
              ] as GraphQLObjectType
              const fieldDef = relatedType?.getFields()?.[fieldName]
              const typeInfo = fieldDef
                ? getTypeInfoFromGraphQLType(fieldDef.type, fieldName)
                : {
                    data_type: "string" as const,
                    semantic_type: "string",
                    context: "generic",
                  }

              // Most relationship fields are not sortable by default
              const sortable = ["name", "title", "email", "handle"].includes(
                fieldName
              )

              // Check if this field should be visible by default
              // Support dot notation in defaultVisibleFields (e.g., "sales_channel.name")
              const isDefaultVisible =
                entityMapping.defaultVisibleFields.includes(fieldPath)

              // Get default order and category
              // If field is not in default visible fields, place it after country (850)
              const isDefaultField = entityMapping.defaultVisibleFields.includes(fieldPath)
              const defaultOrder = DEFAULT_COLUMN_ORDERS[fieldPath] || (isDefaultField ? 700 : 850)
              const category = getColumnCategory(fieldPath, typeInfo.data_type, typeInfo.semantic_type)

              relationshipColumns.push({
                id: fieldPath,
                name: displayName,
                description: `${displayName} from related ${relatedTypeName}`,
                field: fieldPath,
                sortable,
                hideable: true,
                default_visible: isDefaultVisible,
                data_type: typeInfo.data_type,
                semantic_type: typeInfo.semantic_type,
                context: typeInfo.context,
                relationship: {
                  entity: relatedTypeName,
                  field: fieldName,
                },
                default_order: defaultOrder,
                category,
              })
            })
          }
        }


        // Generate computed columns
        const computedColumns: HttpTypes.AdminViews.AdminOrderColumn[] = []
        
        if (entityMapping.computedColumns) {
          for (const [columnId, columnConfig] of Object.entries(entityMapping.computedColumns)) {
            // Get default order and category for computed columns
            // If field is not in default visible fields, place it after country (850)
            const isDefaultField = entityMapping.defaultVisibleFields.includes(columnId)
            const defaultOrder = DEFAULT_COLUMN_ORDERS[columnId] || (isDefaultField ? 600 : 850)
            const category = getColumnCategory(columnId, "string", "computed")

            computedColumns.push({
              id: columnId,
              name: columnConfig.name,
              description: `${columnConfig.name} (computed)`,
              field: columnId,
              sortable: false, // Computed columns can't be sorted server-side
              hideable: true,
              default_visible: entityMapping.defaultVisibleFields.includes(columnId),
              data_type: "string", // Computed columns typically output strings
              semantic_type: "computed",
              context: "display",
              computed: {
                type: columnConfig.computation_type,
                required_fields: columnConfig.required_fields,
                optional_fields: columnConfig.optional_fields || [],
              },
              default_order: defaultOrder,
              category,
            })
          }
        }

        // Combine all columns
        const allColumns = [...directColumns, ...relationshipColumns, ...computedColumns]

        console.log(
          `✅ Generated ${allColumns.length} columns from schema introspection for ${entity}`
        )

        return res.json({
          columns: allColumns,
        })
      }
    }

    console.log(
      `⚠️ No schema found for ${entityMapping.graphqlType}, falling back to hardcoded fields`
    )
  } catch (schemaError) {
    console.warn(
      "Failed to use schema introspection, falling back to predefined fields:",
      schemaError
    )
  }

  // Fallback to hardcoded approach if schema introspection fails
  return res.status(500).json({
    message: `Schema introspection failed for entity: ${entity}. Please check if the entity exists in the schema.`,
    type: "server_error",
  } as any)
}
