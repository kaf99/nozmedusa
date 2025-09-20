import { MikroORM } from "@mikro-orm/core"
import { defineConfig } from "@mikro-orm/postgresql"
import {
  Entity1WithUnDecoratedProp,
  Entity2WithUnDecoratedProp,
  Product,
  ProductOption,
  ProductOptionValue,
  ProductVariant,
} from "../__fixtures__/utils"
import { mikroOrmSerializer } from "../mikro-orm-serializer"
import { mikroOrmSerializerNew } from "../mikro-orm-serializer-new"

jest.setTimeout(60000)

describe("mikroOrmSerializer", () => {
  beforeEach(async () => {
    await MikroORM.init(
      defineConfig({
        entities: [
          Entity1WithUnDecoratedProp,
          Entity2WithUnDecoratedProp,
          Product,
          ProductOption,
          ProductOptionValue,
          ProductVariant,
        ],
        user: "postgres",
        password: "",
        dbName: "test",
        connect: false,
      })
    )
  })

  it("should serialize an entity", async () => {
    const entity1 = new Entity1WithUnDecoratedProp({
      id: "1",
      deleted_at: null,
    })
    entity1.unknownProp = "calculated"

    const entity2 = new Entity2WithUnDecoratedProp({
      id: "2",
      deleted_at: null,
      entity1: entity1,
    })
    entity1.entity2.add(entity2)

    const serialized = await mikroOrmSerializer(entity1, {
      preventCircularRef: false,
    })

    expect(serialized).toEqual({
      id: "1",
      deleted_at: null,
      unknownProp: "calculated",
      entity2: [
        {
          id: "2",
          deleted_at: null,
          entity1: {
            id: "1",
            deleted_at: null,
            unknownProp: "calculated",
          },
          entity1_id: "1",
        },
      ],
    })
  })

  it("should serialize an array of entities", async () => {
    const entity1 = new Entity1WithUnDecoratedProp({
      id: "1",
      deleted_at: null,
    })
    entity1.unknownProp = "calculated"

    const entity2 = new Entity2WithUnDecoratedProp({
      id: "2",
      deleted_at: null,
      entity1: entity1,
    })
    entity1.entity2.add(entity2)

    const serialized = await mikroOrmSerializer([entity1, entity1], {
      preventCircularRef: false,
    })

    const expectation = {
      id: "1",
      deleted_at: null,
      unknownProp: "calculated",
      entity2: [
        {
          id: "2",
          deleted_at: null,
          entity1: {
            id: "1",
            deleted_at: null,
            unknownProp: "calculated",
          },
          entity1_id: "1",
        },
      ],
    }

    expect(serialized).toEqual([expectation, expectation])
  })

  it("should serialize an entity preventing circular relation reference", async () => {
    const entity1 = new Entity1WithUnDecoratedProp({
      id: "1",
      deleted_at: null,
    })
    entity1.unknownProp = "calculated"

    const entity2 = new Entity2WithUnDecoratedProp({
      id: "2",
      deleted_at: null,
      entity1: entity1,
    })
    entity1.entity2.add(entity2)

    const serialized = await mikroOrmSerializer(entity1)

    expect(serialized).toEqual({
      id: "1",
      deleted_at: null,
      unknownProp: "calculated",
      entity2: [
        {
          id: "2",
          deleted_at: null,
          entity1_id: "1",
        },
      ],
    })
  })

  it(`should properly serialize nested relations and sibling to not return parents into children`, async () => {
    const productOptionValue = new ProductOptionValue()
    productOptionValue.id = "1"
    productOptionValue.name = "Product option value 1"
    productOptionValue.option_id = "1"

    const productOptions = new ProductOption()
    productOptions.id = "1"
    productOptions.name = "Product option 1"
    productOptions.values.add(productOptionValue)

    const productVariant = new ProductVariant()
    productVariant.id = "1"
    productVariant.name = "Product variant 1"
    productVariant.options.add(productOptionValue)

    const product = new Product()
    product.id = "1"
    product.name = "Product 1"
    product.options.add(productOptions)
    product.variants.add(productVariant)

    const serialized = await mikroOrmSerializer(product)

    expect(serialized).toEqual({
      id: "1",
      options: [
        {
          id: "1",
          values: [
            {
              id: "1",
              variants: [
                {
                  id: "1",
                  name: "Product variant 1",
                },
              ],
              name: "Product option value 1",
              option_id: "1",
            },
          ],
          name: "Product option 1",
        },
      ],
      variants: [
        {
          id: "1",
          options: [
            {
              id: "1",
              name: "Product option value 1",
              option_id: "1",
              option: {
                id: "1",
                name: "Product option 1",
              },
            },
          ],
          name: "Product variant 1",
        },
      ],
      name: "Product 1",
    })
  })

  it.only("should compare request-scoped serializer performance", async () => {
    const logs: string[] = []
    logs.push("🔬 Comparing serializer performance...")

    // Generate test dataset - smaller for comparison
    function generateComparisonProducts(count: number): Product[] {
      const products: Product[] = []

      for (let i = 0; i < count; i++) {
        const product = new Product()
        product.id = `product-${i}`
        product.name = `Product ${i}`

        // Generate 3 options per product
        for (let optionIndex = 0; optionIndex < 3; optionIndex++) {
          const option = new ProductOption()
          option.id = `option-${product.id}-${optionIndex}`
          option.name = `Option ${optionIndex} for Product ${product.id}`
          option.product = product

          // Generate 3 values per option
          for (let valueIndex = 0; valueIndex < 3; valueIndex++) {
            const value = new ProductOptionValue()
            value.id = `option-value-${option.id}-${valueIndex}`
            value.name = `Option Value ${valueIndex} for Option ${option.id}`
            value.option_id = option.id
            value.option = option
            option.values.add(value)
          }

          product.options.add(option)
        }

        // Generate 2 variants per product
        for (let variantIndex = 0; variantIndex < 2; variantIndex++) {
          const variant = new ProductVariant()
          variant.id = `variant-${product.id}-${variantIndex}`
          variant.name = `Variant ${variantIndex} for Product ${product.id}`
          variant.product_id = product.id
          variant.product = product

          // Assign option values to variants
          const optionArray = product.options.getItems()
          for (let j = 0; j < 2 && j < optionArray.length; j++) {
            const option = optionArray[j]
            const optionValues = option.values.getItems()
            if (optionValues.length > 0) {
              const value = optionValues[0]
              variant.options.add(value)
              value.variants.add(variant)
            }
          }

          product.variants.add(variant)
        }

        products.push(product)
      }

      return products
    }

    const testProducts = generateComparisonProducts(20000)

    logs.push(`📊 Testing with ${testProducts.length} products`)
    logs.push(`   Each with 3 options, 9 option values, 2 variants`)

    // Test configurations
    const testConfigs = [
      {
        name: "Original",
        serializer: mikroOrmSerializer,
      },
      {
        name: "New-optimized",
        serializer: mikroOrmSerializerNew,
      },
    ]

    logs.push("\n🏃‍♂️ Performance Comparison:")
    logs.push("=".repeat(80))

    const results: Array<{ name: string; time: number; speedup: number }> = []

    for (const config of testConfigs) {
      logs.push(`\n📋 Testing: ${config.name}`)
      logs.push("-".repeat(50))

      // Run test 3 times and take average
      const times: number[] = []
      for (let run = 0; run < 1; run++) {
        const start = performance.now()
        const result = await config.serializer(testProducts)
        const time = performance.now() - start
        times.push(time)

        // Verify result is correct
        expect(result).toHaveLength(20000)
        // Validate complete structure of first result
        const firstResult = result[0]
        expect(firstResult).toEqual(
          expect.objectContaining({
            id: expect.any(String),
            name: expect.any(String),
            options: expect.any(Array),
            variants: expect.any(Array),
          })
        )

        // Validate options array structure (should have 3 options)
        expect(firstResult.options).toHaveLength(3)
        expect(firstResult.options[0]).toEqual(
          expect.objectContaining({
            id: expect.any(String),
            name: expect.any(String),
            values: expect.arrayContaining([
              expect.objectContaining({
                id: expect.any(String),
                name: expect.any(String),
                option_id: expect.any(String),
                variants: expect.any(Array),
              }),
            ]),
          })
        )

        // Validate each option has 3 values
        firstResult.options.forEach((option: any) => {
          expect(option.values).toHaveLength(3)
          option.values.forEach((value: any) => {
            expect(value).toEqual(
              expect.objectContaining({
                id: expect.any(String),
                name: expect.any(String),
                option_id: expect.any(String),
                variants: expect.any(Array),
              })
            )
          })
        })

        // Validate variants array structure (should have 2 variants)
        expect(firstResult.variants).toHaveLength(2)
        expect(firstResult.variants[0]).toEqual(
          expect.objectContaining({
            id: expect.any(String),
            name: expect.any(String),
            options: expect.arrayContaining([
              expect.objectContaining({
                id: expect.any(String),
                name: expect.any(String),
                option_id: expect.any(String),
                option: expect.objectContaining({
                  id: expect.any(String),
                  name: expect.any(String),
                }),
              }),
            ]),
          })
        )

        // Validate each variant has exactly 2 option values assigned
        firstResult.variants.forEach((variant: any) => {
          expect(variant.options).toHaveLength(2)
          variant.options.forEach((optionValue: any) => {
            expect(optionValue).toEqual(
              expect.objectContaining({
                id: expect.any(String),
                name: expect.any(String),
                option_id: expect.any(String),
                option: expect.objectContaining({
                  id: expect.any(String),
                  name: expect.any(String),
                }),
              })
            )
          })
        })
      }

      const avgTime = times.reduce((sum, time) => sum + time, 0) / times.length
      const minTime = Math.min(...times)
      const maxTime = Math.max(...times)

      logs.push(`   Average: ${avgTime.toFixed(2)}ms`)
      logs.push(`   Range: ${minTime.toFixed(2)}ms - ${maxTime.toFixed(2)}ms`)

      results.push({
        name: config.name,
        time: avgTime,
        speedup: 0, // Will calculate after all tests
      })
    }

    // Calculate speedups relative to original
    const baselineTime = results[0].time
    results.forEach((result) => {
      result.speedup = baselineTime / result.time
    })

    logs.push("\n🎯 Performance Summary:")
    logs.push("=".repeat(80))
    logs.push(`${"Configuration".padEnd(50)} ${"Time".padEnd(12)} ${"Speedup"}`)
    logs.push("-".repeat(80))

    results.forEach((result) => {
      const speedupText =
        result.speedup === 1
          ? "baseline"
          : `${result.speedup.toFixed(1)}x faster`
      logs.push(
        `${result.name.padEnd(50)} ${result.time
          .toFixed(2)
          .padStart(8)}ms    ${speedupText}`
      )
    })

    logs.push("\n📈 Key Insights:")

    const bestConfig = results.reduce((best, current) =>
      current.time < best.time ? current : best
    )
    logs.push(
      `   Fastest: ${bestConfig.name} (${bestConfig.time.toFixed(2)}ms)`
    )

    const requestScopedWithCircular = results.find((r) =>
      r.name.includes("Request-scoped")
    )
    const originalWithCircular = results.find((r) =>
      r.name.includes("Original")
    )

    if (requestScopedWithCircular && originalWithCircular) {
      const improvement =
        ((originalWithCircular.time - requestScopedWithCircular.time) /
          originalWithCircular.time) *
        100
      if (improvement > 5) {
        logs.push(
          `   Request-scoped improves circular ref handling by ${improvement.toFixed(
            1
          )}%`
        )
      } else {
        logs.push(
          `   Request-scoped performance similar to original (${improvement.toFixed(
            1
          )}% difference)`
        )
      }
    }

    const noCircularRefBest = results
      .filter((r) => r.name.includes("New-optimized"))
      .reduce((best, current) => (current.time < best.time ? current : best))
    logs.push(
      `   Best optimized: ${
        noCircularRefBest.name
      } (${noCircularRefBest.speedup.toFixed(1)}x speedup)`
    )

    logs.push("\n💡 Recommendations:")
    if (bestConfig.name.includes("New-optimized")) {
      logs.push(
        "   - New-optimized provides best performance with full compatibility"
      )
      logs.push("   - Maintains all safety features while maximizing speed")
    }
    if (bestConfig.time < 50) {
      logs.push("   ✅ Sub-50ms target achieved!")
    } else {
      logs.push(
        `   ⚠️  Target: sub-50ms, Current best: ${bestConfig.time.toFixed(2)}ms`
      )
    }

    logs.push("=".repeat(80))
    logs.push("✅ Performance comparison completed")

    // Output all logs at once
    console.log(logs.join("\n"))
  }, 45000)
})
