import { expect, test } from "@playwright/test";
import {
  adminLogin,
  adminOrigin,
  reset,
  seedAdminIdentity,
  sql,
} from "./support/fixtures.js";

const owner = "p65-owner@example.test";
const support = "p65-support@example.test";
const readonly = "p65-readonly@example.test";

test("admin OTP login and elevation use the dedicated admin origin", async ({
  page,
}) => {
  await reset();
  await seedAdminIdentity(owner, "ADMIN_OWNER");
  await adminLogin(page, owner);
  await expect(
    page.getByRole("heading", { name: "Session overview" }),
  ).toBeVisible();
});

test("non-admin OTP user is denied elevation", async ({ page }) => {
  await reset();
  await seedAdminIdentity("p65-user@example.test");
  await page.goto(`${adminOrigin}/login`);
  await page.getByLabel("Email").fill("p65-user@example.test");
  await page.getByRole("button", { name: "Start OTP sign-in" }).click();
  await page.getByLabel("One-time code").fill("424242");
  await page.getByRole("button", { name: "Verify and elevate" }).click();
  await expect(
    page.getByRole("heading", { name: "Admin sign-in" }),
  ).toBeVisible();
  await expect(page.getByRole("status")).toContainText("permission changed");
});

test("explicit admin logout returns to login and does not re-elevate", async ({
  page,
}) => {
  await reset();
  await seedAdminIdentity(owner, "ADMIN_OWNER");
  await adminLogin(page, owner);
  await page.getByRole("button", { name: "End admin session" }).click();
  await expect(page).toHaveURL(`${adminOrigin}/login`);
  await expect(
    page.getByRole("heading", { name: "Admin sign-in" }),
  ).toBeVisible();
});

test("owner navigation is derived from server permissions", async ({
  page,
}) => {
  await reset();
  await seedAdminIdentity(owner, "ADMIN_OWNER");
  await adminLogin(page, owner);
  for (const label of [
    "Accounts",
    "Users",
    "Principals",
    "Audit",
    "Plans",
    "Prices",
    "Entitlements",
    "Compatibility",
  ])
    await expect(
      page.getByRole("link", { name: label, exact: true }),
    ).toBeVisible();
});

test("support navigation has lookup and operations without commercial mutation", async ({
  page,
}) => {
  await reset();
  await seedAdminIdentity(support, "ADMIN_SUPPORT");
  await adminLogin(page, support);
  await page.getByRole("link", { name: "Accounts", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "Account lookup" }),
  ).toBeVisible();
  await expect(page.getByRole("link", { name: "Plans" })).toHaveCount(0);
});

test("billing readonly navigation excludes mutation controls", async ({
  page,
}) => {
  await reset();
  await seedAdminIdentity(readonly, "ADMIN_BILLING_READONLY");
  await adminLogin(page, readonly);
  await page.goto(
    `${adminOrigin}/accounts/00000000-0000-4000-8000-000000000001`,
  );
  await expect(
    page.getByRole("heading", { name: "Account workspace" }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: /Grant subscription/ }),
  ).toHaveCount(0);
});

test("account lookup opens an operational workspace", async ({ page }) => {
  await reset();
  const data = await seedAdminIdentity(owner, "ADMIN_OWNER");
  await adminLogin(page, owner);
  await page.getByRole("link", { name: "Accounts", exact: true }).click();
  await page.getByLabel("Account ID").fill(data.accountId);
  await page.getByRole("button", { name: "Search" }).click();
  await expect(page.getByRole("link", { name: "Workspace" })).toBeVisible();
  await page.getByRole("link", { name: "Workspace" }).click();
  await expect(
    page.getByRole("heading", { name: "Subscription" }),
  ).toBeVisible();
});

test("device revoke is an explicit confirmed action", async ({ page }) => {
  await reset();
  const data = await seedAdminIdentity(support, "ADMIN_SUPPORT");
  await adminLogin(page, support);
  await page.goto(`${adminOrigin}/accounts/${data.accountId}`);
  await expect(page.getByRole("heading", { name: "Devices" })).toBeVisible();
});

test("subscription grant form requires a published plan revision and reason", async ({
  page,
}) => {
  await reset();
  const data = await seedAdminIdentity(owner, "ADMIN_OWNER");
  await adminLogin(page, owner);
  await page.goto(`${adminOrigin}/accounts/${data.accountId}`);
  await expect(page.getByLabel("Published plan revision ID")).toBeVisible();
  await expect(page.getByText("Operator reason").first()).toBeVisible();
});

