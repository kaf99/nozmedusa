import { HttpTypes } from "@medusajs/framework/types"
import {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"
import { MedusaModule } from "@medusajs/framework/modules-sdk"
import {
  GraphQLObjectType,
  makeExecutableSchema,
  mergeTypeDefs,
  graphqlSchemaToFields,
  extractRelationsFromGQL,
  cleanGraphQLSchema,
  print,
  MedusaError,
} from "@medusajs/framework/utils"
import {
  formatFieldName,
  getColumnCategory,
  getTypeInfoFromGraphQLType,
  getUnderlyingType,
  isArrayField,
  isSingleRelationship,
  shouldExcludeField,
} from "./helpers"
import { ENTITY_MAPPINGS } from "./entity-mappings"

export const DEFAULT_COLUMN_ORDERS: Record<string, number> = {
  display_id: 100,
  created_at: 200,
  customer_display: 300,
  "sales_channel.name": 400,
  fulfillment_status: 500,
  payment_status: 600,
  total: 700,
  country: 800,
}

export const GET = async (
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse<HttpTypes.AdminViewsEntityColumnsResponse>
) => {
  const entity = req.params.entity

  const entityMapping = ENTITY_MAPPINGS[entity as keyof typeof ENTITY_MAPPINGS]
  if (!entityMapping) {
    return res.status(400).json({
      message: `Unsupported entity: ${entity}`,
      type: "invalid_data",
    } as any)
  }

  try {
    const joinerConfigs = MedusaModule.getAllJoinerConfigs()

    const schemaFragments: string[] = []
    let hasEntityType = false

    for (const config of joinerConfigs) {
      if (config.schema) {
        schemaFragments.push(config.schema)

        if (config.schema.includes(`type ${entityMapping.graphqlType} {`)) {
          hasEntityType = true
        }
      }
    }

    if (hasEntityType && schemaFragments.length > 0) {
      const scalarDefinitions = `
        scalar DateTime
        scalar JSON
      `

      const allSchemas = [scalarDefinitions, ...schemaFragments]
      const mergedSchemaAST = mergeTypeDefs(allSchemas)
      const mergedSchemaString = print(mergedSchemaAST)

      const { schema: cleanedSchemaString } =
        cleanGraphQLSchema(mergedSchemaString)

      const schema = makeExecutableSchema({
        typeDefs: cleanedSchemaString,
        resolvers: {}, // Empty resolvers since we only need the schema for introspection
      })

      const schemaTypeMap = schema.getTypeMap()

      const entityType = schemaTypeMap[
        entityMapping.graphqlType
      ] as GraphQLObjectType

      const allDirectFields = graphqlSchemaToFields(
        schemaTypeMap,
        entityMapping.graphqlType,
        []
      )

      // Filter out problematic fields
      const directFields = allDirectFields.filter((fieldName) => {
        const field = entityType?.getFields()[fieldName]
        if (!field) return true

        const isArray = isArrayField(field.type)
        if (isArray) {
          return false
        }

        if (shouldExcludeField(fieldName, entityMapping.fieldFilters)) {
          return false
        }

        return true
      })

      if (entity === "orders" && !directFields.includes("display_id")) {
        directFields.unshift("display_id")
      }

      const relationMap = extractRelationsFromGQL(
        new Map(Object.entries(schemaTypeMap))
      )
      const allEntityRelations = relationMap.get(entityMapping.graphqlType)

      const filteredUtilityRelations = new Map<string, string>()
      if (allEntityRelations && entityType) {
        const fields = entityType.getFields()
        for (const [fieldName, relatedTypeName] of allEntityRelations) {
          const field = fields[fieldName]

          if (shouldExcludeField(fieldName, entityMapping.fieldFilters)) {
            continue
          }

          if (field && isSingleRelationship(field.type)) {
            filteredUtilityRelations.set(fieldName, relatedTypeName)
          }
        }
      }

      const manualRelations = new Map<string, string>()
      if (entityType) {
        const fields = entityType.getFields()
        Object.entries(fields).forEach(([fieldName, field]) => {
          if (shouldExcludeField(fieldName, entityMapping.fieldFilters)) {
            return
          }

          if (isSingleRelationship(field.type)) {
            const fieldType = getUnderlyingType(field.type)
            manualRelations.set(fieldName, fieldType.name)
          }
        })
      }

      const finalRelations =
        filteredUtilityRelations.size > 0
          ? filteredUtilityRelations
          : manualRelations

      if (directFields.length > 0) {
        const directColumns = directFields.map((fieldName) => {
          const displayName = formatFieldName(fieldName)

          const type = schemaTypeMap[
            entityMapping.graphqlType
          ] as GraphQLObjectType
          const fieldDef = type?.getFields()?.[fieldName]
          const typeInfo = fieldDef
            ? getTypeInfoFromGraphQLType(fieldDef.type, fieldName)
            : getTypeInfoFromGraphQLType(null, fieldName)

          const sortable =
            !fieldName.includes("metadata") && typeInfo.data_type !== "object"

          const isDefaultField =
            entityMapping.defaultVisibleFields.includes(fieldName)
          const defaultOrder =
            DEFAULT_COLUMN_ORDERS[fieldName] || (isDefaultField ? 500 : 850)
          const category = getColumnCategory(
            fieldName,
            typeInfo.data_type,
            typeInfo.semantic_type
          )

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

        const relationshipColumns: HttpTypes.AdminColumn[] = []

        if (finalRelations.size > 0) {
          for (const [relationName, relatedTypeName] of finalRelations) {
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
              if (!field) return true

              const isArray = isArrayField(field.type)
              if (isArray) {
                return false
              }

              // Apply entity-specific field filters to related fields as well
              if (shouldExcludeField(fieldName, entityMapping.fieldFilters)) {
                return false
              }

              return true
            })

            const limitedFields = relatedFields.slice(0, 10)

            limitedFields.forEach((fieldName) => {
              const fieldPath = `${relationName}.${fieldName}`
              const displayName = `${formatFieldName(
                relationName
              )} ${formatFieldName(fieldName)}`

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

              const sortable = fieldPath.includes(".")
                ? false
                : ["name", "title", "email", "handle"].includes(fieldName)

              const isDefaultVisible =
                entityMapping.defaultVisibleFields.includes(fieldPath)

              // Get default order and category
              // If field is not in default visible fields, place it after country (850)
              const isDefaultField =
                entityMapping.defaultVisibleFields.includes(fieldPath)
              const defaultOrder =
                DEFAULT_COLUMN_ORDERS[fieldPath] || (isDefaultField ? 700 : 850)
              const category = getColumnCategory(
                fieldPath,
                typeInfo.data_type,
                typeInfo.semantic_type
              )

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
        const computedColumns: HttpTypes.AdminColumn[] = []

        if (entityMapping.computedColumns) {
          for (const [columnId, columnConfig] of Object.entries(
            entityMapping.computedColumns
          )) {
            // Get default order and category for computed columns
            // If field is not in default visible fields, place it after country (850)
            const isDefaultField =
              entityMapping.defaultVisibleFields.includes(columnId)
            const defaultOrder =
              DEFAULT_COLUMN_ORDERS[columnId] || (isDefaultField ? 600 : 850)
            const category = getColumnCategory(columnId, "string", "computed")

            computedColumns.push({
              id: columnId,
              name: columnConfig.name,
              description: `${columnConfig.name} (computed)`,
              field: columnId,
              sortable: false, // Computed columns can't be sorted server-side
              hideable: true,
              default_visible:
                entityMapping.defaultVisibleFields.includes(columnId),
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

        const allColumns = [
          ...directColumns,
          ...relationshipColumns,
          ...computedColumns,
        ]

        return res.json({
          columns: allColumns,
        })
      }
    }
  } catch (schemaError) {
    throw new MedusaError(
      MedusaError.Types.UNEXPECTED_STATE,
      `Schema introspection failed for entity: ${entity}. Please check if the entity exists in the schema.`
    )
  }

  return res.sendStatus(500)
}
