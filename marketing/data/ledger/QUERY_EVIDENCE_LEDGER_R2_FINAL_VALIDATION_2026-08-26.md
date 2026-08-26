# Query Evidence Ledger — R2 final validation — 2026-08-26

Status: **PASS — canonical Ledger atomically rewritten**

Canonical file:
- `marketing/data/ledger/query_evidence_ledger.csv`

Commit:
- `c26ce1ab555ad49fc585c6d85b70cd82c4f67ede`

Git content blob:
- `edc56af00eded6a3d0bf7b6e7ebffa13d81a79f8`

Pre-write local validation of the exact byte payload later committed to GitHub:
- rows: **23**
- columns: **72**
- unique `query_id`: **23**
- duplicate query IDs: **0**
- `serp_status=MEASURED`: **15** (10 primary + 5 evidence-driven secondary)
- `alice_status=MEASURED`: **10** accepted canonical primary roots
- `wordstat_status=MEASURED`: **22**; `вегвизир значение` remains honestly `NOT_MEASURED` because no direct exact-query Wordstat value was established in canonical R1
- rows with extra CSV columns: **0**
- rows with missing CSV columns: **0**

Byte-integrity verification:
- local Git blob SHA computed from the validated CSV bytes: `edc56af00eded6a3d0bf7b6e7ebffa13d81a79f8`
- GitHub `content_sha` returned after update: `edc56af00eded6a3d0bf7b6e7ebffa13d81a79f8`
- result: **EXACT MATCH**

## Repairs / merge behavior

- The legacy malformed `подвеска на зеркало в машину` row was not copied mechanically; the whole file was regenerated through a 72-column CSV writer, eliminating shifted trailing fields.
- Existing validated legacy Wordstat rows were retained with their real measurement IDs where the linked value was still the canonical value.
- Where R1 final accepted values superseded older pilot values and the exact final measurement ID was not backfilled, the final R1 value is stored with `wordstat_status=MEASURED` and the measurement ID is deliberately left blank rather than invented.
- Provider Search request IDs are not used as canonical measurement IDs.
- Accepted Alice primary linkage uses real normalized measurement IDs for all 10 roots.
- The excluded context-contaminated gift Alice run is not linked as canonical evidence.
- Browser product-block observations are populated only where directly observed (`оберег в машину`, `подвеска на зеркало в машину`) or explicitly `NOT_OBSERVED`; Search API did not infer them.
- Search API `serp_device` remains blank because provider measurements were not device-specific.
- Mobile/touch evidence is preserved in notes/provenance rather than falsely relabeling Search API rows as mobile.
- Webmaster/customer/commerce performance fields remain `NOT_APPLICABLE` / `NOT_MEASURED`; no evidence was invented.
- Page Job / IA fields remain unassigned and decisions remain `PENDING_ROADMAP_05`.

This closes the legacy Ledger repair risk for Roadmap 04.
