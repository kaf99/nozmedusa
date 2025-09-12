export interface MemoryCacheModuleOptions {
  /**
   * TTL in seconds
   */
  ttl?: number
  /**
   * Maximum number of keys to store (see node-cache documentation)
   */
  maxKeys?: number
  /**
   * Check period for expired keys in seconds (see node-cache documentation)
   */
  checkPeriod?: number
  /**
   * Use clones for cached data (see node-cache documentation)
   */
  useClones?: boolean
}
