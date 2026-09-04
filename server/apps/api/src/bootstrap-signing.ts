import {
  createHash,
  createPrivateKey,
  createPublicKey,
  type KeyObject,
} from "node:crypto";
import { type BootstrapSnapshotPayloadV1 } from "@product/contracts";
import { StableMachineIdentifierV1Schema } from "@product/shared";
import {
  signBootstrapSnapshot,
  type SigningKeyMetadata,
} from "@product/remote-config";
import type { BootstrapSnapshotSigner } from "@product/bootstrap";

export type ConfigSigningMaterial = BootstrapSnapshotSigner & {
  publicKey: KeyObject;
  publicKeySpkiDer: Buffer;
  publicKeySha256: string;
};

/** API-only composition: config signing credentials are never part of AppConfig. */
export function loadConfigSigningMaterial(
  environment: NodeJS.ProcessEnv,
): ConfigSigningMaterial {
  const encoded = environment.CONFIG_SIGNING_PRIVATE_KEY_PEM_B64;
  const keyId = environment.CONFIG_SIGNING_KEY_ID;
  if (
    !encoded ||
    !keyId ||
    !StableMachineIdentifierV1Schema.safeParse(keyId).success
  )
    throw new Error("bootstrap signing configuration is invalid");
  try {
    if (!/^[A-Za-z0-9+/]*={0,2}$/.test(encoded) || encoded.length % 4 !== 0)
      throw new Error("invalid base64");
    const pem = Buffer.from(encoded, "base64");
    if (!pem.length || pem.toString("base64") !== encoded)
      throw new Error("non-canonical");
    const privateKey = createPrivateKey({
      key: pem,
      format: "pem",
      type: "pkcs8",
    });
    if (privateKey.asymmetricKeyType !== "ed25519")
      throw new Error("not Ed25519");
    const publicKey = createPublicKey(privateKey);
    const publicKeySpkiDer = publicKey.export({ format: "der", type: "spki" });
    const publicKeySha256 = createHash("sha256")
      .update(publicKeySpkiDer)
      .digest("hex");
    return {
      keyId,
      publicKey,
      publicKeySpkiDer,
      publicKeySha256,
      sign: (payload: BootstrapSnapshotPayloadV1) =>
        signBootstrapSnapshot(payload, keyId, privateKey),
    };
  } catch {
    throw new Error("bootstrap signing configuration is invalid");
  }
}
export function bindConfigSigningMaterial(
  material: ConfigSigningMaterial,
  metadata: SigningKeyMetadata | undefined,
): void {
  if (
    !metadata ||
    metadata.algorithm !== "Ed25519" ||
    !Buffer.from(metadata.publicKeySpkiDer).equals(material.publicKeySpkiDer) ||
    metadata.publicKeySha256 !== material.publicKeySha256
  )
    throw new Error("bootstrap signing key metadata binding is invalid");
}
