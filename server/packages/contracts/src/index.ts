import { z } from "zod";

/** Public contract convention: names use a V1 suffix until a breaking version is introduced. */
export const CorrelationIdV1Schema = z
  .string()
  .min(1)
  .max(128)
  .regex(/^[A-Za-z0-9._:-]+$/);
export type CorrelationIdV1 = z.infer<typeof CorrelationIdV1Schema>;

export const ApiErrorCodeV1Schema = z.enum([
  "INTERNAL_ERROR",
  "INVALID_REQUEST",
  "SERVICE_UNAVAILABLE",
  "AUTH_RATE_LIMITED",
  "AUTH_OTP_INVALID",
  "AUTH_LOGIN_DENIED",
  "AUTH_SESSION_INVALID",
  "AUTH_CSRF_INVALID",
  "DEVICE_AUTH_RATE_LIMITED",
  "DEVICE_AUTH_INVALID",
  "DEVICE_AUTH_FORBIDDEN",
  "DEVICE_AUTH_STATE_CONFLICT",
  "DEVICE_AUTH_IDEMPOTENCY_CONFLICT",
  "DEVICE_AUTH_CLOSED",
]);
export type ApiErrorCodeV1 = z.infer<typeof ApiErrorCodeV1Schema>;

export const ApiErrorEnvelopeV1Schema = z.object({
  error: z.object({
    code: ApiErrorCodeV1Schema,
    message: z.string().min(1),
    correlationId: CorrelationIdV1Schema,
  }),
});
export type ApiErrorEnvelopeV1 = z.infer<typeof ApiErrorEnvelopeV1Schema>;

/** Public health responses exposed by the P1 API foundation. */
export const HealthLiveResponseV1Schema = z.object({
  status: z.literal("live"),
});
export type HealthLiveResponseV1 = z.infer<typeof HealthLiveResponseV1Schema>;

export const HealthReadyResponseV1Schema = z.object({
  status: z.literal("ready"),
});
export type HealthReadyResponseV1 = z.infer<typeof HealthReadyResponseV1Schema>;

export const OtpRequestBodyV1Schema = z.object({
  email: z.string().min(1).max(320),
});
export const OtpRequestResponseV1Schema = z.object({
  status: z.literal("accepted"),
  challengeId: z.uuid(),
  expiresAt: z.string().datetime(),
});
export const OtpVerifyBodyV1Schema = z.object({
  challengeId: z.uuid(),
  code: z.string().regex(/^\d{6}$/),
});
export const OtpVerifyResponseV1Schema = z.object({
  status: z.literal("authenticated"),
  expiresAt: z.string().datetime(),
});
const SafeVersion = z
  .string()
  .min(1)
  .max(64)
  .regex(/^[A-Za-z0-9._+-]+$/);
export const DeviceAuthorizationStartBodyV1Schema = z
  .object({
    clientType: z.literal("browser_extension"),
    browserFamily: z.enum(["chrome", "yandex_chromium"]),
    browserVersion: SafeVersion.optional(),
    extensionVersion: SafeVersion,
    deviceLabel: z
      .string()
      .min(1)
      .max(128)
      .regex(/^[^<>]*$/u)
      .optional(),
  })
  .strict();
export const DeviceAuthorizationStartResponseV1Schema = z.object({
  status: z.literal("pending"),
  authorizationId: z.uuid(),
  deviceCode: z.string().regex(/^[A-Za-z0-9_-]{43}$/),
  userCode: z
    .string()
    .regex(
      /^[ABCDEFGHJKLMNPQRSTUVWXYZ23456789]{4}-[ABCDEFGHJKLMNPQRSTUVWXYZ23456789]{4}$/,
    ),
  expiresAt: z.string().datetime(),
});
export const DeviceAuthorizationApproveBodyV1Schema = z
  .object({
    accountId: z.uuid(),
    userCode: z
      .string()
      .regex(
        /^[ABCDEFGHJKLMNPQRSTUVWXYZ23456789]{4}-?[ABCDEFGHJKLMNPQRSTUVWXYZ23456789]{4}$/i,
      ),
  })
  .strict();
export const DeviceAuthorizationDenyBodyV1Schema = z
  .object({
    userCode: z
      .string()
      .regex(
        /^[ABCDEFGHJKLMNPQRSTUVWXYZ23456789]{4}-?[ABCDEFGHJKLMNPQRSTUVWXYZ23456789]{4}$/i,
      ),
  })
  .strict();
export const DeviceAuthorizationParamsV1Schema = z
  .object({ id: z.uuid() })
  .strict();
export const DeviceAuthorizationApprovedResponseV1Schema = z.object({
  status: z.literal("approved"),
  authorizationId: z.uuid(),
  expiresAt: z.string().datetime(),
});
export const DeviceAuthorizationDeniedResponseV1Schema = z.object({
  status: z.literal("denied"),
  authorizationId: z.uuid(),
});
