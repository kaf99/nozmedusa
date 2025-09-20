/**
 * Ultra-optimized mikro orm serializer targeting sub-50ms for 1000 complex entities
 * Applied V8 optimizations: hidden classes, inline caching, minimal allocations
 */

import {
  Collection,
  EntityDTO,
  EntityMetadata,
  helper,
  IPrimaryKey,
  Loaded,
  Platform,
  Reference,
  ReferenceKind,
  SerializationContext,
  Utils,
} from "@mikro-orm/core"

// V8 Optimization: Fixed shape objects for hidden class optimization
const STATIC_OPTIONS_SHAPE = {
  populate: ["*"] as string[] | boolean,
  exclude: undefined as string[] | undefined,
  preventCircularRef: true,
  skipNull: true,
  ignoreSerializers: true,
  forceObject: false,
}

// V8 Optimization: Interned strings for better memory performance
const EMPTY_ARRAY: readonly string[] = Object.freeze([])
const WILDCARD = "*"
const DOT = "."
const CONSTRUCTOR_NAME = "constructor"
const NAME_PROP = "name"

// V8 Optimization: Pre-allocated objects with consistent shape
const TEMP_OPTIONS = {
  populate: false as string[] | boolean,
  exclude: undefined as string[] | undefined,
  preventCircularRef: true,
  skipNull: true,
  ignoreSerializers: true,
  forceObject: false,
}

// V8 Optimization: Monomorphic function with consistent parameter types
function isVisible(
  propName: string,
  populate: string[] | boolean,
  exclude: string[] | undefined
): boolean {
  // Fast path: most common case first for branch prediction
  if (populate === true) return true

  // Early exit for exclusions
  if (exclude && exclude.includes(propName)) return false

  if (Array.isArray(populate)) {
    // V8 Optimization: Cache array length for better JIT optimization
    const populateLength = populate.length
    const propNameLength = propName.length

    // V8 Optimization: Use for loop with cached length (faster than forEach)
    for (let i = 0; i < populateLength; i++) {
      const item = populate[i]
      // Most common checks first for branch prediction optimization
      if (item === WILDCARD) return true
      if (item === propName) return true
      // Optimized string comparison: check length first to avoid startsWith overhead
      if (
        item.length > propNameLength &&
        item.charCodeAt(propNameLength) === 46
      ) {
        // 46 = '.'
        if (item.startsWith(propName)) return true
      }
    }
  }

  return false
}

// V8 Optimization: Simplified monomorphic function
function isPopulated(propName: string, populate: string[] | boolean): boolean {
  // Branch prediction: most common case first
  if (populate === true) return true
  if (populate === false || !Array.isArray(populate)) return false

  // V8 Optimization: Cache values to avoid repeated property access
  const propNameLength = propName.length
  const populateLength = populate.length

  // Optimized loop with minimal operations
  for (let i = 0; i < populateLength; i++) {
    const item = populate[i]
    if (item === WILDCARD || item === propName) return true
    // Optimized prefix check: charCodeAt is faster than string operations
    if (
      item.length > propNameLength &&
      item.charCodeAt(propNameLength) === 46
    ) {
      // Use slice instead of startsWith for better performance on small strings
      if (item.slice(0, propNameLength) === propName) return true
    }
  }

  return false
}

// V8 Optimization: Ultra-lightweight request-scoped context with object pooling
class RequestScopedSerializationContext {
  readonly propertyNameCache = new Map<string, string>()
  readonly visitedEntities = new WeakSet<object>()
  readonly keyCollectionBuffer = new Array<string>(200) // Increased buffer size
  keyBufferIndex = 0
  readonly resultObjectPool: any[] = [] // Object pool for result objects
  poolIndex = 0

  constructor() {
    // Pre-warm cache with most common property names
    this.propertyNameCache.set("id", "id")
    this.propertyNameCache.set("name", "name")
    this.propertyNameCache.set("created_at", "created_at")
    this.propertyNameCache.set("updated_at", "updated_at")
    this.propertyNameCache.set("deleted_at", "deleted_at")
    this.propertyNameCache.set("product_id", "product_id")
    this.propertyNameCache.set("option_id", "option_id")
    this.propertyNameCache.set("variant_id", "variant_id")

    // Pre-allocate object pool
    for (let i = 0; i < 50; i++) {
      this.resultObjectPool.push({})
    }
  }

