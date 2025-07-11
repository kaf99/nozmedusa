import { HttpTypes } from "@medusajs/framework/types"
import {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"

// Entity name mappings from URL parameter to GraphQL type and service name
const ENTITY_MAPPINGS = {
  'orders': {
    serviceName: 'order',
    graphqlType: 'Order',
    defaultVisibleFields: ['display_id', 'created_at', 'customer', 'sales_channel', 'payment_status', 'fulfillment_status', 'total']
  },
  'products': {
    serviceName: 'product',
    graphqlType: 'Product',
    defaultVisibleFields: ['title', 'handle', 'status', 'created_at', 'updated_at']
  },
  'customers': {
    serviceName: 'customer',
    graphqlType: 'Customer',
    defaultVisibleFields: ['email', 'first_name', 'last_name', 'created_at', 'updated_at']
  },
  'users': {
    serviceName: 'user',
    graphqlType: 'User',
    defaultVisibleFields: ['email', 'first_name', 'last_name', 'created_at', 'updated_at']
  },
  'regions': {
    serviceName: 'region',
    graphqlType: 'Region',
    defaultVisibleFields: ['name', 'currency_code', 'created_at', 'updated_at']
  },
  'sales-channels': {
    serviceName: 'salesChannel',
    graphqlType: 'SalesChannel',
    defaultVisibleFields: ['name', 'description', 'is_disabled', 'created_at', 'updated_at']
  }
}


// Helper function to format field name for display
const formatFieldName = (field: string): string => {
  return field
    .split(/[._]/)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}


// Helper function to generate columns from predefined field lists
const generateColumnsFromFields = (
  fields: string[],
  entityMapping: typeof ENTITY_MAPPINGS[keyof typeof ENTITY_MAPPINGS]
): HttpTypes.AdminViews.AdminOrderColumn[] => {
  return fields
    .filter(field => !field.startsWith('*')) // Remove relations for now
    .map(fieldName => {
      const displayName = formatFieldName(fieldName)
      
      // Determine data type based on field name patterns
      let dataType: HttpTypes.AdminViews.AdminOrderColumn["data_type"] = "string"
      if (fieldName.includes('_at') || fieldName.includes('date')) {
        dataType = "date"
      } else if (fieldName.includes('total') || fieldName.includes('amount') || fieldName.includes('price')) {
        dataType = "currency"
      } else if (fieldName.includes('count') || fieldName.includes('quantity')) {
        dataType = "number"
      } else if (fieldName.includes('status') || fieldName.includes('type')) {
        dataType = "enum"
      } else if (fieldName === 'metadata' || fieldName.includes('json')) {
        dataType = "object"
      }
      
      // Simple sortability rules
      const sortable = !fieldName.includes('metadata') && dataType !== "object"
      
      return {
        id: fieldName,
        name: displayName,
        description: `${displayName} field`,
        field: fieldName,
        sortable,
        hideable: true,
        default_visible: entityMapping.defaultVisibleFields.includes(fieldName),
        data_type: dataType,
      }
    })
}

// Predefined field lists based on existing query configurations
const ENTITY_FIELDS = {
  'orders': [
    "id", "display_id", "status", "email", "currency_code", "tax_rate", "created_at", "updated_at",
    "canceled_at", "metadata", "sales_channel_id", "total", "subtotal", "tax_total", "discount_total",
    "gift_card_total", "shipping_total", "refunded_total", "paid_total", "refundable_amount"
  ],
  'products': [
    "id", "title", "subtitle", "status", "external_id", "description", "handle", "is_giftcard",
    "discountable", "thumbnail", "collection_id", "type_id", "weight", "length", "height", "width",
    "hs_code", "origin_country", "mid_code", "material", "created_at", "updated_at", "deleted_at", "metadata"
  ],
  'customers': [
    "id", "email", "first_name", "last_name", "billing_address_id", "phone", "has_account",
    "created_at", "updated_at", "deleted_at", "metadata"
  ],
  'users': [
    "id", "email", "first_name", "last_name", "avatar_url", "created_at", "updated_at", "deleted_at", "metadata"
  ],
  'regions': [
    "id", "name", "currency_code", "tax_rate", "tax_code", "gift_cards_taxable", "automatic_taxes",
    "tax_provider_id", "created_at", "updated_at", "deleted_at", "metadata"
  ],
  'sales-channels': [
    "id", "name", "description", "is_disabled", "created_at", "updated_at", "deleted_at", "metadata"
  ]
}

export const GET = async (
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse<HttpTypes.AdminViews.AdminOrderColumnsResponse>
) => {
  try {
    const entity = req.params.entity as string
    
    // Validate entity parameter
    if (!entity) {
      return res.status(400).json({
        message: "Entity parameter is required",
        type: "invalid_data"
      } as any)
    }
    
    // Get entity mapping
    const entityMapping = ENTITY_MAPPINGS[entity as keyof typeof ENTITY_MAPPINGS]
    if (!entityMapping) {
      return res.status(400).json({
        message: `Unsupported entity: ${entity}`,
        type: "invalid_data"
      } as any)
    }

    // Get predefined fields for the entity
    const entityFields = ENTITY_FIELDS[entity as keyof typeof ENTITY_FIELDS]
    if (!entityFields) {
      throw new Error(`No field configuration found for entity: ${entity}`)
    }

    // Generate columns from predefined fields
    const columns = generateColumnsFromFields(entityFields, entityMapping)

    return res.json({
      columns,
    })
  } catch (error) {
    console.error("Error generating columns:", error)
    
    // Return error response
    return res.status(500).json({
      message: `Failed to generate columns for entity: ${req.params.entity}`,
      error: error instanceof Error ? error.message : "Unknown error",
      type: "server_error"
    } as any)
  }
}