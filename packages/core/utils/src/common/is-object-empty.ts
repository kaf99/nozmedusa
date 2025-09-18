import { isObject } from "./is-object"

export function isObjectEmpty(obj: any): obj is object {
  return isObject(obj) && Object.keys(obj).length === 0
}