  // V8 Optimization: Zero-allocation key collection
  resetKeyBuffer(): void {
    this.keyBufferIndex = 0
  }

  addKey(key: string): void {
    if (this.keyBufferIndex < this.keyCollectionBuffer.length) {
      this.keyCollectionBuffer[this.keyBufferIndex++] = key
    } else {
      // Fallback: expand buffer if needed
      this.keyCollectionBuffer.push(key)
      this.keyBufferIndex++
    }
  }

  getKeys(): string[] {
    return this.keyCollectionBuffer.slice(0, this.keyBufferIndex)
  }
}

export class EntitySerializer {
  static serialize<T extends object, P extends string = never>(
    entity: T,
    options: Partial<typeof STATIC_OPTIONS_SHAPE> = STATIC_OPTIONS_SHAPE,
    parents: readonly string[] = EMPTY_ARRAY,
    requestCtx?: RequestScopedSerializationContext
  ): EntityDTO<Loaded<T, P>> {
    // V8 Optimization: Create request-scoped context for concurrent safety
    const ctx = requestCtx ?? new RequestScopedSerializationContext()
    const wrapped = helper(entity)
    const meta = wrapped.__meta
    let contextCreated = false

    // V8 Optimization: Minimize object property access while respecting original options
    const populate = options.populate ?? STATIC_OPTIONS_SHAPE.populate
    const exclude = options.exclude
    const skipNull = options.skipNull ?? STATIC_OPTIONS_SHAPE.skipNull
    const preventCircularRef =
      options.preventCircularRef ?? STATIC_OPTIONS_SHAPE.preventCircularRef
    const ignoreSerializers =
      options.ignoreSerializers ?? STATIC_OPTIONS_SHAPE.ignoreSerializers
    const forceObject = options.forceObject ?? STATIC_OPTIONS_SHAPE.forceObject

    // V8 Optimization: EXTREME - Bypass MikroORM context for maximum speed
    let root: any = null
    if (preventCircularRef) {
      // Only create context if circular ref prevention is needed
      const serializationContext = wrapped.__serializationContext
      if (!serializationContext.root) {
        root = new SerializationContext({} as any)
        SerializationContext.propagate(
          root,
          entity,
          (meta: any, prop: any) =>
            meta.properties[prop]?.kind !== ReferenceKind.SCALAR
        )
        contextCreated = true
      } else {
        root = serializationContext.root! as SerializationContext<any>
      }
    }
    const ret = {} as EntityDTO<Loaded<T, P>>

    // V8 Optimization: Zero-allocation key collection using pre-allocated buffer
    ctx.resetKeyBuffer()
    const seenKeys = new Set<string>() // Only for deduplication

    // Batch collect all unique keys directly into buffer
    const primaryKeys = meta.primaryKeys
    const entityKeys = Object.keys(entity)
    const metaPropertyKeys = Object.keys(meta.properties)

    // Primary keys first (most important)
    for (let i = 0; i < primaryKeys.length; i++) {
      const key = primaryKeys[i]
      if (!seenKeys.has(key)) {
        seenKeys.add(key)
        ctx.addKey(key)
      }
    }

    // Entity keys
    for (let i = 0; i < entityKeys.length; i++) {
      const key = entityKeys[i]
      if (!seenKeys.has(key)) {
        seenKeys.add(key)
        ctx.addKey(key)
      }
    }

    // Metadata property keys
    for (let i = 0; i < metaPropertyKeys.length; i++) {
      const key = metaPropertyKeys[i]
      if (!seenKeys.has(key)) {
        seenKeys.add(key)
        ctx.addKey(key)
      }
    }

    const allKeys = ctx.getKeys()
    const allKeysLength = allKeys.length

    // V8 Optimization: Fast path for simple entities (no relations)
    let hasComplexProperties = false
    const metaProperties = meta.properties
    for (let i = 0; i < allKeysLength; i++) {
      const prop = allKeys[i]
      const propMeta = metaProperties[prop]
      if (propMeta && propMeta.kind !== ReferenceKind.SCALAR) {
        hasComplexProperties = true
        break
      }
    }

    // Super-fast path for simple entities
    if (!hasComplexProperties && populate === true) {
      for (let i = 0; i < allKeysLength; i++) {
        const prop = allKeys[i]
        const propValue = entity[prop as keyof T]
        if (propValue !== undefined && !(propValue === null && skipNull)) {
          ret[prop] = propValue as T[keyof T & string]
        }
      }
      if (contextCreated) root.close()
      return ret
    }

    const visited = root ? root.visited.has(entity) : false
    if (root && !visited) root.visited.add(entity)

    // V8 Optimization: Cache frequently accessed values
    const className = meta.className
    const platform = wrapped.__platform

    // V8 Optimization: Ultra-aggressive inline property processing loop
    for (let i = 0; i < allKeysLength; i++) {
      const prop = allKeys[i]

      // Inline visibility check for maximum performance
      let isPropertyVisible = false
      if (populate === true) {
        isPropertyVisible = true
      } else if (exclude && exclude.includes(prop)) {
        isPropertyVisible = false
      } else if (Array.isArray(populate)) {
        const populateLength = populate.length
        const propLength = prop.length
        for (let j = 0; j < populateLength; j++) {
          const item = populate[j]
          if (item === WILDCARD || item === prop) {
            isPropertyVisible = true
            break
          }
          if (item.length > propLength && item.charCodeAt(propLength) === 46) {
            if (item.slice(0, propLength) === prop) {
              isPropertyVisible = true
              break
            }
          }
        }
      }

      if (!isPropertyVisible) continue

      const propMeta = metaProperties[prop]
      let shouldSerialize = true

      // Inline circular reference check
      if (
        propMeta &&
        preventCircularRef &&
        propMeta.kind !== ReferenceKind.SCALAR
      ) {
        if (!propMeta.mapToPk) {
          const propType = propMeta.type
          const parentsLength = parents.length
          for (let j = 0; j < parentsLength; j++) {
            if (parents[j] === propType) {
              shouldSerialize = false
              break
            }
          }
        }
      }

      if (!shouldSerialize) continue

      // Inline cycle detection - skip if no circular ref prevention
      const cycle = root ? root.visit(className, prop) : false
      if (cycle && visited) continue

      // Inline property processing for primitive values and common cases
      const propValue = entity[prop as keyof T]

      let val: any

      // Fast path for primitive values (most common case)
      if (
        propValue === null ||
        propValue === undefined ||
        typeof propValue === "string" ||
        typeof propValue === "number" ||
        typeof propValue === "boolean"
      ) {
        val = propValue
      }
      // Function handling
      else if (typeof propValue === "function") {
        const returnValue = (propValue as any)()
        if (!ignoreSerializers && propMeta?.serializer) {
          val = propMeta.serializer(returnValue)
        } else {
          val = returnValue
        }
      }
      // Complex object handling - fall back to method call
      else {
        val = this.processProperty<T>(
          prop as keyof T & string,
          entity,
          populate,
          exclude,
          skipNull,
          preventCircularRef,
          ignoreSerializers,
          forceObject,
          parents,
          ctx
        )
      }

      if (!cycle && root) root.leave(className, prop)

      // Inline property name resolution for common cases
      if (val !== undefined && !(val === null && skipNull)) {
        let propName: string
        if (propMeta?.serializedName) {
          propName = propMeta.serializedName as string
        } else if (propMeta?.primary && platform) {
          propName = platform.getSerializedPrimaryKeyField(prop) as string
        } else {
          propName = prop
        }

        ret[propName] = val as T[keyof T & string]
      }
    }

    // Context cleanup
    if (contextCreated && root) root.close()

    // Skip getter processing if not initialized
    if (!wrapped.isInitialized()) return ret

    // Optimized getter processing
    const metaProps = meta.props
    const metaPropsLength = metaProps.length

    for (let i = 0; i < metaPropsLength; i++) {
      const prop = metaProps[i]
      const propName = prop.name

      if (
        prop.getter &&
        !prop.getterName &&
        entity[propName] !== undefined &&
        isVisible(propName, populate, exclude)
      ) {
        ret[this.propertyName(meta, propName, platform, ctx)] =
          this.processProperty(
            propName,
            entity,
            populate,
            exclude,
            skipNull,
            preventCircularRef,
            ignoreSerializers,
            forceObject,
            parents,
            ctx
          )
      } else if (
        prop.getterName &&
        typeof entity[prop.getterName] === "function" &&
        isVisible(propName, populate, exclude)
      ) {
        ret[this.propertyName(meta, propName, platform, ctx)] =
          this.processProperty(
            prop.getterName as keyof T & string,
            entity,
            populate,
            exclude,
            skipNull,
            preventCircularRef,
            ignoreSerializers,
            forceObject,
            parents,
            ctx
          )
      }
    }

    return ret
  }

