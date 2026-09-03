import { drizzle, type NodePgDatabase } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./schema.js";

export interface DatabaseRuntime {
  db: NodePgDatabase<typeof schema>;
  ready(): Promise<void>;
  close(): Promise<void>;
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
  };
}

export const createDatabaseConnection = createDatabaseRuntime;
