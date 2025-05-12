/**
 * Transforms a value to number or returns the default value
 * when original value cannot be casted to number
 */
export function tryConvertToBoolean(value: unknown): boolean | undefined
export function tryConvertToBoolean<T>(
  value: unknown,
  defaultValue: T
): number | T
export function tryConvertToBoolean<T>(
  value: unknown,
  defaultValue?: T
): boolean | undefined | T {
  if (typeof value === "string") {
    const normalizedValue = value.toLowerCase()
    return normalizedValue === "true"
      ? true
      : normalizedValue === "false"
      ? false
      : defaultValue ?? undefined
  }
  return defaultValue ?? undefined
}
