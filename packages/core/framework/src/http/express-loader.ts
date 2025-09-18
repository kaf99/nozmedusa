import { MedusaContainer } from "@medusajs/framework/types"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import fastify, { FastifyInstance, FastifyReply, FastifyRequest } from "fastify"
import Redis from "ioredis"
import path from "path"
import { configManager } from "../config"

const NOISY_ENDPOINTS_CHUNKS = ["@fs", "@id", "@vite", "@react", "node_modules"]

const isHealthCheck = (req: FastifyRequest) => req.url === "/health"

export async function expressLoader({
  container,
}: {
  container: MedusaContainer
}): Promise<{
  app: FastifyInstance
  shutdown: () => Promise<void>
}> {
  const baseDir = configManager.baseDir
  const configModule = configManager.config
  const isProduction = configManager.isProduction
  const NODE_ENV = process.env.NODE_ENV || "development"
  const IS_DEV = NODE_ENV.startsWith("dev")
  const isStaging = NODE_ENV === "staging"
  const isTest = NODE_ENV === "test"
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)

  // Create Fastify instance
  const app = fastify({
    logger: false, // We'll use our own logger
    trustProxy: true,
    routerOptions: {
      ignoreTrailingSlash: true,
      caseSensitive: false,
    },
  })

  let sameSite: string | boolean = false
  let secure = false
  if (isProduction || isStaging) {
    secure = true
    sameSite = "none"
  }

  const { http, sessionOptions, cookieOptions } = configModule.projectConfig
  const sessionOpts = {
    secret: sessionOptions?.secret ?? http?.cookieSecret,
    cookieName: sessionOptions?.name ?? "connect.sid",
    cookie: {
      sameSite,
      secure,
      maxAge: sessionOptions?.ttl ?? 10 * 60 * 60 * 1000,
      ...cookieOptions,
    },
    saveUninitialized: sessionOptions?.saveUninitialized ?? false,
  }

  let redisClient: Redis

  // Register cookie support
  await app.register(require("@fastify/cookie"), {
    secret: sessionOpts.secret,
  })

  // Setup session store
  if (configModule?.projectConfig.sessionOptions?.dynamodbOptions) {
    // DynamoDB session store for Fastify would need custom implementation
    // For now, we'll use in-memory sessions
    await app.register(require("@fastify/session"), {
      ...sessionOpts,
      store: undefined, // Will use default memory store
    })
  } else if (configModule?.projectConfig?.redisUrl) {
    redisClient = new Redis(
      configModule.projectConfig.redisUrl,
      configModule.projectConfig.redisOptions ?? {}
    )

    await app.register(require("@fastify/redis"), {
      client: redisClient,
      namespace: "redis",
    })

    await app.register(require("@fastify/session"), {
      ...sessionOpts,
      store: {
        get: async (
          sessionId: string,
          callback: (err: any, session?: any) => void
        ) => {
          try {
            const key = `${
              configModule?.projectConfig?.redisPrefix ?? ""
            }sess:${sessionId}`
            const session = await redisClient.get(key)
            callback(null, session ? JSON.parse(session) : null)
          } catch (error) {
            callback(error)
          }
        },
        set: async (
          sessionId: string,
          session: any,
          callback: (err?: any) => void
        ) => {
          try {
            const key = `${
              configModule?.projectConfig?.redisPrefix ?? ""
            }sess:${sessionId}`
            const ttl = sessionOpts.cookie.maxAge / 1000
            await redisClient.setex(key, ttl, JSON.stringify(session))
            callback()
          } catch (error) {
            callback(error)
          }
        },
        destroy: async (sessionId: string, callback: (err?: any) => void) => {
          try {
            const key = `${
              configModule?.projectConfig?.redisPrefix ?? ""
            }sess:${sessionId}`
            await redisClient.del(key)
            callback()
          } catch (error) {
            callback(error)
          }
        },
      },
    })
  } else {
    await app.register(require("@fastify/session"), {
      ...sessionOpts,
      store: undefined, // Will use default memory store
    })
  }

  // Request logging
  function shouldSkipHttpLog(req: FastifyRequest, _reply: FastifyReply) {
    return (
      isTest ||
      isHealthCheck(req) ||
      NOISY_ENDPOINTS_CHUNKS.some((chunk) => req.url.includes(chunk)) ||
      !logger.shouldLog("http")
    )
  }

  // Add logging hook
  app.addHook("onRequest", async (request, reply) => {
    if (shouldSkipHttpLog(request, reply)) {
      return
    }

    ;(request as any).startTime = Date.now()
  })

  app.addHook("onSend", async (request, reply, payload) => {
    const startTime = (request as any).startTime
    if (!startTime) return payload

    const duration = Date.now() - startTime

    if (!IS_DEV) {
      const logData = {
        level: "http",
        client_ip: request.ip || "-",
        request_id: (request as any).requestId || "-",
        http_version: request.raw.httpVersion,
        method: request.method,
        path: request.url,
        status: reply.statusCode,
        response_size: reply.getHeader("content-length") || 0,
        request_size: request.headers["content-length"] || 0,
        duration,
        referrer: request.headers.referer || "-",
        user_agent: request.headers["user-agent"] || "",
        timestamp: new Date().toISOString(),
      }
      logger.http(JSON.stringify(logData))
    } else {
      const message = `${request.method} ${request.url} ← ${
        request.headers.referer || "-"
      } (${reply.statusCode}) - ${duration} ms`
      logger.http(message)
    }

    return payload
  })

  // Static files
  await app.register(require("@fastify/static"), {
    root: path.join(baseDir, "static"),
    prefix: "/static/",
  })

  const shutdown = async () => {
    redisClient?.disconnect()
    await app.close()
  }

  return { app, shutdown }
}
