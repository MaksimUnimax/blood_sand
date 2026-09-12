#!/usr/bin/env python3
from __future__ import annotations
import csv, json
from collections import Counter
from pathlib import Path

A = Path("продажи/статистика/ozon/analysis/2026-08-13_2026-09-10")
R = A / "manual_review_2026-09-12"
SRC = A / "08_SEMANTIC_OPPORTUNITY_REGISTER.tsv"

def read_tsv(path):
    with path.open("r", encoding="utf-8-sig", newline="") as f:
        return list(csv.DictReader(f, delimiter="\t"))

def write_tsv(path, rows, fields):
    with path.open("w", encoding="utf-8", newline="") as f:
        w = csv.DictWriter(f, fieldnames=fields, delimiter="\t", lineterminator="\n", extrasaction="ignore")
        w.writeheader()
        w.writerows(rows)

source = [r for r in read_tsv(SRC) if r["decision_state"] == "READY_CANDIDATE"]
source_by = {(r["sku"], r["query_or_cluster"]): r for r in source}
assert len(source) == 321, len(source)
assert len(source_by) == 321, "source key duplicates"

decisions = {}
def add(key, row):
    if key in decisions:
        raise SystemExit(f"duplicate reviewed key: {key}")
    decisions[key] = row

for p in sorted(R.glob("MANUAL_REVIEW_BLOCK_*.tsv")):
    for r in read_tsv(p):
        key = (r["sku"], r["query"])
        add(key, {
            "manual_decision": r["manual_decision"],
            "manual_reason_code": r["manual_reason_code"],
            "manual_reason": r.get("manual_reason",""),
            "review_block": r.get("block_id",""),
            "review_source_file": p.name,
            "approved_destination_field": r.get("approved_destination_field",""),
            "approved_change": r.get("approved_change",""),
        })

for p in sorted(R.glob("MANUAL_REVIEW_BLOCK_*.json")):
    doc = json.loads(p.read_text(encoding="utf-8"))
    for r in doc["rows"]:
        key = (str(r["sku"]), r["query"])
        add(key, {
            "manual_decision": r["decision"],
            "manual_reason_code": r["reason_code"],
            "manual_reason": r.get("reason",""),
            "review_block": doc.get("block_id",""),
            "review_source_file": p.name,
            "approved_destination_field": r.get("approved_destination_field",""),
            "approved_change": r.get("approved_change",""),
        })

missing = sorted(set(source_by) - set(decisions))
extra = sorted(set(decisions) - set(source_by))
if missing or extra:
    print(json.dumps({"missing": missing[:20], "extra": extra[:20],
                      "missing_count": len(missing), "extra_count": len(extra)}, ensure_ascii=False, indent=2))
    raise SystemExit("manual decision/source key mismatch")

counts = Counter(d["manual_decision"] for d in decisions.values())
expected = {"APPROVE": 0, "REJECT": 312, "HOLD": 9}
for k, v in expected.items():
    if counts.get(k, 0) != v:
        raise SystemExit(f"decision count mismatch {k}: {counts.get(k,0)} != {v}")
if sum(counts.values()) != 321:
    raise SystemExit(f"review total mismatch: {sum(counts.values())}")

master = []
for r in source:
    d = decisions[(r["sku"], r["query_or_cluster"])]
    master.append({
        "sku": r["sku"],
        "product_id": r["product_id"],
        "query": r["query_or_cluster"],
        "machine_relevance_state": r["relevance_state"],
        "machine_observed_search_users": r["observed_search_users"],
        "machine_observed_orders": r["observed_orders"],
        "machine_observed_gmv": r["observed_gmv"],
        "machine_existing_card_coverage": r["existing_card_coverage"],
        "machine_semantic_gap": r["semantic_gap"],
        "machine_ownership_risk": r["ownership_risk"],
        "machine_suggested_destination_field": r["suggested_destination_field"],
        "manual_decision": d["manual_decision"],
        "manual_reason_code": d["manual_reason_code"],
        "manual_reason": d["manual_reason"],
        "approved_destination_field": d["approved_destination_field"],
        "approved_change": d["approved_change"],
        "review_block": d["review_block"],
        "review_source_file": d["review_source_file"],
    })

