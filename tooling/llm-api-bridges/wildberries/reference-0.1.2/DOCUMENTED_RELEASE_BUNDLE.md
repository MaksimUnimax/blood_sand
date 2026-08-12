# Wildberries Bridge v0.1.2 — complete documented release bundle

This record identifies the complete distribution bundle generated from the canonical v0.1.2 install artifact plus the current documentation and the original official OpenAPI snapshot captured on 2026-08-12.

## Outer distribution bundle

- file: `wildberries-bridge-v0.1.2-complete-with-documentation.zip`
- bytes: **758626**
- SHA-256: `0e08fa8cde3d0fde187e40cd2e59cad3702146c1d51aca8fbf2a018d42308a1e`
- payload files: **49**

This outer ZIP is **not** the Chrome install artifact. The Chrome install artifact is nested at:

`install/wildberries-bridge-v0.1.2-extension.zip`

and retains its independent canonical identity:

- bytes: **84964**
- SHA-256: `56f0c78911db8ea84c82c3e874c8ac59c46acbf633886b014225d5ab0afe8715`

## Included documentation/evidence

The complete bundle includes:

- canonical install ZIP;
- exact base64 reconstruction parts and rebuild/verify scripts;
- current v0.1.2 README and install guide;
- canonical build evidence;
- currentness record;
- security/blocked-surface record;
- Patch Record 001;
- generated canonical full **286-operation** inventory;
- generated canonical **188-record** production registry document with **172 executable / 16 blocked**;
- full official Wildberries OpenAPI snapshot: **13/13 original YAML specifications**, `SOURCE_MANIFEST.json`, `inventory.json`, `inventory.csv`, and `NOT_INCLUDED.md`;
- the original OpenAPI snapshot archive with SHA-256 `4130a44f3c05cfceae62591c54fac028e45fc2235d403874941639bb5e9f0c4f`;
- fresh exact-artifact verification output;
- bundle-level SHA-256 manifests.

## Verification rerun used for this bundle

```text
PASS wildberries-bridge-v0.1.2-extension.zip bytes=84964 sha256=56f0c78911db8ea84c82c3e874c8ac59c46acbf633886b014225d5ab0afe8715
{"ok":true,"checks":1239,"registry":188,"enabled":172,"blocked":16,"fetches":173}
```

All 13 bundled OpenAPI YAML files were re-hashed against their hashes in the captured inventory before the outer bundle was written. The outer ZIP was then test-extracted successfully and its internal canonical install ZIP was rechecked as 84,964 bytes with the expected SHA-256.

Stale intermediate 83,223-byte / 83,956-byte v0.1.2 artifacts and stale 175-executable evidence are intentionally excluded from this complete distribution bundle.