  // V8 Optimization: Request-scoped property name resolution
  private static propertyName<T>(
    meta: EntityMetadata<T>,
    prop: string,
    platform?: Platform,
    ctx?: RequestScopedSerializationContext
  ): string {
    if (!ctx) {
      // Fallback to direct computation if no context (shouldn't happen in normal flow)
      const property = meta.properties[prop]
      if (property?.serializedName) {
        return property.serializedName as string
      } else if (property?.primary && platform) {
        return platform.getSerializedPrimaryKeyField(prop) as string
      }
      return prop
    }

    // V8 Optimization: Request-scoped cache key
    const cacheKey = `${meta.className}:${prop}:${
      platform?.constructor.name || "none"
    }`

    const cached = ctx.propertyNameCache.get(cacheKey)
    if (cached !== undefined) return cached

    // Fast property resolution
    const property = meta.properties[prop]
    let result: string

    if (property?.serializedName) {
      result = property.serializedName as string
    } else if (property?.primary && platform) {
      result = platform.getSerializedPrimaryKeyField(prop) as string
    } else {
      result = prop
    }

    // V8 Optimization: Store in request-scoped cache (no size limit needed as it's per-request)
    ctx.propertyNameCache.set(cacheKey, result)
    return result
  }

  // V8 Optimization: Streamlined property processing with direct parameters
  private static processProperty<T extends object>(
    prop: string,
    entity: T,
    populate: string[] | boolean,
    exclude: string[] | undefined,
    skipNull: boolean,
    preventCircularRef: boolean,
    ignoreSerializers: boolean,
    forceObject: boolean,
    parents: readonly string[],
    ctx: RequestScopedSerializationContext
  ): T[keyof T] | undefined {
    // V8 Optimization: Avoid spread operator, use direct array creation
    const entityConstructorName = entity.constructor.name
    const newParents =
      parents.length > 0
        ? [...parents, entityConstructorName] // Keep spread only when necessary
        : [entityConstructorName]

    // V8 Optimization: Cache dot index check result
    const dotIndex = prop.indexOf(DOT)
    if (dotIndex > 0) {
      prop = prop.substring(0, dotIndex)
    }

    const wrapped = helper(entity)
    const property = wrapped.__meta.properties[prop]
    const propValue = entity[prop as keyof T]

    // V8 Optimization: Fast path for functions (branch prediction)
    if (typeof propValue === "function") {
      const returnValue = (propValue as any)()
      if (!ignoreSerializers && property?.serializer) {
        return property.serializer(returnValue)
      }
      return returnValue
    }

    // Handle custom serializers if not ignored
    if (!ignoreSerializers && property?.serializer) {
      return property.serializer(propValue)
    }

    // V8 Optimization: Check most common types first for better branch prediction
    if (Utils.isCollection(propValue)) {
      return this.processCollection(
        prop as keyof T & string,
        entity,
        populate,
        exclude,
        skipNull,
        preventCircularRef,
        ignoreSerializers,
        forceObject,
        newParents,
        ctx
      )
    }

    if (Utils.isEntity(propValue, true)) {
      return this.processEntity(
        prop as keyof T & string,
        entity,
        wrapped.__platform,
        populate,
        exclude,
        skipNull,
        preventCircularRef,
        ignoreSerializers,
        forceObject,
        newParents,
        ctx
      )
    }

    // Handle embedded objects
    if (property?.kind === ReferenceKind.EMBEDDED) {
      if (Array.isArray(propValue)) {
        // V8 Optimization: Use for loop instead of map for better performance
        const result = new Array(propValue.length)
        for (let i = 0; i < propValue.length; i++) {
          result[i] = helper(propValue[i]).toJSON()
        }
        return result as T[keyof T]
      }
      if (Utils.isObject(propValue)) {
        return helper(propValue).toJSON() as T[keyof T]
      }
    }

    // Custom type handling
    if (property?.customType) {
      return property.customType.toJSON(propValue, wrapped.__platform)
    }

    // Default normalization
    return wrapped.__platform.normalizePrimaryKey(
      propValue as unknown as IPrimaryKey
    ) as unknown as T[keyof T]
  }

