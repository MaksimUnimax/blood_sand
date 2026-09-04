# ADR-0012: P3 authenticated bootstrap snapshot service

Status: Accepted

`POST /v1/bootstrap` uses the existing live extension-access authentication path and binds the request device ID to that principal. P3.4 always returns a complete signed snapshot; account, subscription, entitlement, device-policy, and AI fields are deliberately staged (`ACTIVE`, `NONE`, `{}`, pre-P4 limit one, and `UNCONFIGURED`).

The server reads one clock instant, signs a 15-minute snapshot and a 24-hour post-expiry offline grace boundary. Compatibility is signed policy and does not become an HTTP error.

The API process alone loads one configured Ed25519 config private key. Its derived SPKI and SHA-256 must bind exactly to public signing-key metadata, and the selected release key ID must equal the configured signer ID. Public failures are fail-closed. P3.5 owns key lifecycle and rotation; P3.6 owns cache/offline consumption.
