import { ModuleProvider, Modules } from "@medusajs/framework/utils"
import Loader from "./loaders"
import { RedisCachingProvider } from "./services/redis-cache"

const services = [RedisCachingProvider]
const loaders = [Loader]

export default ModuleProvider(Modules.CACHING, {
  services,
  loaders,
})
