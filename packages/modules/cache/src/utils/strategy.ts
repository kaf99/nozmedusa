import {
  type GraphQLSchema,
  Modules,
  toCamelCase,
  upperCaseFirst,
} from "@medusajs/framework/utils"
import type { Event, ICachingModuleService } from "@medusajs/framework/types"
import type { InjectedDependencies } from "@types"
import crypto from "crypto"
import stringify from "fast-json-stable-stringify"
import { CacheInvalidationParser, EntityReference } from "./parser"
import { type CachingModuleService } from "@services"

export function objectHash(input: any): string {
  const str = stringify(input)
  return crypto.createHash("sha1").update(str).digest("hex")
}

export class DefaultCacheStrategy {
  #cacheInvalidationParser: CacheInvalidationParser
  #container: InjectedDependencies
  #cacheModule: ICachingModuleService

  constructor(
    container: InjectedDependencies,
    schema: GraphQLSchema,
    cacheModule: CachingModuleService
  ) {
    this.#cacheInvalidationParser = new CacheInvalidationParser(schema)
    this.#container = container
    this.#cacheModule = cacheModule

    this.applyReactiveInvalidation()
  }

  applyReactiveInvalidation() {
    const eventBus = this.#container[Modules.EVENT_BUS]

    eventBus.subscribe("*", async (data: Event) => {
      try {
        // We dont have to await anything here and the rest can be done in the background
        return
      } finally {
        const eventName = data.name
        const operation = eventName.split(".").pop() as
          | "created"
          | "updated"
          | "deleted"
        const entityType = eventName.split(".").slice(-2).shift()!

        const eventData = data.data as
          | { id: string | string[] }
          | { id: string | string[] }[]

        // We expect event data to be either { id: string | string[] } or { id: string | string[] }[]
        if (Array.isArray(eventData)) {
          for (const item of eventData) {
            const ids = Array.isArray(item.id) ? item.id : [item.id]
            const tags: string[] = []
            for (const id of ids) {
              const entityReference: EntityReference = {
                type: upperCaseFirst(toCamelCase(entityType)),
                id,
              }

              const tags_ = await this.computeTags(item, {
                entities: [entityReference],
                operation,
              })
              tags.push(...tags_)
            }

            console.log(tags)
            // TODO: remove expect error once implemented
            // @ts-expect-error
            this.#cacheModule.clear({ tags, noAutoInvalidation: false })
          }
        } else {
          const ids = Array.isArray(eventData.id)
            ? eventData.id
            : [eventData.id]
          const tags: string[] = []
          for (const id of ids) {
            const entityReference: EntityReference = {
              type: upperCaseFirst(toCamelCase(entityType)),
              id,
            }

            const tags_ = await this.computeTags(eventData, {
              entities: [entityReference],
              operation,
            })

            tags.push(...tags_)
          }

          console.log(tags)
          // TODO: remove expect error once implemented
          // @ts-expect-error
          this.#cacheModule.clear({ tags, noAutoInvalidation: false })
        }
      }
    })
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
    input: object | ((input: object) => string[] | Promise<string[]>),
    {
      entities,
      operation,
    }: {
      entities?: EntityReference[]
      operation?: "created" | "updated" | "deleted"
    }
  ): Promise<string[]> {
    if (typeof input === "function") {
      return await input(input)
    }

    // Parse the input object to identify entities
    const entities_ =
      entities || this.#cacheInvalidationParser.parseObjectForEntities(input)

    if (entities_.length === 0) {
      return []
    }

    // Generate cache key for this input
    const cacheKey = await this.computeCacheKey(input)

    // Build invalidation events to get comprehensive cache keys
    const events = this.#cacheInvalidationParser.buildInvalidationEvents(
      entities_,
      cacheKey,
      operation
    )

    // Collect all unique cache keys from all events as tags
    const tags = new Set<string>()

    events.forEach((event) => {
      event.cacheKeys.forEach((key) => tags.add(key))

      // Also add entity-specific tags
      tags.add(`${event.entityType}:${event.entityId}`)
      tags.add(`${event.entityType}:*`)
    })

    return Array.from(tags)
  }
}
