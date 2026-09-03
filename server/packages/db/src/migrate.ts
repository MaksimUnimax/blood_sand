import { loadConfig } from '@product/shared';
import { runMigrations } from './migrations.js';

await runMigrations({ connectionString: loadConfig(process.env).databaseUrl });
