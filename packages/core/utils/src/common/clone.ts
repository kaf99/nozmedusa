import rfdc from "rfdc"
import { isObject } from "./is-object"
import { BigNumber } from "../totals/big-number"

/**
 * Faster than JSON.parse(JSON.stringify(obj)) with default sanitize set to true to maintain the same behavior.
 *
 * If sanitize is set to false, Functions, symbols, bigints, Maps, Sets, Dates will remain intact.
 *
 * No matter the value of sanitize, big numbers will be jsonified.
 *
 * Advantage compare to JSON.parse(JSON.stringify(obj))
 * - Pure cloning: Copies object graph recursively without going through JSON.
 * - Much faster: Avoids string serialization overhead.
 * - Less memory churn: No giant string allocations, fewer temporary objects.
 * - Preserves non-serializable values (unless sanitize is set to true which is the default):
 *   Unlike JSON, it keeps undefined, Date, Map, etc.
 *
 * @param obj
 * @param sanitize
 * @returns
 */
export function clone(
  obj: any,
  options: { sanitize?: boolean } & Parameters<typeof rfdc>[0] = {
    sanitize: true,
  }
) {
  const { sanitize = true, ...rfdcOptions } = options

  const clone = rfdc(rfdcOptions)
  if (sanitize) {
    return clone(sanitizer(obj))
  }

  // If no sanitize is provided, we still want to jsonify the big numbers
  return clone(sanitizer(obj, { bigNumberOnly: true }))
}

function sanitizer(
  obj: any,
  { bigNumberOnly }: { bigNumberOnly?: boolean } = {}
): any {
  // jsonify the big numbers
  if (
    bigNumberOnly &&
    (obj instanceof BigNumber || BigNumber.isBigNumber(obj))
  ) {
    return obj.toJSON()
  }

  if (!isObject(obj)) {
    // Strip functions, symbols, bigints
    if (
      typeof obj === "function" ||
      typeof obj === "symbol" ||
      typeof obj === "bigint"
    ) {
      return undefined
    }
    return obj
  }

  if (Array.isArray(obj)) {
    return obj.map((value) => sanitizer(value, { bigNumberOnly }))
  }

  // Handle Maps / Sets by converting them to plain objects/arrays (or strip)
  if (!bigNumberOnly) {
    if (obj instanceof Map) {
      return Object.fromEntries(
        Array.from(obj.entries()).map(([k, v]) => [
          k,
          sanitizer(v, { bigNumberOnly }),
        ])
      )
    }
    if (obj instanceof Set) {
      return Array.from(obj.values()).map((value) =>
        sanitizer(value, { bigNumberOnly })
      )
    }

    // Handle Dates
    if (obj instanceof Date) {
      return obj.toISOString()
    }
  }

  // Handle BigNumbers
  if (obj instanceof BigNumber) {
    return obj.toJSON()
  }

  // Plain object
  const clean: Record<string, any> = {}
  for (const [k, v] of Object.entries(obj)) {
    clean[k] = sanitizer(v, { bigNumberOnly })
  }
  return clean
}
