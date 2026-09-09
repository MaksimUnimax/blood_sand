import { expect, test, type Page } from "@playwright/test";
import {
  adminLogin,
  adminOrigin,
  reset,
  seedAdminIdentity,
} from "./support/fixtures.js";

const planId = "00000000-0000-4000-8000-000000000001";
const planRevisionId = "00000000-0000-4000-8000-000000000002";
const accountId = "00000000-0000-4000-8000-000000000003";

function plan(fingerprint: string) {
  return {
    id: planId,
    code: "safety-plan",
    status: "DRAFT",
    revisions: [
      {
        id: planRevisionId,
        revision: 1,
        state: "DRAFT",
        displayName: "Safety plan",
        description: "Safety fixture",
        contentFingerprintSha256: fingerprint,
        entitlements: [],
      },
    ],
  };
}

async function loginOwner(page: Page) {
  await reset();
  await seedAdminIdentity("p65-safety-owner@example.test", "ADMIN_OWNER");
  await adminLogin(page, "p65-safety-owner@example.test");
}

async function openPlan(
  page: Page,
  handler: (route: import("@playwright/test").Route) => Promise<void>,
  fingerprint = "R1",
) {
  await page.route(
    "**/api/control-plane/v1/admin/commercial/plans/**",
    handler,
  );
  await page.goto(`${adminOrigin}/commercial/plans/${planId}`);
  await expect(
    page.getByRole("heading", { name: "Plan detail" }),
  ).toBeVisible();
  await expect(page.getByText(fingerprint)).toBeVisible();
}

function setEntitlementControls(page: Page) {
  const action = page.getByRole("button", { name: "Set draft entitlement" });
  const panel = page.locator(".panel").filter({ has: action });
  return {
    key: page.getByLabel("Entitlement key"),
    value: page.getByLabel("Typed value"),
    action,
    reason: panel.getByRole("textbox", { name: "Operator reason" }),
  };
}

test("shared mutation coordinator suppresses double confirmation before the first request resolves", async ({
  page,
}) => {
  await loginOwner(page);
  let requests = 0;
  let release!: () => void;
  const gate = new Promise<void>((resolve) => {
    release = resolve;
  });
  await openPlan(page, async (route) => {
    if (route.request().method() === "GET") {
      await route.fulfill({
        contentType: "application/json",
        body: JSON.stringify(plan("R1")),
      });
      return;
    }
    requests += 1;
    await gate;
    await route.fulfill({ contentType: "application/json", body: "{}" });
  });
  const controls = setEntitlementControls(page);
  await controls.key.fill("feature.export");
  await controls.value.fill("true");
  await controls.reason.fill("ticket-d01");
  await controls.action.click();
  const confirm = page.getByRole("button", {
    name: "Confirm Set draft entitlement",
  });
  await confirm.dispatchEvent("click");
  await confirm.dispatchEvent("click");
  await expect.poll(() => requests).toBe(1);
  await expect(confirm).toBeDisabled();
  release();
  await expect(confirm).toHaveCount(0);
});

test("shared mutation coordinator suppresses keyboard/repeated activation and releases pending on error", async ({
  page,
}) => {
  await loginOwner(page);
  let requests = 0;
  await openPlan(page, async (route) => {
    if (route.request().method() === "GET") {
      await route.fulfill({
        contentType: "application/json",
        body: JSON.stringify(plan("R1")),
      });
      return;
    }
    requests += 1;
    await route.fulfill({
      status: 409,
      contentType: "application/json",
      body: JSON.stringify({
        error: { code: "ADMIN_CONFLICT", message: "conflict" },
      }),
    });
  });
  const controls = setEntitlementControls(page);
  await controls.key.fill("feature.export");
  await controls.reason.fill("ticket-d01-repeat");
  await controls.action.press("Enter");
  const confirm = page.getByRole("button", {
    name: "Confirm Set draft entitlement",
  });
  await confirm.click();
  await expect(page.getByText(/not automatically repeated/)).toBeVisible();
  expect(requests).toBe(1);
  await controls.action.click();
  await expect(
    page.getByRole("button", { name: "Confirm Set draft entitlement" }),
  ).toBeVisible();
});

