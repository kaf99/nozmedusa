import rfdc from "rfdc"

// useful in cases where presence of undefined is not desired (eg. in microORM operations)
export const removeUndefined = <T extends Record<string, any>>(obj: T): T => {
  const clone = rfdc()
  return clone(obj) as T
}
