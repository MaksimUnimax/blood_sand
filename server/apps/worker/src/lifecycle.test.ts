import { describe, expect, it, vi } from 'vitest';
import { startWorker, type JobRunner, type WorkerLogger } from './lifecycle.js';
import type { DatabaseRuntime } from '@product/db';

function dependencies(): { database: DatabaseRuntime; runner: JobRunner; logger: WorkerLogger; events: string[] } {
  const events: string[] = [];
  return {
    database: {
      db: {} as DatabaseRuntime['db'],
      ready: vi.fn(async () => { events.push('database.ready'); }),
      close: vi.fn(async () => { events.push('database.close'); })
    },
    runner: {
      start: vi.fn(async () => { events.push('runner.start'); }),
      stop: vi.fn(async () => { events.push('runner.stop'); })
    },
    logger: { info: vi.fn((bindings: Record<string, unknown>) => { events.push(`log.${String(bindings.state ?? bindings.signal)}`); }) },
    events
  };
}

describe('worker lifecycle', () => {
  it('checks database readiness before starting the job runner', async () => {
    const { database, runner, logger, events } = dependencies();
    await startWorker(database, runner, logger);
    expect(events).toEqual(['database.ready', 'runner.start', 'log.ready']);
  });

  it('does not start the job runner and closes the database when readiness fails', async () => {
    const { database, runner, logger } = dependencies();
    const failure = new Error('database unavailable');
    vi.mocked(database.ready).mockRejectedValue(failure);
    await expect(startWorker(database, runner, logger)).rejects.toThrow(failure);
    expect(runner.start).not.toHaveBeenCalled();
    expect(database.close).toHaveBeenCalledOnce();
  });

  it('stops the job runner before closing the database during shutdown', async () => {
    const { database, runner, logger, events } = dependencies();
    const runtime = await startWorker(database, runner, logger);
    await runtime.shutdown('SIGTERM');
    expect(events).toEqual(['database.ready', 'runner.start', 'log.ready', 'log.SIGTERM', 'runner.stop', 'database.close']);
  });

  it('closes allocated database resources when job runner startup fails', async () => {
    const { database, runner, logger } = dependencies();
    const failure = new Error('runner unavailable');
    vi.mocked(runner.start).mockRejectedValue(failure);
    await expect(startWorker(database, runner, logger)).rejects.toThrow(failure);
    expect(runner.stop).toHaveBeenCalledOnce();
    expect(database.close).toHaveBeenCalledOnce();
  });
});
