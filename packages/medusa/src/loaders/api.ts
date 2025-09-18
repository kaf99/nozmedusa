import { ConfigModule } from "@medusajs/framework/config"
import { ApiLoader } from "@medusajs/framework/http"
import { MedusaContainer, PluginDetails } from "@medusajs/framework/types"
import { FastifyInstance } from "fastify"
import { join } from "path"
import qs from "qs"

type Options = {
  app: FastifyInstance
  plugins: PluginDetails[]
  container: MedusaContainer
}

export default async ({ app, container, plugins }: Options) => {
  // This is a workaround for the issue described here: https://github.com/expressjs/express/issues/3454
  // We parse the url and get the qs to be parsed and override the query prop from the request
  app.addHook('preHandler', async (request, reply) => {
    const parsedUrl = request.url.split("?")
    parsedUrl.shift()
    const queryParamsStr = parsedUrl.join("?")
    if (queryParamsStr) {
      ;(request as any).query = qs.parse(queryParamsStr, { arrayLimit: Infinity })
    }
  })

  const sourcePaths: string[] = []

  /**
   * Always load plugin routes before the Medusa core routes, since it
   * will allow the plugin to define routes with higher priority
   * than Medusa. Here are couple of examples.
   *
   * - Plugin registers a route called "/products/active"
   * - Medusa registers a route called "/products/:id"
   *
   * Now, if Medusa routes gets registered first, then the "/products/active"
   * route will never be resolved, because it will be handled by the
   * "/products/:id" route.
   */
  sourcePaths.push(
    join(__dirname, "../api"),
    ...plugins.map((pluginDetails) => {
      return join(pluginDetails.resolve, "api")
    })
  )

  const {
    projectConfig: {
      http: { restrictedFields },
    },
  } = container.resolve<ConfigModule>("configModule")

  // TODO: Figure out why this is causing issues with test when placed inside ./api.ts
  // Adding this here temporarily
  // Test: (packages/medusa/src/api/routes/admin/currencies/update-currency.ts)
  try {
    await new ApiLoader({
      app: app,
      sourceDir: sourcePaths,
      baseRestrictedFields: restrictedFields?.store,
      container,
    }).load()
  } catch (err) {
    throw Error(
      `An error occurred while registering API Routes. Error: ${err.message}`
    )
  }

  return app
}
