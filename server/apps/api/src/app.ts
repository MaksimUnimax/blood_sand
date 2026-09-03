import { randomUUID } from "node:crypto";
import swagger from "@fastify/swagger";
import cookie from "@fastify/cookie";
import Fastify, {
  type FastifyInstance,
  type FastifyRequest,
  type RawReplyDefaultExpression,
  type RawRequestDefaultExpression,
  type RawServerDefault,
} from "fastify";
import {
  jsonSchemaTransform,
  serializerCompiler,
  type ZodTypeProvider,
  validatorCompiler,
} from "fastify-type-provider-zod";
import type { Logger } from "pino";
import {
  ApiErrorEnvelopeV1Schema,
  CorrelationIdV1Schema,
  HealthLiveResponseV1Schema,
  HealthReadyResponseV1Schema,
  type ApiErrorCodeV1,
} from "@product/contracts";
import { createLogger } from "@product/observability";
import type { AppConfig } from "@product/shared";
import {
  AuthService,
  deriveAuthKeys,
  type AuthRepository,
  type AuthService as AuthServiceType,
} from "@product/auth";
import { registerAuthRoutes } from "./auth-routes.js";
import type { DeviceAuthorizationService } from "@product/device-auth";
import { registerDeviceAuthorizationRoutes } from "./device-authorization-routes.js";

export class ControlledError extends Error {
  public constructor(
    public readonly code: ApiErrorCodeV1,
    message: string,
    public readonly statusCode: number,
  ) {
    super(message);
  }
}

export interface ApiDependencies {
  readonly config: AppConfig;
  readonly isInfrastructureReady: () => Promise<boolean>;
  readonly authService?: AuthServiceType;
  readonly deviceAuthorizationService?: DeviceAuthorizationService;
}

function correlationId(request: FastifyRequest): string {
  return CorrelationIdV1Schema.safeParse(request.id).success
    ? request.id
    : randomUUID();
}

export function createApiApp(
  dependencies: ApiDependencies,
): FastifyInstance<
  RawServerDefault,
  RawRequestDefaultExpression<RawServerDefault>,
  RawReplyDefaultExpression<RawServerDefault>,
  Logger
> {
  const app = Fastify({
    loggerInstance: createLogger(dependencies.config.logLevel),
    requestIdHeader: "x-request-id",
    genReqId: (request) => {
      const provided = request.headers["x-request-id"];
      return typeof provided === "string" &&
        CorrelationIdV1Schema.safeParse(provided).success
        ? provided
        : randomUUID();
    },
  });
  app.setValidatorCompiler(validatorCompiler);
  app.setSerializerCompiler(serializerCompiler);
  void app.register(cookie);
  void app.register(swagger, {
    openapi: {
      openapi: "3.1.0",
      info: { title: "Product Control Plane API", version: "1.0.0-p1" },
      servers: [],
    },
    transform: jsonSchemaTransform,
  });

  app.addHook("onSend", async (request, reply) => {
    reply.header("x-request-id", correlationId(request));
  });
  app.setErrorHandler((error, request, reply) => {
    const controlled = error instanceof ControlledError;
    const validation = "validation" in error || error.name === "ZodError";
    const statusCode = controlled ? error.statusCode : validation ? 400 : 500;
    const code: ApiErrorCodeV1 = controlled
      ? error.code
      : validation
        ? "INVALID_REQUEST"
        : "INTERNAL_ERROR";
    if (!controlled)
      request.log.error(
        { err: error, correlationId: correlationId(request) },
        "Unhandled API error",
      );
    const body = ApiErrorEnvelopeV1Schema.parse({
      error: {
        code,
        message: controlled
          ? error.message
          : validation
            ? "Invalid request"
            : "Internal server error",
        correlationId: correlationId(request),
      },
    });
    void reply.status(statusCode).send(body);
  });
  app.after(() => {
    const typedApp = app.withTypeProvider<ZodTypeProvider>();
    typedApp.get(
      "/health/live",
      {
        schema: {
          summary: "Check process liveness",
          description:
            "Returns process liveness. A syntactically valid `x-request-id` header is preserved in the response; other values are replaced with a generated correlation ID.",
          tags: ["health"],
          response: { 200: HealthLiveResponseV1Schema },
        },
      },
      async () => ({ status: "live" as const }),
    );
    typedApp.get(
      "/health/ready",
      {
        schema: {
          summary: "Check infrastructure readiness",
          description:
            "Returns readiness of required infrastructure. A syntactically valid `x-request-id` header is preserved in the response; other values are replaced with a generated correlation ID.",
          tags: ["health"],
          response: {
            200: HealthReadyResponseV1Schema,
            503: ApiErrorEnvelopeV1Schema,
          },
        },
      },
      async (request, reply) => {
        const ready = await dependencies.isInfrastructureReady();
        if (ready) return reply.status(200).send({ status: "ready" });
        return reply.status(503).send(
          ApiErrorEnvelopeV1Schema.parse({
            error: {
              code: "SERVICE_UNAVAILABLE",
              message: "Required infrastructure is unavailable",
              correlationId: correlationId(request),
            },
          }),
        );
      },
    );
    const unavailable: AuthRepository = {
      requestOtp: async () => ({ ok: false, code: "AUTH_RATE_LIMITED" }),
      verifyOtp: async () => ({ ok: false, code: "AUTH_OTP_INVALID" }),
      authenticate: async () => undefined,
      revoke: async () => "missing",
    };
    registerAuthRoutes(
      app,
      dependencies.authService ??
        new AuthService(unavailable, deriveAuthKeys(Buffer.alloc(32))),
      dependencies.config.environment === "production",
    );
    if (dependencies.deviceAuthorizationService)
      registerDeviceAuthorizationRoutes(
        app,
        dependencies.authService ??
          new AuthService(unavailable, deriveAuthKeys(Buffer.alloc(32))),
        dependencies.deviceAuthorizationService,
      );
  });
  return app;
}
