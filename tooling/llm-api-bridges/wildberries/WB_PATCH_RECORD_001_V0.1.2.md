# Patch Record 001 — exhaustive current OpenAPI + Personal token

- **Record type:** `CURRENTNESS_PATCH`
- **Version:** `0.1.2`
- **Date:** `2026-08-12`
- **Artifact:** `wildberries-bridge-v0.1.2-extension.zip`
- **Artifact SHA-256:** `56f0c78911db8ea84c82c3e874c8ac59c46acbf633886b014225d5ab0afe8715`
- **Artifact bytes:** `84964`
- **Status:** `AUTOMATED_TESTED / CURRENT_OPENAPI_CLASSIFIED`
- **Live account acceptance:** `PENDING`
- **SUPERSEDES:** v0.1.1 current operation/auth surface
- **CORRECTS:** v0.1.1 was not exhaustive against the full current WB OpenAPI navigation

## Reason

Rebuild the WB operation registry from the complete official machine-readable OpenAPI snapshot rather than a manually curated subset, and make the active local credential flow Personal-token-only.

## Effective operation state

- current official OpenAPI: **286 operations / 265 paths / 13 categories**
- current read/read-derived registry: **188 records**
- executable in canonical v0.1.2: **172**
- blocked current reads: **16** = 13 direct PII + 3 Service-token-only
- current mutations excluded: **98**

## Auth/security delta

- active Service/Basic + `X-Client-Secret` flow removed
- Personal token only
- transport/auth injection blocking retained
- direct PII surfaces fail closed
- Service-token-only reads fail closed in Personal build

## Canonical verification

```text
PASS wildberries-bridge-v0.1.2-extension.zip bytes=84964 sha256=56f0c78911db8ea84c82c3e874c8ac59c46acbf633886b014225d5ab0afe8715
{"ok":true,"checks":1239,"registry":188,"enabled":172,"blocked":16,"fetches":173}
```

See `WB_BRIDGE_V0.1.2_BUILD_EVIDENCE.md` and `WB_CURRENTNESS_V0.1.2_2026-08-12.md`.
