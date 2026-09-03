import type {
  ExtensionAuthService,
  ExtensionPrincipal,
} from "@product/extension-auth";

export type AccessAuthenticationResult =
  | { ok: true; value: ExtensionPrincipal }
  | { ok: false; code: "ACCESS_TOKEN_INVALID" };

/** Internal primitive for future protected extension routes. */
export async function authenticateExtensionBearer(
  authorization: string | string[] | undefined,
  auth: ExtensionAuthService,
): Promise<AccessAuthenticationResult> {
  if (typeof authorization !== "string" || authorization.length > 8192)
    return { ok: false, code: "ACCESS_TOKEN_INVALID" };
  const match = /^Bearer ([^\s,]+)$/i.exec(authorization);
  if (!match) return { ok: false, code: "ACCESS_TOKEN_INVALID" };
  const result = await auth.authenticateAccess(match[1]!);
  return result.ok
    ? { ok: true, value: result.value }
    : { ok: false, code: "ACCESS_TOKEN_INVALID" };
}
