import { createDatabaseRuntime } from '@product/db';
import { createLogger } from '@product/observability';
import { loadConfig } from '@product/shared';
import { startWorker, type JobRunner } from './lifecycle.js';

export class NoopJobRunner implements JobRunner {
  async start(): Promise<void> {}
  async stop(): Promise<void> {}
}

const config = loadConfig(process.env);
const logger = createLogger(config.logLevel);
const runtime = await startWorker(
  createDatabaseRuntime(config.databaseUrl),
  new NoopJobRunner(),
  logger
);

process.once('SIGINT', () => void runtime.shutdown('SIGINT'));
process.once('SIGTERM', () => void runtime.shutdown('SIGTERM'));
