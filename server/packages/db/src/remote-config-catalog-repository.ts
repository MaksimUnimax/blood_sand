import { createHash, createPublicKey } from "node:crypto";
import {
  ConfigReleaseCompatibilityPolicySchema,
  ConfigReleaseSchema,
  SigningKeyEventSchema,
  SigningKeyMetadataSchema,
  type RemoteConfigCatalogRepository,
} from "@product/remote-config";
import type { DatabaseQuery } from "./index";

function parseKey(row: Record<string, unknown>) {
  const key = SigningKeyMetadataSchema.parse(row);
  if (
    createHash("sha256").update(key.publicKeySpkiDer).digest("hex") !==
    key.publicKeySha256
  )
    throw new Error("corrupt signing key fingerprint");
  try {
    if (
      createPublicKey({
        key: key.publicKeySpkiDer,
        format: "der",
        type: "spki",
      }).asymmetricKeyType !== "ed25519"
    )
      throw new Error("not Ed25519");
  } catch {
    throw new Error("corrupt Ed25519 SPKI");
  }
  return key;
}
export function createRemoteConfigCatalogRepository(
  db: DatabaseQuery,
): RemoteConfigCatalogRepository {
  return {
    async findSigningKey(keyId) {
      const r = await db.query(
        'SELECT key_id AS "keyId",algorithm,public_key_spki_der AS "publicKeySpkiDer",public_key_sha256 AS "publicKeySha256",created_at AS "createdAt" FROM signing_keys WHERE key_id=$1',
        [keyId],
      );
      return r.rows[0] ? parseKey(r.rows[0]) : undefined;
    },
    async listSigningKeyEvents(keyId) {
      const r = await db.query(
        'SELECT id,key_id AS "keyId",event_type AS "eventType",occurred_at AS "occurredAt",reason_code AS "reasonCode",created_at AS "createdAt" FROM signing_key_events WHERE key_id=$1 ORDER BY occurred_at,id',
        [keyId],
      );
      return r.rows.map((row) => SigningKeyEventSchema.parse(row));
    },
    async findConfigRelease(configVersion) {
      const r = await db.query(
        'SELECT config_version AS "configVersion",contract_version AS "contractVersion",snapshot_version AS "snapshotVersion",envelope_version AS "envelopeVersion",content_hash_sha256 AS "contentHashSha256",source_fingerprint_sha256 AS "sourceFingerprintSha256",signing_key_id AS "signingKeyId",published_at AS "publishedAt",created_at AS "createdAt" FROM config_releases WHERE config_version=$1',
        [configVersion],
      );
      return r.rows[0] ? ConfigReleaseSchema.parse(r.rows[0]) : undefined;
    },
    async findLatestConfigRelease(contractVersion) {
      const r = await db.query(
        'SELECT config_version AS "configVersion",contract_version AS "contractVersion",snapshot_version AS "snapshotVersion",envelope_version AS "envelopeVersion",content_hash_sha256 AS "contentHashSha256",source_fingerprint_sha256 AS "sourceFingerprintSha256",signing_key_id AS "signingKeyId",published_at AS "publishedAt",created_at AS "createdAt" FROM config_releases WHERE contract_version=$1 ORDER BY config_version DESC LIMIT 1',
        [contractVersion],
      );
      return r.rows[0] ? ConfigReleaseSchema.parse(r.rows[0]) : undefined;
    },
    async listConfigReleaseCompatibilityPolicies(configVersion) {
      const r = await db.query(
        'SELECT config_version AS "configVersion",policy_revision_id AS "policyRevisionId" FROM config_release_compatibility_policies WHERE config_version=$1 ORDER BY policy_revision_id',
        [configVersion],
      );
      return r.rows.map((row) =>
        ConfigReleaseCompatibilityPolicySchema.parse(row),
      );
    },
  };
}
