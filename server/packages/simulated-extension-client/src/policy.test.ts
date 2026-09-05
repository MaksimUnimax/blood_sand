import { generateKeyPairSync } from "node:crypto";
import { describe, expect, it } from "vitest";
import { signBootstrapSnapshot } from "@product/remote-config";
import type { BootstrapSnapshotPayloadV1 } from "@product/contracts";
import {
  InMemoryBootstrapSnapshotStore,
  normalizeDetectedAi,
  normalizeRequestContext,
  resolveClientCompatibility,
  SimulatedExtensionClient,
  type BootstrapCacheRecord,
  type BootstrapSnapshotStore,
  type ClientClock,
} from "./index.js";

const DEVICE_ID = "123e4567-e89b-42d3-a456-426614174000";
const SESSION_ID = "123e4567-e89b-42d3-a456-426614174001";
const TEST_KEY = generateKeyPairSync("ed25519");
const REQUEST = {
  contractVersion: "control_plane_v1" as const,
  extensionVersion: "1.0.0",
  browser: { family: "chrome" as const, version: "123" },
};

function payload(
  changes: Partial<BootstrapSnapshotPayloadV1> = {},
): BootstrapSnapshotPayloadV1 {
  return {
    snapshotVersion: "bootstrap_snapshot_v1",
    contractVersion: "control_plane_v1",
    configVersion: 20,
    issuedAt: "2026-01-01T00:00:00.000Z",
    expiresAt: "2026-01-01T00:05:00.000Z",
    offlineGraceUntil: "2026-01-01T00:10:00.000Z",
    serverTime: "2026-01-01T00:00:00.000Z",
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
    ...changes,
  };
}

class TestStore implements BootstrapSnapshotStore {
  value?: BootstrapCacheRecord;
  saves = 0;
  removes = 0;
  failSave = false;
  failLoad = false;

  async load(): Promise<unknown> {
    if (this.failLoad) throw new Error("storage unavailable");
    return this.value ? structuredClone(this.value) : undefined;
  }

  async save(
    _key: Parameters<BootstrapSnapshotStore["save"]>[0],
    record: BootstrapCacheRecord,
  ): Promise<void> {
    this.saves++;
    if (this.failSave) throw new Error("storage unavailable");
    this.value = structuredClone(record);
  }

  async remove(): Promise<void> {
    this.removes++;
    this.value = undefined;
  }
}

function activated(
  input: {
    payloads?: BootstrapSnapshotPayloadV1[];
    clock?: ClientClock;
    store?: BootstrapSnapshotStore;
    fetch?: typeof fetch;
    online?: { value: boolean };
  } = {},
) {
  const key = TEST_KEY;
  const payloads = [...(input.payloads ?? [payload()])];
  const requests: unknown[] = [];
  const fetcher =
    input.fetch ??
    (async (_url: string | URL | Request, init?: RequestInit) => {
      if (input.online && !input.online.value) throw new TypeError("offline");
      requests.push(JSON.parse(String(init?.body)));
      const next = payloads.shift() ?? payload();
      return new Response(
        JSON.stringify(signBootstrapSnapshot(next, "k1", key.privateKey)),
        { status: 200 },
      );
    });
  const client = new SimulatedExtensionClient({
    controlPlaneApiOrigin: "https://api.test",
    portalOrigin: "https://portal.test",
    trustedConfigSigningKeys: new Map([["k1", key.publicKey]]),
    fetch: fetcher,
    clock: input.clock ?? deterministicClock().clock,
    snapshotStore: input.store,
  });
  (client as unknown as { credentials: object }).credentials = {
    deviceId: DEVICE_ID,
    sessionId: SESSION_ID,
    accessToken: "access",
    accessTokenExpiresAt: "2026-01-01T00:01:00.000Z",
    refreshToken: "refresh",
    refreshTokenExpiresAt: "2026-01-01T00:01:00.000Z",
  };
  return { client, key, requests };
}

