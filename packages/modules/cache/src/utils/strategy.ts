import { GraphQLSchema } from "@medusajs/framework/utils"
import crypto from "crypto"
import stringify from "fast-json-stable-stringify"
import { CacheInvalidationParser } from "./parser"

export function objectHash(input: any): string {
  const str = stringify(input)
  return crypto.createHash("sha1").update(str).digest("hex")
}

export class DefaultCacheStrategy {
  #cacheInvalidationParser: CacheInvalidationParser

  constructor(schema: GraphQLSchema) {
    this.#cacheInvalidationParser = new CacheInvalidationParser(schema)
  }

  async computeCacheKey(
    input: object | ((input: object) => string | Promise<string>)
  ) {
    if (typeof input === "function") {
      return await input(input)
    }

    return objectHash(input)
  }

  async computeTags(
    input: object | ((input: object) => string[] | Promise<string[]>)
  ): Promise<string[]> {
    if (typeof input === "function") {
      return await input(input)
    }

    // Parse the input object to identify entities
    const entities = this.#cacheInvalidationParser.parseObjectForEntities(input)

    if (entities.length === 0) {
      return []
    }

    // Generate cache key for this input
    const cacheKey = await this.computeCacheKey(input)

    // Build invalidation events to get comprehensive cache keys
    const events = this.#cacheInvalidationParser.buildInvalidationEvents(
      entities,
      cacheKey
    )

    // Collect all unique cache keys from all events as tags
    const tags = new Set<string>()

    events.forEach((event) => {
      event.cacheKeys.forEach((key) => tags.add(key))

      // Also add entity-specific tags
      tags.add(`${event.entityType}:${event.entityId}`)
      tags.add(`${event.entityType}:*`)

      // Add event name as a tag for targeted invalidation
      const eventName =
        this.#cacheInvalidationParser.generateInvalidationEventName(
          event.entityType,
          "update"
        )
      tags.add(eventName)
    })

    return Array.from(tags)
  }
}
