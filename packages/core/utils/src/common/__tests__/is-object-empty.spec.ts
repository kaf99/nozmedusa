import { isObjectEmpty } from "../is-object-empty"

describe("isObjectEmpty", () => {
  it("successfully checks if object is empty", () => {
    expect(isObjectEmpty("some string")).toBe(false)
    expect(isObjectEmpty(100)).toBe(false)
    expect(isObjectEmpty({ test: undefined })).toBe(false)
    expect(isObjectEmpty({ test: null })).toBe(false)
    expect(isObjectEmpty({ test: null })).toBe(false)
    expect(isObjectEmpty({})).toBe(true)
  })
})
