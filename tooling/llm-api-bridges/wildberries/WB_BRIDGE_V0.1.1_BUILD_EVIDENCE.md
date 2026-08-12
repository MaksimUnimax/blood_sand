# Wildberries Bridge v0.1.1 — build evidence

Build date: **2026-08-12**

## Source gate

- production aliases: **157**
- source provider matrix: **170/170 PASS**
- lifecycle/UI/worker Node tests: **174/174 PASS**
- combined executed checks: **344/344 PASS**
- raw V8 executable production lines: **7043/7043 covered; 0 uncovered**
- all production JavaScript syntax: **PASS**
- manifest parse/reference resolution: **PASS**

## Packaging gate

- production files: **17**
- ZIP contains exactly those **17** production files
- tests, package metadata, evidence, CRX, PEM/private key and credential-backup artifacts: **absent from ZIP**
- source production tree → fresh unpack byte identity: **17/17 PASS**
- fresh-unpacked full regression: **PASS twice consecutively** after removing a test-only 100 ms scheduling flake
- deterministic canonical ZIP rebuild: **byte-identical PASS**
- stale Ozon provider residue scan (`api-seller.ozon.ru`, `OZON_`, `ozrun-`, `/v1/roles`): **PASS / none found**
- embedded credential-value scan: **PASS / none found**
- manifest host permissions: HTTPS fixed hosts, no `<all_urls>`, no wildcard hosts: **PASS**

## Chromium

- Chromium version: **144.0.7559.96**
- `--pack-extension`: **exit 0 / PASS**
- generated `.pem` private key and `.crx` were temporary test artifacts and were deleted; neither is distributed
- runtime load via Xvfb/new-headless: **ENVIRONMENT NOT VERIFIED**. New-headless exposed DevTools but registered only `about:blank`, not an extension target. No manifest-load PASS is claimed from this environment.

## Final artifact

- file: `wildberries-bridge-v0.1.1-extension.zip`
- bytes: `82701`
- SHA-256: `3ffd3c2158c67723c62aa2b6d7a73c152e964e7ab030fecf8a6d67666030f3a2`

## Acceptance boundary

**AUTOMATED TESTED**.  
Not yet claimed: **LIVE USER-ACCOUNT ACCEPTED**.