  // V8 Optimization: Simplified child populate extraction
  private static extractChildPopulate(
    populate: string[] | boolean,
    prop: string
  ): string[] | boolean {
    // Fast path for wildcard or boolean populate
    if (!Array.isArray(populate) || populate.includes(WILDCARD)) {
      return populate
    }

    const propPrefix = prop + DOT
    const propPrefixLength = propPrefix.length
    const childPopulate: string[] = []

    // V8 Optimization: Use for loop with cached length
    const populateLength = populate.length
    for (let i = 0; i < populateLength; i++) {
      const field = populate[i]
      if (field.length > propPrefixLength && field.startsWith(propPrefix)) {
        childPopulate.push(field.substring(propPrefixLength))
      }
    }

    return childPopulate.length > 0 ? childPopulate : false
  }

  // V8 Optimization: Create child options with proper inheritance
  private static createChildOptions(
    populate: string[] | boolean,
    exclude: string[] | undefined,
    skipNull: boolean,
    preventCircularRef: boolean,
    ignoreSerializers: boolean,
    forceObject: boolean,
    prop: string
  ) {
    const childPopulate = this.extractChildPopulate(populate, prop)
    return {
      populate: childPopulate,
      exclude,
      preventCircularRef,
      skipNull,
      ignoreSerializers,
      forceObject,
    }
  }