function deterministicClock(): {
  clock: ClientClock;
  set: (wall: number, mono: number) => void;
} {
  let wall = Date.parse("2026-01-01T00:00:00.000Z");
  let mono = 0;
  return {
    clock: {
      wallNow: () => new Date(wall),
      monotonicNowMs: () => mono,
    },
    set: (nextWall, nextMono) => {
      wall = nextWall;
      mono = nextMono;
    },
  };
}

describe("P3.6 cache and policy", () => {
  it("normalizes absent, null, and omitted AI variants", () => {
    expect(normalizeDetectedAi(undefined)).toBeNull();
    expect(normalizeDetectedAi(null)).toBeNull();
    expect(normalizeDetectedAi({ family: "chat", surface: "page" })).toEqual({
      family: "chat",
      surface: "page",
      variant: null,
    });
    expect(
      normalizeRequestContext({
        ...REQUEST,
        detectedAi: { family: "chat", surface: "page" },
      }),
    ).toEqual({
      ...REQUEST,
      detectedAi: { family: "chat", surface: "page", variant: null },
    });
  });

  it("stores the exact signed envelope and sends lastConfigVersion only from it", async () => {
    const store = new TestStore();
    const first = activated({ store });
    const live = await first.client.bootstrapWithPolicy(REQUEST);
    expect(live).toMatchObject({
      kind: "READY",
      source: "LIVE",
      freshness: "FRESH",
    });
    expect(store.value?.envelope).toEqual(
      signBootstrapSnapshot(payload(), "k1", first.key.privateKey),
    );
    const nextLive = activated({ store });
    await nextLive.client.bootstrapWithPolicy(REQUEST);
    expect(nextLive.requests[0]).toMatchObject({ lastConfigVersion: 20 });
    const offline = activated({
      store,
      fetch: async () => {
        throw new TypeError("offline");
      },
    });
    expect(await offline.client.bootstrapWithPolicy(REQUEST)).toMatchObject({
      kind: "READY",
      source: "CACHE",
    });
  });

  it("requires activation before any cached use", async () => {
    const store = new TestStore();
    const client = new SimulatedExtensionClient({
      controlPlaneApiOrigin: "https://api.test",
      portalOrigin: "https://portal.test",
      snapshotStore: store,
    });
    expect(await client.bootstrapWithPolicy(REQUEST)).toEqual({
      kind: "UNAVAILABLE",
      reason: "NOT_AUTHORIZED",
    });
  });

  it("classifies exact expiry and grace boundaries", async () => {
    const time = deterministicClock();
    const store = new TestStore();
    const first = activated({ store, clock: time.clock });
    await first.client.bootstrapWithPolicy(REQUEST);
    const offline = activated({
      store,
      clock: time.clock,
      fetch: async () => {
        throw new TypeError("offline");
      },
    });
    const expires = Date.parse(payload().expiresAt);
    const graceEnd = Date.parse(payload().offlineGraceUntil);
    time.set(expires - 1, 1);
    expect(await offline.client.bootstrapWithPolicy(REQUEST)).toMatchObject({
      freshness: "FRESH",
    });
    time.set(expires, 2);
    expect(await offline.client.bootstrapWithPolicy(REQUEST)).toMatchObject({
      freshness: "OFFLINE_GRACE",
    });
    time.set(graceEnd - 1, 3);
    expect(await offline.client.bootstrapWithPolicy(REQUEST)).toMatchObject({
      freshness: "OFFLINE_GRACE",
    });
    time.set(graceEnd, 4);
    expect(await offline.client.bootstrapWithPolicy(REQUEST)).toEqual({
      kind: "UNAVAILABLE",
      reason: "CACHE_EXPIRED",
    });
  });

  it("uses monotonic progression when the wall clock rolls back", async () => {
    const time = deterministicClock();
    const store = new TestStore();
    const first = activated({ store, clock: time.clock });
    await first.client.bootstrapWithPolicy(REQUEST);
    const offline = activated({
      store,
      clock: time.clock,
      fetch: async () => {
        throw new TypeError("offline");
      },
    });
    time.set(Date.parse("2025-12-31T23:00:00.000Z"), 60_000);
    expect(await offline.client.bootstrapWithPolicy(REQUEST)).toMatchObject({
      kind: "READY",
      source: "CACHE",
      freshness: "FRESH",
    });
  });

  it("fails cached use closed when the active monotonic clock rolls back", async () => {
    const time = deterministicClock();
    const store = new TestStore();
    const online = { value: true };
    const first = activated({ store, clock: time.clock, online });
    await first.client.bootstrapWithPolicy(REQUEST);
    time.set(Date.parse("2026-01-01T00:01:00.000Z"), 10);
    online.value = false;
    expect(await first.client.bootstrapWithPolicy(REQUEST)).toMatchObject({
      kind: "READY",
      source: "CACHE",
    });
    time.set(Date.parse("2026-01-01T00:01:00.000Z"), 5);
    expect(
      await first.client.bootstrapWithPolicy({ ...REQUEST }),
    ).toMatchObject({ kind: "UNAVAILABLE", reason: "CLOCK_UNSAFE" });
  });

  it("rejects signed server-time replay but permits a lower config version with newer time", async () => {
    const time = deterministicClock();
    const store = new TestStore();
    const newerTime = payload({
      configVersion: 19,
      serverTime: "2026-01-01T00:00:01.000Z",
      issuedAt: "2026-01-01T00:00:01.000Z",
    });
    const olderTime = payload({
      configVersion: 21,
      serverTime: "2026-01-01T00:00:00.500Z",
    });
    const sequence = activated({
      store,
      clock: time.clock,
      payloads: [payload(), newerTime, olderTime],
    });
    expect((await sequence.client.bootstrapWithPolicy(REQUEST)).kind).toBe(
      "READY",
    );
    expect((await sequence.client.bootstrapWithPolicy(REQUEST)).kind).toBe(
      "READY",
    );
    expect(sequence.requests[1]).toMatchObject({ lastConfigVersion: 20 });
    expect(await sequence.client.bootstrapWithPolicy(REQUEST)).toEqual({
      kind: "UNAVAILABLE",
      reason: "SERVER_TIME_ROLLBACK",
    });
    expect(store.value?.envelope).toEqual(
      signBootstrapSnapshot(newerTime, "k1", sequence.key.privateKey),
    );
  });

  it.each([
    [
      "tampered payload",
      (record: BootstrapCacheRecord) => {
        record.envelope.payload = record.envelope.payload.slice(0, -1) + "A";
      },
    ],
    [
      "tampered signature",
      (record: BootstrapCacheRecord) => {
        record.envelope.signature = "A" + record.envelope.signature.slice(1);
      },
    ],
    [
      "unknown key",
      (record: BootstrapCacheRecord) => {
        record.envelope.keyId = "unknown-key";
      },
    ],
    [
      "mismatching device",
      (record: BootstrapCacheRecord) => {
        record.deviceId = "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa";
      },
    ],
    [
      "mismatching origin",
      (record: BootstrapCacheRecord) => {
        record.controlPlaneApiOrigin = "https://other.test";
      },
    ],
    [
      "mismatching extension context",
      (record: BootstrapCacheRecord) => {
        record.requestContext.extensionVersion = "2.0.0";
      },
    ],
    [
      "mismatching browser context",
      (record: BootstrapCacheRecord) => {
        record.requestContext.browser.family = "yandex_chromium";
      },
    ],
    [
      "mismatching AI context",
      (record: BootstrapCacheRecord) => {
        record.requestContext.detectedAi = {
          family: "other",
          surface: "page",
          variant: null,
        };
      },
    ],
    [
      "unknown local field",
      (record: BootstrapCacheRecord) => {
        (record as BootstrapCacheRecord & { extra: boolean }).extra = true;
      },
    ],
  ])("fails closed for %s cache records", async (_name, tamper) => {
    const store = new TestStore();
    const first = activated({ store });
    await first.client.bootstrapWithPolicy(REQUEST);
    tamper(store.value!);
    const offline = activated({
      store,
      fetch: async () => {
        throw new TypeError("offline");
      },
    });
    expect(await offline.client.bootstrapWithPolicy(REQUEST)).toMatchObject({
      kind: "UNAVAILABLE",
      reason: _name.includes("context") ? "NO_MATCHING_CACHE" : "CACHE_INVALID",
    });
    expect(store.removes).toBe(_name.includes("context") ? 0 : 1);
  });

  it("rejects a lowered trusted server-time metadata floor", async () => {
    const store = new TestStore();
    const first = activated({ store });
    await first.client.bootstrapWithPolicy(REQUEST);
    store.value!.trustedServerTimeHighWatermark = "2025-12-31T23:59:59.000Z";
    const offline = activated({
      store,
      fetch: async () => {
        throw new TypeError("offline");
      },
    });
    expect(await offline.client.bootstrapWithPolicy(REQUEST)).toMatchObject({
      kind: "UNAVAILABLE",
      reason: "CACHE_INVALID",
    });
  });

  it("does not turn an HTTP response into same-attempt cache success", async () => {
    const store = new TestStore();
    const first = activated({ store });
    await first.client.bootstrapWithPolicy(REQUEST);
    const second = activated({
      store,
      fetch: async () =>
        new Response(
          JSON.stringify({
            error: {
              code: "BOOTSTRAP_UNAVAILABLE",
              message: "unavailable",
              correlationId: "corr",
            },
          }),
          { status: 503 },
        ),
    });
    expect(await second.client.bootstrapWithPolicy(REQUEST)).toEqual({
      kind: "UNAVAILABLE",
      reason: "HTTP_ERROR",
      status: 503,
      error: "BOOTSTRAP_UNAVAILABLE",
    });
  });

  it.each([401, 403])(
    "removes cache on online authorization denial %s",
    async (status) => {
      const store = new TestStore();
      const first = activated({ store });
      await first.client.bootstrapWithPolicy(REQUEST);
      const second = activated({
        store,
        fetch: async () =>
          new Response(JSON.stringify({ error: { code: "DENIED" } }), {
            status,
          }),
      });
      expect(await second.client.bootstrapWithPolicy(REQUEST)).toMatchObject({
        kind: "UNAVAILABLE",
        reason: "AUTHORIZATION_DENIED",
      });
      expect(store.value).toBeUndefined();
    },
  );

  it("does not fall back after a 200 verification failure", async () => {
    const store = new TestStore();
    const first = activated({ store });
    await first.client.bootstrapWithPolicy(REQUEST);
    const second = activated({
      store,
      fetch: async () =>
        new Response(
          JSON.stringify({ envelopeVersion: "bootstrap_envelope_v1" }),
          { status: 200 },
        ),
    });
    expect(await second.client.bootstrapWithPolicy(REQUEST)).toEqual({
      kind: "UNAVAILABLE",
      reason: "SECURITY_FAILURE",
      error: "INVALID_ENVELOPE",
    });
  });

  it("keeps live success usable when cache persistence fails", async () => {
    const store = new TestStore();
    store.failSave = true;
    const first = activated({ store });
    expect(await first.client.bootstrapWithPolicy(REQUEST)).toMatchObject({
      kind: "READY",
      source: "LIVE",
    });
    expect(store.saves).toBe(1);
  });

  it("returns no matching cache for a context switch and sends null lastConfigVersion", async () => {
    const store = new TestStore();
    const first = activated({ store });
    await first.client.bootstrapWithPolicy(REQUEST);
    let requestBody: { lastConfigVersion?: number | null } | undefined;
    const second = activated({
      store,
      fetch: async (_url, init) => {
        requestBody = JSON.parse(String(init?.body)) as {
          lastConfigVersion?: number | null;
        };
        return new Response(
          JSON.stringify({
            error: {
              code: "BOOTSTRAP_UNAVAILABLE",
              message: "unavailable",
              correlationId: "corr",
            },
          }),
          { status: 503 },
        );
      },
    });
    const result = await second.client.bootstrapWithPolicy({
      ...REQUEST,
      extensionVersion: "2.0.0",
      detectedAi: { family: "chat", surface: "work", variant: null },
    });
    expect(result).toMatchObject({ kind: "UNAVAILABLE", reason: "HTTP_ERROR" });
    expect(requestBody?.lastConfigVersion).toBeNull();
  });

  it("uses one compatibility precedence resolver for all signed states", () => {
    expect(resolveClientCompatibility(payload())).toBe("READY");
    expect(
      resolveClientCompatibility(
        payload({
          compatibility: {
            extension: { status: "UPDATE_RECOMMENDED", minimumVersion: null },
            browser: { status: "SUPPORTED" },
          },
        }),
      ),
    ).toBe("UPDATE_RECOMMENDED");
    expect(
      resolveClientCompatibility(
        payload({
          compatibility: {
            extension: { status: "UPDATE_REQUIRED", minimumVersion: "2.0.0" },
            browser: { status: "SUPPORTED" },
          },
        }),
      ),
    ).toBe("UPDATE_REQUIRED");
    expect(
      resolveClientCompatibility(
        payload({
          compatibility: {
            extension: { status: "SUPPORTED", minimumVersion: null },
            browser: { status: "UNSUPPORTED_BROWSER" },
          },
        }),
      ),
    ).toBe("UNSUPPORTED_BROWSER");
    expect(
      resolveClientCompatibility(
        payload({
          compatibility: {
            extension: { status: "UPDATE_REQUIRED", minimumVersion: "2.0.0" },
            browser: { status: "MAINTENANCE" },
          },
        }),
      ),
    ).toBe("MAINTENANCE");
  });

  it("caches and preserves UPDATE_RECOMMENDED as usable", async () => {
    const store = new InMemoryBootstrapSnapshotStore();
    const livePayload = payload({
      compatibility: {
        extension: { status: "UPDATE_RECOMMENDED", minimumVersion: "1.1.0" },
        browser: { status: "SUPPORTED" },
      },
    });
    const first = activated({ store, payloads: [livePayload] });
    expect((await first.client.bootstrapWithPolicy(REQUEST)).kind).toBe(
      "UPDATE_RECOMMENDED",
    );
    const offline = activated({
      store,
      fetch: async () => {
        throw new TypeError("offline");
      },
    });
    expect(await offline.client.bootstrapWithPolicy(REQUEST)).toMatchObject({
      kind: "UPDATE_RECOMMENDED",
      source: "CACHE",
    });
  });

  it.each([
    [
      "UPDATE_REQUIRED",
      {
        extension: {
          status: "UPDATE_REQUIRED" as const,
          minimumVersion: "2.0.0",
        },
        browser: { status: "SUPPORTED" as const },
      },
    ],
    [
      "UNSUPPORTED_BROWSER",
      {
        extension: { status: "SUPPORTED" as const, minimumVersion: null },
        browser: { status: "UNSUPPORTED_BROWSER" as const },
      },
    ],
    [
      "MAINTENANCE",
      {
        extension: { status: "SUPPORTED" as const, minimumVersion: null },
        browser: { status: "MAINTENANCE" as const },
      },
    ],
  ])(
    "caches blocked policy state %s without downgrading it",
    async (_name, compatibility) => {
      const store = new TestStore();
      const first = activated({
        store,
        payloads: [payload({ compatibility })],
      });
      expect((await first.client.bootstrapWithPolicy(REQUEST)).kind).toBe(
        _name,
      );
      const offline = activated({
        store,
        fetch: async () => {
          throw new TypeError("offline");
        },
      });
      expect((await offline.client.bootstrapWithPolicy(REQUEST)).kind).toBe(
        _name,
      );
    },
  );
});
