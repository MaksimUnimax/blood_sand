# Wildberries Bridge v0.1.2 — canonical build evidence

Build/reverification date: **2026-08-12**

Status: **AUTOMATED TESTED / CURRENT OPENAPI CLASSIFIED / NOT LIVE USER-ACCOUNT ACCEPTED**

## Canonical release identity

- version: `0.1.2`
- install artifact: `wildberries-bridge-v0.1.2-extension.zip`
- bytes: **84964**
- SHA-256: `56f0c78911db8ea84c82c3e874c8ac59c46acbf633886b014225d5ab0afe8715`
- production files: **17**

The exact artifact is stored losslessly as 10 base64 parts under `reference-0.1.2/archive-exact/` and is reconstructed by `reference-0.1.2/rebuild_extension.py`.

## Exact-artifact verification rerun

The retained exact-reference scripts were run against the reconstructed canonical bytes:

```text
PASS wildberries-bridge-v0.1.2-extension.zip bytes=84964 sha256=56f0c78911db8ea84c82c3e874c8ac59c46acbf633886b014225d5ab0afe8715
{"ok":true,"checks":1239,"registry":188,"enabled":172,"blocked":16,"fetches":173}
```

The provider/registry test reconstructs and extracts the canonical install ZIP before execution, so the test target is the exact stored production artifact rather than a separately edited source tree.

## Current OpenAPI gate

Official machine-readable Wildberries Swagger snapshot captured on 2026-08-12:

- categories: **13/13**
- paths: **265**
- operations: **286**
- source snapshot archive bytes: **275298**
- source snapshot archive SHA-256: `4130a44f3c05cfceae62591c54fac028e45fc2235d403874941639bb5e9f0c4f`
- inventory JSON bytes: **88942**
- inventory JSON SHA-256: `8b6175708f698579c4a3c9621c698bfd01f76fac66e60ccc48923f26dc35f9ad`

Canonical registry overlay:

- current read/read-derived records: **188**
- executable in Personal-token-only v0.1.2: **172**
- blocked current reads: **16** = 13 direct PII + 3 Service-token-only
- current mutation operations excluded from the read registry: **98**

## Credential/security facts checked on canonical bytes

- credential parser accepts `personal` token type only;
- non-personal token type fails closed;
- supplied client secret fails with `CLIENT_SECRET_UNSUPPORTED_PERSONAL_BUILD`;
- manifest contains neither `buyer-chat-api.wildberries.ru` nor `user-management-api.wildberries.ru` permission;
- manifest contains no `<all_urls>` or wildcard Wildberries host permission.

## Acceptance boundary

This evidence does **not** claim a real seller-account acceptance smoke. That remains **PENDING**.
