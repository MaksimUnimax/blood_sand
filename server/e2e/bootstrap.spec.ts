import { createPublicKey } from "node:crypto";
import { expect, test } from "@playwright/test";
import { verifyBootstrapEnvelope } from "../packages/remote-config/src/index.js";
import {
  activateExtension,
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
async function verificationKey() {
  const [row] = await sql<{ public_key_spki_der: Buffer }>(
    "SELECT public_key_spki_der FROM signing_keys WHERE key_id = $1",
    ["e2e-config-signing-key"],
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
    new Map([["e2e-config-signing-key", await verificationKey()]]),
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
    new Map([["e2e-config-signing-key", await verificationKey()]]),
  );
  expect(verified).toMatchObject({ ok: true });
  if (verified.ok)
    expect(verified.payload.compatibility.extension.status).toBe(
      "UPDATE_REQUIRED",
    );
});
