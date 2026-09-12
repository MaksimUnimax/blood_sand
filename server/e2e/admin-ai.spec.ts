import { expect, test, type Page } from "@playwright/test";
import {
  adminLogin,
  adminOrigin,
  reset,
  seedAdminIdentity,
  sql,
} from "./support/fixtures.js";

test.describe.configure({ mode: "serial" });

async function mutate(page: Page, action: string, reason: string) {
  const button = page.getByRole("button", { name: action, exact: true }).last();
  const panel = button
    .locator("xpath=ancestor::div[contains(@class, 'panel')]")
    .first();
  await panel.getByRole("textbox", { name: "Operator reason" }).fill(reason);
  await button.click();
  const mutation = page.waitForResponse(
    (response) =>
      response.url().includes("/api/control-plane/v1/admin/ai/") &&
      response.request().method() === "POST",
  );
  const confirmation = page.getByRole("button", {
    name: `Confirm ${action}`,
    exact: true,
  });
  await confirmation
    .locator("xpath=ancestor::div[contains(@class, 'panel')]")
    .first()
    .getByRole("textbox", { name: "Operator reason" })
    .fill(reason);
  await expect(confirmation).toBeEnabled();
  await confirmation.click();
  const mutationResponse = await mutation;
  if (!mutationResponse.ok()) {
    throw new Error(
      `${action} failed: ${mutationResponse.status()} ${await mutationResponse.text()}`,
    );
  }
  await expect(
    page.getByRole("button", { name: `Confirm ${action}`, exact: true }),
  ).toHaveCount(0);
}

async function createPublishedProfile(page: Page, suffix: string) {
  await page.goto(`${adminOrigin}/ai/registry`);
  await expect(
    page.getByRole("heading", { name: "AI adapter registry" }),
  ).toBeVisible();
  await page.getByLabel("Machine key").first().fill(`e2e-${suffix}`);
  await page.getByLabel("Display name").first().fill(`E2E ${suffix}`);
  await page.getByLabel("Description").first().fill("A bounded E2E adapter");
  await mutate(page, "Create adapter", `create adapter ${suffix}`);
  await page.getByLabel("Surface machine key").fill(`surface-${suffix}`);
  await page.getByLabel("Surface display name").fill(`Surface ${suffix}`);
  await mutate(page, "Create surface", `create surface ${suffix}`);
  await page.getByLabel("Variant machine key").fill(`variant-${suffix}`);
  await page.getByLabel("Variant display name").fill(`Variant ${suffix}`);
  await mutate(page, "Create variant", `create variant ${suffix}`);

  await page.goto(`${adminOrigin}/ai/profiles`);
  await expect(
    page.getByRole("heading", { name: "AI profiles" }),
  ).toBeVisible();
  const profileCreate = page
    .getByRole("heading", { name: "Create stable profile identity" })
    .locator("xpath=..");
  await profileCreate
    .locator("select")
    .nth(0)
    .selectOption({ label: `E2E ${suffix} (e2e-${suffix})` });
  await profileCreate
    .locator("select")
    .nth(1)
    .selectOption({ label: `Surface ${suffix} (surface-${suffix})` });
  await profileCreate
    .locator("select")
    .nth(2)
    .selectOption({ label: `Variant ${suffix} (variant-${suffix})` });
  await page.getByLabel("Machine key").fill(`profile-${suffix}`);
  await page.getByLabel("Display name").fill(`Profile ${suffix}`);
  await mutate(page, "Create profile", `create profile ${suffix}`);
  await expect(
    page.getByRole("heading", { name: "Structured profile draft" }),
  ).toBeVisible();
  await mutate(page, "Create DRAFT", `create draft ${suffix}`);
  await mutate(page, "Replace DRAFT", `replace draft ${suffix}`);
  await mutate(page, "Mark CANDIDATE", `candidate ${suffix}`);
  await expect(page.getByText(/CANDIDATE/)).toBeVisible();
  await mutate(page, "Publish revision", `publish ${suffix}`);
}

