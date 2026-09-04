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

export function client(): SimulatedExtensionClient {
  return new SimulatedExtensionClient({
    controlPlaneApiOrigin: apiOrigin,
    portalOrigin,
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

export async function activateExtension(page: Page) {
  await login(page);
  const extension = client();
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
  return credentials(extension);
}

/** Uses the accepted publication path; only its public signer metadata exists in DB. */
export async function seedBootstrapConfig(
  options: { minimumExtensionVersion?: string } = {},
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
        signingKeyId: "e2e-config-signing-key",
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
