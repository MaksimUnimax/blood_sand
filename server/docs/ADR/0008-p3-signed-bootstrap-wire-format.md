# ADR-0008 — P3 Signed Bootstrap Wire Format

Date: 2026-09-04
Status: Accepted

## Decision

Bootstrap V1 uses Ed25519 with the dedicated `CONFIG` signing-key role. It is
independent from the P2 access-token signing key. Future server configuration
names are `CONFIG_SIGNING_PRIVATE_KEY_PEM_B64` and `CONFIG_SIGNING_KEY_ID`;
P3.1 does not wire either environment value into an application.

The exact identifiers are `control_plane_v1`, `bootstrap_snapshot_v1`, and
`bootstrap_envelope_v1`. The external envelope is exactly:

```json
{"envelopeVersion":"bootstrap_envelope_v1","algorithm":"Ed25519","keyId":"…","payload":"base64url","signature":"base64url"}
```

`payload` is the sole snapshot authority: canonical UTF-8 JSON bytes of the
strict payload schema, base64url encoded. The signature input is exactly UTF-8
`product-control-plane/bootstrap-snapshot/v1`, a NUL byte, UTF-8 `keyId`, a
NUL byte, then payload bytes.

Clients select `keyId` only from a packaged trusted public-key ring. Rotation
uses overlapping packaged keys. Unknown keys, invalid signatures, tampered
payloads, and non-canonical payload bytes fail closed. The verifier authenticates
bytes before parsing them, then validates the schema after verification.

Signing says that the server authenticated declarative policy. It does not
authorize arbitrary execution. A client still intersects
`PACKAGED_CLIENT_CAPABILITY ∩ SERVER_ENTITLEMENT ∩ REMOTE_POLICY`; signed data
cannot add a URL, method, headers, cookies, auth values, JavaScript, WASM,
remote module, command, or provider operation.

## Consequences

The wire contract is frozen independently of persistence and HTTP delivery.
Only null/boolean/string/safe-integer/array/plain-object canonical JSON values
are accepted. The canonicalizer is not a general remote-config execution format.