test("owner sees all AI workspaces and support/billing permissions stay isolated", async ({
  page,
}) => {
  await reset();
  await seedAdminIdentity("p75-owner-nav@example.test", "ADMIN_OWNER");
  await adminLogin(page, "p75-owner-nav@example.test");
  for (const label of ["Registry", "Profiles", "Assignments"])
    await expect(
      page.getByRole("link", { name: label, exact: true }),
    ).toBeVisible();
  await page.goto(`${adminOrigin}/ai/registry`);
  await expect(
    page.getByRole("heading", { name: "AI adapter registry" }),
  ).toBeVisible();
  await page.goto(`${adminOrigin}/ai/profiles`);
  await expect(
    page.getByRole("heading", { name: "AI profiles" }),
  ).toBeVisible();
  await page.goto(`${adminOrigin}/ai/assignments`);
  await expect(
    page.getByRole("heading", { name: "AI assignment operations" }),
  ).toBeVisible();

  await page.getByRole("button", { name: "End admin session" }).click();
  await seedAdminIdentity("p75-support-nav@example.test", "ADMIN_SUPPORT");
  await adminLogin(page, "p75-support-nav@example.test");
  await expect(
    page.getByRole("link", { name: "Registry", exact: true }),
  ).toBeVisible();
  await page.goto(`${adminOrigin}/ai/registry`);
  await expect(
    page.getByRole("heading", { name: "AI adapter registry" }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: /Create adapter/ }),
  ).toHaveCount(0);
  await page.goto(`${adminOrigin}/ai/profiles`);
  await expect(
    page.getByRole("button", { name: /Create profile/ }),
  ).toHaveCount(0);

  await page.getByRole("button", { name: "End admin session" }).click();
  await seedAdminIdentity(
    "p75-billing-nav@example.test",
    "ADMIN_BILLING_READONLY",
  );
  await adminLogin(page, "p75-billing-nav@example.test");
  await expect(
    page.getByRole("link", { name: "Registry", exact: true }),
  ).toHaveCount(0);
  await page.goto(`${adminOrigin}/ai/registry`);
  await expect(
    page.locator(".notice.error").filter({ hasText: "not available" }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: /Create adapter/ }),
  ).toHaveCount(0);
});

