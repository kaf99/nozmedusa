import { clone } from "../clone"
import { BigNumber } from "../../totals/big-number"
import { BigNumber as BigNumberJS } from "bignumber.js"

describe("clone", () => {
  describe("basic cloning", () => {
    it("should clone primitive values", () => {
      expect(clone(42)).toBe(42)
      expect(clone("hello")).toBe("hello")
      expect(clone(true)).toBe(true)
      expect(clone(null)).toBe(null)
      expect(clone(undefined)).toBe(undefined)
    })

    it("should clone arrays", () => {
      const original = [1, 2, 3]
      const cloned = clone(original)

      expect(cloned).toEqual(original)
      expect(cloned).not.toBe(original)
    })

    it("should clone nested arrays", () => {
      const original = [1, [2, 3], [4, [5, 6]]]
      const cloned = clone(original)

      expect(cloned).toEqual(original)
      expect(cloned).not.toBe(original)
      expect(cloned[1]).not.toBe(original[1])
      expect(cloned[2][1]).not.toBe(original[2][1])
    })

    it("should clone objects", () => {
      const original = { a: 1, b: "test" }
      const cloned = clone(original)

      expect(cloned).toEqual(original)
      expect(cloned).not.toBe(original)
    })

    it("should clone nested objects", () => {
      const original = { a: 1, b: { c: 2, d: { e: 3 } } }
      const cloned = clone(original)

      expect(cloned).toEqual(original)
      expect(cloned).not.toBe(original)
      expect(cloned.b).not.toBe(original.b)
      expect(cloned.b.d).not.toBe(original.b.d)
    })
  })

  describe("BigNumber handling", () => {
    it("should handle BigNumber instances", () => {
      const bigNum = new BigNumber("123.45")
      const original = { value: bigNum }
      const cloned = clone(original)

      expect(cloned.value).toBe(123.45)
    })

    it("should handle BigNumberJS instances", () => {
      const bigNumJS = new BigNumberJS("678.90")
      const original = { value: bigNumJS }
      const cloned = clone(original)

      expect(cloned.value).toBe(678.9)
    })

    it("should handle mixed BigNumber types in arrays", () => {
      const bigNum = new BigNumber("100")
      const bigNumJS = new BigNumberJS("200")
      const original = [bigNum, bigNumJS, "normal"]
      const cloned = clone(original)

      expect(cloned).toEqual([100, 200, "normal"])
    })
  })

  describe("sanitization (default behavior)", () => {
    it("should remove functions by default", () => {
      const original = {
        a: 1,
        fn: () => "test",
        b: 2,
      }
      const cloned = clone(original)

      expect(cloned).toEqual({ a: 1, b: 2 })
      expect(cloned.fn).toBeUndefined()
    })

    it("should remove symbols by default", () => {
      const sym = Symbol("test")
      const original = {
        a: 1,
        [sym]: "symbol value",
        b: sym,
      }
      const cloned = clone(original)

      expect(cloned).toEqual({ a: 1 })
    })

    it("should remove bigints by default", () => {
      const original = {
        a: 1,
        bigIntValue: BigInt(123),
        b: 2,
      }
      const cloned = clone(original)

      expect(cloned).toEqual({ a: 1, b: 2 })
    })

    it("should convert Maps to plain objects", () => {
      const map = new Map<string, any>([
        ["key1", "value1"],
        ["key2", { nested: "value" }],
      ])
      const original = { map }
      const cloned = clone(original)

      expect(cloned.map).toEqual({
        key1: "value1",
        key2: { nested: "value" },
      })
    })

    it("should convert Sets to arrays", () => {
      const set = new Set([1, 2, 3, { a: 1 }])
      const original = { set }
      const cloned = clone(original)

      expect(cloned.set).toEqual([1, 2, 3, { a: 1 }])
    })

    it("should convert Dates to ISO strings", () => {
      const date = new Date("2023-01-01T00:00:00.000Z")
      const original = { date }
      const cloned = clone(original)

      expect(cloned.date).toBe("2023-01-01T00:00:00.000Z")
    })

    it("should handle nested Maps and Sets", () => {
      const nestedMap = new Map([["inner", "value"]])
      const nestedSet = new Set([1, 2])
      const original = {
        map: new Map<string, any>([
          ["nested", nestedMap],
          ["set", nestedSet],
        ]),
      }
      const cloned = clone(original)

      expect(cloned.map).toEqual({
        nested: { inner: "value" },
        set: [1, 2],
      })
    })
  })

  describe("sanitize option set to false", () => {
    it("should still jsonify BigNumbers even when sanitize is false", () => {
      const bigNum = new BigNumber("123.45")
      const original = { value: bigNum }
      const cloned = clone(original, { sanitize: false })

      expect(cloned.value).toBe(123.45)
    })

    it("should still handle BigNumberJS even when sanitize is false", () => {
      const bigNumJS = new BigNumberJS("678.90")
      const original = { value: bigNumJS }
      const cloned = clone(original, { sanitize: false })

      expect(cloned.value).toBe(678.9)
    })
  })

  describe("complex nested structures", () => {
    it("should handle complex nested structures with mixed types", () => {
      const original = {
        numbers: [1, 2, 3],
        strings: ["a", "b", "c"],
        nested: {
          map: new Map([["key", "value"]]),
          set: new Set([1, 2, 3]),
          date: new Date("2023-01-01"),
          bigNum: new BigNumber("999.99"),
          fn: () => "should be removed",
        },
        array: [
          { a: 1 },
          new Map([["nested", { deep: true }]]),
          new Set([{ obj: "in set" }]),
        ],
      }

      const cloned = clone(original)

      expect(cloned).toEqual({
        numbers: [1, 2, 3],
        strings: ["a", "b", "c"],
        nested: {
          map: { key: "value" },
          set: [1, 2, 3],
          date: "2023-01-01T00:00:00.000Z",
          bigNum: 999.99,
        },
        array: [{ a: 1 }, { nested: { deep: true } }, [{ obj: "in set" }]],
      })

      expect(cloned.nested).not.toBe(original.nested)
      expect(cloned.array[0]).not.toBe(original.array[0])
    })
  })

  describe("edge cases", () => {
    it("should handle null and undefined", () => {
      expect(clone(null)).toBe(null)
      expect(clone(undefined)).toBe(undefined)
    })

    it("should handle empty objects and arrays", () => {
      expect(clone({})).toEqual({})
      expect(clone([])).toEqual([])
    })

    it("should handle objects with undefined values", () => {
      const original = {
        defined: "value",
        undefined: undefined,
        fn: () => {},
        another: "value",
      }
      const cloned = clone(original)

      expect(cloned).toEqual({
        defined: "value",
        undefined: undefined,
        another: "value",
      })
    })
  })

  describe("rfdc options", () => {
    it("should pass through rfdc options", () => {
      const original = { a: 1, b: { c: 2 } }
      const cloned = clone(original, { proto: false })

      expect(cloned).toEqual(original)
      expect(cloned).not.toBe(original)
    })
  })
})
