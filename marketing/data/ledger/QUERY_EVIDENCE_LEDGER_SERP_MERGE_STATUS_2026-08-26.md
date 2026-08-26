# Query Evidence Ledger — merge status — 2026-08-26

Статус: **CLOSED — ATOMIC CANONICAL REWRITE COMPLETE + VALIDATED**

The earlier legacy-CSV repair risk is closed.

Canonical Ledger:
- `marketing/data/ledger/query_evidence_ledger.csv`
- rewrite commit: `c26ce1ab555ad49fc585c6d85b70cd82c4f67ede`
- Git content blob: `edc56af00eded6a3d0bf7b6e7ebffa13d81a79f8`

Validation artifact:
- `marketing/data/ledger/QUERY_EVIDENCE_LEDGER_R2_FINAL_VALIDATION_2026-08-26.md`
- validation commit: `0d009a63def4e8e0482e0e362130eb946c1445af`

Validated final structure:
- 23 rows;
- 72 columns;
- 23 unique query IDs;
- 15 Search-measured queries (10 primary + 5 secondary);
- 10 accepted Alice-measured primary roots;
- no extra/missing CSV columns;
- exact local Git blob SHA == GitHub content SHA.

Legacy malformed row `подвеска на зеркало в машину` was repaired by regenerating the complete CSV through the canonical 72-column schema rather than shifting fields manually.

Evidence discipline retained:
- final R1 values used where canonical;
- exact Wordstat measurement IDs left blank where late R1 byte-level linkage was not backfilled, rather than invented;
- provider request IDs not substituted for canonical Search measurement IDs;
- accepted Alice 10/10 linked using real normalized measurement IDs;
- context-contaminated Alice run excluded;
- browser/mobile-only observations not inferred from Search API;
- Search API device remains unassigned;
- Webmaster/customer/commerce fields remain unmeasured/not-applicable;
- Page Jobs / IA remain pending Roadmap 05.

Mobile representative browser evidence is now **2/2 complete**:
- `marketing/data/raw/browser_serp/20260826__slavyanskie_oberegi__emulated_mobile_touch.md`
- `marketing/data/raw/browser_serp/20260826__obereg_v_mashinu__emulated_mobile_touch.md`

Final R2 handoff:
- `marketing/research/R2_YANDEX_SERP_ALICE_FINAL_REPORT_2026-08-26.md`

## Continuation

Do not perform another R2 Ledger rewrite or paid secondary Search by default. Continue with Roadmap 05 opportunity / Page Job decision stage using the canonical Ledger and final R2 report.
