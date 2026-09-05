import { createPublicKey } from "node:crypto";
import { expect, test } from "@playwright/test";
import { verifyBootstrapEnvelope } from "../packages/remote-config/src/index.js";
import type {
  BootstrapCacheRecord,
  BootstrapSnapshotStore,
  ClientClock,
} from "../packages/simulated-extension-client/src/index.js";
import {
  activateExtension,
  activateExtensionClient,
  apiOrigin,
  reset,
  seedBootstrapConfig,
  sql,
} from "./support/fixtures.js";

const request = (deviceId: string) => ({
  contractVersion: "control_plane_v1",
  extensionVersion: "1.2.3",
  browser: { family: "chrome", version: "123" },
  deviceId,
  lastConfigVersion: null,
  detectedAi: { family: "chat", surface: "page" },
});
const policyRequest = {
  contractVersion: "control_plane_v1" as const,
  extensionVersion: "1.2.3",
  browser: { family: "chrome" as const, version: "123" },
  detectedAi: { family: "chat", surface: "page", variant: null },
};

class E2EStore implements BootstrapSnapshotStore {
  record?: BootstrapCacheRecord;
  async load(): Promise<unknown> {
    return this.record ? structuredClone(this.record) : undefined;
  }
  async save(
    _key: Parameters<BootstrapSnapshotStore["save"]>[0],
    record: BootstrapCacheRecord,
  ): Promise<void> {
    this.record = structuredClone(record);
  }
  async remove(): Promise<void> {
    this.record = undefined;
  }
}

function controlledClock(): {
  clock: ClientClock;
  set: (wallMs: number, monotonicMs: number) => void;
} {
  let wallMs = Date.now();
  let monotonicMs = 0;
  return {
    clock: {
      wallNow: () => new Date(wallMs),
      monotonicNowMs: () => monotonicMs,
    },
    set: (nextWallMs, nextMonotonicMs) => {
      wallMs = nextWallMs;
      monotonicMs = nextMonotonicMs;
    },
  };
}

