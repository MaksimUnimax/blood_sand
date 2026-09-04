import { expect, type Page } from "@playwright/test";
import { SimulatedExtensionClient } from "../../packages/simulated-extension-client/src/index.js";
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

export async function credentials(clientInstance: SimulatedExtensionClient): Promise<{
  deviceId: string;
  sessionId: string;
  accessToken: string;
  refreshToken: string;
}> {
  const value = (clientInstance as unknown as {
    credentials?: {
      deviceId: string;
      sessionId: string;
      accessToken: string;
      refreshToken: string;
    };
  }).credentials;
  if (!value) throw new Error("activation credentials are absent");
  return value;
}

export async function accountId(): Promise<string> {
  const rows = await sql<{ id: string }>("SELECT id FROM accounts LIMIT 1");
  if (!rows[0]) throw new Error("fixture account is absent");
  return rows[0].id;
}
