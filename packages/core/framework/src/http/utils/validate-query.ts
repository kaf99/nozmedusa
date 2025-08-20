import { BaseEntity, QueryConfig, RequestQueryFields } from "@medusajs/types"
import { MedusaError, removeUndefinedProperties } from "@medusajs/utils"
import { NextFunction } from "express"
import { omit } from "lodash"
import { MedusaRequest, MedusaResponse } from "../types"
import { prepareListQuery, prepareRetrieveQuery } from "./get-query-config"
import { StandardSchemaV1, isStandardSchemaV1 } from "../../standard-schema"

// Validator that accepts Standard Schema compatible schemas
async function validateWithStandardSchema(
  schema: StandardSchemaV1,
  value: unknown
): Promise<any> {
  const result = await schema["~standard"].validate(value)
  
  if (result.issues && result.issues.length > 0) {
    // Format the error message to match our existing format
    const issues = result.issues.slice(0, 3)
    const messages = issues.map(issue => {
      const path = issue.path?.join(", ")
      
      // Handle required field errors (Zod compatibility)
      if (issue.message === "Required" || 
          (issue.message.includes("Invalid input") && issue.message.includes("received undefined"))) {
        return path ? `Field '${path}' is required` : "Field is required"
      }
      
      // Handle invalid input without undefined (likely a discriminated union error)
      if (issue.message === "Invalid input" && path) {
        // For discriminated union errors in arrays, Zod v3 would append the discriminator field
        // Check if this is an array element that likely has a type discriminator
        if (path.includes("geo_zones") && path.match(/\d+$/)) {
          return `Field '${path}, type' is required`
        }
        return `Field '${path}': Invalid input`
      }
      
      // Handle enum errors specifically
      if (issue.message.includes("Invalid enum value") && path) {
        // Extract expected and received values
        const expectedMatch = issue.message.match(/Expected (.+), received '([^']+)'/)
        if (expectedMatch) {
          const expectedPart = expectedMatch[1]
          const received = expectedMatch[2]
          
          // Extract values between quotes
          const quotedValues = expectedPart.match(/'([^']+)'/g)
          if (quotedValues) {
            const expected = quotedValues.map(v => v.replace(/'/g, '')).join(", ")
            return `Expected: '${expected}' for field '${path}', but got: '${received}'`
          }
        }
      }
      
      // Handle minimum number validation
      if (issue.message.includes("Number must be greater than or equal to") && path) {
        const minMatch = issue.message.match(/Number must be greater than or equal to (\d+)/)
        if (minMatch) {
          const minValue = minMatch[1]
          return `Value for field '${path}' too small, expected at least: '${minValue}'`
        }
      }
      
      // Check if the message already contains all the field names from the path
      if (path && issue.path) {
        const pathSegments = issue.path.map(p => String(p))
        const messageContainsAllFields = pathSegments.every(segment => 
          issue.message.includes(`'${segment}'`) || 
          issue.message.includes(`"${segment}"`) ||
          issue.message.includes(` ${segment} `) ||
          issue.message.includes(`${segment}:`)
        )
        
        // If message already mentions all fields, don't add redundant prefix
        if (messageContainsAllFields) {
          return issue.message
        }
        
        // Skip field prefix for custom validation messages that are complete sentences
        if (issue.message.includes("Provider is required when creating")) {
          return issue.message
        }
        
        // Otherwise add the path prefix for context
        return `Field '${path}': ${issue.message}`
      }
      
      // Handle unrecognized keys error
      if (issue.message.includes("Unrecognized key(s) in object:")) {
        return issue.message.replace("Unrecognized key(s) in object:", "Unrecognized fields:")
      }
      
      return issue.message
    })
    
    throw new MedusaError(
      MedusaError.Types.INVALID_DATA,
      `Invalid request: ${messages.join("; ")}`
    )
  }
  
  // Success case - no issues
  return "value" in result ? result.value : undefined
}

/**
 * Normalize an input query, especially from array like query params to an array type
 * e.g: /admin/orders/?fields[]=id,status,cart_id becomes { fields: ["id", "status", "cart_id"] }
 *
 * We only support up to 2 levels of depth for query params in order to have a somewhat readable query param, and limit possible performance issues
 */
const normalizeQuery = (req: MedusaRequest) => {
  return Object.entries(req.query).reduce((acc, [key, val]) => {
    let normalizedValue = val
    if (Array.isArray(val) && val.length === 1 && typeof val[0] === "string") {
      normalizedValue = val[0].split(",")
    }

    if (key.includes(".")) {
      const [parent, child, ...others] = key.split(".")
      if (others.length > 0) {
        throw new MedusaError(
          MedusaError.Types.INVALID_ARGUMENT,
          `Key accessor more than 2 levels deep: ${key}`
        )
      }

      if (!acc[parent]) {
        acc[parent] = {}
      }
      acc[parent] = {
        ...acc[parent],
        [child]: normalizedValue,
      }
    } else {
      acc[key] = normalizedValue
    }

    return acc
  }, {})
}

/**
 * Omit the non filterable config from the validated object
 * @param obj
 */
const getFilterableFields = <T extends RequestQueryFields>(obj: T): T => {
  const result = omit(obj, ["limit", "offset", "fields", "order"]) as T
  return removeUndefinedProperties(result)
}

export function validateAndTransformQuery<TEntity extends BaseEntity>(
  schema: StandardSchemaV1,
  queryConfig: QueryConfig<TEntity>
): (
  req: MedusaRequest,
  res: MedusaResponse,
  next: NextFunction
) => Promise<void> {
  return async function validateQuery(
    req: MedusaRequest,
    _: MedusaResponse,
    next: NextFunction
  ) {
    try {
      const restricted = req.restrictedFields?.list()
      const allowed = queryConfig.allowed ?? []

      // If any custom allowed fields are set, we add them to the allowed list along side the one configured in the query config if any
      if (req.allowed?.length) {
        allowed.push(...req.allowed)
      }

      delete req.allowed
      const query = normalizeQuery(req) as Record<string, any>

      if (!isStandardSchemaV1(schema)) {
        throw new MedusaError(
          MedusaError.Types.INVALID_DATA,
          "Schema must implement Standard Schema v1 interface"
        )
      }

      const validated = await validateWithStandardSchema(schema, query)

      const cnf = queryConfig.isList
        ? prepareListQuery(validated, { ...queryConfig, allowed, restricted })
        : prepareRetrieveQuery(validated, {
            ...queryConfig,
            allowed,
            restricted,
          })

      const { with_deleted, ...validatedQueryFilters } = validated
      req.validatedQuery = validatedQueryFilters
      req.filterableFields = getFilterableFields(req.validatedQuery)
      req.queryConfig = cnf.remoteQueryConfig as any
      req.remoteQueryConfig = req.queryConfig
      req.listConfig = (cnf as any).listConfig
      req.retrieveConfig = (cnf as any).retrieveConfig

      next()
    } catch (e) {
      next(e)
    }
  }
}
