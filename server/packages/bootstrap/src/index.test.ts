import { generateKeyPairSync } from "node:crypto";
import { describe, expect, it } from "vitest";
import { verifyBootstrapEnvelope } from "@product/remote-config";
import { signBootstrapSnapshot } from "@product/remote-config";
import { BootstrapError, BootstrapService } from "./index.js";

const subject = {
  accountId: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
  deviceId: "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb",
};
const request = {
  contractVersion: "control_plane_v1" as const,
  extensionVersion: "1.2.3",
  browser: { family: "chrome" as const, version: "120" },
  deviceId: subject.deviceId,
  lastConfigVersion: null,
  detectedAi: { family: "alpha", surface: "page" },
};
const policy = {
  resolve: async (_input: unknown) => ({
    configVersion: 7,
    signingKeyId: "config-key",
    sourceFingerprintSha256: "a".repeat(64),
    compatibility: {
      extension: {
        status: "UPDATE_REQUIRED" as const,
        minimumVersion: "2.0.0",
      },
      browser: { status: "SUPPORTED" as const },
    },
    features: { feature_alpha: true },
  }),
};
describe("BootstrapService", () => {
  it("composes and signs a complete fixed-time snapshot", async () => {
    const pair = generateKeyPairSync("ed25519");
    let reads = 0;
    const service = new BootstrapService(
      policy,
      {
        keyId: "config-key",
        sign: (payload) =>
          signBootstrapSnapshot(payload, "config-key", pair.privateKey),
      },
      {
        now: () => {
          reads++;
          return new Date("2026-01-01T00:00:00.000Z");
        },
      },
    );
    const envelope = await service.issue(subject, request);
    const verified = verifyBootstrapEnvelope(
      envelope,
      new Map([["config-key", pair.publicKey]]),
    );
    expect(verified).toMatchObject({ ok: true });
    if (verified.ok)
      expect(verified.payload).toMatchObject({
        configVersion: 7,
        serverTime: "2026-01-01T00:00:00.000Z",
        issuedAt: "2026-01-01T00:00:00.000Z",
        expiresAt: "2026-01-01T00:15:00.000Z",
        offlineGraceUntil: "2026-01-02T00:15:00.000Z",
        subscription: { state: "NONE", planRevision: null },
        devicePolicy: { status: "ACTIVE" },
        entitlements: {},
        features: { feature_alpha: true },
        ai: { status: "UNCONFIGURED" },
      });
    expect(reads).toBe(1);
  });
  it("rejects device mismatch before policy", async () => {
    let called = false;
    const pair = generateKeyPairSync("ed25519");
    const service = new BootstrapService(
      {
        resolve: async () => {
          called = true;
          return policy.resolve({});
        },
      },
      {
        keyId: "config-key",
        sign: (p) => signBootstrapSnapshot(p, "config-key", pair.privateKey),
      },
    );
    await expect(
      service.issue(subject, {
        ...request,
        deviceId: "cccccccc-cccc-4ccc-8ccc-cccccccccccc",
      }),
    ).rejects.toMatchObject({
      code: "DEVICE_MISMATCH",
    } satisfies Partial<BootstrapError>);
    expect(called).toBe(false);
  });
  it("forwards only the authenticated subject and ignores client freshness and AI hints", async () => {
    const pair = generateKeyPairSync("ed25519");
    const inputs: unknown[] = [];
    const service = new BootstrapService(
      { resolve: async (input) => (inputs.push(input), policy.resolve({})) },
      {
        keyId: "config-key",
        sign: (p) => signBootstrapSnapshot(p, "config-key", pair.privateKey),
      },
      { now: () => new Date("2026-01-01T00:00:00.000Z") },
    );
    const first = await service.issue(subject, {
      ...request,
      lastConfigVersion: null,
      detectedAi: { family: "one", surface: "page" },
    });
    const second = await service.issue(subject, {
      ...request,
      lastConfigVersion: 999,
      detectedAi: { family: "two", surface: "popup", variant: "x" },
    });
    const keys = new Map([["config-key", pair.publicKey]]);
    const a = verifyBootstrapEnvelope(first, keys);
    const b = verifyBootstrapEnvelope(second, keys);
    expect(inputs).toEqual([
      {
        contractVersion: "control_plane_v1",
        extensionVersion: "1.2.3",
        browser: { family: "chrome", version: "120" },
        accountId: subject.accountId,
        deviceId: subject.deviceId,
      },
      {
        contractVersion: "control_plane_v1",
        extensionVersion: "1.2.3",
        browser: { family: "chrome", version: "120" },
        accountId: subject.accountId,
        deviceId: subject.deviceId,
      },
    ]);
    expect(a).toMatchObject({ ok: true });
    expect(b).toMatchObject({ ok: true });
    if (a.ok && b.ok) expect(a.payload).toEqual(b.payload);
  });
  it("fails closed when the resolved configuration selects another signer", async () => {
    const pair = generateKeyPairSync("ed25519");
    const service = new BootstrapService(
      {
        resolve: async () => ({
          ...(await policy.resolve({})),
          signingKeyId: "different",
        }),
      },
      {
        keyId: "config-key",
        sign: (p) => signBootstrapSnapshot(p, "config-key", pair.privateKey),
      },
    );
    await expect(service.issue(subject, request)).rejects.toMatchObject({
      code: "UNAVAILABLE",
    });
  });
});
