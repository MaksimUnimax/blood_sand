import { drizzle, type NodePgDatabase } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';

export interface DatabaseConnection {
  db: NodePgDatabase;
  close(): Promise<void>;
}

export function createDatabaseConnection(connectionString: string): DatabaseConnection {
  const pool = new Pool({ connectionString });
  return { db: drizzle({ client: pool }), close: () => pool.end() };
}
