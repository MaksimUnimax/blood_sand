import { describe, expect, it } from "vitest";
import {
  ExtensionAuthService,
  createEphemeralAccessTokenSigningKey,
  deriveExtensionAuthKeys,
  issueAccessToken,
  type ExtensionAuthRepository,
} from "@product/extension-auth";
import { authenticateExtensionBearer } from "./extension-access-auth.js";

const identity = {
  sessionId: "session",
  deviceId: "device",
  accountId: "account",
};
const keys = deriveExtensionAuthKeys(Buffer.alloc(32, 7));
const signingKey = createEphemeralAccessTokenSigningKey();
function service(
  authorize: ExtensionAuthRepository["authorize"] = async () => identity,
) {
  return new ExtensionAuthService(
    {
      consumeRefreshRate: async () => ({ allowed: true }),
      authorize,
      authorizeFromRefreshHash: async () => identity,
      createRefresh: async () => true,
      rotateRefresh: async () => "rotated",
    } satisfies ExtensionAuthRepository,
    keys,
    undefined,
    signingKey,
  );
}
describe("internal extension bearer primitive", () => {
  it("returns an active principal and fails closed for malformed credentials", async () => {
    const token = await issueAccessToken(signingKey, identity);
    await expect(
      authenticateExtensionBearer(`Bearer ${token}`, service()),
    ).resolves.toEqual({ ok: true, value: identity });
    for (const value of [
      undefined,
      "Basic x",
      "Bearer",
      "Bearer ",
      "Bearer a b",
      "Bearer broken",
      "Bearer x, Bearer y",
      "B".repeat(8193),
    ])
      await expect(
        authenticateExtensionBearer(value, service()),
      ).resolves.toEqual({ ok: false, code: "ACCESS_TOKEN_INVALID" });
    await expect(
      authenticateExtensionBearer(
        `Bearer ${token}`,
        service(async () => undefined),
      ),
    ).resolves.toEqual({ ok: false, code: "ACCESS_TOKEN_INVALID" });
  });
});