test("stale mutation reloads the authoritative plan and requires a new review using R2", async ({
  page,
}) => {
  await loginOwner(page);
  let reads = 0;
  let mutations = 0;
  let laterBody: Record<string, unknown> | undefined;
  await openPlan(page, async (route) => {
    if (route.request().method() === "GET") {
      reads += 1;
      await route.fulfill({
        contentType: "application/json",
        body: JSON.stringify(plan(reads === 1 ? "R1" : "R2")),
      });
      return;
    }
    mutations += 1;
    if (mutations === 1) {
      await route.fulfill({
        status: 409,
        contentType: "application/json",
        body: JSON.stringify({
          error: { code: "ADMIN_STATE_STALE", message: "stale" },
        }),
      });
      return;
    }
    laterBody = route.request().postDataJSON() as Record<string, unknown>;
    await route.fulfill({ contentType: "application/json", body: "{}" });
  });
  const controls = setEntitlementControls(page);
  await controls.key.fill("feature.export");
  await controls.value.fill("true");
  const reason = controls.reason;
  await reason.fill("ticket-d02-r1");
  await controls.action.click();
  await page
    .getByRole("button", { name: "Confirm Set draft entitlement" })
    .click();
  await expect(page.getByText(/not automatically repeated/)).toBeVisible();
  expect(mutations).toBe(1);
  await expect(page.locator("pre")).toContainText("R2");
  await expect(
    page.getByRole("button", { name: "Confirm Set draft entitlement" }),
  ).toHaveCount(0);
  await controls.action.click();
  await reason.fill("ticket-d02-r2");
  await page
    .getByRole("button", { name: "Confirm Set draft entitlement" })
    .click();
  await expect.poll(() => mutations).toBe(2);
  expect(laterBody?.expectedContentFingerprint).toBe("R2");
});

test("draft entitlement follows the review lifecycle with zero pre-confirm writes", async ({
  page,
}) => {
  await loginOwner(page);
  let requests = 0;
  await openPlan(
    page,
    async (route) => {
      if (route.request().method() === "GET") {
        await route.fulfill({
          contentType: "application/json",
          body: JSON.stringify(plan("R7")),
        });
        return;
      }
      requests += 1;
      await route.fulfill({ contentType: "application/json", body: "{}" });
    },
    "R7",
  );
  const controls = setEntitlementControls(page);
  await controls.key.fill("feature.export");
  await controls.value.fill("true");
  const reason = controls.reason;
  await reason.fill("ticket-d03");
  expect(requests).toBe(0);
  await controls.action.click();
  expect(requests).toBe(0);
  await page.getByRole("button", { name: "Cancel" }).click();
  expect(requests).toBe(0);
  await controls.action.click();
  await page
    .getByRole("button", { name: "Confirm Set draft entitlement" })
    .dblclick();
  await expect.poll(() => requests).toBe(1);
  expect(requests).toBe(1);
});

