import { FastifyReply, FastifyRequest } from "fastify"
import { MedusaNextFunction, MedusaRequest, MedusaResponse } from "./types"

/**
 * Creates a proxy that makes Fastify request look like Express request
 */
export function createRequestProxy(
  fastifyRequest: FastifyRequest
): MedusaRequest {
  const proxy = new Proxy(fastifyRequest as any, {
    get(target, prop, receiver) {
      // Handle Express-specific properties
      switch (prop) {
        case "params":
          return target.params || {}
        case "query":
          return target.query || {}
        case "body":
          return target.body
        case "headers":
          return target.headers
        case "method":
          return target.method
        case "url":
          return target.url
        case "path":
          // Express uses 'path' for pathname, Fastify uses 'url'
          return target.routeOptions?.url || target.url?.split("?")[0]
        case "protocol":
          return target.protocol
        case "secure":
          return target.protocol === "https"
        case "ip":
          return target.ip
        case "hostname":
          return target.hostname
        case "originalUrl":
          return target.url
        case "baseUrl":
          return ""
        case "fresh":
          return false // Could implement if needed
        case "stale":
          return true // Could implement if needed
        case "xhr":
          return target.headers["x-requested-with"] === "XMLHttpRequest"
        case "cookies":
          return target.cookies || {}
        case "signedCookies":
          return target.cookies || {} // Fastify handles signed cookies differently
        case "session":
          return target.session
        case "user":
          return target.user
        case "get":
          return (name: string) => target.headers[name.toLowerCase()]
        case "header":
          return (name: string) => target.headers[name.toLowerCase()]
        case "accepts":
          return () => false // Could implement if needed
        case "acceptsCharsets":
          return () => false // Could implement if needed
        case "acceptsEncodings":
          return () => false // Could implement if needed
        case "acceptsLanguages":
          return () => false // Could implement if needed
        case "range":
          return () => undefined // Could implement if needed
        case "is":
          return () => false // Could implement if needed
        default:
          return Reflect.get(target, prop, receiver)
      }
    },
    set(target, prop, value, receiver) {
      return Reflect.set(target, prop, value, receiver)
    },
  })

  return proxy as MedusaRequest
}

/**
 * Creates a proxy that makes Fastify reply look like Express response
 */
export function createResponseProxy(
  fastifyReply: FastifyReply
): MedusaResponse {
  const proxy = new Proxy(fastifyReply, {
    get(target, prop, receiver) {
      // Handle Express-specific properties and methods
      switch (prop) {
        case "statusCode":
          return target.statusCode
        case "headersSent":
          return target.sent
        case "status":
          return (code: number) => {
            target.status(code)
            return proxy
          }
        case "send":
          return (data: any) => {
            if (typeof data === "string") {
              target.type("text/html")
            }
            return target.send(data)
          }
        case "json":
          return (data: any) => {
            return target.send(data)
          }
        case "end":
          return (data?: any) => {
            if (data) {
              target.send(data)
            } else {
              target.raw.end()
            }
          }
        case "redirect":
          return (url: string | number, status?: string | number) => {
            if (typeof url === "number") {
              // Express allows res.redirect(status, url)
              ;(target as any).redirect(url, status as string)
            } else {
              ;(target as any).redirect((status as number) || 302, url)
            }
          }
        case "set":
          return (field: string | Record<string, string>, value?: string) => {
            if (typeof field === "object") {
              Object.entries(field).forEach(([key, val]) => {
                target.header(key, val)
              })
            } else {
              target.header(field, value!)
            }
            return proxy
          }
        case "header":
          return (field: string | Record<string, string>, value?: string) => {
            if (typeof field === "object") {
              Object.entries(field).forEach(([key, val]) => {
                target.header(key, val)
              })
            } else {
              target.header(field, value!)
            }
            return proxy
          }
        case "get":
          return (field: string) => {
            return target.getHeader(field)
          }
        case "cookie":
          return (name: string, value: any, options?: any) => {
            ;(target as any).setCookie(name, value, options)
            return proxy
          }
        case "clearCookie":
          return (name: string, options?: any) => {
            ;(target as any).clearCookie(name, options)
            return proxy
          }
        case "type":
          return (type: string) => {
            target.type(type)
            return proxy
          }
        case "contentType":
          return (type: string) => {
            target.type(type)
            return proxy
          }
        case "attachment":
          return (filename?: string) => {
            if (filename) {
              target.header(
                "Content-Disposition",
                `attachment; filename="${filename}"`
              )
            } else {
              target.header("Content-Disposition", "attachment")
            }
            return proxy
          }
        case "sendFile":
          return () => {
            throw new Error(
              "res.sendFile() not implemented in Fastify proxy. Use @fastify/static or target.sendFile()"
            )
          }
        case "download":
          return () => {
            throw new Error(
              "res.download() not implemented in Fastify proxy. Use @fastify/static or target.sendFile()"
            )
          }
        case "render":
          return () => {
            throw new Error(
              "res.render() not implemented in Fastify proxy. Use a view engine plugin"
            )
          }
        case "vary":
          return (field: string) => {
            const current = target.getHeader("Vary")
            if (current) {
              target.header("Vary", `${current}, ${field}`)
            } else {
              target.header("Vary", field)
            }
            return proxy
          }
        case "format":
          return () => {
            throw new Error("res.format() not implemented in Fastify proxy")
          }
        case "write":
          return (chunk: any, encoding?: BufferEncoding) => {
            if (encoding) {
              target.raw.write(chunk, encoding)
            } else {
              target.raw.write(chunk)
            }
            return proxy
          }
        default:
          return Reflect.get(target, prop, receiver)
      }
    },
    set(target, prop, value, receiver) {
      switch (prop) {
        case "statusCode":
          target.status(value)
          return true
        default:
          return Reflect.set(target, prop, value, receiver)
      }
    },
  })

  return proxy as unknown as MedusaResponse
}

