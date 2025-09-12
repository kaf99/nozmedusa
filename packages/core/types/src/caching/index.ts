type Providers =
  | string[]
  | { id: string; ttl?: number }
  | { id: string; ttl?: number }[]

export interface ICachingModuleService {
  /**
   * This method retrieves data from the cache.
   *
   * @param key - The key of the item to retrieve.
   * @param tags - The tags of the items to retrieve.
   * @param provider - The provider from which to retrieve the item(s). if not provided, the
   * default provider will be used.
   *
   *  @returns The item(s) that was stored in the cache. If the item(s) was not found, void will
   *  be returned.
   *
   */
  get<T>({
    key,
    tags,
    provider,
  }: {
    key?: string
    tags?: string[]
    provider?: string
  }): Promise<T | null>

  /**
   * This method stores data in the cache.
   *
   * @param key - The key of the item to store.
   * @param data - The data to store in the cache.
   * @param ttl - The time-to-live (TTL in seconds) value in seconds. If not provided, the default TTL value
   * is used. The default value is based on the used Cache Module.
   * @param tags - The tags of the items to store. can be used for cross invalidation.
   * @param options - if specified, will be stored with the item(s).
   * @param providers - The providers from which to store the item(s).
   *
   */
  set({
    key,
    data,
    ttl,
    tags,
    options,
    providers,
  }: {
    key: string
    data: object
    ttl?: number
    tags?: string[]
    options?: {
      noAutoInvalidation?: boolean
    }
    providers?: Providers
  }): Promise<void>

  /**
   * This method clears data from the cache.
   *
   * @param key - The key of the item to clear.
   * @param tags - The tags of the items to clear.
   * @param options - if specified, invalidate the item(s) that has the value of the given
   * options stored. e.g you can invalidate the tags X if their options.noAutoInvalidation is true.
   * @param providers - The providers from which to clear the item(s).
   *
   */
  clear({
    key,
    tags,
    options,
    providers,
  }: {
    key?: string
    tags?: string[]
    options?: {
      noAutoInvalidation?: boolean
    }
    providers?: string | string[]
  }): Promise<void>
}

export interface ICachingProviderService {
  get({ key, tags }: { key?: string; tags?: string[] }): Promise<any>
  set({
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
    options?: { noAutoInvalidation?: boolean }
  }): Promise<void>
  clear({
    key,
    tags,
    options,
  }: {
    key?: string
    tags?: string[]
    options?: { noAutoInvalidation?: boolean }
  }): Promise<void>
}
