import { loadConfig } from '@product/shared';
import { createDatabaseConnection } from './index.js';

const connection = createDatabaseConnection(loadConfig(process.env).databaseUrl);
await connection.close();
console.log('Database migration harness is configured; real migration acceptance is P1.3.');