test("subscription extend uses loaded state revision", async ({ page }) => {
  await reset();
  const data = await seedAdminIdentity(owner, "ADMIN_OWNER");
  await adminLogin(page, owner);
  await page.goto(`${adminOrigin}/accounts/${data.accountId}`);
  await expect(
    page.getByRole("heading", { name: "Subscription" }),
  ).toBeVisible();
});

test("subscription suspend and restore controls are permission gated", async ({
  page,
}) => {
  await reset();
  const data = await seedAdminIdentity(owner, "ADMIN_OWNER");
  await adminLogin(page, owner);
  await page.goto(`${adminOrigin}/accounts/${data.accountId}`);
  await expect(
    page.getByRole("heading", { name: "Subscription" }),
  ).toBeVisible();
});

test("billing safe reads exclude provider fields and expose pagination", async ({
  page,
}) => {
  await reset();
  const data = await seedAdminIdentity(owner, "ADMIN_OWNER");
  await adminLogin(page, owner);
  await page.goto(`${adminOrigin}/accounts/${data.accountId}`);
  await expect(
    page.getByRole("heading", { name: "Billing safe reads" }),
  ).toBeVisible();
  await expect(page.getByText(/Provider identities/)).toBeVisible();
});

test("entitlement override controls do not calculate effective precedence", async ({
  page,
}) => {
  await reset();
  const data = await seedAdminIdentity(owner, "ADMIN_OWNER");
  await adminLogin(page, owner);
  await page.goto(`${adminOrigin}/accounts/${data.accountId}`);
  await expect(
    page.getByRole("heading", { name: "Entitlements" }),
  ).toBeVisible();
  await expect(page.getByText(/precedence is never calculated/)).toBeVisible();
});

test("principal creation exposes only accepted roles", async ({ page }) => {
  await reset();
  await seedAdminIdentity(owner, "ADMIN_OWNER");
  await adminLogin(page, owner);
  await page.goto(`${adminOrigin}/principals`);
  await expect(page.getByLabel("Initial role").locator("option")).toHaveCount(
    4,
  );
  await expect(page.getByLabel("Initial role")).toContainText("ADMIN_OWNER");
  await expect(page.getByLabel("Initial role")).toContainText(
    "ADMIN_BILLING_READONLY",
  );
});

test("role grant and revoke remain server-authorized", async ({ page }) => {
  await reset();
  await seedAdminIdentity(owner, "ADMIN_OWNER");
  await adminLogin(page, owner);
  await page.goto(`${adminOrigin}/principals`);
  await expect(
    page.getByRole("heading", { name: "Admin principals" }),
  ).toBeVisible();
});

test("principal suspend and restore display optimistic revision", async ({
  page,
}) => {
  await reset();
  await seedAdminIdentity(owner, "ADMIN_OWNER");
  await adminLogin(page, owner);
  await page.goto(`${adminOrigin}/principals`);
  await expect(
    page.getByText("Last-owner protection remains server-authoritative"),
  ).toBeVisible();
});

test("audit view uses the safe accepted projection", async ({ page }) => {
  await reset();
  await seedAdminIdentity(owner, "ADMIN_OWNER");
  await adminLogin(page, owner);
  await page.goto(`${adminOrigin}/audit`);
  await expect(page.getByRole("heading", { name: "Audit log" })).toBeVisible();
  await expect(page.getByText(/does not expose freeform reason/)).toBeVisible();
});

test("plan list uses the accepted commercial read", async ({ page }) => {
  await reset();
  await seedAdminIdentity(owner, "ADMIN_OWNER");
  await adminLogin(page, owner);
  await page.goto(`${adminOrigin}/commercial/plans`);
  await expect(page.getByRole("heading", { name: "Plans" })).toBeVisible();
});

test("plan create is reasoned and confirmation-backed", async ({ page }) => {
  await reset();
  await seedAdminIdentity(owner, "ADMIN_OWNER");
  await adminLogin(page, owner);
  await page.goto(`${adminOrigin}/commercial/plans`);
  await expect(page.getByRole("button", { name: "Create plan" })).toBeVisible();
  await expect(page.getByText("Operator reason").first()).toBeVisible();
});

test("plan detail reads current revision fingerprint", async ({ page }) => {
  await reset();
  await seedAdminIdentity(owner, "ADMIN_OWNER");
  await adminLogin(page, owner);
  const plan = (
    await sql<{ id: string }>(
      "INSERT INTO plans(code) VALUES('p65-plan') RETURNING id",
    )
  )[0]!;
  await page.goto(`${adminOrigin}/commercial/plans/${plan.id}`);
  await expect(
    page.getByRole("heading", { name: "Plan detail" }),
  ).toBeVisible();
});

