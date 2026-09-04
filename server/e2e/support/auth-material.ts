import { loadAccessTokenSigningKey } from "@product/extension-auth";

/** Synthetic E2E-only material shared by the API harness and service probe. */
export const TEST_ONLY_AUTH_ROOT = Buffer.alloc(32, 23);
const TEST_ONLY_ED25519_PKCS8_PEM_B64 =
  "LS0tLS1CRUdJTiBQUklWQVRFIEtFWS0tLS0tCk1DNENBUUF3QlFZREsyVndCQ0lFSUVHMHZLOFNlMWZIYVFrNThQZHhwdzlLb2tQZC90RXh3ZGw5aUNJcDJoVVgKLS0tLS1FTkQgUFJJVkFURSBLRVktLS0tLQo=";

export const TEST_ONLY_ACCESS_TOKEN_SIGNING_KEY = loadAccessTokenSigningKey({
  ACCESS_TOKEN_SIGNING_PRIVATE_KEY_PEM_B64: TEST_ONLY_ED25519_PKCS8_PEM_B64,
  ACCESS_TOKEN_SIGNING_KEY_ID: "e2e-ed25519-v1",
});
