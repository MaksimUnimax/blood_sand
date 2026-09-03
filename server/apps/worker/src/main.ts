import { createLogger } from '@product/observability';
import { loadConfig } from '@product/shared';

export interface JobRunner { start(): Promise<void>; stop(): Promise<void>; }
export class NoopJobRunner implements JobRunner { async start(): Promise<void> {} async stop(): Promise<void> {} }
const config = loadConfig(process.env);
const logger = createLogger(config.logLevel);
const runner = new NoopJobRunner();
await runner.start();
logger.info({ state: 'ready' }, 'Worker ready');
async function shutdown(signal: string): Promise<void> { logger.info({ signal }, 'Worker shutdown requested'); await runner.stop(); }
process.once('SIGINT', () => void shutdown('SIGINT'));
process.once('SIGTERM', () => void shutdown('SIGTERM'));
