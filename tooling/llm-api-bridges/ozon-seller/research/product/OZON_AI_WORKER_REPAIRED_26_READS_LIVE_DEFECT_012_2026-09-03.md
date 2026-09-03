# DEFECT-012 — MV3 report-file host permissions

Date: 2026-09-03
Branch: `research/ozon-product-demand-2026-09-02`
Live-test authority build: `197b7d3fcd8c714ffc8a387d0b9ee1ab33d7019c`
Classification: `REPORT_FILE_TRUSTED_HOSTS_MISSING_FROM_MV3_HOST_PERMISSIONS`
Status before authorized repair: `OPEN_CONFIRMED`

## Governing authorization

Operator rule remains authoritative: **ЗАПРЕТ НА ЛЮБЫЕ ПАТЧИ БЕЗ МОЕГО ПРЯМОГО РАЗРЕШЕНИЯ.**

The full planned live collection was completed before this repair. After collection completion, the operator gave direct authorization to proceed (`Делай`). This repair is scoped only to the confirmed remaining live failure below.

## Completed corrective live collection on unchanged build

Final planned live matrix on `197b7d3f...`:
- PATCH-LIVE-01..09: PASS
- PATCH-LIVE-10A: PASS
- PATCH-LIVE-10B: PASS
- PATCH-LIVE-10C: FAIL — `REPORT_FILE_FETCH_FAILED / Failed to fetch / HTTP 0`, safe opaque ref admitted but no structured rows returned
- PATCH-LIVE-11: PASS — semantic `additional_data[{key,value}]` receiver identity/tax values redacted
- PATCH-LIVE-12: PASS — personal-data gate fail-closed locally, zero provider request
- PATCH-LIVE-13: PASS — FBP warehouse provider/account permission represented as `ENTITLEMENT_UNKNOWN`, not `all_accounts`

Summary: **12/13 planned live tests PASS; 1/13 FAIL (PATCH-LIVE-10)**. PATCH-STRUCT-14..15 retain prior package-certified PASS evidence. PATCH-REG-16 has prior package-certified PASS evidence but the overall live gate remains failed until PATCH-LIVE-10 closes.

## Exact live reproduction

PATCH-LIVE-10A created a fresh `seller_products` report with operator personal-data setting OFF and provider HTTP200. PATCH-LIVE-10B returned `status=success`, redacted the provider file URL and registered a fresh opaque `report_file_ref`. PATCH-LIVE-10C used that exact fresh ref with personal-data still OFF.

Observed PATCH-LIVE-10C:
- `physical_business_request_count=1`
- `external_request_executed=true`
- host alias `report_file`
- HTTP status `0`
- bridge code `REPORT_FILE_FETCH_FAILED`
- message `Failed to fetch`
- `automatic_retry=false`
- no structured/usable report rows returned
- no signed URL or base64 exposed

This proves the original DEFECT-001 static personal-data block is repaired: the safe opaque ref reached the report-file transport. The remaining failure occurs at the installed browser-extension file-fetch boundary.

## Root cause

`ProviderTransportCore.normalizeTrustedReportFileUrl` accepts HTTPS report-file URLs on `ozon.ru`, `*.ozon.ru`, `ozone.ru`, and `*.ozone.ru`. The deterministic report-file workflow gate uses a representative signed URL on `https://cdn1.ozone.ru/...` but injects a mocked `fetchImpl`.

The installed MV3 `manifest.json` in `197b7d3f...` has host permissions for ChatGPT/Alice, `api-seller.ozon.ru`, `api-performance.ozon.ru`, and `docs.ozon.ru`, but no permission covering the trusted report-file hosts. Therefore a real service-worker cross-origin GET to an Ozon report-file host can be rejected by the browser before an HTTP response exists, matching the observed `Failed to fetch / HTTP 0` result. The mocked deterministic gate could not detect this packaging permission boundary.

## Authorized repair

Add MV3 host permissions matching the existing trusted report-host allowlist:
- `https://ozon.ru/*`
- `https://*.ozon.ru/*`
- `https://ozone.ru/*`
- `https://*.ozone.ru/*`

Add deterministic assertions to `run_report_file_workflow_gate.mjs` requiring those permissions in the packaged manifest.

No change is authorized or required to:
- trusted report-host normalization / SSRF allowlist;
- `redirect:"error"` behavior;
- Seller credential isolation (`credentials:"omit"`, no Seller auth headers on file hosts);
- signed-URL redaction;
- base64 redaction;
- report parser logic;
- personal-data policy logic;
- any other repaired READ contract.

## Acceptance after package certification

1. Package CI must pass on Linux and Windows and cross-platform artifact identity must pass.
2. Install the exact new certified artifact.
3. Keep operator personal-data setting OFF.
4. Restart PATCH-LIVE-10 from a fresh `report_products_create` (10A), then fresh `report_info` (10B), then `report_file_get` on the newly returned opaque ref (10C). Historical refs must not be reused because provenance is runtime/session state.
5. PATCH-LIVE-10 closes only if 10C returns structured/usable report content while signed URL/base64 remain hidden.
6. Prior live PASS evidence for PATCH-LIVE-01..09 and 11..13 remains recorded; final gate acceptance is withheld until the repaired 10A→10B→10C chain passes on the new artifact.
7. STD-10 / main roadmap remains FROZEN until final live acceptance.
