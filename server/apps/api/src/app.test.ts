import { describe, expect, it } from 'vitest';
import { ApiErrorEnvelopeV1Schema } from '@product/contracts';
import type { AppConfig } from '@product/shared';
import { ControlledError, createApiApp } from './app.js';

const config: AppConfig = { environment: 'test', databaseUrl: 'postgres://test:test@localhost:5432/test', logLevel: 'info', apiPort: 3000, workerReadyDelayMs: 0 };

describe('API foundation', () => {
  it('serves liveness', async () => {
    const app = createApiApp({ config });
    const response = await app.inject('/health/live');
    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual({ status: 'live' });
    await app.close();
  });
  it('generates and preserves allowed correlation IDs', async () => {
    const app = createApiApp({ config });
    const generated = await app.inject('/health/live');
    expect(generated.headers['x-request-id']).toMatch(/^[A-Za-z0-9._:-]+$/);
    const preserved = await app.inject({ url: '/health/live', headers: { 'x-request-id': 'accepted-request-id-1' } });
    expect(preserved.headers['x-request-id']).toBe('accepted-request-id-1');
    await app.close();
  });
  it('uses the stable controlled error envelope', async () => {
    const app = createApiApp({ config });
    app.get('/test-controlled-error', () => { throw new ControlledError('INVALID_REQUEST', 'Fixture rejected', 400); });
    const response = await app.inject('/test-controlled-error');
    expect(response.statusCode).toBe(400);
    expect(ApiErrorEnvelopeV1Schema.parse(response.json()).error.code).toBe('INVALID_REQUEST');
    await app.close();
  });
});
