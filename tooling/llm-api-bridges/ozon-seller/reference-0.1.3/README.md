# Ozon Bridge reference v0.1.3

Immutable reference for Wildberries bridge development and later Ozon maintenance.

## Canonical reference

The exact tested production install artifact is preserved as 9 ASCII base64 parts under `archive-exact/` because the GitHub connector used in this session truncated direct binary ZIP uploads.

Rebuild it from this directory:

```bash
python rebuild_extension.py
```

The script concatenates `archive-exact/ozon-bridge-v0.1.3-extension.zip.b64.part01` through `part09`, decodes them, writes `ozon-bridge-v0.1.3-extension.zip`, and fails closed unless both checks match:

- size: `79343` bytes
- SHA-256: `fe535cbe1f34d7a1e7684346ca7cad0a71c3ff6ac1018854cde03dd26fe6c5a9`

## Included evidence

- `OZON_BRIDGE_V0.1.3_DOCUMENTATION.md`
- `OZON_BRIDGE_V0.1.3_BUILD_EVIDENCE.md`
- `INSTALL_ARTIFACT_SHA256.txt`
- exact encoded production ZIP under `archive-exact/`

Recorded acceptance for this release:

- Ozon source suite: 228/228 PASS
- unpacked final ZIP suite: 228/228 PASS
- Wordstat reference regression: 283/283 PASS
- production byte identity: 16/16
- Chromium packaging: exit 0

The separately generated source/tests/evidence bundle is not stored here as an unverified direct binary upload; the docs and build evidence above are the GitHub reference authority for the recorded test run.

## Immutability

Do not edit this reference in place. Future Ozon revisions must use a new versioned reference directory. Wildberries work may copy/adapt patterns from this snapshot but must not modify `reference-0.1.3/`.
