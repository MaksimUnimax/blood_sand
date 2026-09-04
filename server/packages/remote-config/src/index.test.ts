import { generateKeyPairSync, sign } from "node:crypto";
import { describe, expect, it } from "vitest";
import {
  BootstrapRequestV1Schema,
  BootstrapSnapshotPayloadV1Schema,
  type BootstrapSnapshotPayloadV1,
} from "@product/contracts";
import {
  BOOTSTRAP_SIGNATURE_DOMAIN,
  canonicalizeJson,
  configReleaseHashes,
  rolloutBucketV1,
  selectRolloutCandidateV1,
  signBootstrapSnapshot,
  verifyBootstrapEnvelope,
  type TrustedConfigSigningKeyRing,
} from "./index.js";

describe("P3.3 manifests and cohorts", () => {
  const ids = [
    "11111111-1111-4111-8111-111111111111",
    "22222222-2222-4222-8222-222222222222",
  ];
  it("normalizes manifest source ordering", () => {
    const base = {
      contractVersion: "control_plane_v1" as const,
      snapshotVersion: "bootstrap_snapshot_v1" as const,
      envelopeVersion: "bootstrap_envelope_v1" as const,
      signingKeyId: "config-current",
      compatibilityPolicyRevisionIds: ids,
      featureRuleRevisionIds: [],
      featureRolloutRevisionIds: [],
    };
    expect(configReleaseHashes(base)).toEqual(
      configReleaseHashes({
        ...base,
        compatibilityPolicyRevisionIds: [...ids].reverse(),
      }),
    );
    expect(configReleaseHashes(base).contentHashSha256).not.toBe(
      configReleaseHashes({ ...base, signingKeyId: "config-next" })
        .contentHashSha256,
    );
  });
  it("uses a stable bounded rollout bucket", () => {
    const value = {
      rolloutKey: "feature.example",
      cohortSeed: Buffer.alloc(32, 7),
      subjectKind: "ACCOUNT" as const,
      subjectId: "11111111-1111-4111-8111-111111111111",
    };
    expect(rolloutBucketV1(value)).toBe(rolloutBucketV1(value));
    expect(rolloutBucketV1(value)).toBeGreaterThanOrEqual(0);
    expect(rolloutBucketV1(value)).toBeLessThan(10000);
    expect(
      selectRolloutCandidateV1({ ...value, state: "ACTIVE", percentageBps: 0 }),
    ).toBe(false);
    expect(
      selectRolloutCandidateV1({
        ...value,
        state: "ACTIVE",
        percentageBps: 10000,
      }),
    ).toBe(true);
    expect(
      selectRolloutCandidateV1({
        ...value,
        state: "PAUSED",
        percentageBps: 10000,
      }),
    ).toBe(false);
  });
});

const payload: BootstrapSnapshotPayloadV1 = {
  snapshotVersion: "bootstrap_snapshot_v1",
  contractVersion: "control_plane_v1",
  configVersion: 1,
  issuedAt: "2026-09-04T00:00:00.000Z",
  expiresAt: "2026-09-04T00:05:00.000Z",
  offlineGraceUntil: "2026-09-04T00:10:00.000Z",
  serverTime: "2026-09-04T00:00:01.000Z",
  account: { status: "ACTIVE" },
  subscription: { state: "NONE", planRevision: null },
  devicePolicy: { status: "ACTIVE" },
  compatibility: {
    extension: { status: "SUPPORTED", minimumVersion: null },
    browser: { status: "SUPPORTED" },
  },
  entitlements: {},
  features: {},
  ai: { status: "UNCONFIGURED" },
};

function keyMaterial() {
  const config = generateKeyPairSync("ed25519");
  const previous = generateKeyPairSync("ed25519");
  const access = generateKeyPairSync("ed25519");
  const ring: TrustedConfigSigningKeyRing = new Map([
    ["config-old", previous.publicKey],
    ["config-current", config.publicKey],
  ]);
  return { config, previous, access, ring };
}