/**
 * Creates a next function compatible with Express middleware
 */
export function createNextFunction(
  _fastifyRequest: FastifyRequest,
  fastifyReply: FastifyReply
): MedusaNextFunction {
  return (error?: any) => {
    if (error) {
      fastifyReply.send(error)
    }
    // For Fastify, we don't need to explicitly call next
    // The handler chain is managed differently
  }
}

/**
 * Wraps a route handler to provide Express-compatible req/res/next
 */
export function wrapExpressHandler(
  handler: (
    req: MedusaRequest,
    res: MedusaResponse,
    next?: MedusaNextFunction
  ) => any
) {
  return async (request: FastifyRequest, reply: FastifyReply) => {
    const req = createRequestProxy(request)
    const res = createResponseProxy(reply)
    const next = createNextFunction(request, reply)

    try {
      const result = await handler(req, res, next)

      // If handler returned a value and response hasn't been sent, send it
      if (result !== undefined && !reply.sent) {
        return result
      }
    } catch (error) {
      throw error
    }
  }
}

/**
 * Creates a raw body parser middleware compatible with Fastify
 */
export function createRawBodyParser(options: { type?: string } = {}) {
  return (
    req: MedusaRequest,
    res: MedusaResponse,
    next: MedusaNextFunction
  ) => {
    // In Fastify, the body is already parsed by content type parsers
    // This middleware just ensures the body is available as expected
    next()
  }
}

/**
 * Wraps middleware to provide Express-compatible req/res/next
 */
export function wrapExpressMiddleware(
  middleware: (
    req: MedusaRequest,
    res: MedusaResponse,
    next: MedusaNextFunction
  ) => any
) {
  // Handle Express raw middleware specially
  if (
    typeof middleware === "function" &&
    middleware.toString().includes("raw")
  ) {
    // Replace Express raw middleware with our compatible version
    return async (request: FastifyRequest, reply: FastifyReply) => {
      // The body is already parsed as buffer by our content type parser
      // No additional processing needed
    }
  }

  return async (request: FastifyRequest, reply: FastifyReply) => {
    const req = createRequestProxy(request)
    const res = createResponseProxy(reply)

    return new Promise<void>((resolve, reject) => {
      const next: MedusaNextFunction = (error?: any) => {
        if (error) {
          reject(error)
        } else {
          resolve()
        }
      }

      try {
        const result = middleware(req, res, next)

        // If middleware returns a promise, wait for it
        if (result && typeof result.then === "function") {
          result.then(() => resolve()).catch(reject)
        }
        // If middleware didn't call next and didn't return a promise,
        // we assume it's synchronous and completed
        else {
          resolve()
        }
      } catch (error) {
        reject(error)
      }
    })
  }
}
