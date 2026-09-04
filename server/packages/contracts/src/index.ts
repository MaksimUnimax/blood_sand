import { z } from "zod";
import {
  SemVerV1Schema,
  StableMachineIdentifierV1Schema,
} from "@product/shared";

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
  "AUTH_REFRESH_INVALID",
  "DEVICE_AUTH_RATE_LIMITED",
  "DEVICE_AUTH_INVALID",
  "DEVICE_AUTH_FORBIDDEN",
  "DEVICE_AUTH_STATE_CONFLICT",
  "DEVICE_AUTH_IDEMPOTENCY_CONFLICT",
  "DEVICE_AUTH_CLOSED",
  "DEVICE_AUTH_PENDING",
  "DEVICE_LIMIT_REACHED",
  "DEVICE_FORBIDDEN",
  "DEVICE_NOT_FOUND",
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
export const RefreshRequestBodyV1Schema = z
  .object({ refreshToken: z.string().regex(/^[A-Za-z0-9_-]{43}$/) })
  .strict();
export const RefreshResponseV1Schema = z.object({
  tokenType: z.literal("Bearer"),
  accessToken: z.string().min(1),
  accessTokenExpiresAt: z.string().datetime(),
  refreshToken: z.string().regex(/^[A-Za-z0-9_-]{43}$/),
  refreshTokenExpiresAt: z.string().datetime(),
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
export const OwnedAccountV1Schema = z
  .object({
    id: z.uuid(),
    displayName: z.string().nullable(),
    status: z.enum(["ACTIVE", "SUSPENDED"]),
  })
  .strict();
export const OwnedAccountsResponseV1Schema = z
  .object({ accounts: z.array(OwnedAccountV1Schema) })
  .strict();
export const DeviceAuthorizationPreviewParamsV1Schema = z
  .object({ id: z.uuid() })
  .strict();
export const DeviceAuthorizationPreviewResponseV1Schema = z
  .object({
    status: z.literal("pending"),
    authorizationId: z.uuid(),
    clientType: z.literal("browser_extension"),
    browserFamily: z.enum(["chrome", "yandex_chromium"]),
    browserVersion: z.string().nullable(),
    extensionVersion: z.string(),
    deviceLabel: z.string().nullable(),
    expiresAt: z.string().datetime(),
  })
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
export const DeviceAuthorizationExchangeBodyV1Schema = z
  .object({ deviceCode: z.string().regex(/^[A-Za-z0-9_-]{43}$/) })
  .strict();
export const DeviceAuthorizationExchangeResponseV1Schema = z.object({
  status: z.literal("activated"),
  deviceId: z.uuid(),
  sessionId: z.uuid(),
  tokenType: z.literal("Bearer"),
  accessToken: z.string().min(1),
  accessTokenExpiresAt: z.string().datetime(),
  refreshToken: z.string().regex(/^[A-Za-z0-9_-]{43}$/),
  refreshTokenExpiresAt: z.string().datetime(),
});
export const DeviceListQueryV1Schema = z
  .object({
    accountId: z.uuid(),
    limit: z.coerce.number().int().min(1).max(100).optional(),
    cursor: z.uuid().optional(),
  })
  .strict();
export const DeviceListItemV1Schema = z.object({
  id: z.uuid(),
  status: z.enum(["ACTIVE", "REVOKED"]),
  label: z.string().nullable(),
  browserFamily: z.enum(["chrome", "yandex_chromium"]),
  browserVersionLastSeen: z.string().nullable(),
  extensionVersionLastSeen: z.string().nullable(),
  createdAt: z.string().datetime(),
  activatedAt: z.string().datetime().nullable(),
  lastSeenAt: z.string().datetime().nullable(),
  revokedAt: z.string().datetime().nullable(),
});
export const DeviceListResponseV1Schema = z.object({
  devices: z.array(DeviceListItemV1Schema),
  nextCursor: z.uuid().nullable(),
});
export const DeviceRevokeParamsV1Schema = z
  .object({ device_id: z.uuid() })
  .strict();
export const DeviceRevokeResponseV1Schema = z.object({
  status: z.literal("revoked"),
  deviceId: z.uuid(),
});

/** Frozen P3.1 control-plane bootstrap wire-contract identifiers. */
export const ControlPlaneContractVersionV1Schema =
  z.literal("control_plane_v1");
export const BootstrapSnapshotVersionV1Schema = z.literal(
  "bootstrap_snapshot_v1",
);
export const BootstrapEnvelopeVersionV1Schema = z.literal(
  "bootstrap_envelope_v1",
);

const IsoTimestampV1Schema = z.string().datetime({ offset: true });

export const BootstrapRequestV1Schema = z
  .object({
    contractVersion: ControlPlaneContractVersionV1Schema,
    extensionVersion: SemVerV1Schema,
    browser: z
      .object({
        family: z.enum(["chrome", "yandex_chromium"]),
        version: z.string().min(1).max(64),
      })
      .strict(),
    deviceId: z.uuid(),
    lastConfigVersion: z.number().int().min(0).nullable(),
    detectedAi: z
      .object({
        family: StableMachineIdentifierV1Schema,
        surface: StableMachineIdentifierV1Schema,
        variant: StableMachineIdentifierV1Schema.nullable().optional(),
      })
      .strict()
      .optional(),
  })
  .strict();
export type BootstrapRequestV1 = z.infer<typeof BootstrapRequestV1Schema>;

const EntitlementValueV1Schema = z.union([
  z.boolean(),
  z.number().int().safe(),
  StableMachineIdentifierV1Schema,
]);
const BoundedEntitlementMapV1Schema = z
  .record(StableMachineIdentifierV1Schema, EntitlementValueV1Schema)
  .refine((value) => Object.keys(value).length <= 128, "too many entitlements");
const BoundedFeatureMapV1Schema = z
  .record(StableMachineIdentifierV1Schema, z.boolean())
  .refine((value) => Object.keys(value).length <= 128, "too many features");
const SubscriptionV1Schema = z.discriminatedUnion("state", [
  z.object({ state: z.literal("NONE"), planRevision: z.null() }).strict(),
  z
    .object({
      state: z.enum([
        "TRIAL",
        "ACTIVE",
        "GRACE",
        "PAST_DUE",
        "CANCELED",
        "EXPIRED",
        "SUSPENDED",
      ]),
      planRevision: StableMachineIdentifierV1Schema,
    })
    .strict(),
]);

export const BootstrapSnapshotPayloadV1Schema = z
  .object({
    snapshotVersion: BootstrapSnapshotVersionV1Schema,
    contractVersion: ControlPlaneContractVersionV1Schema,
    configVersion: z.number().int().positive(),
    issuedAt: IsoTimestampV1Schema,
    expiresAt: IsoTimestampV1Schema,
    offlineGraceUntil: IsoTimestampV1Schema,
    serverTime: IsoTimestampV1Schema,
    account: z.object({ status: z.literal("ACTIVE") }).strict(),
    subscription: SubscriptionV1Schema,
    devicePolicy: z.object({ status: z.literal("ACTIVE") }).strict(),
    compatibility: z
      .object({
        extension: z
          .object({
            status: z.enum([
              "SUPPORTED",
              "UPDATE_RECOMMENDED",
              "UPDATE_REQUIRED",
            ]),
            minimumVersion: SemVerV1Schema.nullable(),
          })
          .strict(),
        browser: z
          .object({
            status: z.enum(["SUPPORTED", "UNSUPPORTED_BROWSER", "MAINTENANCE"]),
          })
          .strict(),
      })
      .strict(),
    entitlements: BoundedEntitlementMapV1Schema,
    features: BoundedFeatureMapV1Schema,
    ai: z.object({ status: z.literal("UNCONFIGURED") }).strict(),
  })
  .strict()
  .superRefine((value, context) => {
    const issuedAt = Date.parse(value.issuedAt);
    const expiresAt = Date.parse(value.expiresAt);
    const offlineGraceUntil = Date.parse(value.offlineGraceUntil);
    const serverTime = Date.parse(value.serverTime);
    if (issuedAt > serverTime)
      context.addIssue({
        code: "custom",
        path: ["serverTime"],
        message: "issuedAt must be at or before serverTime",
      });
    if (issuedAt >= expiresAt)
      context.addIssue({
        code: "custom",
        path: ["expiresAt"],
        message: "expiresAt must be after issuedAt",
      });
    if (expiresAt >= offlineGraceUntil)
      context.addIssue({
        code: "custom",
        path: ["offlineGraceUntil"],
        message: "offlineGraceUntil must be after expiresAt",
      });
  });
export type BootstrapSnapshotPayloadV1 = z.infer<
  typeof BootstrapSnapshotPayloadV1Schema
>;

export const SignedBootstrapEnvelopeV1Schema = z
  .object({
    envelopeVersion: BootstrapEnvelopeVersionV1Schema,
    algorithm: z.literal("Ed25519"),
    keyId: StableMachineIdentifierV1Schema,
    payload: z
      .string()
      .min(1)
      .max(32_768)
      .regex(/^[A-Za-z0-9_-]+$/),
    signature: z
      .string()
      .min(1)
      .max(256)
      .regex(/^[A-Za-z0-9_-]+$/),
  })
  .strict();
export type SignedBootstrapEnvelopeV1 = z.infer<
  typeof SignedBootstrapEnvelopeV1Schema
>;