describe("canonicalizeJson", () => {
  it("sorts nested keys while preserving array ordering and Unicode", () => {
    const escaped = 'β"\\\n';
    expect(
      canonicalizeJson({
        z: ["β", 2, 1],
        a: { y: true, b: escaped },
      }).toString(),
    ).toBe(`{"a":{"b":${JSON.stringify(escaped)},"y":true},"z":["β",2,1]}`);
    expect(canonicalizeJson({ a: 1, b: 0, c: -2 }).toString()).toBe(
      '{"a":1,"b":0,"c":-2}',
    );
  });

  it("rejects values outside the narrow canonical JSON domain", () => {
    const custom = Object.create({ inherited: true });
    expect(() => canonicalizeJson(-0)).toThrow();
    expect(() => canonicalizeJson(1.5)).toThrow();
    expect(() => canonicalizeJson(Number.NaN)).toThrow();
    expect(() => canonicalizeJson(Infinity)).toThrow();
    expect(() => canonicalizeJson(1n)).toThrow();
    expect(() => canonicalizeJson(undefined)).toThrow();
    expect(() => canonicalizeJson(() => undefined)).toThrow();
    expect(() => canonicalizeJson(Symbol("invalid"))).toThrow();
    expect(() => canonicalizeJson(new Date())).toThrow();
    expect(() => canonicalizeJson(new Map())).toThrow();
    expect(() => canonicalizeJson(new Set())).toThrow();
    expect(() => canonicalizeJson(custom)).toThrow();
  });
});

describe("bootstrap V1 schemas", () => {
  it("enforces strict request fields and bounded SemVer/machine identifiers", () => {
    const request = {
      contractVersion: "control_plane_v1",
      extensionVersion: "1.2.3-beta.1+build.7",
      browser: { family: "chrome", version: "128.0.1" },
      deviceId: "9dbd5a3f-5ae6-42bd-b9c5-1da0bafdf1b6",
      lastConfigVersion: null,
      detectedAi: { family: "chatgpt", surface: "standard", variant: null },
    };
    expect(BootstrapRequestV1Schema.safeParse(request).success).toBe(true);
    expect(
      BootstrapRequestV1Schema.safeParse({ ...request, extra: true }).success,
    ).toBe(false);
    expect(
      BootstrapRequestV1Schema.safeParse({ ...request, extensionVersion: "v1" })
        .success,
    ).toBe(false);
    expect(
      BootstrapRequestV1Schema.safeParse({
        ...request,
        detectedAi: { family: "ChatGPT", surface: "standard" },
      }).success,
    ).toBe(false);
  });

  it("requires time ordering and the truthful pre-commercial baseline", () => {
    expect(BootstrapSnapshotPayloadV1Schema.safeParse(payload).success).toBe(
      true,
    );
    expect(
      BootstrapSnapshotPayloadV1Schema.safeParse({
        ...payload,
        expiresAt: payload.issuedAt,
      }).success,
    ).toBe(false);
    expect(
      BootstrapSnapshotPayloadV1Schema.safeParse({
        ...payload,
        ai: { status: "HEALTHY" },
      }).success,
    ).toBe(false);
  });
});

