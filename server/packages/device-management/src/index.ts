import { createHmac, hkdfSync } from "node:crypto";
import { deviceCodeArtifact, deriveDeviceAuthKeys } from "@product/device-auth";
import {
  deriveActivationRefreshToken,
  deriveExtensionAuthKeys,
  issueAccessToken,
  refreshTokenHash,
  type AccessTokenSigningKey,
} from "@product/extension-auth";

export const PRE_ENTITLEMENT_ACTIVE_DEVICE_LIMIT = 1;
export const EXCHANGE_REPLAY_WINDOW_MS = 120_000;
export const EXCHANGE_RATE_LIMIT = 120;
export const EXCHANGE_RATE_WINDOW_MS = 10 * 60_000;
export const PENDING_RETRY_AFTER_SECONDS = 5;
const maxSaneLimit = 10_000;
const salt = Buffer.from(
  "product-control-plane/device-management/hkdf-salt/v1",
);
const labels = {
  idempotency:
    "product-control-plane/device-management/exchange-idempotency/v1",
  rate: "product-control-plane/device-management/exchange-rate-limit/v1",
} as const;
export interface DeviceLimitResolver {
  resolve(accountId: string): Promise<{ maxActive: number; source: string }>;
}
export class PreEntitlementDeviceLimitResolver implements DeviceLimitResolver {
  async resolve() {
    return {
      maxActive: PRE_ENTITLEMENT_ACTIVE_DEVICE_LIMIT,
      source: "PRE_ENTITLEMENT_BASELINE",
    };
  }
}
export type DeviceManagementKeys = Record<keyof typeof labels, Buffer>;
export function deriveDeviceManagementKeys(root: Buffer): DeviceManagementKeys {
  if (root.length !== 32)
    throw new Error("authentication root secret must be 32 bytes");
  return Object.fromEntries(
    Object.entries(labels).map(([name, label]) => [
      name,
      Buffer.from(hkdfSync("sha256", root, salt, label, 32)),
    ]),
  ) as DeviceManagementKeys;
}
function artifact(key: Buffer, purpose: string, value: string) {
  const bytes = Buffer.from(value);
  return `v1:${createHmac("sha256", key).update(`v1:${purpose}:${bytes.length}:`).update(bytes).digest("base64url")}`;
}
export const exchangeIdempotencyHash = (
  keys: DeviceManagementKeys,
  key: string,
) => artifact(keys.idempotency, "exchange-idempotency", key);
export const exchangeRateKey = (keys: DeviceManagementKeys, ip: string) =>
  artifact(keys.rate, "exchange-ip", ip);
export const validExchangeIdempotencyKey = (
  key: string | undefined,
): key is string => !!key && /^[A-Za-z0-9._:-]{16,128}$/.test(key);
export type ExchangeResult =
  | {
      kind: "ACTIVATED";
      deviceId: string;
      sessionId: string;
      refreshToken: string;
      accessToken: string;
      accessTokenExpiresAt: Date;
      refreshTokenExpiresAt: Date;
      replay: boolean;
    }
  | { kind: "PENDING"; retryAfterSeconds: number }
  | { kind: "CLOSED" }
  | { kind: "DEVICE_LIMIT_REACHED" }
  | { kind: "RATE_LIMITED"; retryAfterSeconds?: number }
  | { kind: "INVALID" }
  | { kind: "SERVICE_UNAVAILABLE" };