  // V8 Optimization: Ultra-fast entity processing with direct parameters
  private static processEntity<T extends object>(
    prop: keyof T & string,
    entity: T,
    platform: Platform,
    populate: string[] | boolean,
    exclude: string[] | undefined,
    skipNull: boolean,
    preventCircularRef: boolean,
    ignoreSerializers: boolean,
    forceObject: boolean,
    parents: readonly string[],
    ctx: RequestScopedSerializationContext
  ): T[keyof T] | undefined {
    const child = Reference.unwrapReference(entity[prop] as T)
    const wrapped = helper(child)

    // V8 Optimization: Simplified expansion decision
    const populated = isPopulated(prop, populate) && wrapped.isInitialized()
    const expand = populated || forceObject || !wrapped.__managed

    if (expand) {
      const childOptions = this.createChildOptions(
        populate,
        exclude,
        skipNull,
        preventCircularRef,
        ignoreSerializers,
        forceObject,
        prop
      )
      return this.serialize(child, childOptions, parents, ctx) as T[keyof T]
    }

    return platform.normalizePrimaryKey(
      wrapped.getPrimaryKey() as IPrimaryKey
    ) as T[keyof T]
  }

  // V8 Optimization: Ultra-fast collection processing with inline operations
  private static processCollection<T extends object>(
    prop: keyof T & string,
    entity: T,
    populate: string[] | boolean,
    exclude: string[] | undefined,
    skipNull: boolean,
    preventCircularRef: boolean,
    ignoreSerializers: boolean,
    forceObject: boolean,
    parents: readonly string[],
    ctx: RequestScopedSerializationContext
  ): T[keyof T] | undefined {
    const col = entity[prop] as unknown as Collection<T>

    if (!col.isInitialized()) return undefined

    const items = col.getItems(false)
    const itemsLength = items.length

    // Fast path for empty collections
    if (itemsLength === 0) return [] as unknown as T[keyof T]

    // V8 Optimization: Pre-allocate result array with exact size
    const result = new Array(itemsLength)

    // Inline population check for maximum performance
    let shouldPopulateCollection = false
    if (populate === true) {
      shouldPopulateCollection = true
    } else if (Array.isArray(populate)) {
      const propLength = prop.length
      const populateLength = populate.length
      for (let j = 0; j < populateLength; j++) {
        const item = populate[j]
        if (item === WILDCARD || item === prop) {
          shouldPopulateCollection = true
          break
        }
        if (item.length > propLength && item.charCodeAt(propLength) === 46) {
          if (item.slice(0, propLength) === prop) {
            shouldPopulateCollection = true
            break
          }
        }
      }
    }

    if (!shouldPopulateCollection) {
      // Ultra-fast path: just return primary keys without helper calls
      for (let i = 0; i < itemsLength; i++) {
        const item = items[i]
        const wrapped = helper(item)
        result[i] = wrapped.getPrimaryKey()
      }
      return result as unknown as T[keyof T]
    }

    // Inline child populate extraction for maximum performance
    let childPopulate: string[] | boolean = populate
    if (Array.isArray(populate) && !populate.includes(WILDCARD)) {
      const propPrefix = prop + DOT
      const propPrefixLength = propPrefix.length
      const childPopulateArray: string[] = []

      for (let j = 0; j < populate.length; j++) {
        const field = populate[j]
        if (field.length > propPrefixLength && field.startsWith(propPrefix)) {
          childPopulateArray.push(field.substring(propPrefixLength))
        }
      }
      childPopulate = childPopulateArray.length > 0 ? childPopulateArray : false
    }

    // Inline child options creation
    const childOptions = {
      populate: childPopulate,
      exclude,
      preventCircularRef,
      skipNull,
      ignoreSerializers,
      forceObject,
    }

    // V8 Optimization: Ultra-fast serialization loop
    for (let i = 0; i < itemsLength; i++) {
      result[i] = this.serialize(items[i], childOptions, parents, ctx)
    }

    return result as unknown as T[keyof T]
  }
}

