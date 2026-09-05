import { createPublicKey, type KeyObject } from "node:crypto";
import { expect, type Page } from "@playwright/test";
import { SimulatedExtensionClient } from "../../packages/simulated-extension-client/src/index.js";
import {
  createDatabaseRuntime,
  createP3PolicyPublicationRepository,
} from "../../packages/db/src/index.js";
import { resetE2eDatabase, sql } from "./database.js";
export { sql };

export const apiOrigin = "http://127.0.0.1:3100";
export const portalOrigin = "http://127.0.0.1:3200";

export async function reset(): Promise<void> {
  await resetE2eDatabase();
}

export async function login(page: Page, returnTo = "/"): Promise<void> {
  await page.goto(`/login?returnTo=${encodeURIComponent(returnTo)}`);
  await page.getByLabel("Email").fill("e2e@example.test");
  await page.getByRole("button", { name: "Send code" }).click();
  await page.getByLabel("Code").fill("424242");
  await page.getByRole("button", { name: "Verify" }).click();
  await expect(page).toHaveURL(new RegExp(`${returnTo.replace("?", "\\?")}$`));
}

function packagedKeys(ids: string[]): ReadonlyMap<string, KeyObject> {
  const raw = JSON.parse(
    process.env.CONFIG_SIGNING_PUBLIC_KEY_RING_JSON ?? "[]",
  ) as Array<{
    keyId: string;
    publicKeySpkiDerB64: string;
  }>;
  return new Map(
    raw
      .filter((entry) => ids.includes(entry.keyId))
      .map((entry) => [
        entry.keyId,
        createPublicKey({
          key: Buffer.from(entry.publicKeySpkiDerB64, "base64"),
          format: "der",
          type: "spki",
        }),
      ]),
  );
}

/** Test setup supplies public package data; the client never discovers it. */
async function packagedKeysFromDisposableDb(
  ids: string[],
): Promise<ReadonlyMap<string, KeyObject>> {
  const rows = await sql<{ key_id: string; public_key_spki_der: Buffer }>(
    "SELECT key_id,public_key_spki_der FROM signing_keys WHERE key_id=ANY($1::text[])",
    [ids],
  );
  return new Map(
    rows.map((entry) => [
      entry.key_id,
      createPublicKey({
        key: entry.public_key_spki_der,
        format: "der",
        type: "spki",
      }),
    ]),
  );
}

async function packagedClient(
  trust: "old" | "overlap" | "new",
): Promise<SimulatedExtensionClient> {
  const ids =
    trust === "old"
      ? ["e2e-config-k1"]
      : trust === "new"
        ? ["e2e-config-k2"]
        : ["e2e-config-k1", "e2e-config-k2"];
  return new SimulatedExtensionClient({
    controlPlaneApiOrigin: apiOrigin,
    portalOrigin,
    trustedConfigSigningKeys: await packagedKeysFromDisposableDb(ids),
  });
}

export function client(
  trust: "old" | "overlap" | "new" = "overlap",
): SimulatedExtensionClient {
  const ids =
    trust === "old"
      ? ["e2e-config-k1"]
      : trust === "new"
        ? ["e2e-config-k2"]
        : ["e2e-config-k1", "e2e-config-k2"];
  return new SimulatedExtensionClient({
    controlPlaneApiOrigin: apiOrigin,
    portalOrigin,
    trustedConfigSigningKeys: packagedKeys(ids),
  });
}

export async function start(clientInstance: SimulatedExtensionClient) {
  return clientInstance.startAuthorization({
    clientType: "browser_extension",
    browserFamily: "chrome",
    browserVersion: "123.0",
    extensionVersion: "1.2.3",
    deviceLabel: "E2E Chrome",
  });
}

export async function approve(
  page: Page,
  authorization: Awaited<ReturnType<typeof start>>,
): Promise<void> {
  await page.goto(authorization.verificationUrl);
  await expect(page.getByText("E2E Chrome")).toBeVisible();
  await expect(page.getByText("chrome 123.0")).toBeVisible();
  await expect(page.getByText("1.2.3")).toBeVisible();
  await page.getByLabel("User code").fill(authorization.userCode);
  await page.getByRole("button", { name: "Approve" }).click();
  await expect(page.getByRole("status")).toContainText("Device approved");
}

export async function credentials(
  clientInstance: SimulatedExtensionClient,
): Promise<{
  deviceId: string;
  sessionId: string;
  accessToken: string;
  refreshToken: string;
}> {
  const value = (
    clientInstance as unknown as {
      credentials?: {
        deviceId: string;
        sessionId: string;
        accessToken: string;
        refreshToken: string;
      };
    }
  ).credentials;
  if (!value) throw new Error("activation credentials are absent");
  return value;
}

export async function accountId(): Promise<string> {
  const rows = await sql<{ id: string }>("SELECT id FROM accounts LIMIT 1");
  if (!rows[0]) throw new Error("fixture account is absent");
  return rows[0].id;
}

export async function activateExtensionClient(
  page: Page,
  trust: "old" | "overlap" | "new" = "overlap",
) {
  await login(page);
  const extension = await packagedClient(trust);
  const authorization = await start(extension);
  await approve(page, authorization);
  if (
    (
      await extension.exchange(
        authorization.deviceCode,
        "e2e-bootstrap-exchange-key",
      )
    ).kind !== "ACTIVATED"
  )
    throw new Error("E2E extension activation failed");
  return extension;
}

export async function activateExtension(page: Page) {
  return credentials(await activateExtensionClient(page));
}

/** Uses the accepted publication path; only its public signer metadata exists in DB. */
export async function seedBootstrapConfig(
  options: { minimumExtensionVersion?: string; signingKeyId?: string } = {},
) {
  const database = createDatabaseRuntime(process.env.DATABASE_URL!);
  const publication = createP3PolicyPublicationRepository(database);
  const context = {
    actorType: "SYSTEM" as const,
    correlationId: "e2e-bootstrap",
  };
  const publishedAt = new Date("2026-09-04T00:00:00.000Z");
  try {
    const compatibility = await publication.publishCompatibilityPolicyRevision(
      {
        policyKey: "e2e-bootstrap-policy",
        contractVersion: "control_plane_v1",
        browserFamily: null,
        minimumExtensionVersion: options.minimumExtensionVersion ?? "1.0.0",
        recommendedExtensionVersion:
          options.minimumExtensionVersion === "2.0.0" ? "2.1.0" : "1.1.0",
        minimumBrowserVersion: null,
        maintenanceMode: false,
        maintenanceCode: null,
        blockedVersions: [],
        publishedAt,
      },
      context,
    );
    await publication.createFeatureDefinition(
      { featureKey: "feature-e2e" },
      context,
    );
    const feature = await publication.publishFeatureRuleRevision(
      {
        featureKey: "feature-e2e",
        contractVersion: "control_plane_v1",
        enabled: true,
        browserFamily: null,
        minimumExtensionVersion: "1.0.0",
        publishedAt,
      },
      context,
    );
    const config = await publication.publishConfigRelease(
      {
        contractVersion: "control_plane_v1",
        snapshotVersion: "bootstrap_snapshot_v1",
        envelopeVersion: "bootstrap_envelope_v1",
        signingKeyId: options.signingKeyId ?? "e2e-config-k1",
        compatibilityPolicyRevisionIds: [compatibility.id],
        featureRuleRevisionIds: [feature.id],
        featureRolloutRevisionIds: [],
        publishedAt,
      },
      context,
    );
    return config.configVersion;
  } finally {
    await database.close();
  }
}