describe("signed bootstrap envelope", () => {
  it("signs and verifies a valid, canonical snapshot", () => {
    const { config, ring } = keyMaterial();
    const envelope = signBootstrapSnapshot(
      payload,
      "config-current",
      config.privateKey,
    );
    expect(verifyBootstrapEnvelope(envelope, ring)).toEqual({
      ok: true,
      payload,
    });
  });

  it("canonicalizes semantic objects independently of insertion order", () => {
    expect(canonicalizeJson({ z: { b: 2, a: 1 }, a: [2, 1] })).toEqual(
      canonicalizeJson({ a: [2, 1], z: { a: 1, b: 2 } }),
    );
  });

  it("changes its signature when its payload changes", () => {
    const { config } = keyMaterial();
    const first = signBootstrapSnapshot(
      payload,
      "config-current",
      config.privateKey,
    );
    const second = signBootstrapSnapshot(
      { ...payload, configVersion: 2 },
      "config-current",
      config.privateKey,
    );
    expect(second.signature).not.toBe(first.signature);
  });

  it("rejects payload and signature tampering", () => {
    const { config, ring } = keyMaterial();
    const envelope = signBootstrapSnapshot(
      payload,
      "config-current",
      config.privateKey,
    );
    expect(
      verifyBootstrapEnvelope(
        { ...envelope, payload: flipBase64Url(envelope.payload) },
        ring,
      ),
    ).toEqual({ ok: false, error: "INVALID_SIGNATURE" });
    expect(
      verifyBootstrapEnvelope(
        { ...envelope, signature: flipBase64Url(envelope.signature) },
        ring,
      ),
    ).toEqual({ ok: false, error: "INVALID_SIGNATURE" });
  });

  it("fails closed for wrong, unknown, or non-Ed25519 envelope keys", () => {
    const { config, previous, ring } = keyMaterial();
    const envelope = signBootstrapSnapshot(
      payload,
      "config-current",
      config.privateKey,
    );
    expect(
      verifyBootstrapEnvelope(
        envelope,
        new Map([["config-current", previous.publicKey]]),
      ),
    ).toEqual({ ok: false, error: "INVALID_SIGNATURE" });
    expect(
      verifyBootstrapEnvelope({ ...envelope, keyId: "unknown-key" }, ring),
    ).toEqual({ ok: false, error: "UNKNOWN_SIGNING_KEY" });
    expect(
      verifyBootstrapEnvelope({ ...envelope, algorithm: "ES256" }, ring),
    ).toEqual({ ok: false, error: "UNSUPPORTED_ALGORITHM" });
  });

  it("rejects malformed encodings and signed invalid JSON/schema", () => {
    const { config, ring } = keyMaterial();
    const envelope = signBootstrapSnapshot(
      payload,
      "config-current",
      config.privateKey,
    );
    expect(
      verifyBootstrapEnvelope({ ...envelope, payload: "not+base64url" }, ring),
    ).toEqual({ ok: false, error: "INVALID_PAYLOAD_ENCODING" });
    const malformedJson = signedRaw("{", "config-current", config.privateKey);
    expect(verifyBootstrapEnvelope(malformedJson, ring)).toEqual({
      ok: false,
      error: "INVALID_PAYLOAD_JSON",
    });
    const invalidSchema = signedRaw(
      '{"snapshotVersion":"bootstrap_snapshot_v1"}',
      "config-current",
      config.privateKey,
    );
    expect(verifyBootstrapEnvelope(invalidSchema, ring)).toEqual({
      ok: false,
      error: "INVALID_PAYLOAD_SCHEMA",
    });
  });

  it("rejects a signed but non-canonical JSON payload", () => {
    const { config, ring } = keyMaterial();
    const nonCanonical = JSON.stringify(
      { ...payload, entitlements: {}, features: {} },
      null,
      2,
    );
    expect(
      verifyBootstrapEnvelope(
        signedRaw(nonCanonical, "config-current", config.privateKey),
        ring,
      ),
    ).toEqual({ ok: false, error: "NON_CANONICAL_PAYLOAD" });
  });

  it("supports overlapping config keys, but never an access-token key", () => {
    const { config, previous, access, ring } = keyMaterial();
    expect(
      verifyBootstrapEnvelope(
        signBootstrapSnapshot(payload, "config-old", previous.privateKey),
        ring,
      ).ok,
    ).toBe(true);
    expect(
      verifyBootstrapEnvelope(
        signBootstrapSnapshot(payload, "config-current", config.privateKey),
        ring,
      ).ok,
    ).toBe(true);
    const configEnvelope = signBootstrapSnapshot(
      payload,
      "config-current",
      config.privateKey,
    );
    expect(
      verifyBootstrapEnvelope(
        configEnvelope,
        new Map([["config-current", access.publicKey]]),
      ),
    ).toEqual({ ok: false, error: "INVALID_SIGNATURE" });
  });
});

function signedRaw(
  rawPayload: string,
  keyId: string,
  privateKey: ReturnType<typeof generateKeyPairSync>["privateKey"],
) {
  const payloadBytes = Buffer.from(rawPayload, "utf8");
  const bytes = Buffer.concat([
    BOOTSTRAP_SIGNATURE_DOMAIN,
    Buffer.from(keyId),
    Buffer.from([0]),
    payloadBytes,
  ]);
  return {
    envelopeVersion: "bootstrap_envelope_v1",
    algorithm: "Ed25519",
    keyId,
    payload: payloadBytes.toString("base64url"),
    signature: sign(null, bytes, privateKey).toString("base64url"),
  };
}

function flipBase64Url(value: string): string {
  return `${value.startsWith("A") ? "B" : "A"}${value.slice(1)}`;
}
