import { describe, expect, it } from "vitest";
import { safeReturnTo } from "./return-to.js";

describe("safeReturnTo", () => {
  const id = "123e4567-e89b-42d3-a456-426614174000";

  it("permits only explicit portal destinations", () => {
    expect(safeReturnTo("/")).toBe("/");
    expect(safeReturnTo("/devices")).toBe("/devices");
    expect(safeReturnTo(`/activate?authorizationId=${id}`)).toBe(
      `/activate?authorizationId=${id}`,
    );
  });

  it.each([
    "https://example.com",
    "http://example.com",
    "//example.com",
    "\\\\example.com",
    "javascript:alert(1)",
    "data:text/html,x",
    "/%",
    "/devices%2f..%2flogin",
    "/login",
    "/activate?authorizationId=not-a-uuid",
    "/devices?x=1",
    "/\u0000",
    `/${"a".repeat(2049)}`,
  ])("rejects unsafe destination %#", (value) => {
    expect(safeReturnTo(value)).toBe("/");
  });
});
