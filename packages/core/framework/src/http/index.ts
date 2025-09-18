import "../types/container"

export * from "./express-loader"
export * from "./middlewares"
export * from "./router"
export * from "./types"
export * from "./utils/define-middlewares"
export * from "./utils/get-query-config"
export * from "./utils/http-compression"
export * from "./utils/maybe-apply-link-filter"
export * from "./utils/refetch-entities"
export * from "./utils/restricted-fields"
export * from "./utils/unless-path"
export * from "./utils/validate-body"
export * from "./utils/validate-query"

// Fastify compatibility layer
export * from "./express-fastify-proxy"

// Re-export ApiLoader (now Fastify-powered) for backward compatibility
export { ApiLoader } from "./router"