test("entitlement override mutations use loaded revision, fail closed when missing, and use refreshed R8 after stale R7", async ({
  page,
}) => {
  await loginOwner(page);
  let mode: "r7" | "missing" | "stale" | "r8" = "r7";
  let requests = 0;
  const bodies: Record<string, unknown>[] = [];
  await page.route(
    "**/api/control-plane/v1/admin/accounts/**/entitlement-overrides**",
    async (route) => {
      if (route.request().method() === "GET") {
        const revision = mode === "r8" ? 8 : 7;
        await route.fulfill({
          contentType: "application/json",
          body: JSON.stringify({
            items:
              mode === "missing"
                ? []
                : [
                    {
                      entitlementKey: "feature.export",
                      revision,
                      operation: "SET",
                    },
                  ],
            nextCursor: null,
          }),
        });
        return;
      }
      requests += 1;
      bodies.push(route.request().postDataJSON() as Record<string, unknown>);
      if (mode === "stale") {
        mode = "r8";
        await route.fulfill({
          status: 409,
          contentType: "application/json",
          body: JSON.stringify({
            error: { code: "ADMIN_STATE_STALE", message: "stale" },
          }),
        });
        return;
      }
      await route.fulfill({ contentType: "application/json", body: "{}" });
    },
  );
  await page.goto(`${adminOrigin}/accounts/${accountId}`);
  await expect(
    page.getByRole("heading", { name: "Entitlements" }),
  ).toBeVisible();
  const key = page.getByLabel("Entitlement key");
  await key.fill("feature.export");
  await expect(
    page.getByRole("button", { name: "Set override" }),
  ).toBeVisible();
  const setPanel = page
    .locator(".panel")
    .filter({ has: page.getByRole("button", { name: "Set override" }) });
  await setPanel
    .getByRole("textbox", { name: "Operator reason" })
    .fill("ticket-d04-set");
  await setPanel.getByRole("button", { name: "Set override" }).click();
  await setPanel.getByRole("button", { name: "Confirm Set override" }).click();
  await expect.poll(() => requests).toBe(1);
  expect(bodies[0]?.expectedLatestRevision).toBe(7);

  const clearPanel = page
    .locator(".panel")
    .filter({ has: page.getByRole("button", { name: "Clear override" }) });
  await clearPanel
    .getByRole("textbox", { name: "Operator reason" })
    .fill("ticket-d04-clear");
  await clearPanel.getByRole("button", { name: "Clear override" }).click();
  await clearPanel
    .getByRole("button", { name: "Confirm Clear override" })
    .click();
  await expect.poll(() => requests).toBe(2);
  expect(bodies[1]?.expectedLatestRevision).toBe(7);

  mode = "missing";
  await page.reload();
  await key.fill("feature.export");
  await setPanel.getByRole("button", { name: "Set override" }).click();
  await setPanel
    .getByRole("textbox", { name: "Operator reason" })
    .fill("ticket-d04-missing-set");
  await setPanel.getByRole("button", { name: "Confirm Set override" }).click();
  await expect.poll(() => requests).toBe(2);
  await clearPanel.getByRole("button", { name: "Clear override" }).click();
  await clearPanel
    .getByRole("textbox", { name: "Operator reason" })
    .fill("ticket-d04-missing-clear");
  await clearPanel
    .getByRole("button", { name: "Confirm Clear override" })
    .click();
  await expect.poll(() => requests).toBe(2);

  mode = "stale";
  await page.reload();
  await key.fill("feature.export");
  await setPanel.getByRole("button", { name: "Set override" }).click();
  await setPanel
    .getByRole("textbox", { name: "Operator reason" })
    .fill("ticket-d04-r7");
  await setPanel.getByRole("button", { name: "Confirm Set override" }).click();
  await expect(page.getByText(/not automatically repeated/)).toBeVisible();
  expect(requests).toBe(3);
  await setPanel.getByRole("button", { name: "Set override" }).click();
  await setPanel
    .getByRole("textbox", { name: "Operator reason" })
    .fill("ticket-d04-r8");
  await setPanel.getByRole("button", { name: "Confirm Set override" }).click();
  await expect.poll(() => requests).toBe(4);
  expect(bodies[3]?.expectedLatestRevision).toBe(8);
});

test("admin logout sends admin CSRF and invalidates the server session", async ({
  page,
  context,
}) => {
  await reset();
  await seedAdminIdentity("p65-logout-owner@example.test", "ADMIN_OWNER");
  await adminLogin(page, "p65-logout-owner@example.test");
  const cookies = await context.cookies(adminOrigin);
  const adminCsrf = cookies.find(
    (cookie) => cookie.name === "pcp_admin_csrf",
  )?.value;
  const portalCsrf = cookies.find(
    (cookie) => cookie.name === "pcp_csrf",
  )?.value;
  let logoutStatus = 0;
  let sentCsrf: string | null = null;
  page.on("request", (request) => {
    if (
      request.url().endsWith("/api/control-plane/v1/admin/session") &&
      request.method() === "DELETE"
    )
      sentCsrf = request.headers()["x-csrf-token"] ?? null;
  });
  const logout = page.waitForResponse(
    (response) =>
      response.url().endsWith("/api/control-plane/v1/admin/session") &&
      response.request().method() === "DELETE",
  );
  await page.getByRole("button", { name: "End admin session" }).click();
  logoutStatus = (await logout).status();
  await expect(page).toHaveURL(`${adminOrigin}/login`);
  expect(logoutStatus).toBe(204);
  expect(sentCsrf).toBe(adminCsrf);
  expect(sentCsrf).not.toBe(portalCsrf);
  const me = await page.request.get(
    `${adminOrigin}/api/control-plane/v1/admin/me`,
  );
  expect(me.status()).toBe(401);
});
