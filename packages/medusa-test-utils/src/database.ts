import { logger } from "@medusajs/framework/logger"
import { CustomDBMigrator } from "@medusajs/framework/utils"

import {
  defineConfig,
  MikroORM,
  Options,
  SqlEntityManager,
} from "@mikro-orm/postgresql"
import { createDatabase, dropDatabase } from "pg-god"
import { execOrTimeout } from "./medusa-test-runner-utils"

const DB_HOST = process.env.DB_HOST ?? "localhost"
const DB_USERNAME = process.env.DB_USERNAME ?? ""
const DB_PASSWORD = process.env.DB_PASSWORD ?? ""
const DB_PORT = process.env.DB_PORT ?? "5432"

const pgGodCredentials = {
  user: DB_USERNAME,
  password: DB_PASSWORD,
  host: DB_HOST,
  port: parseInt(DB_PORT),
}

export function getDatabaseURL(dbName?: string): string {
  const DB_HOST = process.env.DB_HOST ?? "localhost"
  const DB_USERNAME = process.env.DB_USERNAME ?? "postgres"
  const DB_PASSWORD = process.env.DB_PASSWORD ?? ""
  const DB_PORT = process.env.DB_PORT ?? "5432"
  const DB_NAME = dbName ?? process.env.DB_TEMP_NAME

  return `postgres://${DB_USERNAME}${
    DB_PASSWORD ? `:${DB_PASSWORD}` : ""
  }@${DB_HOST}:${DB_PORT}/${DB_NAME}`
}

export function getMikroOrmConfig({
  mikroOrmEntities,
  pathToMigrations,
  clientUrl,
  schema,
}: {
  mikroOrmEntities: any[]
  pathToMigrations?: string
  clientUrl?: string
  schema?: string
}): Options {
  const DB_URL = clientUrl ?? getDatabaseURL()

  return defineConfig({
    clientUrl: DB_URL,
    entities: Object.values(mikroOrmEntities),
    schema: schema ?? process.env.MEDUSA_DB_SCHEMA,
    debug: false,
    pool: {
      min: 2,
    },
    migrations: {
      pathTs: pathToMigrations,
      silent: true,
    },
    extensions: [CustomDBMigrator],
  })
}

export interface TestDatabase {
  mikroOrmEntities: any[]
  pathToMigrations?: string
  schema?: string
  clientUrl?: string

  orm: MikroORM | null
  manager: SqlEntityManager | null

  setupDatabase(): Promise<void>
  clearDatabase(): Promise<void>
  getManager(): SqlEntityManager
  forkManager(): SqlEntityManager
  getOrm(): MikroORM
}

export function getMikroOrmWrapper({
  mikroOrmEntities,
  pathToMigrations,
  clientUrl,
  schema,
}: {
  mikroOrmEntities: any[]
  pathToMigrations?: string
  clientUrl?: string
  schema?: string
}): TestDatabase {
  return {
    mikroOrmEntities,
    pathToMigrations,
    clientUrl: clientUrl ?? getDatabaseURL(),
    schema: schema ?? process.env.MEDUSA_DB_SCHEMA,

    orm: null,
    manager: null,

    getManager() {
      if (this.manager === null) {
        throw new Error("manager entity not available")
      }

      return this.manager
    },

    forkManager() {
      if (this.manager === null) {
        throw new Error("manager entity not available")
      }

      return this.manager.fork()
    },

    getOrm() {
      if (this.orm === null) {
        throw new Error("orm entity not available")
      }

      return this.orm
    },

    async setupDatabase() {
      const OrmConfig = getMikroOrmConfig({
        mikroOrmEntities: this.mikroOrmEntities,
        pathToMigrations: this.pathToMigrations,
        clientUrl: this.clientUrl,
        schema: this.schema,
      })

      try {
        this.orm = await MikroORM.init(OrmConfig)
        this.manager = this.orm.em

        try {
          await this.orm.getSchemaGenerator().ensureDatabase()
        } catch (err) {
          logger.error("Error ensuring database:", err)
          throw err
        }

        await this.manager?.execute(
          `CREATE SCHEMA IF NOT EXISTS "${this.schema ?? "public"}";`
        )

        const pendingMigrations = await this.orm
          .getMigrator()
          .getPendingMigrations()

        if (pendingMigrations && pendingMigrations.length > 0) {
          await this.orm
            .getMigrator()
            .up({ migrations: pendingMigrations.map((m) => m.name!) })
        } else {
          await this.orm.schema.refreshDatabase()
        }
      } catch (error) {
        if (this.orm) {
          try {
            await this.orm.close()
          } catch (closeError) {
            logger.error("Error closing ORM:", closeError)
          }
        }
        this.orm = null
        this.manager = null
        throw error
      }
    },

    async clearDatabase() {
      if (this.orm === null) {
        throw new Error("ORM not configured")
      }

      try {
        await this.manager?.execute(
          `DROP SCHEMA IF EXISTS "${this.schema ?? "public"}" CASCADE;`
        )

        await this.manager?.execute(
          `CREATE SCHEMA IF NOT EXISTS "${this.schema ?? "public"}";`
        )

        const closePromise = this.orm.close()

        await execOrTimeout(closePromise)
      } catch (error) {
        logger.error("Error clearing database:", error)
        try {
          await this.orm?.close()
        } catch (closeError) {
          logger.error("Error during forced ORM close:", closeError)
        }
        throw error
      } finally {
        this.orm = null
        this.manager = null
      }
    },
  }
}