// V8 Optimization: Ultra-optimized main serializer function with request-scoped context
export const mikroOrmSerializerNew = <TOutput extends object>(
  data: any,
  options?: Partial<
    Parameters<typeof EntitySerializer.serialize>[1] & {
      preventCircularRef: boolean | undefined
      populate: string[] | boolean | undefined
    }
  >
): Promise<TOutput> => {
  // V8 Optimization: Use synchronous execution in Promise.resolve for better performance
  return Promise.resolve().then(() => {
    // V8 Optimization: Create request-scoped context for concurrent safety
    const ctx = new RequestScopedSerializationContext()

    // V8 Optimization: Avoid object spread when possible
    const finalOptions = options
      ? {
          populate: options.populate ?? STATIC_OPTIONS_SHAPE.populate,
          exclude: options.exclude,
          preventCircularRef:
            options.preventCircularRef ??
            STATIC_OPTIONS_SHAPE.preventCircularRef,
          skipNull: options.skipNull ?? STATIC_OPTIONS_SHAPE.skipNull,
          ignoreSerializers:
            options.ignoreSerializers ?? STATIC_OPTIONS_SHAPE.ignoreSerializers,
          forceObject: options.forceObject ?? STATIC_OPTIONS_SHAPE.forceObject,
        }
      : STATIC_OPTIONS_SHAPE

    // V8 Optimization: Branch prediction - handle single entity case first (most common)
    if (!Array.isArray(data)) {
      if (data?.__meta) {
        return EntitySerializer.serialize(
          data,
          finalOptions,
          EMPTY_ARRAY,
          ctx
        ) as TOutput
      }
      return data as TOutput
    }

    // Array case
    const dataLength = data.length
    if (dataLength === 0) {
      return [] as unknown as TOutput
    }

    // V8 Optimization: Pre-allocate result array with exact size
    const result = new Array(dataLength)

    // V8 Optimization: Single loop for classification and processing with shared context
    for (let i = 0; i < dataLength; i++) {
      const item = data[i]
      if (item?.__meta) {
        result[i] = EntitySerializer.serialize(
          item,
          finalOptions,
          EMPTY_ARRAY,
          ctx
        )
      } else {
        result[i] = item
      }
    }

    return result as TOutput
  })
}
