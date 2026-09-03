import {
  createHmac,
  createPrivateKey,
  createPublicKey,
  generateKeyPairSync,
  hkdfSync,
  randomBytes,
} from "node:crypto";
import type { KeyObject } from "node:crypto";
import {
  decodeProtectedHeader,
  jwtVerify,
  SignJWT,
  type JWTPayload,
} from "jose";

export const ACCESS_TOKEN_TTL_SECONDS = 15 * 60;
export const REFRESH_TOKEN_TTL_MS = 30 * 24 * 60 * 60_000;
export const REFRESH_REPLAY_WINDOW_MS = 2 * 60_000;
export const ACCESS_TOKEN_ISSUER = "product-control-plane";
export const ACCESS_TOKEN_AUDIENCE = "product-extension";

const salt = Buffer.from("product-control-plane/extension-auth/hkdf-salt/v1");
const labels = {
  refreshHash: "product-control-plane/extension-auth/refresh-hash/v1",
  refreshDerivation: "product-control-plane/extension-auth/refresh-derive/v1",
  activationRefresh:
    "product-control-plane/extension-auth/activation-refresh/v1",
  idempotency: "product-control-plane/extension-auth/refresh-idempotency/v1",
  rateLimit: "product-control-plane/extension-auth/rate-limit/v1",
} as const;
export type ExtensionAuthKeys = Record<keyof typeof labels, Buffer>;

