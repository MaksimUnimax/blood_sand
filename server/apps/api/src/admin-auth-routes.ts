import type {
  FastifyInstance,
  RawReplyDefaultExpression,
  RawRequestDefaultExpression,
  RawServerDefault,
} from "fastify";
import type { Logger } from "pino";
import type { AdminAuthService } from "@product/admin-auth";
import {
  AdminMeResponseV1Schema,
  AdminSessionResponseV1Schema,
  ApiErrorEnvelopeV1Schema,
} from "@product/contracts";
import type { AuthService } from "@product/auth";
import { ControlledError } from "./app.js";

const adminSessionCookie = "pcp_admin_session";
const adminCsrfCookie = "pcp_admin_csrf";
const portalSessionCookie = "pcp_portal_session";
const portalCsrfCookie = "pcp_csrf";

type Api = FastifyInstance<
  RawServerDefault,
  RawRequestDefaultExpression<RawServerDefault>,
  RawReplyDefaultExpression<RawServerDefault>,
  Logger
>;

function adminError(
  code:
    | "ADMIN_UNAUTHORIZED"
    | "ADMIN_FORBIDDEN"
    | "ADMIN_REAUTH_REQUIRED"
    | "ADMIN_CSRF_INVALID"
    | "SERVICE_UNAVAILABLE",
): ControlledError {
  const status =
    code === "ADMIN_UNAUTHORIZED"
      ? 401
      : code === "SERVICE_UNAVAILABLE"
        ? 503
        : code === "ADMIN_FORBIDDEN"
          ? 403
          : 403;
  return new ControlledError(
    code,
    code === "SERVICE_UNAVAILABLE"
      ? "Required service is unavailable"
      : "Admin authentication failed",
    status,
  );
}
function clearAdminCookies(
  reply: {
    clearCookie: (
      name: string,
      options: { path: string; sameSite: "strict"; secure: boolean },
    ) => unknown;
  },
  production: boolean,
) {
  const options = {
    path: "/",
    sameSite: "strict" as const,
    secure: production,
  };
  reply.clearCookie(adminSessionCookie, options);
  reply.clearCookie(adminCsrfCookie, options);
}

export function registerAdminAuthRoutes(
  app: Api,
  auth: AuthService,
  adminAuth: AdminAuthService,
  production: boolean,
): void {
  const safeHeaders = (reply: {
    header(name: string, value: string): unknown;
  }) => reply.header("cache-control", "no-store");
  const authenticatedAdmin = async (request: {
    cookies: Record<string, string | undefined>;
  }) => {
    const token = request.cookies[adminSessionCookie];
    if (!token) throw adminError("ADMIN_UNAUTHORIZED");
    const result = await adminAuth.authenticateAdminSession(token);
    if (!result.ok) {
      if (result.code === "SERVICE_UNAVAILABLE") throw adminError(result.code);
      if (result.code === "ADMIN_UNAUTHORIZED") throw adminError(result.code);
      throw adminError("ADMIN_UNAUTHORIZED");
    }
    return { token, subject: result.value };
  };

  app.post(
    "/v1/admin/session",
    {
      schema: {
        response: {
          200: AdminSessionResponseV1Schema,
          401: ApiErrorEnvelopeV1Schema,
          403: ApiErrorEnvelopeV1Schema,
          503: ApiErrorEnvelopeV1Schema,
        },
      },
    },
    async (request, reply) => {
      const portalToken = request.cookies[portalSessionCookie];
      if (!portalToken) throw adminError("ADMIN_UNAUTHORIZED");
      const portal = await auth.authenticate(portalToken);
      if (!portal || !portal.createdAt) throw adminError("ADMIN_UNAUTHORIZED");
      const csrfHeader = request.headers["x-csrf-token"];
      const csrf = typeof csrfHeader === "string" ? csrfHeader : undefined;
      if (!auth.csrfValid(portalToken, csrf, request.cookies[portalCsrfCookie]))
        throw adminError("ADMIN_CSRF_INVALID");
      const result = await adminAuth.createAdminSession(
        {
          sessionId: portal.sessionId,
          userId: portal.userId,
          createdAt: portal.createdAt,
        },
        request.id,
      );
      if (!result.ok) {
        if (result.code === "SERVICE_UNAVAILABLE")
          throw adminError(result.code);
        if (result.code === "ADMIN_REAUTH_REQUIRED")
          throw adminError(result.code);
        if (result.code === "ADMIN_FORBIDDEN") throw adminError(result.code);
        throw adminError("ADMIN_UNAUTHORIZED");
      }
      const options = {
        path: "/",
        sameSite: "strict" as const,
        secure: production,
        maxAge: 30 * 60,
      };
      reply.setCookie(adminSessionCookie, result.value.sessionToken, {
        ...options,
        httpOnly: true,
      });
      reply.setCookie(
        adminCsrfCookie,
        adminAuth.csrf(result.value.sessionToken),
        {
          ...options,
          httpOnly: false,
        },
      );
      safeHeaders(reply);
      return {
        status: "authenticated" as const,
        expiresAt: result.value.subject.expiresAt.toISOString(),
      };
    },
  );

  app.get(
    "/v1/admin/me",
    {
      schema: {
        response: {
          200: AdminMeResponseV1Schema,
          401: ApiErrorEnvelopeV1Schema,
          503: ApiErrorEnvelopeV1Schema,
        },
      },
    },
    async (request, reply) => {
      const { subject } = await authenticatedAdmin(request);
      safeHeaders(reply);
      return {
        status: "authenticated" as const,
        principalId: subject.adminPrincipalId,
        roles: [...subject.roles].sort(),
        permissions: [...subject.permissions].sort(),
        expiresAt: subject.expiresAt.toISOString(),
      };
    },
  );

  app.delete("/v1/admin/session", async (request, reply) => {
    const { token, subject } = await authenticatedAdmin(request);
    const csrfHeader = request.headers["x-csrf-token"];
    const csrf = typeof csrfHeader === "string" ? csrfHeader : undefined;
    if (!adminAuth.csrfValid(token, csrf, request.cookies[adminCsrfCookie]))
      throw adminError("ADMIN_CSRF_INVALID");
    const result = await adminAuth.revokeAdminSession(
      token,
      subject.adminPrincipalId,
      request.id,
    );
    if (!result.ok) {
      if (result.code === "SERVICE_UNAVAILABLE") throw adminError(result.code);
      throw adminError("ADMIN_UNAUTHORIZED");
    }
    clearAdminCookies(reply, production);
    safeHeaders(reply);
    return reply.status(204).send();
  });
}