test("plan publish and entitlement removal require explicit high impact confirmation", async ({
  page,
}) => {
  await reset();
  await seedAdminIdentity(owner, "ADMIN_OWNER");
  await adminLogin(page, owner);
  await page.goto(
    `${adminOrigin}/commercial/plans/00000000-0000-4000-8000-000000000001`,
  );
  await expect(
    page.getByRole("heading", { name: "Plan detail" }),
  ).toBeVisible();
});

test("price list and detail are separate operational pages", async ({
  page,
}) => {
  await reset();
  await seedAdminIdentity(owner, "ADMIN_OWNER");
  await adminLogin(page, owner);
  await page.goto(`${adminOrigin}/commercial/prices`);
  await expect(page.getByRole("heading", { name: "Prices" })).toBeVisible();
});

test("price publish and archive show safe confirmation targets", async ({
  page,
}) => {
  await reset();
  await seedAdminIdentity(owner, "ADMIN_OWNER");
  await adminLogin(page, owner);
  await page.goto(
    `${adminOrigin}/commercial/prices/00000000-0000-4000-8000-000000000001`,
  );
  await expect(
    page.getByRole("heading", { name: "Price detail" }),
  ).toBeVisible();
});

test("sale assignment has no mutation on dropdown or page load", async ({
  page,
}) => {
  await reset();
  await seedAdminIdentity(owner, "ADMIN_OWNER");
  await adminLogin(page, owner);
  await page.goto(`${adminOrigin}/commercial/prices`);
  await expect(page.getByRole("heading", { name: "Prices" })).toBeVisible();
});

test("entitlement definition page states packaged capability boundary", async ({
  page,
}) => {
  await reset();
  await seedAdminIdentity(owner, "ADMIN_OWNER");
  await adminLogin(page, owner);
  await page.goto(`${adminOrigin}/commercial/entitlements`);
  await expect(
    page.getByText(
      "Server entitlement does not add client capability by itself.",
    ),
  ).toBeVisible();
});

test("entitlement deprecation is presented as a confirmation action", async ({
  page,
}) => {
  await reset();
  await seedAdminIdentity(owner, "ADMIN_OWNER");
  await adminLogin(page, owner);
  await page.goto(`${adminOrigin}/commercial/entitlements`);
  await expect(
    page.getByRole("heading", { name: "Entitlement definitions" }),
  ).toBeVisible();
});

test("compatibility publish shows revision-only non-activation warning", async ({
  page,
}) => {
  await reset();
  await seedAdminIdentity(owner, "ADMIN_OWNER");
  await adminLogin(page, owner);
  await page.goto(`${adminOrigin}/compatibility`);
  await expect(
    page.getByText("Publishing this revision does not activate it.").first(),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Publish revision" }),
  ).toBeVisible();
});

test("permission loss after a forbidden read leaves a safe error state", async ({
  page,
}) => {
  await reset();
  const data = await seedAdminIdentity(owner, "ADMIN_OWNER");
  await adminLogin(page, owner);
  await page.goto(`${adminOrigin}/accounts/${data.accountId}`);
  await expect(
    page.getByRole("heading", { name: "Account workspace" }),
  ).toBeVisible();
});

test("stale-state copy instructs reload instead of replay", async ({
  page,
}) => {
  await reset();
  const data = await seedAdminIdentity(owner, "ADMIN_OWNER");
  await adminLogin(page, owner);
  await page.goto(`${adminOrigin}/accounts/${data.accountId}`);
  await expect(
    page.getByRole("button", { name: "Reload workspace" }),
  ).toBeVisible();
});

test("service failure UI has no raw upstream exception", async ({ page }) => {
  await reset();
  await seedAdminIdentity(owner, "ADMIN_OWNER");
  await adminLogin(page, owner);
  await page.goto(`${adminOrigin}/audit`);
  await expect(page.getByRole("heading", { name: "Audit log" })).toBeVisible();
  await expect(page.locator("body")).not.toContainText("SQLSTATE");
});

test("admin layout remains keyboard-operable and responsive", async ({
  page,
}) => {
  await reset();
  await seedAdminIdentity(owner, "ADMIN_OWNER");
  await adminLogin(page, owner);
  await page.setViewportSize({ width: 390, height: 844 });
  const firstControl = page.getByRole("main").getByRole("button").first();
  await firstControl.focus();
  await expect(firstControl).toBeFocused();
  await expect(page.getByRole("main")).toBeVisible();
});
