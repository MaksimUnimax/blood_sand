# Ozon Bridge v0.1.6 reference

Status: accepted release candidate after repeated local and fresh-package verification.

Base: immutable `reference-0.1.5/`.

Authority inputs:

- `../OZON_BRIDGE_BOUNDARY_AUDIT_2026-08-12.md`
- `OZON_BRIDGE_V0.1.6_CHANGELOG_AND_TEST_EVIDENCE.md`
- `OZON_BRIDGE_V0.1.6_PATCH.diff.gz.b64`
- `OZON_BRIDGE_V0.1.6_REPRODUCIBLE_EVIDENCE.md`

Release ZIP SHA-256:

`6ff4a7daab51f05b0beb5942e5f7f6ef155b3ffa29a3a78e69eca9b7b8229242`

The compressed/base64 patch reconstructs the v0.1.6 production changes from the exact v0.1.5 production tree. Decode with `base64 -d`, then `gzip -d`, then apply the unified diff. v0.1.6 removes bridge-owned generic request/result/body-size/timeout ceilings that were not established by the supplied official Ozon OpenAPI contracts, while retaining Ozon operation-specific limits and the existing security/privacy/read-only/lifecycle invariants.