test("owner completes registry, structured profile lifecycle, and assignment rollout UX", async ({
  page,
}) => {
  await reset();
  await seedAdminIdentity("p75-owner-flow@example.test", "ADMIN_OWNER");
  await adminLogin(page, "p75-owner-flow@example.test");
  await createPublishedProfile(page, "flow");
  await expect(page.locator("body")).not.toContainText(/cohort|seed/i);
  await expect(page.locator("body")).not.toContainText(
    /javascript|eval|wasm|filesystem|http method/i,
  );

  await page.goto(`${adminOrigin}/ai/assignments`);
  await expect(
    page.getByRole("heading", { name: "AI assignment operations" }),
  ).toBeVisible();
  const scopeCreate = page
    .getByRole("heading", { name: "Create assignment scope" })
    .locator("xpath=..");
  await scopeCreate
    .locator("select")
    .nth(0)
    .selectOption({ label: "E2E flow (e2e-flow)" });
  await scopeCreate
    .locator("select")
    .nth(1)
    .selectOption({ label: "Surface flow (surface-flow)" });
  await scopeCreate
    .locator("select")
    .nth(2)
    .selectOption({ label: "Variant flow (variant-flow)" });
  await page.getByLabel("Browser family").selectOption("chrome");
  await page.getByLabel("Subject kind").selectOption("ACCOUNT");
  await mutate(page, "Create assignment scope", "create assignment flow");
  await expect(page.getByText(/No assignment revision exists/)).toBeVisible();

  await page
    .getByLabel("Profile")
    .first()
    .selectOption({ label: "Profile flow (profile-flow)" });
  await expect(page.getByLabel("Direct profile revision")).toBeVisible();
  await page.getByLabel("Direct profile revision").selectOption({ index: 1 });
  await mutate(page, "Assign direct", "direct assignment flow");
  await expect(
    page.getByRole("cell", { name: "DIRECT", exact: true }).first(),
  ).toBeVisible();
  await expect(
    page.getByText(/Current expected assignment revision: 1/),
  ).toBeVisible();

  await page
    .getByLabel("Rollout baseline profile revision")
    .selectOption({ index: 1 });
  await page
    .getByLabel("Rollout candidate profile revision")
    .selectOption({ index: 1 });
  await expect(
    page.getByRole("button", { name: "Start rollout", exact: true }),
  ).toBeDisabled();
  await page.goto(`${adminOrigin}/ai/profiles`);
  await mutate(page, "Create DRAFT", "create second draft flow");
  await mutate(page, "Mark CANDIDATE", "candidate second flow");
  await mutate(page, "Publish revision", "publish second flow");
  await page.goto(`${adminOrigin}/ai/assignments`);
  await page
    .getByLabel("Profile")
    .first()
    .selectOption({ label: "Profile flow (profile-flow)" });
  await expect(
    page.getByLabel("Rollout candidate profile revision"),
  ).toBeVisible();
  await page
    .getByLabel("Rollout baseline profile revision")
    .selectOption({ index: 1 });
  await page
    .getByLabel("Rollout candidate profile revision")
    .selectOption({ index: 2 });
  await page.getByLabel("Percentage (exact 0.00–100.00%)").fill("10.00");
  await mutate(page, "Start rollout", "start rollout flow");
  await expect(
    page.getByRole("cell", { name: "ROLLOUT", exact: true }).first(),
  ).toBeVisible();
  await page.getByLabel("Percentage (exact 0.00–100.00%)").fill("25.00");
  await mutate(page, "Change percentage", "increase rollout flow");
  await mutate(page, "Pause rollout", "pause rollout flow");
  await expect(page.getByText(/candidate is not being selected/)).toBeVisible();
  await mutate(page, "Resume rollout", "resume rollout flow");
  await mutate(page, "Complete rollout", "complete rollout flow");
  await expect(
    page.getByRole("cell", { name: "DIRECT", exact: true }).first(),
  ).toBeVisible();
});

test("stale registry review is invalidated without retry and logout remains safe", async ({
  page,
}) => {
  await reset();
  const identity = await seedAdminIdentity(
    "p75-stale@example.test",
    "ADMIN_OWNER",
  );
  await adminLogin(page, "p75-stale@example.test");
  await createPublishedProfile(page, "stale");
  await page.goto(`${adminOrigin}/ai/registry`);
  const adapter = (
    await sql<{ id: string; updated_at: string }>(
      "SELECT id, updated_at FROM ai_adapters LIMIT 1",
    )
  )[0]!;
  const save = page.getByRole("button", {
    name: "Save adapter metadata",
    exact: true,
  });
  const panel = save
    .locator("xpath=ancestor::div[contains(@class, 'panel')]")
    .first();
  await panel
    .getByRole("textbox", { name: "Operator reason" })
    .fill("stale review");
  await save.click();
  await sql(
    "UPDATE ai_adapters SET updated_at = updated_at + interval '1 second' WHERE id=$1",
    [adapter.id],
  );
  let mutations = 0;
  page.on("request", (request) => {
    if (
      request.url().includes(`/ai/registry/adapters/${adapter.id}/metadata`) &&
      request.method() === "POST"
    )
      mutations += 1;
  });
  await page
    .getByRole("button", { name: "Confirm Save adapter metadata", exact: true })
    .click();
  await expect(page.getByText(/not automatically repeated/)).toBeVisible();
  expect(mutations).toBe(1);
  await page.getByRole("button", { name: "End admin session" }).click();
  await expect(page).toHaveURL(`${adminOrigin}/login`);
  expect(identity.principalId).toBeTruthy();
});
