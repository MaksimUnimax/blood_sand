import type { DatabaseRuntime } from '@product/db';

export interface JobRunner {
  start(): Promise<void>;
  stop(): Promise<void>;
}

export interface WorkerLogger {
  info(bindings: Record<string, unknown>, message: string): void;
}

export interface WorkerRuntime {
  shutdown(signal: string): Promise<void>;
}

export async function startWorker(
  database: DatabaseRuntime,
  runner: JobRunner,
  logger: WorkerLogger
): Promise<WorkerRuntime> {
  let runnerStartAttempted = false;

  try {
    await database.ready();
    runnerStartAttempted = true;
    await runner.start();
  } catch (error) {
    if (runnerStartAttempted) {
      try {
        await runner.stop();
      } catch {
        // Preserve the startup failure; the database must still be closed below.
      }
    }
    try {
      await database.close();
    } catch {
      // Preserve the startup failure rather than replacing it with shutdown noise.
    }
    throw error;
  }

  logger.info({ state: 'ready' }, 'Worker ready');
  let closing = false;
  return {
    async shutdown(signal: string): Promise<void> {
      if (closing) return;
      closing = true;
      logger.info({ signal }, 'Worker shutdown requested');
      try {
        await runner.stop();
      } finally {
        await database.close();
      }
    }
  };
}
