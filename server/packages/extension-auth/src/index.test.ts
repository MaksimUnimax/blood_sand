import { generateKeyPairSync } from "node:crypto";
import { describe, expect, it, vi } from "vitest";
import {
  ACCESS_TOKEN_TTL_SECONDS,
  ExtensionAuthService,
  createEphemeralAccessTokenSigningKey,
  REFRESH_REPLAY_WINDOW_MS,
  REFRESH_TOKEN_TTL_MS,
  deriveExtensionAuthKeys,
  deriveReplacementRefreshToken,
  generateRefreshToken,
  issueAccessToken,
  loadAccessTokenSigningKey,
  refreshIdempotencyHash,
  refreshTokenHash,
  validRefreshIdempotencyKey,
  verifyAccessToken,
  type ExtensionAuthRepository,
} from "./index.js";

const keys = deriveExtensionAuthKeys(Buffer.alloc(32, 41));
const identity = {
  sessionId: "session-1",
  deviceId: "device-1",
  accountId: "account-1",
};
const now = new Date("2026-09-03T12:00:00.000Z");
const signingKey = createEphemeralAccessTokenSigningKey("test-key-1");
function repository(
  overrides: Partial<ExtensionAuthRepository> = {},
): ExtensionAuthRepository {
  return {
    consumeRefreshRate: vi.fn().mockResolvedValue({ allowed: true }),
    authorize: vi.fn().mockResolvedValue(identity),
    authorizeFromRefreshHash: vi.fn().mockResolvedValue(identity),
    createRefresh: vi.fn().mockResolvedValue(true),
    rotateRefresh: vi.fn().mockResolvedValue("rotated"),
    ...overrides,
  };
}

