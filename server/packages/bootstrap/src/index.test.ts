import { generateKeyPairSync } from "node:crypto";
import { describe, expect, it } from "vitest";
import { verifyBootstrapEnvelope } from "@product/remote-config";
import { signBootstrapSnapshot } from "@product/remote-config";
import { BootstrapError, BootstrapService } from "./index.js";
import type { CommercialAccessResolution } from "@product/commercial-access";

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
  function signedService(
    commercial: CommercialAccessResolution,
    now = "2026-01-01T00:00:00.000Z",
  ) {
    const pair = generateKeyPairSync("ed25519");
    return {
      pair,
      service: new BootstrapService(
        policy,
        {
          sign: async (_keyId, payload) =>
            signBootstrapSnapshot(payload, "config-key", pair.privateKey),
        },
        { now: () => new Date(now) },
        { resolve: async () => commercial },
      ),
    };
  }
  const commercialSubscription = {
    id: subject.accountId,
    accountId: subject.accountId,
    state: "ACTIVE" as const,
    stateRevision: 2,
    currentPlanRevisionId: "cccccccc-cccc-4ccc-8ccc-cccccccccccc",
    boundPriceRevisionId: null,
    startedAt: new Date("2025-12-01T00:00:00.000Z"),
    currentPeriodStart: new Date("2026-01-01T00:00:00.000Z"),
    currentPeriodEnd: new Date("2026-01-01T01:00:00.000Z"),
    graceUntil: null,
    cancelAtPeriodEnd: false,
    canceledAt: null,
    suspendedAt: null,
    createdAt: new Date("2025-12-01T00:00:00.000Z"),
    updatedAt: new Date("2026-01-01T00:00:00.000Z"),
  };
  function eligibleCommercial(
    accessUntil = commercialSubscription.currentPeriodEnd,
  ): CommercialAccessResolution {
    return {
      kind: "OK",
      value: {
        accountId: subject.accountId,
        currentSubscription: commercialSubscription,
        access: {
          kind: "ELIGIBLE",
          subscriptionId: commercialSubscription.id,
          state: "ACTIVE",
          stateRevision: 2,
          planRevisionId: commercialSubscription.currentPlanRevisionId,
          boundPriceRevisionId: null,
          currentPeriodEnd: commercialSubscription.currentPeriodEnd,
          graceUntil: null,
        },
        planRevisionId: commercialSubscription.currentPlanRevisionId,
        entitlements: { "source.ozon": true, "device.max_active": 0 },
        accessUntil,
      },
    };
  }

  it("projects the actual subscription and exact UUID into a signed snapshot", async () => {
    const f = signedService(eligibleCommercial());
    const envelope = await f.service.issue(subject, request);
    const verified = verifyBootstrapEnvelope(
      envelope,
      new Map([["config-key", f.pair.publicKey]]),
    );
    expect(verified).toMatchObject({ ok: true });
    if (verified.ok) {
      expect(verified.payload.subscription).toEqual({
        state: "ACTIVE",
        planRevision: commercialSubscription.currentPlanRevisionId,
      });
      expect(verified.payload.entitlements).toEqual({
        "source.ozon": true,
        "device.max_active": 0,
      });
    }
  });
  it("caps offline grace at the subscription access deadline", async () => {
    const f = signedService(eligibleCommercial());
    const envelope = await f.service.issue(subject, request);
    const verified = verifyBootstrapEnvelope(
      envelope,
      new Map([["config-key", f.pair.publicKey]]),
    );
    if (verified.ok) {
      expect(verified.payload.expiresAt).toBe("2026-01-01T00:15:00.000Z");
      expect(verified.payload.offlineGraceUntil).toBe(
        "2026-01-01T01:00:00.000Z",
      );
    }
  });
  it("caps grace-state snapshots at graceUntil", async () => {
    const deadline = new Date("2026-01-01T00:20:00.000Z");
    const value = eligibleCommercial(deadline);
    if (value.kind === "OK") {
      value.value.currentSubscription = {
        ...commercialSubscription,
        state: "GRACE",
        graceUntil: deadline,
      };
      value.value.access = {
        kind: "ELIGIBLE",
        subscriptionId: commercialSubscription.id,
        state: "GRACE",
        stateRevision: 2,
        planRevisionId: commercialSubscription.currentPlanRevisionId,
        boundPriceRevisionId: null,
        currentPeriodEnd: commercialSubscription.currentPeriodEnd,
        graceUntil: deadline,
      };
    }
    const f = signedService(value);
    const verified = verifyBootstrapEnvelope(
      await f.service.issue(subject, request),
      new Map([["config-key", f.pair.publicKey]]),
    );
    if (verified.ok)
      expect(verified.payload.offlineGraceUntil).toBe(deadline.toISOString());
  });
  it("fails closed when only one millisecond remains for the signed interval", async () => {
    const deadline = new Date("2026-01-01T00:00:00.001Z");
    await expect(
      signedService(eligibleCommercial(deadline)).service.issue(
        subject,
        request,
      ),
    ).rejects.toMatchObject({ code: "UNAVAILABLE" });
  });
  it("reports stored ineligible state but never projects its entitlements", async () => {
    const ineligible: CommercialAccessResolution = {
      kind: "OK",
      value: {
        accountId: subject.accountId,
        currentSubscription: { ...commercialSubscription, state: "PAST_DUE" },
        access: { kind: "INELIGIBLE", reason: "PAST_DUE" },
        planRevisionId: null,
        entitlements: { should: true },
        accessUntil: null,
      },
    };
    const f = signedService(ineligible);
    const verified = verifyBootstrapEnvelope(
      await f.service.issue(subject, request),
      new Map([["config-key", f.pair.publicKey]]),
    );
    if (verified.ok) {
      expect(verified.payload.subscription).toEqual({
        state: "PAST_DUE",
        planRevision: commercialSubscription.currentPlanRevisionId,
      });
      expect(verified.payload.entitlements).toEqual({});
    }
  });
  it("composes and signs a complete fixed-time snapshot", async () => {
    const pair = generateKeyPairSync("ed25519");
    let reads = 0;
    const service = new BootstrapService(
      policy,
      {
        sign: async (_keyId, payload) =>
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
        sign: async (_keyId, p) =>
          signBootstrapSnapshot(p, "config-key", pair.privateKey),
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
        sign: async (_keyId, p) =>
          signBootstrapSnapshot(p, "config-key", pair.privateKey),
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
        sign: async (_keyId, p) =>
          signBootstrapSnapshot(p, "config-key", pair.privateKey),
      },
    );
    await expect(service.issue(subject, request)).rejects.toMatchObject({
      code: "UNAVAILABLE",
    });
  });
});
