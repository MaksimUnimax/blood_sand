import { randomUUID } from 'node:crypto';
import Fastify, { type FastifyInstance, type FastifyRequest, type RawReplyDefaultExpression, type RawRequestDefaultExpression, type RawServerDefault } from 'fastify';
import type { Logger } from 'pino';
import { ApiErrorEnvelopeV1Schema, CorrelationIdV1Schema, type ApiErrorCodeV1 } from '@product/contracts';
import { createLogger } from '@product/observability';
import type { AppConfig } from '@product/shared';

export class ControlledError extends Error {
  public constructor(public readonly code: ApiErrorCodeV1, message: string, public readonly statusCode: number) {
    super(message);
  }
}

export interface ApiDependencies {
  readonly config: AppConfig;
  readonly isInfrastructureReady?: () => Promise<boolean>;
}

function correlationId(request: FastifyRequest): string {
  return CorrelationIdV1Schema.safeParse(request.id).success ? request.id : randomUUID();
}

export function createApiApp(dependencies: ApiDependencies): FastifyInstance<RawServerDefault, RawRequestDefaultExpression<RawServerDefault>, RawReplyDefaultExpression<RawServerDefault>, Logger> {
  const app = Fastify({
    loggerInstance: createLogger(dependencies.config.logLevel),
    requestIdHeader: 'x-request-id',
    genReqId: (request) => {
      const provided = request.headers['x-request-id'];
      return typeof provided === 'string' && CorrelationIdV1Schema.safeParse(provided).success ? provided : randomUUID();
    }
  });

  app.addHook('onSend', async (request, reply) => {
    reply.header('x-request-id', correlationId(request));
  });
  app.setErrorHandler((error, request, reply) => {
    const controlled = error instanceof ControlledError;
    const statusCode = controlled ? error.statusCode : 500;
    const code: ApiErrorCodeV1 = controlled ? error.code : 'INTERNAL_ERROR';
    if (!controlled) request.log.error({ err: error, correlationId: correlationId(request) }, 'Unhandled API error');
    const body = ApiErrorEnvelopeV1Schema.parse({ error: { code, message: controlled ? error.message : 'Internal server error', correlationId: correlationId(request) } });
    void reply.status(statusCode).send(body);
  });
  app.get('/health/live', async () => ({ status: 'live' }));
  app.get('/health/ready', async (_request, reply) => {
    const ready = await (dependencies.isInfrastructureReady?.() ?? Promise.resolve(true));
    return reply.status(ready ? 200 : 503).send({ status: ready ? 'ready' : 'not_ready' });
  });
  return app;
}