describe("extension token core", () => {
  it("T1 uses a 15-minute EdDSA JWT with exactly the minimal claims", async () => {
    const token = await issueAccessToken(signingKey, identity, now);
    const payload = JSON.parse(
      Buffer.from(token.split(".")[1]!, "base64url").toString("utf8"),
    );
    expect(payload).toEqual({
      iss: "product-control-plane",
      aud: "product-extension",
      sub: "session-1",
      did: "device-1",
      aid: "account-1",
      ver: 1,
      iat: 1788436800,
      exp: 1788436800 + ACCESS_TOKEN_TTL_SECONDS,
    });
    expect(await verifyAccessToken(signingKey, token, now)).toEqual({
      ...identity,
      version: 1,
      issuedAt: payload.iat,
      expiresAt: payload.exp,
    });
    expect(
      await verifyAccessToken(
        signingKey,
        token,
        new Date(now.getTime() + (ACCESS_TOKEN_TTL_SECONDS + 31) * 1000),
      ),
    ).toBeUndefined();
    const [header] = token.split(".");
    expect(
      JSON.parse(Buffer.from(header!, "base64url").toString("utf8")),
    ).toEqual({ alg: "EdDSA", typ: "JWT", kid: "test-key-1" });
  });

  it("T1 authorizes a valid signature against live session, device, and account state", async () => {
    const token = await issueAccessToken(signingKey, identity, now);
    expect(
      await new ExtensionAuthService(
        repository(),
        keys,
        () => now,
        signingKey,
      ).authenticateAccess(token),
    ).toEqual({ ok: true, value: identity });
    expect(
      await new ExtensionAuthService(
        repository({ authorize: vi.fn().mockResolvedValue(undefined) }),
        keys,
        () => now,
        signingKey,
      ).authenticateAccess(token),
    ).toEqual({ ok: false, code: "EXTENSION_AUTH_UNAUTHORIZED" });
  });

  it("T1 requires canonical opaque 32-byte refresh tokens and separated HMAC artifacts", () => {
    const token = generateRefreshToken(Buffer.alloc(32, 7));
    expect(token).toBe(Buffer.alloc(32, 7).toString("base64url"));
    expect(token).toMatch(/^[A-Za-z0-9_-]{43}$/);
    expect(() => generateRefreshToken(Buffer.alloc(31))).toThrow("32 bytes");
    expect(refreshTokenHash(keys, token)).not.toContain(token);
    expect(refreshTokenHash(keys, token)).not.toBe(
      refreshIdempotencyHash(keys, token),
    );
    expect(validRefreshIdempotencyKey("I".repeat(16))).toBe(true);
    expect(validRefreshIdempotencyKey("short")).toBe(false);
  });

  it("T1 derives a stable replacement only for the same token and idempotency request", () => {
    const old = generateRefreshToken(Buffer.alloc(32, 8));
    const one = deriveReplacementRefreshToken(keys, old, "A".repeat(16));
    expect(one).toMatch(/^[A-Za-z0-9_-]{43}$/);
    expect(deriveReplacementRefreshToken(keys, old, "A".repeat(16))).toBe(one);
    expect(deriveReplacementRefreshToken(keys, old, "B".repeat(16))).not.toBe(
      one,
    );
    expect(
      deriveReplacementRefreshToken(
        keys,
        generateRefreshToken(Buffer.alloc(32, 9)),
        "A".repeat(16),
      ),
    ).not.toBe(one);
  });

  it("T1 freezes 30-day sliding refresh and two-minute replay policy", () => {
    expect(REFRESH_TOKEN_TTL_MS).toBe(30 * 24 * 60 * 60_000);
    expect(REFRESH_REPLAY_WINDOW_MS).toBe(120_000);
  });

  it("T2 gives a same-idempotency retry its deterministic replacement, never a reuse result", async () => {
    const old = generateRefreshToken(Buffer.alloc(32, 3));
    const repo = repository({
      rotateRefresh: vi.fn().mockResolvedValue("replay"),
    });
    const result = await new ExtensionAuthService(
      repo,
      keys,
      () => now,
      signingKey,
    ).refresh(old, "R".repeat(16), "corr", "127.0.0.1");
    expect(result).toMatchObject({
      ok: true,
      value: {
        replay: true,
        refreshToken: deriveReplacementRefreshToken(keys, old, "R".repeat(16)),
      },
    });
    expect(repo.rotateRefresh).toHaveBeenCalledWith(
      expect.objectContaining({
        replayUntil: new Date(now.getTime() + REFRESH_REPLAY_WINDOW_MS),
      }),
    );
  });

  it("T2 maps invalid/reuse and inactive family outcomes fail-closed", async () => {
    const old = generateRefreshToken(Buffer.alloc(32, 4));
    expect(
      await new ExtensionAuthService(
        repository(),
        keys,
        () => now,
        signingKey,
      ).refresh("bad", "R".repeat(16), "c", "127.0.0.1"),
    ).toEqual({ ok: false, code: "EXTENSION_AUTH_INVALID" });
    expect(
      await new ExtensionAuthService(
        repository({ rotateRefresh: vi.fn().mockResolvedValue("reuse") }),
        keys,
        () => now,
        signingKey,
      ).refresh(old, "R".repeat(16), "c", "127.0.0.1"),
    ).toEqual({ ok: false, code: "EXTENSION_AUTH_REUSE" });
    expect(
      await new ExtensionAuthService(
        repository({
          authorizeFromRefreshHash: vi.fn().mockResolvedValue(undefined),
        }),
        keys,
        () => now,
        signingKey,
      ).refresh(old, "R".repeat(16), "c", "127.0.0.1"),
    ).toEqual({ ok: false, code: "EXTENSION_AUTH_UNAUTHORIZED" });
  });

  it("T1 loads configured Ed25519 PKCS#8 keys, and rejects malformed config", async () => {
    const pem = signingKey.privateKey
      .export({ type: "pkcs8", format: "pem" })
      .toString();
    const environment = {
      ACCESS_TOKEN_SIGNING_PRIVATE_KEY_PEM_B64:
        Buffer.from(pem).toString("base64"),
      ACCESS_TOKEN_SIGNING_KEY_ID: "test-key-1",
    };
    const loaded = loadAccessTokenSigningKey(environment);
    const token = await issueAccessToken(loaded, identity, now);
    expect(await verifyAccessToken(loaded, token, now)).toBeDefined();
    const wrongKidToken = await issueAccessToken(
      { ...loaded, keyId: "other-key" },
      identity,
      now,
    );
    expect(await verifyAccessToken(loaded, wrongKidToken, now)).toBeUndefined();
    expect(() =>
      loadAccessTokenSigningKey({
        ...environment,
        ACCESS_TOKEN_SIGNING_PRIVATE_KEY_PEM_B64: "%%%",
      }),
    ).toThrow();
    expect(() =>
      loadAccessTokenSigningKey({
        ...environment,
        ACCESS_TOKEN_SIGNING_PRIVATE_KEY_PEM_B64:
          Buffer.from("bad pem").toString("base64"),
      }),
    ).toThrow();
    expect(() =>
      loadAccessTokenSigningKey({
        ...environment,
        ACCESS_TOKEN_SIGNING_KEY_ID: "!",
      }),
    ).toThrow();
    expect(() =>
      loadAccessTokenSigningKey({
        ...environment,
        ACCESS_TOKEN_SIGNING_KEY_ID: "a".repeat(65),
      }),
    ).toThrow();
    const rsa = generateKeyPairSync("rsa", { modulusLength: 2048 }).privateKey;
    const ec = generateKeyPairSync("ec", {
      namedCurve: "prime256v1",
    }).privateKey;
    for (const privateKey of [rsa, ec])
      expect(() =>
        loadAccessTokenSigningKey({
          ...environment,
          ACCESS_TOKEN_SIGNING_PRIVATE_KEY_PEM_B64: Buffer.from(
            privateKey.export({ type: "pkcs8", format: "pem" }),
          ).toString("base64"),
        }),
      ).toThrow();
  });
});
