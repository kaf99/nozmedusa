import rfdc from "rfdc"
import { isObject } from "./is-object"

/**
 * Faster than JSON.parse(JSON.stringify(obj)) with default sanitize set to true to maintain the same behavior.
 * when sanitize is set to false, Functions, symbols, bigints, Maps, Sets, Dates will remain intact.
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
  { sanitize }: { sanitize?: boolean } & Parameters<typeof rfdc>[0] = {
    sanitize: true,
  }
) {
  sanitize ??= true

  const clone = rfdc()
  if (sanitize) {
    return clone(sanitizer(obj))
  }
  return clone(obj)
}

function sanitizer(obj: any): any {
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
    return obj.map(sanitizer)
  }

  // Handle Maps / Sets by converting them to plain objects/arrays (or strip)
  if (obj instanceof Map) {
    return Object.fromEntries(
      Array.from(obj.entries()).map(([k, v]) => [k, sanitizer(v)])
    )
  }
  if (obj instanceof Set) {
    return Array.from(obj.values()).map(sanitizer)
  }

  // Handle Dates
  if (obj instanceof Date) {
    return obj.toISOString()
  }

  // Plain object
  const clean: Record<string, any> = {}
  for (const [k, v] of Object.entries(obj)) {
    clean[k] = sanitizer(v)
  }
  return clean
}