fields = list(master[0].keys())
write_tsv(A / "13_MANUAL_REVIEW_MASTER.tsv", master, fields)
approved = [r for r in master if r["manual_decision"] == "APPROVE"]
write_tsv(A / "14_APPROVED_CHANGE_SET.tsv", approved, fields)
hold = [r for r in master if r["manual_decision"] == "HOLD"]
write_tsv(A / "15_MANUAL_REVIEW_HOLD_QUEUE.tsv", hold, fields)

reasons = Counter(r["manual_reason_code"] for r in master)
top_reasons = "\n".join(f"- `{k}`: {v}" for k,v in reasons.most_common())
holds_md = "\n".join(
    f"- SKU `{r['sku']}` — `{r['query']}` — `{r['manual_reason_code']}`"
    for r in hold
)
report = f"""# Ozon manual semantic review — final report

Date: 2026-09-12

## Final verdict

All **321 / 321** machine `READY_CANDIDATE` rows across **63 / 63** SKUs were manually reviewed.

- APPROVE: **{counts.get('APPROVE',0)}**
- REJECT: **{counts.get('REJECT',0)}**
- HOLD: **{counts.get('HOLD',0)}**
- direct Ozon card mutations performed: **0**
- new Ozon provider calls performed: **0**

The approved change set is intentionally empty. This is a valid analytical result: none of the machine READY rows was both substantively new and sufficiently supported to authorize a direct card change from the current bounded evidence.

## Main rejection pattern

The machine pass frequently promoted symbol/sign token overlap while ignoring a conflicting product type, use case, material, placement, brand, or variant. A second large class consisted of useful intents already explicitly present in the current title/description; those are `NO_CHANGE`, not new keyword additions.

## Reason-code distribution

{top_reasons}

## HOLD queue

{holds_md}

HOLD means separate evidence/review is required before any use in Ozon content. HOLD is not approval.

## Authority

- machine source: `08_SEMANTIC_OPPORTUNITY_REGISTER.tsv`
- block decisions: `manual_review_2026-09-12/MANUAL_REVIEW_BLOCK_*`
- master human authority: `13_MANUAL_REVIEW_MASTER.tsv`
- approved mutations: `14_APPROVED_CHANGE_SET.tsv`
- unresolved review: `15_MANUAL_REVIEW_HOLD_QUEUE.tsv`

## Boundary

The four Ozon query slices are bounded observations (maximum 15 queries per SKU per slice). The empty approved set does not prove that no future card improvement exists; it proves that the **321 machine READY candidates in this pass** do not justify a direct mutation after human review.
"""
(A / "16_MANUAL_REVIEW_FINAL_REPORT.md").write_text(report, encoding="utf-8")

cursor_path = R / "MANUAL_REVIEW_CURSOR_2026-09-12.json"
cursor = json.loads(cursor_path.read_text(encoding="utf-8"))
cursor["status"] = "COMPLETE__MANUAL_REVIEW_QA_PASS"
cursor["final_decision_counts"] = expected
cursor["final_outputs"] = [
    "13_MANUAL_REVIEW_MASTER.tsv",
    "14_APPROVED_CHANGE_SET.tsv",
    "15_MANUAL_REVIEW_HOLD_QUEUE.tsv",
    "16_MANUAL_REVIEW_FINAL_REPORT.md",
]
cursor["final_qa"] = {
    "source_ready_rows": len(source),
    "unique_source_keys": len(source_by),
    "reviewed_keys": len(decisions),
    "missing_keys": 0,
    "extra_keys": 0,
    "approved_rows": len(approved),
    "hold_rows": len(hold),
}
cursor_path.write_text(json.dumps(cursor, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

status = {
    "QA_STATUS": "PASS",
    "SOURCE_READY_ROWS": len(source),
    "REVIEWED_ROWS": len(decisions),
    "APPROVE": counts.get("APPROVE",0),
    "REJECT": counts.get("REJECT",0),
    "HOLD": counts.get("HOLD",0),
    "MISSING_KEYS": 0,
    "EXTRA_KEYS": 0,
    "APPROVED_CHANGE_SET_ROWS": len(approved),
}
(A / "MANUAL_REVIEW_FINAL_STATUS_2026-09-12.json").write_text(
    json.dumps(status, ensure_ascii=False, indent=2) + "\n", encoding="utf-8"
)
print(json.dumps(status, ensure_ascii=False, indent=2))
