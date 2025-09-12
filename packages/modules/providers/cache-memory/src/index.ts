import { ModuleProvider, Modules } from "@medusajs/framework/utils"
import Loader from "./loaders"
import { MemoryCachingProvider } from "./services/memory-cache"

const services = [MemoryCachingProvider]
const loaders = [Loader]

export default ModuleProvider(Modules.CACHING, {
  services,
  loaders,
})
