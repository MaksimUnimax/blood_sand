import {
  DeviceAuthorizationExchangeResponseV1Schema,
  DeviceAuthorizationStartResponseV1Schema,
  RefreshResponseV1Schema,
  ApiErrorEnvelopeV1Schema,
  BootstrapRequestV1Schema,
  SignedBootstrapEnvelopeV1Schema,
  type BootstrapRequestV1,
  type BootstrapSnapshotPayloadV1,
  type SignedBootstrapEnvelopeV1,
} from "@product/contracts";
import {
  verifyBootstrapEnvelope,
  type BootstrapVerificationFailure,
} from "@product/remote-config";
import type { KeyObject } from "node:crypto";
import {
  InMemoryBootstrapSnapshotStore,
  normalizeRequestContext,
  requestContextsEqual,
  validateBootstrapCacheRecord,
  type BootstrapCacheRecord,
  type BootstrapRequestContext,
  type BootstrapSnapshotStore,
  type BootstrapSnapshotStoreKey,
  type ValidatedBootstrapCache,
} from "./bootstrap-cache.js";
import {
  classifyBootstrapFreshness,
  resolveClientCompatibility,
  type SignedOperationalResult,
} from "./bootstrap-policy.js";
export * from "./bootstrap-cache.js";
export * from "./bootstrap-policy.js";
export type ExchangeResult =
  | { kind: "ACTIVATED" }
  | { kind: "PENDING"; retryAfterSeconds: number }
  | { kind: "LIMIT_REACHED" | "CLOSED" | "INVALID" | "RATE_LIMITED" };
type Credentials = {
  deviceId: string;
  sessionId: string;
  accessToken: string;
  accessTokenExpiresAt: string;
  refreshToken: string;
  refreshTokenExpiresAt: string;
};
export type BootstrapResult =
  | {
      kind: "VERIFIED";
      payload: BootstrapSnapshotPayloadV1;
      envelope: SignedBootstrapEnvelopeV1;
    }
  | { kind: "HTTP_ERROR"; status: number; code: string }
  | { kind: "VERIFICATION_FAILURE"; error: BootstrapVerificationFailure };
export type BootstrapPolicyUnavailableReason =
  | "NOT_AUTHORIZED"
  | "CACHE_INVALID"
  | "CACHE_EXPIRED"
  | "NO_MATCHING_CACHE"
  | "CLOCK_UNSAFE"
  | "SERVER_TIME_ROLLBACK"
  | "INVALID_LIVE_FRESHNESS"
  | "SECURITY_FAILURE"
  | "HTTP_ERROR"
  | "AUTHORIZATION_DENIED";
export type BootstrapPolicyResult =
  | SignedOperationalResult
  | {
      kind: "UNAVAILABLE";
      reason: BootstrapPolicyUnavailableReason;
      status?: number;
      error?: string;
    };
export type ClientClock = {
  wallNow: () => Date;
  monotonicNowMs: () => number;
};
export type BootstrapPolicyRequest = Omit<
  BootstrapRequestV1,
  "deviceId" | "lastConfigVersion"
