import { generateKeyPairSync } from "node:crypto";
import { describe, expect, it } from "vitest";
import {
  bindConfigSigningMaterial,
  loadConfigSigningMaterial,
} from "./bootstrap-signing.js";

function environment(pem?: string, keyId = "config-key"): NodeJS.ProcessEnv {
  return {
    CONFIG_SIGNING_KEY_ID: keyId,
    ...(pem === undefined
      ? {}
      : {
          CONFIG_SIGNING_PRIVATE_KEY_PEM_B64:
            Buffer.from(pem).toString("base64"),
        }),
  };
}

function ed25519Pem(): string {
  return generateKeyPairSync("ed25519").privateKey.export({
    format: "pem",
    type: "pkcs8",
  }) as string;
}

describe("API config-signing material", () => {
  it("loads a runtime-generated Ed25519 private PEM and derives public metadata", () => {
    const material = loadConfigSigningMaterial(environment(ed25519Pem()));
    expect(material.keyId).toBe("config-key");
    expect(material.publicKeySpkiDer.length).toBeGreaterThan(0);
    expect(material.publicKeySha256).toMatch(/^[0-9a-f]{64}$/);
  });

  it.each([
    ["missing", {}],
    ["empty", { CONFIG_SIGNING_PRIVATE_KEY_PEM_B64: "" }],
    ["invalid base64", { CONFIG_SIGNING_PRIVATE_KEY_PEM_B64: "***=" }],
    ["non-canonical base64", { CONFIG_SIGNING_PRIVATE_KEY_PEM_B64: "YQ===" }],
    [
      "invalid pem",
      {
        CONFIG_SIGNING_PRIVATE_KEY_PEM_B64:
          Buffer.from("not a key").toString("base64"),
      },
    ],
  ])("fails closed for %s private-key input", (_name, input) => {
    expect(() =>
      loadConfigSigningMaterial({
        CONFIG_SIGNING_KEY_ID: "config-key",
        ...input,
      }),
    ).toThrow("bootstrap signing configuration is invalid");
  });

  it("rejects a public key, RSA key, and invalid key identifier", () => {
    const ed = generateKeyPairSync("ed25519");
    const publicPem = ed.publicKey.export({
      format: "pem",
      type: "spki",
    }) as string;
    const rsaPem = generateKeyPairSync("rsa", {
      modulusLength: 2048,
    }).privateKey.export({ format: "pem", type: "pkcs8" }) as string;
    expect(() => loadConfigSigningMaterial(environment(publicPem))).toThrow();
    expect(() => loadConfigSigningMaterial(environment(rsaPem))).toThrow();
    expect(() =>
      loadConfigSigningMaterial(environment(ed25519Pem(), "bad key id")),
    ).toThrow();
  });

  it("binds only exact Ed25519 public metadata", () => {
    const material = loadConfigSigningMaterial(environment(ed25519Pem()));
    const metadata = {
      keyId: material.keyId,
      algorithm: "Ed25519" as const,
      publicKeySpkiDer: material.publicKeySpkiDer,
      publicKeySha256: material.publicKeySha256,
      createdAt: new Date(),
    };
    expect(() => bindConfigSigningMaterial(material, metadata)).not.toThrow();
    expect(() => bindConfigSigningMaterial(material, undefined)).toThrow();
    expect(() =>
      bindConfigSigningMaterial(material, {
        ...metadata,
        publicKeySpkiDer: Buffer.from("different"),
      }),
    ).toThrow();
    expect(() =>
      bindConfigSigningMaterial(material, {
        ...metadata,
        publicKeySha256: "0".repeat(64),
      }),
    ).toThrow();
  });
});