export function deriveExtensionAuthKeys(root: Buffer): ExtensionAuthKeys {
  if (root.length !== 32)
    throw new Error("authentication root secret must be 32 bytes");
  return Object.fromEntries(
    Object.entries(labels).map(([name, label]) => [
      name,
      Buffer.from(hkdfSync("sha256", root, salt, label, 32)),
    ]),
  ) as ExtensionAuthKeys;
}
function artifact(key: Buffer, purpose: string, value: string): string {
  const encoded = Buffer.from(value, "utf8");
  const hmac = createHmac("sha256", key);
  hmac.update(Buffer.from(`v1:${purpose}:${encoded.length}:`));
  hmac.update(encoded);
  return `v1:${hmac.digest("base64url")}`;
}
export function refreshTokenHash(
  keys: ExtensionAuthKeys,
  token: string,
): string {
  return artifact(keys.refreshHash, "refresh-token", token);
}
export function refreshIdempotencyHash(
  keys: ExtensionAuthKeys,
  key: string,
): string {
  return artifact(keys.idempotency, "refresh-idempotency", key);
}
/** Pseudonymous peer identity for persistence; callers must never store the IP. */
export function refreshRateKey(
  keys: ExtensionAuthKeys,
  peerIp: string,
): string {
  return artifact(keys.rateLimit, "refresh-ip", peerIp);
}
export function validRefreshIdempotencyKey(
  value: string | undefined,
): value is string {
  return !!value && /^[A-Za-z0-9._:-]{16,128}$/.test(value);
}
export function generateRefreshToken(bytes: Buffer = randomBytes(32)): string {
  if (bytes.length !== 32) throw new Error("refresh token needs 32 bytes");
  return bytes.toString("base64url");
}
export function deriveReplacementRefreshToken(
  keys: ExtensionAuthKeys,
  previous: string,
  idempotencyKey: string,
): string {
  return createHmac("sha256", keys.refreshDerivation)
    .update(Buffer.from("v1:replacement:"))
    .update(Buffer.from(previous, "utf8"))
    .update(Buffer.from("\0", "utf8"))
    .update(Buffer.from(idempotencyKey, "utf8"))
    .digest("base64url");
}
/** Deterministic, single-use initial credential for a P2.5 activation replay. */
export function deriveActivationRefreshToken(
  keys: ExtensionAuthKeys,
  deviceCode: string,
  exchangeIdempotencyKey: string,
): string {
  const code = Buffer.from(deviceCode, "utf8");
  const key = Buffer.from(exchangeIdempotencyKey, "utf8");
  return createHmac("sha256", keys.activationRefresh)
    .update(Buffer.from("v1:activation:"))
    .update(Buffer.from(String(code.length) + ":"))
    .update(code)
    .update(Buffer.from(":" + String(key.length) + ":"))
    .update(key)
    .digest("base64url");
}
export interface AccessTokenSigningKey {
  privateKey: KeyObject;
  publicKey: KeyObject;
  keyId: string;
}
export function loadAccessTokenSigningKey(
  environment: NodeJS.ProcessEnv,
): AccessTokenSigningKey {
  const encoded = environment.ACCESS_TOKEN_SIGNING_PRIVATE_KEY_PEM_B64;
  const keyId = environment.ACCESS_TOKEN_SIGNING_KEY_ID;
  if (!encoded || !keyId || !/^[A-Za-z0-9._:-]{1,64}$/.test(keyId))
    throw new Error("access token signing configuration is invalid");
  try {
    const pem = Buffer.from(encoded, "base64");
    if (pem.toString("base64") !== encoded) throw new Error("non-canonical");
    const privateKey = createPrivateKey({
      key: pem,
      format: "pem",
      type: "pkcs8",
    });
    if (privateKey.asymmetricKeyType !== "ed25519")
      throw new Error("not Ed25519");
    return { privateKey, publicKey: createPublicKey(privateKey), keyId };
  } catch {
    throw new Error("access token signing configuration is invalid");
  }
}
/** Test/OpenAPI-only synthetic material; production must use configuration. */
export function createEphemeralAccessTokenSigningKey(
  keyId = "test-ed25519-v1",
): AccessTokenSigningKey {
  const { privateKey } = generateKeyPairSync("ed25519");
  return { privateKey, publicKey: createPublicKey(privateKey), keyId };
}
export interface AccessTokenIdentity {
  sessionId: string;
  deviceId: string;
  accountId: string;
}
export type ExtensionPrincipal = AccessTokenIdentity;
export interface AccessTokenClaims extends AccessTokenIdentity {
  version: 1;
  issuedAt: number;
  expiresAt: number;
}
export async function issueAccessToken(
  signingKey: AccessTokenSigningKey,
  identity: AccessTokenIdentity,
  now = new Date(),
): Promise<string> {
  const issuedAt = Math.floor(now.getTime() / 1000);
  return new SignJWT({
    did: identity.deviceId,
    aid: identity.accountId,
    ver: 1,
  })
    .setProtectedHeader({ alg: "EdDSA", typ: "JWT", kid: signingKey.keyId })
    .setIssuer(ACCESS_TOKEN_ISSUER)
    .setAudience(ACCESS_TOKEN_AUDIENCE)
    .setSubject(identity.sessionId)
    .setIssuedAt(issuedAt)
    .setExpirationTime(issuedAt + ACCESS_TOKEN_TTL_SECONDS)
    .sign(signingKey.privateKey);
}
export async function verifyAccessToken(
  signingKey: AccessTokenSigningKey,
  token: string,
  now = new Date(),
): Promise<AccessTokenClaims | undefined> {
  try {
    const header = decodeProtectedHeader(token);
    if (
      header.alg !== "EdDSA" ||
      header.typ !== "JWT" ||
      header.kid !== signingKey.keyId ||
      Object.keys(header).length !== 3
    )
      return undefined;
    const { payload } = await jwtVerify(token, signingKey.publicKey, {
      algorithms: ["EdDSA"],
      issuer: ACCESS_TOKEN_ISSUER,
      audience: ACCESS_TOKEN_AUDIENCE,
      currentDate: now,
      clockTolerance: 30,
    });
    const p = payload as JWTPayload & {
      did?: unknown;
      aid?: unknown;
      ver?: unknown;
    };
    if (
      typeof p.sub !== "string" ||
      typeof p.did !== "string" ||
      typeof p.aid !== "string" ||
      p.ver !== 1 ||
      typeof p.iat !== "number" ||
      typeof p.exp !== "number"
    )
      return undefined;
    return {
      sessionId: p.sub,
      deviceId: p.did,
      accountId: p.aid,
      version: 1,
      issuedAt: p.iat,
      expiresAt: p.exp,
    };
  } catch {
    return undefined;
  }
}

export type ExtensionAuthFailure =
  | "EXTENSION_AUTH_INVALID"
  | "EXTENSION_AUTH_REUSE"
  | "EXTENSION_AUTH_UNAUTHORIZED"
  | "EXTENSION_AUTH_RATE_LIMITED"
  | "SERVICE_UNAVAILABLE";
export type ExtensionAuthResult<T> =
  | { ok: true; value: T }
  | { ok: false; code: ExtensionAuthFailure; retryAfterSeconds?: number };
