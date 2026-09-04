import { createHash, generateKeyPairSync } from "node:crypto";
import { expect, it } from "vitest";
import { createRemoteConfigCatalogRepository } from "./remote-config-catalog-repository.js";
import type { DatabaseQuery } from "./index.js";

it("fails closed for corrupt signing-key rows", async () => {
  const pair = generateKeyPairSync("ed25519");
  const der = pair.publicKey.export({ format: "der", type: "spki" });
  const valid = {
    keyId: "config-current",
    algorithm: "Ed25519",
    publicKeySpkiDer: der,
    publicKeySha256: createHash("sha256").update(der).digest("hex"),
    createdAt: new Date(),
  };
  for (const row of [
    { ...valid, publicKeySha256: "f".repeat(64) },
    { ...valid, publicKeySpkiDer: Buffer.from("not an SPKI") },
    { ...valid, algorithm: "RSA" },
    { ...valid, publicKeySha256: "F".repeat(64) },
  ]) {
    const database: DatabaseQuery = {
      query: async () => ({ rows: [row] }),
    } as DatabaseQuery;
    await expect(
      createRemoteConfigCatalogRepository(database).findSigningKey(
        "config-current",
      ),
    ).rejects.toThrow();
  }
});
