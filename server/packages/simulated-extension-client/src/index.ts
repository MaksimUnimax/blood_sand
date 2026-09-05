import {
  DeviceAuthorizationExchangeResponseV1Schema,
  DeviceAuthorizationStartResponseV1Schema,
  RefreshResponseV1Schema,
  ApiErrorEnvelopeV1Schema,
  BootstrapRequestV1Schema,
  SignedBootstrapEnvelopeV1Schema,
  type BootstrapRequestV1,
  type BootstrapSnapshotPayloadV1,
} from "@product/contracts";
import {
  verifyBootstrapEnvelope,
  type BootstrapVerificationFailure,
} from "@product/remote-config";
import type { KeyObject } from "node:crypto";
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
  | { kind: "VERIFIED"; payload: BootstrapSnapshotPayloadV1 }
  | { kind: "HTTP_ERROR"; status: number; code: string }
  | { kind: "VERIFICATION_FAILURE"; error: BootstrapVerificationFailure };
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
  }) {
    this.controlPlaneApiOrigin = validOrigin(input.controlPlaneApiOrigin);
    this.portalOrigin = validOrigin(input.portalOrigin);
    this.trustedConfigSigningKeys = new Map(
      input.trustedConfigSigningKeys ?? [],
    );
    this.fetcher = input.fetch ?? fetch;
  }
  private readonly fetcher: typeof fetch;
  private readonly trustedConfigSigningKeys: ReadonlyMap<string, KeyObject>;
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
      ? { kind: "VERIFIED", payload: verified.payload }
      : { kind: "VERIFICATION_FAILURE", error: verified.error };
  }
}