export const dbTestUtilFactory = (): any => ({
  pgConnection_: null,

  create: async function (dbName: string) {
    try {
      await createDatabase(
        { databaseName: dbName, errorIfExist: false },
        pgGodCredentials
      )
    } catch (error) {
      logger.error("Error creating database:", error)
      throw error
    }
  },

  // Cache table list to avoid repeated queries
  _cachedTables: null,

  teardown: async function ({ schema }: { schema?: string } = {}) {
    if (!this.pgConnection_) {
      return
    }

    const runRawQuery = this.pgConnection_.raw.bind(this.pgConnection_)
    schema ??= "public"

    try {
      // Use cached table list or query once
      let tableNames = this._cachedTables
      if (!tableNames) {
        const result = await runRawQuery(`
          SELECT table_name 
          FROM information_schema.tables 
          WHERE table_schema = '${schema}'
            AND table_type = 'BASE TABLE'
            AND table_name NOT LIKE 'pg_%'
            AND table_name != 'mikro_orm_migrations'
        `)
        tableNames = result.rows
        this._cachedTables = tableNames // Cache for next time
      }

      if (tableNames.length) {
        // Build table list more efficiently
        const truncateTables = tableNames
          .filter(
            ({ table_name }) =>
              !table_name.startsWith("cat_") &&
              !["index_data", "index_relation"].includes(table_name)
          )
          .map(({ table_name }) => `"${schema}"."${table_name}"`)

        // Add index tables if they exist
        const hasIndexTables = tableNames.some(({ table_name }) =>
          ["index_data", "index_relation"].includes(table_name)
        )

        if (hasIndexTables) {
          truncateTables.push(
            `"${schema}"."index_data"`,
            `"${schema}"."index_relation"`
          )
        }

        if (truncateTables.length > 0) {
          await runRawQuery(`
            SET session_replication_role = 'replica';
            SET CONSTRAINTS ALL DEFERRED;
            TRUNCATE ${truncateTables.join(", ")} RESTART IDENTITY CASCADE;
            SET CONSTRAINTS ALL IMMEDIATE;
            SET session_replication_role = 'origin';
          `)
        }
      }
    } catch (error) {
      logger.error("Error during database teardown:", error)
      throw error
    }
  },

  shutdown: async function (dbName: string) {
    try {
      const cleanupPromises: Promise<any>[] = []

      if (this.pgConnection_?.context) {
        cleanupPromises.push(
          execOrTimeout(this.pgConnection_.context.destroy())
        )
      }

      if (this.pgConnection_) {
        cleanupPromises.push(execOrTimeout(this.pgConnection_.destroy()))
      }

      await Promise.all(cleanupPromises)

      return await dropDatabase(
        { databaseName: dbName, errorIfNonExist: false },
        pgGodCredentials
      )
    } catch (error) {
      logger.error("Error during database shutdown:", error)
      try {
        await this.pgConnection_?.context?.destroy()
        await this.pgConnection_?.destroy()
      } catch (cleanupError) {
        logger.error("Error during forced cleanup:", cleanupError)
      }
      throw error
    } finally {
      this.pgConnection_ = null
    }
  },
})