export interface ExtensionAuthRepository {
  consumeRefreshRate(input: {
    keyHash: string;
    now: Date;
    limit: number;
    windowMs: number;
  }): Promise<{ allowed: boolean; retryAfterSeconds?: number }>;
  authorize(sessionId: string): Promise<AccessTokenIdentity | undefined>;
  authorizeFromRefreshHash(
    tokenHash: string,
  ): Promise<AccessTokenIdentity | undefined>;
  createRefresh(input: {
    sessionId: string;
    tokenHash: string;
    expiresAt: Date;
  }): Promise<boolean>;
  rotateRefresh(input: {
    tokenHash: string;
    replacementHash: string;
    idempotencyHash: string;
    expiresAt: Date;
    replayUntil: Date;
    correlationId: string;
  }): Promise<"rotated" | "replay" | "invalid" | "reuse">;
}
export class ExtensionAuthService {
  constructor(
    private readonly repository: ExtensionAuthRepository,
    private readonly keys: ExtensionAuthKeys,
    private readonly now: () => Date = () => new Date(),
    private readonly signingKey: AccessTokenSigningKey,
  ) {}
  async issue(sessionId: string): Promise<
    ExtensionAuthResult<{
      accessToken: string;
      refreshToken: string;
      expiresAt: Date;
    }>
  > {
    const identity = await this.repository.authorize(sessionId);
    if (!identity) return { ok: false, code: "EXTENSION_AUTH_UNAUTHORIZED" };
    const refreshToken = generateRefreshToken();
    const expiresAt = new Date(this.now().getTime() + REFRESH_TOKEN_TTL_MS);
    if (
      !(await this.repository.createRefresh({
        sessionId,
        tokenHash: refreshTokenHash(this.keys, refreshToken),
        expiresAt,
      }))
    )
      return { ok: false, code: "SERVICE_UNAVAILABLE" };
    return {
      ok: true,
      value: {
        accessToken: await issueAccessToken(
          this.signingKey,
          identity,
          this.now(),
        ),
        refreshToken,
        expiresAt,
      },
    };
  }
  async authenticateAccess(
    accessToken: string,
  ): Promise<ExtensionAuthResult<AccessTokenIdentity>> {
    const claims = await verifyAccessToken(
      this.signingKey,
      accessToken,
      this.now(),
    );
    if (!claims) return { ok: false, code: "EXTENSION_AUTH_INVALID" };
    const active = await this.repository.authorize(claims.sessionId);
    if (
      !active ||
      active.deviceId !== claims.deviceId ||
      active.accountId !== claims.accountId
    )
      return { ok: false, code: "EXTENSION_AUTH_UNAUTHORIZED" };
    return { ok: true, value: active };
  }
  async refresh(
    refreshToken: string,
    idempotencyKey: string,
    correlationId: string,
    peerIp = "",
  ): Promise<
    ExtensionAuthResult<{
      accessToken: string;
      accessTokenExpiresAt: Date;
      refreshToken: string;
      expiresAt: Date;
      replay: boolean;
    }>
  > {
    if (
      !/^[A-Za-z0-9_-]{43}$/.test(refreshToken) ||
      !validRefreshIdempotencyKey(idempotencyKey)
    )
      return { ok: false, code: "EXTENSION_AUTH_INVALID" };
    const now = this.now(),
      expiresAt = new Date(now.getTime() + REFRESH_TOKEN_TTL_MS);
    const rate = await this.repository.consumeRefreshRate({
      keyHash: refreshRateKey(this.keys, peerIp),
      now,
      limit: 60,
      windowMs: 15 * 60_000,
    });
    if (!rate.allowed)
      return {
        ok: false,
        code: "EXTENSION_AUTH_RATE_LIMITED",
        ...(rate.retryAfterSeconds
          ? { retryAfterSeconds: rate.retryAfterSeconds }
          : {}),
      };
    const result = await this.repository.rotateRefresh({
      tokenHash: refreshTokenHash(this.keys, refreshToken),
      replacementHash: refreshTokenHash(
        this.keys,
        deriveReplacementRefreshToken(this.keys, refreshToken, idempotencyKey),
      ),
      idempotencyHash: refreshIdempotencyHash(this.keys, idempotencyKey),
      expiresAt,
      replayUntil: new Date(now.getTime() + REFRESH_REPLAY_WINDOW_MS),
      correlationId,
    });
    if (result === "invalid")
      return { ok: false, code: "EXTENSION_AUTH_INVALID" };
    if (result === "reuse") return { ok: false, code: "EXTENSION_AUTH_REUSE" };
    const identity = await this.repository.authorizeFromRefreshHash(
      refreshTokenHash(this.keys, refreshToken),
    );
    if (!identity) return { ok: false, code: "EXTENSION_AUTH_UNAUTHORIZED" };
    return {
      ok: true,
      value: {
        accessToken: await issueAccessToken(this.signingKey, identity, now),
        accessTokenExpiresAt: new Date(
          now.getTime() + ACCESS_TOKEN_TTL_SECONDS * 1000,
        ),
        refreshToken: deriveReplacementRefreshToken(
          this.keys,
          refreshToken,
          idempotencyKey,
        ),
        expiresAt,
        replay: result === "replay",
      },
    };
  }
}
