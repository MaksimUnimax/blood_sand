# WB Bridge v0.1.2 — currentness against official OpenAPI (2026-08-12)

Status: **AUTOMATED TESTED / CURRENT OPENAPI CLASSIFIED / NOT LIVE USER-ACCOUNT ACCEPTED**

## Authority

The release registry was rebuilt against the machine-readable OpenAPI 3.0.1 specifications exposed by the current official Wildberries Swagger navigation captured on 2026-08-12.

- categories: **13/13**
- paths: **265**
- operations: **286**
- `READ_SAFE`: **150**
- `READ_SANITIZED`: **19**
- `READ_DERIVED`: **6**
- `READ_PII_BLOCKED`: **13**
- `MUTATION_BLOCKED`: **98**
- read/read-derived surfaces total: **188**
- non-PII read candidates: **175**
- additional Service-token-only reads disabled in the Personal-token-only release: **3**
- final executable aliases in canonical v0.1.2: **172**
- final blocked registry records: **16** = 13 direct PII + 3 Service-token-only

Classification is semantic, not HTTP-verb-only. In particular, mutating GET operations remain blocked even though their HTTP verb is GET.

## v0.1.1 → v0.1.2 contract delta

Before the final token-type execution gate:

- **138** aliases retain an exact current method+path contract.
- **18** existing aliases were migrated to changed current contracts.
- **19** new read aliases were added.
- **1** stale alias (`search_report_position`) was removed because `/api/v2/search-report/product/positions` is absent from the current OpenAPI snapshot.
- result: **175** non-PII current read candidates.

The canonical Personal-token-only v0.1.2 then execution-disables three current Service-token-only reads:

- `subscriptions` → `GET /api/common/v1/subscriptions`
- `seller_rating` → `GET /api/common/v1/rating`
- `tariff_constructor_options` → `GET /api/common/v1/tariff-constructor/options`

Therefore the canonical release contains **188 registry records, 172 executable, 16 blocked**.

Notable current migrations include FBS/DBS/DBW/pickup metadata routes, FBW supplies GET→POST, promotion normquery GET→POST, media statistics GET→POST, pinned-feedback `/api/feedbacks/v1/pins*`, seller rating `/api/common/v1/rating`, and stock-report `/api/analytics/v1/stocks-report/wb-warehouses`.

## Privacy and credential boundary

All **13** direct PII read surfaces remain execution-disabled. The **19** sanitized read surfaces use the bridge privacy sanitizer. No `user-management-api.wildberries.ru` or buyer-chat host permission is added.

The canonical v0.1.2 build is Personal-token-only and does not emit `X-Client-Secret`. Current reads that require a Service token are represented in the registry for completeness but fail before network execution.

## Canonical artifact verification

Canonical install ZIP:

- file: `wildberries-bridge-v0.1.2-extension.zip`
- bytes: `84964`
- SHA-256: `56f0c78911db8ea84c82c3e874c8ac59c46acbf633886b014225d5ab0afe8715`

The exact reconstructed artifact was rerun through the retained provider/registry regression and returned:

```json
{"ok":true,"checks":1239,"registry":188,"enabled":172,"blocked":16,"fetches":173}
```

See `WB_CURRENT_READ_ONLY_INVENTORY_2026-08-12.md` for the full 286-operation source classification and `reference-0.1.2/` for the exact reconstructible release artifact.
