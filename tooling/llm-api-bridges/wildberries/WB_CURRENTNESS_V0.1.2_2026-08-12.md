# WB Bridge v0.1.2 — currentness against official OpenAPI (2026-08-12)

Status: **AUTOMATED TESTED / NOT LIVE USER-ACCOUNT ACCEPTED**

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
- executable aliases: **175**

Classification is semantic, not HTTP-verb-only. In particular, `GET /adv/v0/delete`, `/adv/v0/start`, `/adv/v0/pause`, and `/adv/v0/stop` remain blocked because they mutate campaign state.

## v0.1.1 → v0.1.2 registry delta

- **138** aliases retain an exact current method+path contract.
- **18** existing aliases were migrated to changed current contracts.
- **19** new read aliases were added.
- **1** stale alias (`search_report_position`) was removed because `/api/v2/search-report/product/positions` is absent from the current OpenAPI snapshot.
- final executable registry: **175**.

Notable current migrations include FBS/DBS/DBW/pickup metadata routes, FBW supplies GET→POST, promotion normquery GET→POST, media statistics GET→POST, pinned-feedback `/api/feedbacks/v1/pins*`, seller rating `/api/common/v1/rating`, and stock-report `/api/analytics/v1/stocks-report/wb-warehouses`.

## Privacy boundary

All **13** direct PII read surfaces remain absent from the executable registry. The **19** sanitized read surfaces use the bridge privacy sanitizer. No `user-management-api.wildberries.ru` host permission was added.

## Evidence

The tested local supplemental artifact `wildberries-bridge-v0.1.2-source-tests-evidence.zip` contains the exact 13 YAML specifications, parsed OpenAPI coverage inventory, source, tests, and run logs used for this release candidate.
