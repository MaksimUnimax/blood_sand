import { afterEach, describe, expect, it } from "vitest";
import { assertE2eDatabase } from "./database.js";

const originalE2e = process.env.PRODUCT_CONTROL_PLANE_E2E;
const originalDatabaseUrl = process.env.DATABASE_URL;

afterEach(() => {
  if (originalE2e === undefined) delete process.env.PRODUCT_CONTROL_PLANE_E2E;
  else process.env.PRODUCT_CONTROL_PLANE_E2E = originalE2e;
  if (originalDatabaseUrl === undefined) delete process.env.DATABASE_URL;
  else process.env.DATABASE_URL = originalDatabaseUrl;
});

describe("assertE2eDatabase", () => {
  it("accepts an explicitly enabled loopback test database", () => {
    process.env.PRODUCT_CONTROL_PLANE_E2E = "1";
    process.env.DATABASE_URL = "postgres://user:password@127.0.0.1:5432/product_control_plane_test";

    expect(assertE2eDatabase()).toBe(process.env.DATABASE_URL);
  });

  it("rejects the former CI database name", () => {
    process.env.PRODUCT_CONTROL_PLANE_E2E = "1";
    process.env.DATABASE_URL = "postgres://user:password@127.0.0.1:5432/product_control_plane_ci";

    expect(assertE2eDatabase).toThrow(/explicitly named e2e or test/);
  });
});
