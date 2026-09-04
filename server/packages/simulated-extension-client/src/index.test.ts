import { describe, expect, it } from "vitest";
import { SimulatedExtensionClient } from "./index.js";

describe("SimulatedExtensionClient", () => {
  it("rejects non-origin constructor inputs", () => {
    for (const input of [
      "/api",
      "ftp://example.test",
      "https://u:p@example.test",
      "https://example.test/path",
      "https://example.test/?q=1",
    ]) {
      expect(
        () =>
          new SimulatedExtensionClient({
            controlPlaneApiOrigin: input,
            portalOrigin: "https://portal.test",
          }),
      ).toThrow("invalid origin");
    }
  });

  it("keeps codes out of the verification URL", async () => {
    const client = new SimulatedExtensionClient({
      controlPlaneApiOrigin: "https://api.test",
      portalOrigin: "https://portal.test",
      fetch: async () =>
        new Response(
          JSON.stringify({
            status: "pending",
            authorizationId: "123e4567-e89b-42d3-a456-426614174000",
            deviceCode: "a".repeat(43),
            userCode: "ABCD-EFGH",
            expiresAt: "2026-01-01T00:00:00.000Z",
          }),
          { status: 201 },
        ),
    });
    const result = await client.startAuthorization(
      {
        clientType: "browser_extension",
        browserFamily: "chrome",
        extensionVersion: "1",
      },
      "123e4567-e89b-42d3-a456-426614174001",
    );
    expect(result.verificationUrl).toBe(
      "https://portal.test/activate?authorizationId=123e4567-e89b-42d3-a456-426614174000",
    );
    expect(result.verificationUrl).not.toContain("a".repeat(43));
    expect(result.verificationUrl).not.toContain("ABCD-EFGH");
  });
});
