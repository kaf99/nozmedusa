import { Redis } from "ioredis"
import { RedisCacheModuleOptions } from "@types"

export class RedisCachingProvider {
  static identifier = "cache-redis"

  protected redisClient: Redis
  protected keyNamePrefix: string
  protected defaultTTL: number

  constructor(
    { redisClient, prefix }: { redisClient: Redis; prefix: string },
    options?: RedisCacheModuleOptions
  ) {
    this.redisClient = redisClient
    this.keyNamePrefix = prefix
    this.defaultTTL = options?.ttl ?? 3600 // 1 hour default
  }

  #getKeyName(key: string): string {
    return `${this.keyNamePrefix}${key}`
  }

  #getTagKey(tag: string): string {
    return `${this.keyNamePrefix}tag:${tag}`
  }

  #getOptionsKey(key: string): string {
    return `${this.keyNamePrefix}options:${key}`
  }

  async get({ key, tags }: { key?: string; tags?: string[] }): Promise<any> {
    if (key) {
      const keyName = this.#getKeyName(key)
      const result = await this.redisClient.get(keyName)
      return result ? JSON.parse(result) : null
    }

    if (tags && tags.length > 0) {
      // Get all keys associated with the tags
      const pipeline = this.redisClient.pipeline()
      tags.forEach((tag) => {
        const tagKey = this.#getTagKey(tag)
        pipeline.smembers(tagKey)
      })

      const tagResults = await pipeline.exec()
      const allKeys = new Set<string>()

      tagResults?.forEach((result, index) => {
        if (result && result[1]) {
          ;(result[1] as string[]).forEach((key) => allKeys.add(key))
        }
      })

      if (allKeys.size === 0) {
        return []
      }

      // Get all values for the keys
      const valuePipeline = this.redisClient.pipeline()
      Array.from(allKeys).forEach((key) => {
        valuePipeline.get(key)
      })

      const valueResults = await valuePipeline.exec()
      const results: any[] = []

      valueResults?.forEach((result, index) => {
        if (result && result[1]) {
          try {
            results.push(JSON.parse(result[1] as string))
          } catch (e) {
            // Skip invalid JSON
          }
        }
      })

      return results
    }

    return null
  }

  async set({
    key,
    data,
    ttl,
    tags,
    options,
  }: {
    key: string
    data: object
    ttl?: number
    tags?: string[]
    options?: {
      noAutoInvalidation?: boolean
    }
  }): Promise<void> {
    const keyName = this.#getKeyName(key)
    const serializedData = JSON.stringify(data)
    const effectiveTTL = ttl ?? this.defaultTTL

    // Set the main cache entry
    if (effectiveTTL > 0) {
      await this.redisClient.setex(keyName, effectiveTTL, serializedData)
    } else {
      await this.redisClient.set(keyName, serializedData)
    }

    // Store options if provided
    if (options) {
      const optionsKey = this.#getOptionsKey(key)
      const optionsData = JSON.stringify(options)

      if (effectiveTTL > 0) {
        await this.redisClient.setex(optionsKey, effectiveTTL + 60, optionsData) // +1 minute buffer
      } else {
        await this.redisClient.set(optionsKey, optionsData)
      }
    }

    // Handle tags if provided
    if (tags && tags.length > 0) {
      const pipeline = this.redisClient.pipeline()

      tags.forEach((tag) => {
        const tagKey = this.#getTagKey(tag)
        pipeline.sadd(tagKey, keyName)

        // Set TTL for tag keys too (slightly longer than cache TTL)
        if (effectiveTTL > 0) {
          pipeline.expire(tagKey, effectiveTTL + 60) // +1 minute buffer
        }
      })

      await pipeline.exec()
    }
  }

  async clear({
    key,
    tags,
    options,
  }: {
    key?: string
    tags?: string[]
    options?: {
      noAutoInvalidation?: boolean
    }
  }): Promise<void> {
    if (key) {
      const keyName = this.#getKeyName(key)
      const optionsKey = this.#getOptionsKey(key)
      await this.redisClient.del(keyName, optionsKey)
      return
    }

    if (tags && tags.length > 0) {
      // Get all keys associated with the tags
      const pipeline = this.redisClient.pipeline()
      tags.forEach((tag) => {
        const tagKey = this.#getTagKey(tag)
        pipeline.smembers(tagKey)
      })

      const tagResults = await pipeline.exec()
      const allKeys = new Set<string>()

      tagResults?.forEach((result, index) => {
        if (result && result[1]) {
          ;(result[1] as string[]).forEach((key) => allKeys.add(key))
        }
      })

      if (allKeys.size > 0) {
        // If clear method has noAutoInvalidation=false, force clear all keys
        // Otherwise, respect individual entry noAutoInvalidation settings
        const forceInvalidation = options?.noAutoInvalidation === false

        if (forceInvalidation) {
          // Force invalidation - clear all keys regardless of their individual settings
          const deletePipeline = this.redisClient.pipeline()

          Array.from(allKeys).forEach((key) => {
            const optionsKey = this.#getOptionsKey(
              key.replace(this.keyNamePrefix, "")
            )
            deletePipeline.del(key, optionsKey)
          })

          tags.forEach((tag) => {
            const tagKey = this.#getTagKey(tag)
            deletePipeline.del(tagKey)
          })

          await deletePipeline.exec()
        } else {
          // Respect individual entry noAutoInvalidation settings
          const optionsPipeline = this.redisClient.pipeline()

          Array.from(allKeys).forEach((key) => {
            const optionsKey = this.#getOptionsKey(
              key.replace(this.keyNamePrefix, "")
            )
            optionsPipeline.get(optionsKey)
          })

          const optionsResults = await optionsPipeline.exec()
          const keysToDelete: string[] = []

          Array.from(allKeys).forEach((key, index) => {
            const optionsResult = optionsResults?.[index]

            if (optionsResult && optionsResult[1]) {
              try {
                const entryOptions = JSON.parse(optionsResult[1] as string)
                // Only delete if entry doesn't have noAutoInvalidation set to true
                if (!entryOptions.noAutoInvalidation) {
                  keysToDelete.push(key)
                }
              } catch (e) {
                // If can't parse options, assume it's safe to delete
                keysToDelete.push(key)
              }
            } else {
              // No options stored, safe to delete
              keysToDelete.push(key)
            }
          })

          if (keysToDelete.length > 0) {
            const deletePipeline = this.redisClient.pipeline()

            keysToDelete.forEach((key) => {
              const optionsKey = this.#getOptionsKey(
                key.replace(this.keyNamePrefix, "")
              )
              deletePipeline.del(key, optionsKey)
            })

            // Only delete tag keys if all keys for that tag are being deleted
            tags.forEach((tag) => {
              const tagKey = this.#getTagKey(tag)
              deletePipeline.del(tagKey)
            })

            await deletePipeline.exec()
          }
        }
      }
    }
  }

  // async flush(): Promise<void> {
  //   // Use SCAN to find all keys with our prefix and delete them
  //   const pattern = `${this.keyNamePrefix}*`
  //   let cursor = "0"

  //   do {
  //     const result = await this.redisClient.scan(
  //       cursor,
  //       "MATCH",
  //       pattern,
  //       "COUNT",
  //       1000
  //     )
  //     cursor = result[0]
  //     const keys = result[1]

  //     if (keys.length > 0) {
  //       await this.redisClient.del(...keys)
  //     }
  //   } while (cursor !== "0")
  // }
}
