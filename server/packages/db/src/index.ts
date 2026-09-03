import { drizzle, type NodePgDatabase } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./schema.js";
export { createAuthRepository } from "./auth-repository.js";

export interface DatabaseRuntime {
  db: NodePgDatabase<typeof schema>;
  ready(): Promise<void>;
  close(): Promise<void>;
  query<T extends Record<string, unknown> = Record<string, unknown>>(
    text: string,
    values?: unknown[],
  ): Promise<{ rows: T[] }>;
  transaction<T>(
    operation: (transaction: DatabaseQuery) => Promise<T>,
  ): Promise<T>;
}

export interface DatabaseQuery {
  query<T extends Record<string, unknown> = Record<string, unknown>>(
    text: string,
    values?: unknown[],
  ): Promise<{ rows: T[] }>;
}

export function createDatabaseRuntime(
  connectionString: string,
): DatabaseRuntime {
  const pool = new Pool({ connectionString });
  return {
    db: drizzle({ client: pool, schema }),
    ready: async () => {
      await pool.query("SELECT 1");
    },
    close: () => pool.end(),
    query: (text, values) => pool.query(text, values),
    transaction: async <T>(
      operation: (transaction: DatabaseQuery) => Promise<T>,
    ) => {
      const client = await pool.connect();
      try {
        await client.query("BEGIN");
        const value = await operation({
          query: (text, values) => client.query(text, values),
        });
        await client.query("COMMIT");
        return value;
      } catch (error) {
        await client.query("ROLLBACK");
        throw error;
      } finally {
        client.release();
      }
    },
  };
}

export const createDatabaseConnection = createDatabaseRuntime;