> & { detectedAi?: BootstrapRequestV1["detectedAi"] | null };
function validOrigin(raw: string): string {
  try {
    const url = new URL(raw);
    if (
      !["http:", "https:"].includes(url.protocol) ||
      url.username ||
      url.password ||
      url.pathname !== "/" ||
      url.search ||
      url.hash
    )
      throw new Error("invalid origin");
    return url.origin;
  } catch {
    throw new Error("invalid origin");
  }
}
export class SimulatedExtensionClient {
  private credentials?: Credentials;
  readonly controlPlaneApiOrigin: string;
  readonly portalOrigin: string;
  constructor(input: {
    controlPlaneApiOrigin: string;
    portalOrigin: string;
    trustedConfigSigningKeys?: ReadonlyMap<string, KeyObject>;
    fetch?: typeof fetch;
    clock?: ClientClock;
    snapshotStore?: BootstrapSnapshotStore;
    store?: BootstrapSnapshotStore;
  }) {
    this.controlPlaneApiOrigin = validOrigin(input.controlPlaneApiOrigin);
    this.portalOrigin = validOrigin(input.portalOrigin);
    this.trustedConfigSigningKeys = new Map(
      input.trustedConfigSigningKeys ?? [],
    );
    this.fetcher = input.fetch ?? fetch;
    this.clock = input.clock ?? {
      wallNow: () => new Date(),
      monotonicNowMs: () =>
        typeof performance !== "undefined" ? performance.now() : Date.now(),
    };
    this.snapshotStore =
      input.snapshotStore ??
      input.store ??
      new InMemoryBootstrapSnapshotStore();
  }
  private readonly fetcher: typeof fetch;
  private readonly trustedConfigSigningKeys: ReadonlyMap<string, KeyObject>;
  private readonly clock: ClientClock;
  private readonly snapshotStore: BootstrapSnapshotStore;
  private trustedServerTimeHighWatermarkMs?: number;
  private lastObservedWallTimeHighWatermarkMs?: number;
  private runtimeAnchor?: { effectiveNowMs: number; monotonicNowMs: number };
  private effectiveNowHighWatermarkMs?: number;
  async startAuthorization(
    metadata: {
      clientType: "browser_extension";
      browserFamily: "chrome" | "yandex_chromium";
      browserVersion?: string;
      extensionVersion: string;
      deviceLabel?: string;
    },
    idempotencyKey = crypto.randomUUID(),
  ) {
    const response = await this.fetcher(
      `${this.controlPlaneApiOrigin}/v1/device-authorizations`,
      {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "idempotency-key": idempotencyKey,
        },
        body: JSON.stringify(metadata),
      },
    );
    const value = DeviceAuthorizationStartResponseV1Schema.parse(
      await response.json(),
    );
    return {
      ...value,
      verificationUrl: `${this.portalOrigin}/activate?authorizationId=${value.authorizationId}`,
    };
  }
  async exchange(
    deviceCode: string,
    idempotencyKey: string,
  ): Promise<ExchangeResult> {
    const response = await this.fetcher(
      `${this.controlPlaneApiOrigin}/v1/device-authorizations/token`,
      {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "idempotency-key": idempotencyKey,
        },
        body: JSON.stringify({ deviceCode }),
      },
    );
    if (response.ok) {
      const value = DeviceAuthorizationExchangeResponseV1Schema.parse(
        await response.json(),
      );
      this.credentials = {
        deviceId: value.deviceId,
        sessionId: value.sessionId,
        accessToken: value.accessToken,
        accessTokenExpiresAt: value.accessTokenExpiresAt,
        refreshToken: value.refreshToken,
        refreshTokenExpiresAt: value.refreshTokenExpiresAt,
      };
      return { kind: "ACTIVATED" };
    }
    const error = (await response.json().catch(() => ({})))?.error?.code;
    if (error === "DEVICE_AUTH_PENDING")
      return {
        kind: "PENDING",
        retryAfterSeconds: Math.max(
          1,
          Number(response.headers.get("retry-after")) || 5,
        ),
      };
    if (error === "DEVICE_LIMIT_REACHED") return { kind: "LIMIT_REACHED" };
    if (error === "DEVICE_AUTH_CLOSED") return { kind: "CLOSED" };
    if (error === "DEVICE_AUTH_RATE_LIMITED") return { kind: "RATE_LIMITED" };
    return { kind: "INVALID" };
  }
  async pollUntilTerminal(
    deviceCode: string,
    input: {
      idempotencyKey: string;
      expiresAt: Date;
      sleep: (ms: number) => Promise<void>;
      clock: () => Date;
    },
  ): Promise<ExchangeResult> {
    while (input.clock() < input.expiresAt) {
      const result = await this.exchange(deviceCode, input.idempotencyKey);
      if (result.kind !== "PENDING") return result;
      const remaining = input.expiresAt.getTime() - input.clock().getTime();
      if (remaining <= 0) break;
      await input.sleep(
        Math.min(remaining, Math.max(1000, result.retryAfterSeconds * 1000)),
      );
    }
    return { kind: "CLOSED" };
  }
  async refresh(idempotencyKey = crypto.randomUUID()): Promise<boolean> {
    if (!this.credentials) return false;
    const response = await this.fetcher(
      `${this.controlPlaneApiOrigin}/v1/auth/refresh`,
      {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "idempotency-key": idempotencyKey,
        },
        body: JSON.stringify({ refreshToken: this.credentials.refreshToken }),
      },
    );
    if (!response.ok) return false;
    const value = RefreshResponseV1Schema.parse(await response.json());
    this.credentials = { ...this.credentials, ...value };
    return true;
  }

  async bootstrap(
    input: Omit<BootstrapRequestV1, "deviceId">,
  ): Promise<BootstrapResult> {
    if (!this.credentials)
      return { kind: "HTTP_ERROR", status: 401, code: "UNAUTHORIZED" };
    const request = BootstrapRequestV1Schema.parse({
      ...input,
      deviceId: this.credentials.deviceId,
    });
    const response = await this.fetcher(
      `${this.controlPlaneApiOrigin}/v1/bootstrap`,
      {
        method: "POST",
        headers: {
          "content-type": "application/json",
          authorization: `Bearer ${this.credentials.accessToken}`,
        },
        body: JSON.stringify(request),
      },
    );
    let body: unknown;
    try {
      body = await response.json();
    } catch {
      if (response.ok)
        return { kind: "VERIFICATION_FAILURE", error: "INVALID_ENVELOPE" };
      return {
        kind: "HTTP_ERROR",
        status: response.status,
        code: "HTTP_ERROR",
      };
    }
    if (!response.ok) {
      const error = ApiErrorEnvelopeV1Schema.safeParse(body);
      return {
        kind: "HTTP_ERROR",
        status: response.status,
        code: error.success ? error.data.error.code : "HTTP_ERROR",
      };
    }
    const envelope = SignedBootstrapEnvelopeV1Schema.safeParse(body);
    if (!envelope.success)
      return { kind: "VERIFICATION_FAILURE", error: "INVALID_ENVELOPE" };
    const verified = verifyBootstrapEnvelope(
      envelope.data,
      this.trustedConfigSigningKeys,
    );
    return verified.ok
      ? { kind: "VERIFIED", payload: verified.payload, envelope: envelope.data }
      : { kind: "VERIFICATION_FAILURE", error: verified.error };
  }

  async bootstrapWithPolicy(
    input: BootstrapPolicyRequest,
  ): Promise<BootstrapPolicyResult> {
    if (!this.credentials)
      return { kind: "UNAVAILABLE", reason: "NOT_AUTHORIZED" };

    const context = normalizeRequestContext(input);
    const key: BootstrapSnapshotStoreKey = {
      controlPlaneApiOrigin: this.controlPlaneApiOrigin,
      deviceId: this.credentials.deviceId,
      contractVersion: context.contractVersion,
    };
    const cacheState = await this.loadCacheState(key, context);
    const liveRequest = {
      ...input,
      detectedAi: context.detectedAi ?? undefined,
      lastConfigVersion: cacheState.matching?.payload.configVersion ?? null,
    };

    let live: BootstrapResult;
    try {
      live = await this.bootstrap(liveRequest);
    } catch {
      return this.useOfflineCache(cacheState.matching, cacheState.reason);
    }

    if (live.kind === "HTTP_ERROR") {
      if (live.status === 401 || live.status === 403) {
        await this.removeCache(key);
        return {
          kind: "UNAVAILABLE",
          reason: "AUTHORIZATION_DENIED",
          status: live.status,
          error: live.code,
        };
      }
      return {
        kind: "UNAVAILABLE",
        reason: "HTTP_ERROR",
        status: live.status,
        error: live.code,
      };
    }
    if (live.kind === "VERIFICATION_FAILURE")
      return {
        kind: "UNAVAILABLE",
        reason: "SECURITY_FAILURE",
        error: live.error,
      };

    const payloadServerTimeMs = Date.parse(live.payload.serverTime);
    const expiresAtMs = Date.parse(live.payload.expiresAt);
    if (
      !Number.isFinite(payloadServerTimeMs) ||
      !Number.isFinite(expiresAtMs) ||
      payloadServerTimeMs >= expiresAtMs
    )
      return {
        kind: "UNAVAILABLE",
        reason: "INVALID_LIVE_FRESHNESS",
      };
    if (
      this.trustedServerTimeHighWatermarkMs !== undefined &&
      payloadServerTimeMs < this.trustedServerTimeHighWatermarkMs
    )
      return {
        kind: "UNAVAILABLE",
        reason: "SERVER_TIME_ROLLBACK",
      };

    this.anchorLiveTime(payloadServerTimeMs);
    const record: BootstrapCacheRecord = {
      cacheVersion: "bootstrap_cache_v1",
      controlPlaneApiOrigin: this.controlPlaneApiOrigin,
      deviceId: this.credentials.deviceId,
      requestContext: context,
      envelope: live.envelope,
      trustedServerTimeHighWatermark: new Date(
        this.trustedServerTimeHighWatermarkMs!,
      ).toISOString(),
      lastObservedWallTimeHighWatermark: new Date(
        this.lastObservedWallTimeHighWatermarkMs!,
      ).toISOString(),
    };
    try {
      await this.snapshotStore.save(key, record);
    } catch {
      // A cache is an availability aid; it is never authority over live policy.
    }
    return {
      kind: resolveClientCompatibility(live.payload),
      source: "LIVE",
      freshness: "FRESH",
      payload: live.payload,
    };
  }

  private async loadCacheState(
    key: BootstrapSnapshotStoreKey,
    context: BootstrapRequestContext,
  ): Promise<{
    matching?: ValidatedBootstrapCache;
    reason: "CACHE_INVALID" | "NO_MATCHING_CACHE";
  }> {
    let raw: unknown;
    try {
      raw = await this.snapshotStore.load(key);
    } catch {
      return { reason: "NO_MATCHING_CACHE" };
    }
    if (raw === undefined) return { reason: "NO_MATCHING_CACHE" };
    const validated = validateBootstrapCacheRecord(
      raw,
      key,
      this.trustedConfigSigningKeys,
    );
    if (!validated.ok) {
      await this.removeCache(key);
      return { reason: "CACHE_INVALID" };
    }
    this.trustedServerTimeHighWatermarkMs = Math.max(
      this.trustedServerTimeHighWatermarkMs ?? -Infinity,
      validated.value.trustedServerTimeHighWatermarkMs,
    );
    this.lastObservedWallTimeHighWatermarkMs = Math.max(
      this.lastObservedWallTimeHighWatermarkMs ?? -Infinity,
      validated.value.lastObservedWallTimeHighWatermarkMs,
    );
    return requestContextsEqual(validated.value.record.requestContext, context)
      ? { matching: validated.value, reason: "NO_MATCHING_CACHE" }
      : { reason: "NO_MATCHING_CACHE" };
  }

  private async useOfflineCache(
    cached: ValidatedBootstrapCache | undefined,
    noCacheReason: "CACHE_INVALID" | "NO_MATCHING_CACHE",
  ): Promise<BootstrapPolicyResult> {
    if (!cached) return { kind: "UNAVAILABLE", reason: noCacheReason };
    const monotonicNowMs = this.clock.monotonicNowMs();
    if (
      this.runtimeAnchor &&
      monotonicNowMs < this.runtimeAnchor.monotonicNowMs
    )
      return { kind: "UNAVAILABLE", reason: "CLOCK_UNSAFE" };
    const wallNowMs = this.clock.wallNow().getTime();
    if (!Number.isFinite(wallNowMs))
      return { kind: "UNAVAILABLE", reason: "CLOCK_UNSAFE" };
    const runtimeNowMs = this.runtimeAnchor
      ? this.runtimeAnchor.effectiveNowMs +
        (monotonicNowMs - this.runtimeAnchor.monotonicNowMs)
      : -Infinity;
    const effectiveNowMs = Math.max(
      cached.trustedServerTimeHighWatermarkMs,
      cached.lastObservedWallTimeHighWatermarkMs,
      wallNowMs,
      runtimeNowMs,
      this.effectiveNowHighWatermarkMs ?? -Infinity,
    );
    this.effectiveNowHighWatermarkMs = effectiveNowMs;
    if (this.runtimeAnchor)
      this.runtimeAnchor = { effectiveNowMs, monotonicNowMs };
    const freshness = classifyBootstrapFreshness({
      effectiveNowMs,
      expiresAt: cached.payload.expiresAt,
      offlineGraceUntil: cached.payload.offlineGraceUntil,
    });
    if (freshness === "EXPIRED")
      return { kind: "UNAVAILABLE", reason: "CACHE_EXPIRED" };
    return {
      kind: resolveClientCompatibility(cached.payload),
      source: "CACHE",
      freshness,
      payload: cached.payload,
    };
  }

  private anchorLiveTime(payloadServerTimeMs: number): number {
    const wallNowMs = this.clock.wallNow().getTime();
    const safeWallNowMs = Number.isFinite(wallNowMs) ? wallNowMs : -Infinity;
    this.trustedServerTimeHighWatermarkMs = Math.max(
      this.trustedServerTimeHighWatermarkMs ?? -Infinity,
      payloadServerTimeMs,
    );
    this.lastObservedWallTimeHighWatermarkMs = Math.max(
      this.lastObservedWallTimeHighWatermarkMs ?? -Infinity,
      safeWallNowMs,
      this.trustedServerTimeHighWatermarkMs,
    );
    const effectiveNowMs = Math.max(
      this.trustedServerTimeHighWatermarkMs,
      this.lastObservedWallTimeHighWatermarkMs,
      safeWallNowMs,
      this.effectiveNowHighWatermarkMs ?? -Infinity,
    );
    const monotonicNowMs = this.clock.monotonicNowMs();
    this.runtimeAnchor = { effectiveNowMs, monotonicNowMs };
    this.effectiveNowHighWatermarkMs = effectiveNowMs;
    return effectiveNowMs;
  }

  private async removeCache(key: BootstrapSnapshotStoreKey): Promise<void> {
    try {
      await this.snapshotStore.remove(key);
    } catch {
      // Removal is best effort; a later load still verifies before use.
    }
  }
}
