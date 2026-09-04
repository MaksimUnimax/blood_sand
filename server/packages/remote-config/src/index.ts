import { sign, verify, type KeyObject } from "node:crypto";
import {
  BootstrapSnapshotPayloadV1Schema,
  SignedBootstrapEnvelopeV1Schema,
  type BootstrapSnapshotPayloadV1,
  type SignedBootstrapEnvelopeV1,
} from "@product/contracts";

export const BOOTSTRAP_SIGNATURE_DOMAIN = Buffer.from(
  "product-control-plane/bootstrap-snapshot/v1\0",
  "utf8",
);

export type CanonicalJsonValue =
  | null
  | boolean
  | string
  | number
  | CanonicalJsonValue[]
  | { [key: string]: CanonicalJsonValue };

/** Deterministic JSON for already schema-validated declarative snapshots only. */
export function canonicalizeJson(value: unknown): Buffer {
  return Buffer.from(canonicalize(value), "utf8");
}

function canonicalize(value: unknown): string {
  if (value === null) return "null";
  switch (typeof value) {
    case "boolean":
      return value ? "true" : "false";
    case "string":
      return JSON.stringify(value);
    case "number":
      if (!Number.isSafeInteger(value) || Object.is(value, -0))
        throw new TypeError(
          "canonical JSON numbers must be safe integers excluding -0",
        );
      return String(value);
    case "object": {
      if (Array.isArray(value)) return `[${value.map(canonicalize).join(",")}]`;
      if (Object.getPrototypeOf(value) !== Object.prototype)
        throw new TypeError(
          "canonical JSON objects must have Object.prototype",
        );
      const object = value as Record<string, unknown>;
      return `{${Object.keys(object)
        .sort()
        .map((key) => `${JSON.stringify(key)}:${canonicalize(object[key])}`)
        .join(",")}}`;
    }
    default:
      throw new TypeError("value is not valid canonical JSON");
  }
}

/** Packaged public keys; lookup is strictly by the envelope keyId. */
export type TrustedConfigSigningKeyRing = ReadonlyMap<string, KeyObject>;

export type BootstrapVerificationFailure =
  | "INVALID_ENVELOPE"
  | "UNSUPPORTED_ALGORITHM"
  | "UNKNOWN_SIGNING_KEY"
  | "INVALID_SIGNATURE"
  | "INVALID_PAYLOAD_ENCODING"
  | "INVALID_PAYLOAD_JSON"
  | "INVALID_PAYLOAD_SCHEMA"
  | "NON_CANONICAL_PAYLOAD";
export type VerifyBootstrapEnvelopeResult =
  | { ok: true; payload: BootstrapSnapshotPayloadV1 }
  | { ok: false; error: BootstrapVerificationFailure };

export function signBootstrapSnapshot(
  payload: BootstrapSnapshotPayloadV1,
  keyId: string,
  privateKey: KeyObject,
): SignedBootstrapEnvelopeV1 {
  const parsed = BootstrapSnapshotPayloadV1Schema.parse(payload);
  const payloadBytes = canonicalizeJson(parsed);
  const signingBytes = bootstrapSigningBytes(keyId, payloadBytes);
  return SignedBootstrapEnvelopeV1Schema.parse({
    envelopeVersion: "bootstrap_envelope_v1",
    algorithm: "Ed25519",
    keyId,
    payload: payloadBytes.toString("base64url"),
    signature: sign(null, signingBytes, privateKey).toString("base64url"),
  });
}

export function verifyBootstrapEnvelope(
  input: unknown,
  ring: TrustedConfigSigningKeyRing,
): VerifyBootstrapEnvelopeResult {
  const envelope = SignedBootstrapEnvelopeV1Schema.safeParse(input);
  if (!envelope.success) {
    const algorithm = asRecord(input)?.algorithm;
    const raw = asRecord(input);
    if (typeof algorithm === "string" && algorithm !== "Ed25519")
      return { ok: false, error: "UNSUPPORTED_ALGORITHM" };
    if (
      (typeof raw?.payload === "string" && !isBase64Url(raw.payload)) ||
      (typeof raw?.signature === "string" && !isBase64Url(raw.signature))
    )
      return { ok: false, error: "INVALID_PAYLOAD_ENCODING" };
    return {
      ok: false,
      error: "INVALID_ENVELOPE",
    };
  }
  if (envelope.data.algorithm !== "Ed25519")
    return { ok: false, error: "UNSUPPORTED_ALGORITHM" };
  const publicKey = ring.get(envelope.data.keyId);
  if (!publicKey) return { ok: false, error: "UNKNOWN_SIGNING_KEY" };
  const payloadBytes = decodeBase64Url(envelope.data.payload);
  const signature = decodeBase64Url(envelope.data.signature);
  if (!payloadBytes || !signature)
    return { ok: false, error: "INVALID_PAYLOAD_ENCODING" };
  let valid: boolean;
  try {
    valid = verify(
      null,
      bootstrapSigningBytes(envelope.data.keyId, payloadBytes),
      publicKey,
      signature,
    );
  } catch {
    return { ok: false, error: "INVALID_SIGNATURE" };
  }
  if (!valid) return { ok: false, error: "INVALID_SIGNATURE" };
  let json: unknown;
  try {
    json = JSON.parse(payloadBytes.toString("utf8"));
  } catch {
    return { ok: false, error: "INVALID_PAYLOAD_JSON" };
  }
  const payload = BootstrapSnapshotPayloadV1Schema.safeParse(json);
  if (!payload.success) return { ok: false, error: "INVALID_PAYLOAD_SCHEMA" };
  try {
    if (!canonicalizeJson(payload.data).equals(payloadBytes))
      return { ok: false, error: "NON_CANONICAL_PAYLOAD" };
  } catch {
    return { ok: false, error: "INVALID_PAYLOAD_SCHEMA" };
  }
  return { ok: true, payload: payload.data };
}

function bootstrapSigningBytes(keyId: string, payload: Buffer): Buffer {
  return Buffer.concat([
    BOOTSTRAP_SIGNATURE_DOMAIN,
    Buffer.from(keyId, "utf8"),
    Buffer.from([0]),
    payload,
  ]);
}
function decodeBase64Url(value: string): Buffer | undefined {
  if (!isBase64Url(value)) return undefined;
  try {
    const decoded = Buffer.from(value, "base64url");
    return decoded.toString("base64url") === value ? decoded : undefined;
  } catch {
    return undefined;
  }
}
function isBase64Url(value: string): boolean {
  return /^[A-Za-z0-9_-]+$/.test(value);
}
function asRecord(value: unknown): Record<string, unknown> | undefined {
  return value !== null && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : undefined;
}