export interface DeviceManagementRepository {
  consumeExchangeRate(input: {
    keyHash: string;
    now: Date;
    limit: number;
    windowMs: number;
  }): Promise<{ allowed: boolean; retryAfterSeconds?: number }>;
  exchange(input: {
    deviceCodeHash: string;
    idempotencyHash: string;
    refreshTokenHash: string;
    now: Date;
    replayUntil: Date;
    correlationId: string;
    resolveLimit: (
      accountId: string,
    ) => Promise<{ maxActive: number; source: string }>;
  }): Promise<
    | {
        kind: "activated";
        deviceId: string;
        sessionId: string;
        accountId: string;
      }
    | { kind: "replay"; deviceId: string; sessionId: string; accountId: string }
    | { kind: "pending" | "closed" | "limit" | "invalid-limit" }
  >;
  list(input: {
    portalUserId: string;
    accountId: string;
    limit: number;
    cursor?: string;
  }): Promise<
    | { kind: "ok"; devices: SafeDevice[]; nextCursor?: string }
    | { kind: "forbidden" | "invalid-cursor" }
  >;
  revoke(input: {
    portalUserId: string;
    deviceId: string;
    correlationId: string;
  }): Promise<"revoked" | "already-revoked" | "not-found">;
}
export interface SafeDevice {
  id: string;
  status: "ACTIVE" | "REVOKED";
  label: string | null;
  browserFamily: string;
  browserVersionLastSeen: string | null;
  extensionVersionLastSeen: string | null;
  createdAt: Date;
  activatedAt: Date | null;
  lastSeenAt: Date | null;
  revokedAt: Date | null;
}
export class DeviceManagementService {
  constructor(
    private readonly repository: DeviceManagementRepository,
    private readonly root: Buffer,
    private readonly signingKey: AccessTokenSigningKey,
    private readonly limits: DeviceLimitResolver = new PreEntitlementDeviceLimitResolver(),
    private readonly now: () => Date = () => new Date(),
  ) {}
  async exchange(
    deviceCode: string,
    idempotencyKey: string,
    peerIp: string,
    correlationId: string,
  ): Promise<ExchangeResult> {
    if (
      !/^[A-Za-z0-9_-]{43}$/.test(deviceCode) ||
      !validExchangeIdempotencyKey(idempotencyKey)
    )
      return { kind: "INVALID" };
    const now = this.now(),
      keys = deriveDeviceManagementKeys(this.root),
      authKeys = deriveDeviceAuthKeys(this.root),
      extKeys = deriveExtensionAuthKeys(this.root);
    const rate = await this.repository.consumeExchangeRate({
      keyHash: exchangeRateKey(keys, peerIp),
      now,
      limit: EXCHANGE_RATE_LIMIT,
      windowMs: EXCHANGE_RATE_WINDOW_MS,
    });
    if (!rate.allowed)
      return {
        kind: "RATE_LIMITED",
        ...(rate.retryAfterSeconds
          ? { retryAfterSeconds: rate.retryAfterSeconds }
          : {}),
      };
    const refreshToken = deriveActivationRefreshToken(
      extKeys,
      deviceCode,
      idempotencyKey,
    );
    const result = await this.repository.exchange({
      deviceCodeHash: deviceCodeArtifact(authKeys, deviceCode),
      idempotencyHash: exchangeIdempotencyHash(keys, idempotencyKey),
      refreshTokenHash: refreshTokenHash(extKeys, refreshToken),
      now,
      replayUntil: new Date(now.getTime() + EXCHANGE_REPLAY_WINDOW_MS),
      correlationId,
      resolveLimit: async (accountId) => {
        const value = await this.limits.resolve(accountId);
        if (
          !Number.isInteger(value.maxActive) ||
          value.maxActive < 0 ||
          value.maxActive > maxSaneLimit
        )
          throw new Error("invalid device limit");
        return value;
      },
    });
    if (result.kind === "pending")
      return {
        kind: "PENDING",
        retryAfterSeconds: PENDING_RETRY_AFTER_SECONDS,
      };
    if (result.kind === "closed") return { kind: "CLOSED" };
    if (result.kind === "limit") return { kind: "DEVICE_LIMIT_REACHED" };
    if (result.kind === "invalid-limit") return { kind: "SERVICE_UNAVAILABLE" };
    if (result.kind !== "activated" && result.kind !== "replay")
      return { kind: "SERVICE_UNAVAILABLE" };
    return {
      kind: "ACTIVATED",
      deviceId: result.deviceId,
      sessionId: result.sessionId,
      refreshToken,
      accessToken: await issueAccessToken(
        this.signingKey,
        {
          deviceId: result.deviceId,
          sessionId: result.sessionId,
          accountId: result.accountId,
        },
        now,
      ),
      accessTokenExpiresAt: new Date(now.getTime() + 15 * 60 * 1000),
      refreshTokenExpiresAt: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000),
      replay: result.kind === "replay",
    };
  }
  async list(
    portalUserId: string,
    accountId: string,
    limit?: number,
    cursor?: string,
  ) {
    const size = limit === undefined ? 50 : limit;
    if (!Number.isInteger(size) || size < 1 || size > 100)
      return { kind: "INVALID" as const };
    const r = await this.repository.list({
      portalUserId,
      accountId,
      limit: size,
      cursor,
    });
    return r.kind === "ok"
      ? r
      : {
          kind:
            r.kind === "forbidden"
              ? ("FORBIDDEN" as const)
              : ("INVALID_CURSOR" as const),
        };
  }
  async revoke(portalUserId: string, deviceId: string, correlationId: string) {
    const r = await this.repository.revoke({
      portalUserId,
      deviceId,
      correlationId,
    });
    return r === "not-found"
      ? { kind: "NOT_FOUND" as const }
      : { kind: "REVOKED" as const, idempotent: r === "already-revoked" };
  }
}