function transportSwitch() {
  let offline = false;
  return {
    fetcher: async (input: RequestInfo | URL, init?: RequestInit) => {
      if (offline && String(input).endsWith("/v1/bootstrap"))
        throw new TypeError("simulated transport outage");
      return fetch(input, init);
    },
    offline: () => {
      offline = true;
    },
  };
}
async function verificationKey() {
  const [row] = await sql<{ public_key_spki_der: Buffer }>(
    "SELECT public_key_spki_der FROM signing_keys WHERE key_id = $1",
    ["e2e-config-k1"],
  );
  if (!row) throw new Error("E2E public signing metadata is absent");
  return createPublicKey({
    key: row.public_key_spki_der,
    format: "der",
    type: "spki",
  });
}
async function bootstrap(token: string | undefined, body: unknown) {
  return fetch(`${apiOrigin}/v1/bootstrap`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      ...(token ? { authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(body),
  });
}

test.beforeEach(async () => reset());

test("bootstrap rejects an unauthenticated HTTP request", async () => {
  expect(
    (
      await bootstrap(
        undefined,
        request("aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa"),
      )
    ).status,
  ).toBe(401);
});

test("bootstrap rejects a malformed authenticated request", async ({
  page,
}) => {
  const credentials = await activateExtension(page);
  const response = await bootstrap(credentials.accessToken, {
    ...request(credentials.deviceId),
    unexpected: true,
  });
  expect(response.status).toBe(400);
  expect((await response.json()).error.code).toBe("INVALID_REQUEST");
});

test("bootstrap rejects a body device that differs from the bearer principal", async ({
  page,
}) => {
  const credentials = await activateExtension(page);
  const response = await bootstrap(
    credentials.accessToken,
    request("aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa"),
  );
  expect(response.status).toBe(403);
  expect((await response.json()).error.code).toBe("DEVICE_MISMATCH");
});

test("bootstrap fails closed when no config is published", async ({ page }) => {
  const credentials = await activateExtension(page);
  const response = await bootstrap(
    credentials.accessToken,
    request(credentials.deviceId),
  );
  expect(response.status).toBe(503);
  expect((await response.json()).error.code).toBe("BOOTSTRAP_UNAVAILABLE");
});

test("bootstrap returns a cryptographically verified strict snapshot", async ({
  page,
}) => {
  const credentials = await activateExtension(page);
  const configVersion = await seedBootstrapConfig();
  const response = await bootstrap(
    credentials.accessToken,
    request(credentials.deviceId),
  );
  expect(response.status).toBe(200);
  const verified = verifyBootstrapEnvelope(
    await response.json(),
    new Map([["e2e-config-k1", await verificationKey()]]),
  );
  expect(verified).toMatchObject({ ok: true });
  if (verified.ok)
    expect(verified.payload).toMatchObject({
      configVersion,
      account: { status: "ACTIVE" },
      subscription: { state: "NONE", planRevision: null },
      devicePolicy: { status: "ACTIVE" },
      entitlements: {},
      features: { "feature-e2e": true },
      ai: { status: "UNCONFIGURED" },
    });
});

test("UPDATE_REQUIRED remains a signed successful bootstrap response", async ({
  page,
}) => {
  const credentials = await activateExtension(page);
  await seedBootstrapConfig({ minimumExtensionVersion: "2.0.0" });
  const response = await bootstrap(
    credentials.accessToken,
    request(credentials.deviceId),
  );
  expect(response.status).toBe(200);
  const verified = verifyBootstrapEnvelope(
    await response.json(),
    new Map([["e2e-config-k1", await verificationKey()]]),
  );
  expect(verified).toMatchObject({ ok: true });
  if (verified.ok)
    expect(verified.payload.compatibility.extension.status).toBe(
      "UPDATE_REQUIRED",
    );
});

test("packaged K1-only client verifies a K1 bootstrap", async ({ page }) => {
  await seedBootstrapConfig({ signingKeyId: "e2e-config-k1" });
  const extension = await activateExtensionClient(page, "old");
  const result = await extension.bootstrap({
    contractVersion: "control_plane_v1",
    extensionVersion: "1.2.3",
    browser: { family: "chrome", version: "123" },
    lastConfigVersion: null,
  });
  expect(result.kind).toBe("VERIFIED");
});

test("overlap client verifies a bootstrap signed by newly active K2", async ({
  page,
}) => {
  await seedBootstrapConfig({ signingKeyId: "e2e-config-k2" });
  const extension = await activateExtensionClient(page, "overlap");
  const result = await extension.bootstrap({
    contractVersion: "control_plane_v1",
    extensionVersion: "1.2.3",
    browser: { family: "chrome", version: "123" },
    lastConfigVersion: null,
  });
  expect(result.kind).toBe("VERIFIED");
});

test("old K1-only client rejects a K2 bootstrap as UNKNOWN_SIGNING_KEY", async ({
  page,
}) => {
  await seedBootstrapConfig({ signingKeyId: "e2e-config-k2" });
  const extension = await activateExtensionClient(page, "old");
  expect(
    await extension.bootstrap({
      contractVersion: "control_plane_v1",
      extensionVersion: "1.2.3",
      browser: { family: "chrome", version: "123" },
      lastConfigVersion: null,
    }),
  ).toEqual({ kind: "VERIFICATION_FAILURE", error: "UNKNOWN_SIGNING_KEY" });
});

test("revoking the currently selected K1 makes the next bootstrap fail closed", async ({
  page,
}) => {
  await seedBootstrapConfig({ signingKeyId: "e2e-config-k1" });
  const extension = await activateExtensionClient(page, "overlap");
  await sql(
    "INSERT INTO signing_key_events(key_id,event_type,occurred_at,reason_code) VALUES($1,'REVOKED',$2,$3)",
    ["e2e-config-k1", "2026-09-04T00:01:00.000Z", "emergency-test"],
  );
  expect(
    await extension.bootstrap({
      contractVersion: "control_plane_v1",
      extensionVersion: "1.2.3",
      browser: { family: "chrome", version: "123" },
      lastConfigVersion: null,
    }),
  ).toEqual({ kind: "HTTP_ERROR", status: 503, code: "BOOTSTRAP_UNAVAILABLE" });
});

test("P3.6 uses a real signed fresh cache after bootstrap transport loss", async ({
  page,
}) => {
  await seedBootstrapConfig();
  const time = controlledClock();
  const transport = transportSwitch();
  const extension = await activateExtensionClient(page, "overlap", {
    clock: time.clock,
    snapshotStore: new E2EStore(),
    fetch: transport.fetcher,
  });
  const live = await extension.bootstrapWithPolicy(policyRequest);
  expect(live).toMatchObject({
    kind: "READY",
    source: "LIVE",
    freshness: "FRESH",
  });
  transport.offline();
  const cached = await extension.bootstrapWithPolicy(policyRequest);
  expect(cached).toMatchObject({
    kind: "READY",
    source: "CACHE",
    freshness: "FRESH",
  });
});

test("P3.6 permits a real signed cache during bounded offline grace", async ({
  page,
}) => {
  await seedBootstrapConfig();
  const time = controlledClock();
  const transport = transportSwitch();
  const extension = await activateExtensionClient(page, "overlap", {
    clock: time.clock,
    snapshotStore: new E2EStore(),
    fetch: transport.fetcher,
  });
  const live = await extension.bootstrapWithPolicy(policyRequest);
  if (!("payload" in live)) throw new Error("live policy was unavailable");
  time.set(Date.parse(live.payload.expiresAt), 1);
  transport.offline();
  expect(await extension.bootstrapWithPolicy(policyRequest)).toMatchObject({
    kind: "READY",
    source: "CACHE",
    freshness: "OFFLINE_GRACE",
  });
});

test("P3.6 rejects a real cache exactly at offline grace end", async ({
  page,
}) => {
  await seedBootstrapConfig();
  const time = controlledClock();
  const transport = transportSwitch();
  const extension = await activateExtensionClient(page, "overlap", {
    clock: time.clock,
    snapshotStore: new E2EStore(),
    fetch: transport.fetcher,
  });
  const live = await extension.bootstrapWithPolicy(policyRequest);
  if (!("payload" in live)) throw new Error("live policy was unavailable");
  time.set(Date.parse(live.payload.offlineGraceUntil), 1);
  transport.offline();
  expect(await extension.bootstrapWithPolicy(policyRequest)).toEqual({
    kind: "UNAVAILABLE",
    reason: "CACHE_EXPIRED",
  });
});

test("P3.6 rejects a tampered real cache while transport is unavailable", async ({
  page,
}) => {
  await seedBootstrapConfig();
  const time = controlledClock();
  const transport = transportSwitch();
  const store = new E2EStore();
  const extension = await activateExtensionClient(page, "overlap", {
    clock: time.clock,
    snapshotStore: store,
    fetch: transport.fetcher,
  });
  expect((await extension.bootstrapWithPolicy(policyRequest)).kind).toBe(
    "READY",
  );
  store.record!.envelope.signature =
    "A" + store.record!.envelope.signature.slice(1);
  transport.offline();
  expect(await extension.bootstrapWithPolicy(policyRequest)).toMatchObject({
    kind: "UNAVAILABLE",
    reason: "CACHE_INVALID",
  });
});

test("P3.6 invalidates the real device cache after online authorization denial", async ({
  page,
}) => {
  await seedBootstrapConfig();
  const transport = transportSwitch();
  const store = new E2EStore();
  const extension = await activateExtensionClient(page, "overlap", {
    snapshotStore: store,
    fetch: transport.fetcher,
  });
  expect((await extension.bootstrapWithPolicy(policyRequest)).kind).toBe(
    "READY",
  );
  await page.goto("/devices");
  await page.getByRole("button", { name: "Revoke" }).click();
  await expect(page.getByText(/E2E Chrome — REVOKED/)).toBeVisible();
  expect(await extension.bootstrapWithPolicy(policyRequest)).toMatchObject({
    kind: "UNAVAILABLE",
    reason: "AUTHORIZATION_DENIED",
    status: 401,
  });
  expect(store.record).toBeUndefined();
});

test("P3.6 returns UPDATE_REQUIRED for signed live and cached policy", async ({
  page,
}) => {
  await seedBootstrapConfig({ minimumExtensionVersion: "2.0.0" });
  const transport = transportSwitch();
  const store = new E2EStore();
  const extension = await activateExtensionClient(page, "overlap", {
    snapshotStore: store,
    fetch: transport.fetcher,
  });
  const lowLevel = await extension.bootstrap({
    ...policyRequest,
    lastConfigVersion: null,
  });
  expect(lowLevel).toMatchObject({ kind: "VERIFIED" });
  expect((await extension.bootstrapWithPolicy(policyRequest)).kind).toBe(
    "UPDATE_REQUIRED",
  );
  transport.offline();
  expect((await extension.bootstrapWithPolicy(policyRequest)).kind).toBe(
    "UPDATE_REQUIRED",
  );
});

test("P3.6 returns UNSUPPORTED_BROWSER for a signed real compatibility response", async ({
  page,
}) => {
  await seedBootstrapConfig({ unsupportedChrome: true });
  const extension = await activateExtensionClient(page);
  const lowLevel = await extension.bootstrap({
    ...policyRequest,
    lastConfigVersion: null,
  });
  expect(lowLevel).toMatchObject({ kind: "VERIFIED" });
  expect((await extension.bootstrapWithPolicy(policyRequest)).kind).toBe(
    "UNSUPPORTED_BROWSER",
  );
});
