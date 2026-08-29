#!/usr/bin/env python3
"""Build an operation-level salvage map for the accepted historical B1-B49 lineage.

The script analyzes deterministic materialized production trees only. It does not call
Seller API or Performance API. Historical B49 is materialized externally by the workflow
from the exact accepted B49 commit; its recursive work tree contains B0..B48 bases.
"""

from __future__ import annotations

import argparse
import json
import re
import subprocess
from pathlib import Path

ACCEPTED_B0 = "3795359959c965fc5cd1837b9a1c978493ae2ac5"
ACCEPTED_B49 = "59ce0cedf93e409f5988b16d5b569b4a5f229b1b"

ALLOWED_SELLER_CLUSTERS = {
    "catalog_products",
    "stocks_inventory",
    "prices_promotions",
    "orders_postings",
    "warehouse_logistics",
    "returns_cancellations",
    "finance",
    "sales_analytics",
    "search_visibility",
    "supplies_fbo",
    "reviews_questions",
    "account_access",
}

# stage, branch, historical scope, old audit verdict, current canonical targets,
# current salvage policy. B9/B17 and B6 intentionally encode the later roadmap corrections.
STAGES = [
    (1, "feature/ozon-b1-assortment-master-contracts-2026-08-25", "Assortment Master", "MOVE", ["catalog_products"], "SALVAGE_MOVE"),
    (2, "feature/ozon-b2-prices-listing-state-contracts-2026-08-26", "Prices / Listing State", "MOVE", ["prices_promotions"], "SALVAGE_MOVE"),
    (3, "feature/ozon-b3-warehouse-stock-geography-contracts-2026-08-26", "Warehouse / Stock Geography", "MOVE", ["stocks_inventory", "warehouse_logistics"], "SALVAGE_SPLIT_BY_OPERATION_CLUSTER"),
    (4, "feature/ozon-b4-orders-returns-cancellations-contracts-2026-08-26", "Orders + Returns + Cancellations", "REWORK", ["orders_postings", "returns_cancellations"], "SALVAGE_SPLIT_BY_OPERATION_CLUSTER"),
    (5, "feature/ozon-b5-finance-realization-contracts-2026-08-26", "Finance / Realization", "KEEP", ["finance"], "SALVAGE_KEEP_IN_TARGET"),
    (6, "feature/ozon-b6-performance-read-core-2026-08-26", "Performance API Read Core", "DROP_FROM_SELLER_ONLY", ["advertising_performance"], "PRESERVE_SEPARATE_PROVIDER_FOR_STEP_6"),
    (7, "feature/ozon-b7-analytics-search-contracts-2026-08-26", "Analytics / Search", "MOVE", ["sales_analytics", "search_visibility"], "SALVAGE_SPLIT_BY_OPERATION_CLUSTER"),
    (8, "feature/ozon-b8-supply-replenishment-2026-08-26", "Supply / Replenishment", "MOVE", ["supplies_fbo"], "SALVAGE_MOVE"),
    (9, "feature/ozon-b9-reviews-questions-2026-08-26", "Reviews / Questions", "OLD_REWORK_PRIVACY_CONCLUSION_SUPERSEDED", ["reviews_questions"], "SALVAGE_EXISTING_PERSONAL_DATA_GATE_PRESERVED_STEP4_AUDIT_LATER"),
    (10, "feature/ozon-b10-seller-health-ratings-2026-08-26", "Seller Health / Ratings", "REWORK", ["RECLASSIFY_FIXED_SELLER_CLUSTER"], "SALVAGE_RECLASSIFY_UNAUTHORIZED_TAXONOMY"),
    (11, "feature/ozon-b11-catalog-diagnostics-content-2026-08-26", "Catalog Diagnostics / Content", "MOVE", ["catalog_products"], "SALVAGE_MOVE"),
    (12, "feature/ozon-b12-finance-transactions-sunset-2026-08-27", "Finance Transactions Sunset", "KEEP", ["finance"], "PRESERVE_CURRENTNESS_DEPRECATION_EVIDENCE"),
    (13, "feature/ozon-b13-promotions-market-reads-2026-08-27", "Promotions Market Reads", "MOVE", ["prices_promotions"], "SALVAGE_MOVE"),
    (14, "feature/ozon-b14-pricing-strategy-reads-2026-08-27", "Pricing Strategy Reads", "MOVE", ["prices_promotions"], "SALVAGE_MOVE"),
    (15, "feature/ozon-b15-catalog-reference-reads-2026-08-27", "Catalog Reference Reads", "MOVE", ["catalog_products"], "SALVAGE_MOVE"),
    (16, "feature/ozon-b16-warehouse-delivery-diagnostics-2026-08-27", "Warehouse / Delivery Diagnostics", "MOVE", ["warehouse_logistics"], "SALVAGE_MOVE"),
    (17, "feature/ozon-b17-reviews-questions-extended-reads-2026-08-27", "Reviews / Questions Extended", "OLD_REWORK_PRIVACY_CONCLUSION_SUPERSEDED", ["reviews_questions"], "SALVAGE_EXISTING_PERSONAL_DATA_GATE_PRESERVED_STEP4_AUDIT_LATER"),
    (18, "feature/ozon-b18-pricing-strategy-extended-reads-2026-08-27", "Pricing Strategy Extended Reads", "MOVE", ["prices_promotions"], "SALVAGE_MOVE"),
    (19, "feature/ozon-b19-catalog-certification-reference-reads-2026-08-27", "Catalog Certification Reference Reads", "MOVE", ["catalog_products"], "SALVAGE_MOVE"),
    (20, "feature/ozon-b20-catalog-certificate-data-reads-2026-08-27", "Catalog Certificate Data Reads", "MOVE", ["catalog_products"], "SALVAGE_MOVE"),
    (21, "feature/ozon-b21-return-giveout-reads-2026-08-27", "Return Giveout Reads", "MOVE", ["returns_cancellations"], "SALVAGE_MOVE_WITH_EXISTING_EXCLUSIONS"),
    (22, "feature/ozon-b22-cancellation-reason-reads-2026-08-27", "Cancellation Reason Reads", "MOVE", ["returns_cancellations"], "SALVAGE_MOVE"),
    (23, "feature/ozon-b23-seller-account-logistics-reads-2026-08-27", "Seller Account / Ozon Logistics", "MOVE", ["account_access"], "SALVAGE_MOVE"),
    (24, "feature/ozon-b24-fbo-supply-status-act-reads-2026-08-28", "FBO Supply Status / Act Reads", "MOVE", ["supplies_fbo"], "SALVAGE_MOVE_NO_HIDDEN_POLLING"),
    (25, "feature/ozon-b25-safe-reference-settings-no-body-reads-2026-08-28", "Safe Reference / Settings No-Body Reads", "REWORK", ["warehouse_logistics", "catalog_products", "returns_cancellations"], "SALVAGE_SPLIT_BY_OPERATION_CLUSTER"),
    (26, "feature/ozon-b26-fbo-draft-cargo-reads-2026-08-28", "FBO Draft Cargo Reads", "MOVE", ["supplies_fbo"], "SALVAGE_MOVE"),
    (27, "feature/ozon-b27-fbo-draft-location-planning-reads-2026-08-28", "FBO Draft Location Planning Reads", "MOVE", ["supplies_fbo"], "SALVAGE_MOVE"),
    (28, "feature/ozon-b28-fbo-transport-cargo-reads-2026-08-28", "FBO Transport Cargo Reads", "MOVE", ["supplies_fbo"], "SALVAGE_MOVE"),
    (29, "feature/ozon-b29-product-stock-reads-2026-08-28", "Product Stock Reads", "MOVE", ["stocks_inventory"], "SALVAGE_MOVE"),
    (30, "feature/ozon-b30-fbs-delivery-assembly-reads-2026-08-28", "FBS Delivery / Assembly Reads", "MOVE", ["orders_postings"], "SALVAGE_MOVE"),
    (31, "feature/ozon-b31-fbs-carriage-container-reads-2026-08-28", "FBS Carriage / Container Reads", "MOVE", ["orders_postings"], "SALVAGE_MOVE"),
    (32, "feature/ozon-b32-fbs-operational-reference-reads-2026-08-28", "FBS Operational Reference Reads", "REWORK", ["orders_postings", "warehouse_logistics"], "SALVAGE_SPLIT_BY_OPERATION_CLUSTER"),
    (33, "feature/ozon-b33-operational-status-reference-reads-2026-08-28", "Operational Status / Reference Reads", "REWORK", ["warehouse_logistics", "catalog_products", "orders_postings", "supplies_fbo"], "SALVAGE_SPLIT_BY_OPERATION_CLUSTER"),
    (34, "feature/ozon-b34-stock-analytics-extended-reads-2026-08-28", "Stock Analytics Extended Reads", "MOVE", ["stocks_inventory"], "SALVAGE_MOVE"),
    (35, "feature/ozon-b35-marketplace-search-query-reads-2026-08-28", "Marketplace Search Query Reads", "MOVE", ["search_visibility"], "SALVAGE_MOVE"),
    (36, "feature/ozon-b36-fbp-planning-reads-2026-08-28", "FBP Planning Reads", "MOVE", ["orders_postings"], "SALVAGE_MOVE"),
    (37, "feature/ozon-b37-fbo-removal-report-reads-2026-08-28", "FBO Removal List Reads", "MOVE", ["returns_cancellations"], "SALVAGE_DIRECT_READ_NOT_ASYNC_WORKFLOW"),
    (38, "feature/ozon-b38-finance-ledger-reads-2026-08-28", "Finance Ledger Reads", "MOVE", ["finance"], "SALVAGE_MOVE"),
    (39, "feature/ozon-b39-fbs-pickup-geography-reads-2026-08-28", "FBS Pickup Geography Reads", "MOVE", ["warehouse_logistics"], "SALVAGE_MOVE"),
    (40, "feature/ozon-b40-finance-balance-realization-reads-2026-08-28", "Finance Balance / Realization Reads", "MOVE", ["finance"], "SALVAGE_MOVE"),
    (41, "feature/ozon-b41-finance-buyout-read-2026-08-28", "Finance Buyout Read", "MOVE", ["finance"], "SALVAGE_MOVE"),
    (42, "feature/ozon-b42-fbs-warehouse-setup-reference-reads-2026-08-28", "FBS Warehouse Setup Reference Reads", "MOVE", ["warehouse_logistics"], "SALVAGE_MOVE"),
    (43, "feature/ozon-b43-fbp-posting-reads-2026-08-28", "FBP Posting Reads", "MOVE", ["orders_postings"], "SALVAGE_MOVE"),
    (44, "feature/ozon-b44-fbo-posting-get-2026-08-28", "FBO Posting Get", "MOVE", ["orders_postings"], "SALVAGE_MOVE_PRESERVE_ACCEPTED_SAFE_PROJECTION"),
    (45, "feature/ozon-b45-seller-action-candidates-2026-08-28", "Seller Action Candidates", "MOVE", ["prices_promotions"], "SALVAGE_MOVE"),
    (46, "feature/ozon-b46-fbs-posting-cancel-reason-2026-08-28", "FBS Posting Cancel Reason", "MOVE", ["returns_cancellations"], "SALVAGE_MOVE"),
    (47, "feature/ozon-b47-unpaid-legal-products-2026-08-28", "Unpaid Legal Products", "MOVE", ["orders_postings"], "SALVAGE_MOVE"),
    (48, "feature/ozon-b48-fbo-draft-timeslot-info-2026-08-28", "FBO Draft Timeslot Info", "MOVE", ["supplies_fbo"], "SALVAGE_MOVE"),
    (49, "feature/ozon-b49-fbs-posting-timeslot-change-restrictions-2026-08-28", "FBS Posting Timeslot Change Restrictions", "MOVE", ["orders_postings"], "SALVAGE_MOVE"),
]

ORPHANS = [
    "feature/ozon-b25-cancellation-read-completion-2026-08-28",
    "feature/ozon-b26-fbo-posting-detail-read-2026-08-28",
]


def run(*args: str, cwd: Path | None = None) -> str:
    return subprocess.check_output(args, cwd=cwd, text=True).strip()


def dump_registry(root: Path) -> dict:
    code = r"""
import {pathToFileURL} from 'node:url';
const root=process.argv[1];
await import(pathToFileURL(`${root}/shared/runtime_names.js`).href);
await import(pathToFileURL(`${root}/shared/ozon_operation_registry.js`).href);
const ops=globalThis.OzonOperationRegistry?.OPERATIONS;
if(!ops) throw new Error('registry unavailable '+root);
process.stdout.write(JSON.stringify(ops));
"""
    raw = subprocess.check_output(["node", "--input-type=module", "-e", code, str(root)], text=True)
    parsed = json.loads(raw)
    if not isinstance(parsed, dict):
        raise AssertionError(f"invalid registry at {root}")
    return parsed


def normalize_meta(meta: dict) -> dict:
    keys = [
        "provider", "method", "path", "effect", "request_style", "execution_enabled",
        "currentness", "safety_class", "privacy_policy", "cluster", "section",
        "guidance_visibility", "entitlement_key", "workflow_role", "pagination_model",
        "quota_class",
    ]
    return {k: meta.get(k) for k in keys if k in meta}


def canonical_target(meta: dict, stage_targets: list[str]) -> str:
    provider = str(meta.get("provider") or "")
    if provider == "performance_api":
        return "advertising_performance_STEP6"
    cluster = meta.get("cluster")
    if cluster in ALLOWED_SELLER_CLUSTERS:
        return cluster
    if len(stage_targets) == 1 and stage_targets[0] in ALLOWED_SELLER_CLUSTERS:
        return stage_targets[0]
    return "RECLASSIFY_FIXED_SELLER_CLUSTER"


def resolve_remote_branch(repo: Path, branch: str) -> str | None:
    ref = f"refs/remotes/origin/{branch}"
    try:
        return run("git", "rev-parse", "--verify", ref, cwd=repo)
    except subprocess.CalledProcessError:
        return None


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--repo-root", required=True)
    ap.add_argument("--lineage-work", required=True)
    ap.add_argument("--b49-out", required=True)
    ap.add_argument("--canonical-b1", required=True)
    ap.add_argument("--master-checklist", required=True)
    ap.add_argument("--out-json", required=True)
    ap.add_argument("--out-summary", required=True)
    args = ap.parse_args()

    repo = Path(args.repo_root).resolve()
    lineage_work = Path(args.lineage_work).resolve()
    b49_out = Path(args.b49_out).resolve()
    canonical_b1_root = Path(args.canonical_b1).resolve()

    master = json.loads(Path(args.master_checklist).read_text(encoding="utf-8"))
    seller_rows = [r for r in master["rows"] if r["provider"] == "seller_api"]
    master_by_key = {r["operation_key"]: r for r in seller_rows}
    assert len(master_by_key) == 463

    stage_roots: dict[int, Path] = {49: b49_out}
    for p in lineage_work.rglob("b*-base"):
        m = re.fullmatch(r"b(\d+)-base", p.name)
        if not m:
            continue
        n = int(m.group(1))
        if n in stage_roots:
            raise AssertionError(f"duplicate materialized stage B{n}: {stage_roots[n]} and {p}")
        stage_roots[n] = p
    missing = [n for n in range(0, 50) if n not in stage_roots]
    if missing:
        raise AssertionError(f"missing materialized stages: {missing}")

    registries = {n: dump_registry(stage_roots[n]) for n in range(0, 50)}
    canonical_b1 = dump_registry(canonical_b1_root)
    canonical_by_operation = {}
    for alias, meta in canonical_b1.items():
        if meta.get("provider") not in {"seller_api", "performance_api"}:
            continue
        key = f"{str(meta.get('method') or '').upper()} {meta.get('path')}"
        canonical_by_operation.setdefault((meta.get("provider"), key), []).append(alias)

    stage_entries = []
    all_historical_seller_ops = set()
    all_historical_performance_ops = set()
    reclassify_aliases = []
    current_inventory_salvage_aliases = []
    outside_current_inventory_aliases = []

    for n, branch, scope, old_verdict, targets, policy in STAGES:
        prev = registries[n - 1]
        cur = registries[n]
        added = sorted(set(cur) - set(prev))
        removed = sorted(set(prev) - set(cur))
        changed = sorted(
            alias for alias in set(prev) & set(cur)
            if normalize_meta(prev[alias]) != normalize_meta(cur[alias])
        )
        affected = []
        for change_kind, aliases in (("ADDED", added), ("CHANGED", changed), ("REMOVED", removed)):
            for alias in aliases:
                meta = cur.get(alias) if change_kind != "REMOVED" else prev.get(alias)
                meta = normalize_meta(meta or {})
                provider = meta.get("provider")
                operation_key = f"{str(meta.get('method') or '').upper()} {meta.get('path')}"
                master_row = master_by_key.get(operation_key) if provider == "seller_api" else None
                target = canonical_target(meta, targets)
                already_aliases = canonical_by_operation.get((provider, operation_key), [])

                if provider == "seller_api":
                    all_historical_seller_ops.add(operation_key)
                elif provider == "performance_api":
                    all_historical_performance_ops.add(operation_key)

                if provider == "performance_api":
                    decision = "PRESERVE_FOR_STEP6_PERFORMANCE_PROVIDER"
                elif change_kind == "REMOVED":
                    decision = "HISTORICAL_REMOVAL_EVIDENCE_REVIEW"
                elif master_row is None:
                    decision = "OUTSIDE_CURRENT_463_REQUIRES_DEPRECATED_OR_REPLACED_RECONCILIATION"
                    outside_current_inventory_aliases.append(alias)
                elif target == "RECLASSIFY_FIXED_SELLER_CLUSTER":
                    decision = "RECLASSIFY_BEFORE_CANONICAL_SALVAGE"
                    reclassify_aliases.append(alias)
                elif already_aliases:
                    decision = "ALREADY_PRESENT_IN_ACCEPTED_CANONICAL_B1"
                    current_inventory_salvage_aliases.append(alias)
                else:
                    decision = "SALVAGE_CANDIDATE_TO_CANONICAL_GROUP"
                    current_inventory_salvage_aliases.append(alias)

                affected.append({
                    "change_kind": change_kind,
                    "alias": alias,
                    "meta": meta,
                    "operation_key": operation_key,
                    "canonical_target": target,
                    "present_in_current_463_seller_inventory": master_row is not None if provider == "seller_api" else None,
                    "current_master_category": master_row.get("source_category_tag") if master_row else None,
                    "current_master_purpose": master_row.get("purpose") if master_row else None,
                    "canonical_b1_matching_aliases": sorted(already_aliases),
                    "salvage_decision": decision,
                })

        stage_entries.append({
            "stage": f"B{n}",
            "historical_branch": branch,
            "observed_branch_head": resolve_remote_branch(repo, branch),
            "historical_scope": scope,
            "historical_reconciliation_verdict": old_verdict,
            "current_canonical_targets": targets,
            "current_salvage_policy": policy,
            "registry_alias_count_before": len(prev),
            "registry_alias_count_after": len(cur),
            "added_alias_count": len(added),
            "changed_alias_count": len(changed),
            "removed_alias_count": len(removed),
            "affected_operations": affected,
        })

    orphan_rows = []
    for branch in ORPHANS:
        orphan_rows.append({
            "branch": branch,
            "observed_branch_head": resolve_remote_branch(repo, branch),
            "policy": "QUARANTINED_NOT_IN_ACCEPTED_B49_LINEAGE_DO_NOT_SALVAGE_AUTOMATICALLY",
        })

    final_old_registry = registries[49]
    final_provider_counts = {}
    for meta in final_old_registry.values():
        provider = str(meta.get("provider"))
        final_provider_counts[provider] = final_provider_counts.get(provider, 0) + 1

    payload = {
        "schema": "OZON_B1_B49_OPERATION_SALVAGE_MANIFEST_V1",
        "as_of": "2026-08-29",
        "roadmap_step": 3,
        "status": "OPERATION_LEVEL_SALVAGE_MAP_BUILT_RECLASSIFICATION_AND_CANONICAL_REPLAY_PENDING",
        "authorities": {
            "accepted_b0_commit": ACCEPTED_B0,
            "accepted_historical_b49_tip": ACCEPTED_B49,
            "current_master_checklist": "OZON_FULL_API_MASTER_CHECKLIST_2026-08-29.json",
            "master_seller_operation_count": 463,
            "personal_data_correction": "B9/B17 existing Personal Data gate is preserved; global attachment audit is Step 4, not a reason to discard these reads in Step 3.",
            "performance_correction": "Historical B6 Performance is preserved as separate provider salvage for Step 6, not deleted from the product goal.",
        },
        "counts": {
            "historical_stages": len(stage_entries),
            "historical_b49_registry_aliases": len(final_old_registry),
            "historical_b49_provider_aliases": final_provider_counts,
            "unique_historical_seller_operation_keys_touched": len(all_historical_seller_ops),
            "unique_historical_performance_operation_keys_touched": len(all_historical_performance_ops),
            "aliases_requiring_fixed_cluster_reclassification": len(set(reclassify_aliases)),
            "aliases_current_inventory_salvage_or_already_canonical": len(set(current_inventory_salvage_aliases)),
            "aliases_outside_current_463_requiring_currentness_reconciliation": len(set(outside_current_inventory_aliases)),
            "quarantined_orphan_branches": len(orphan_rows),
        },
        "orphan_branch_quarantine": orphan_rows,
        "stages": stage_entries,
    }

    Path(args.out_json).write_text(json.dumps(payload, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

    target_counts = {}
    decision_counts = {}
    for stage in stage_entries:
        for op in stage["affected_operations"]:
            target_counts[op["canonical_target"]] = target_counts.get(op["canonical_target"], 0) + 1
            decision_counts[op["salvage_decision"]] = decision_counts.get(op["salvage_decision"], 0) + 1

    target_lines = "\n".join(f"- `{k}`: {v}" for k, v in sorted(target_counts.items())) or "- none"
    decision_lines = "\n".join(f"- `{k}`: {v}" for k, v in sorted(decision_counts.items())) or "- none"
    reclass_lines = "\n".join(f"- `{a}`" for a in sorted(set(reclassify_aliases))) or "- none"
    outside_lines = "\n".join(f"- `{a}`" for a in sorted(set(outside_current_inventory_aliases))) or "- none"

    summary = f"""# B1-B49 operation-level salvage map\n\nDate: 2026-08-29  \nRoadmap step: 3\n\n## Deterministic source\n\nThe accepted historical B49 tip `{ACCEPTED_B49}` was recursively materialized. Its materializer produced exact B0..B48 base trees; B49 itself is the exact final output. Registry deltas were computed between consecutive materialized production trees. No branch name or batch title was used as a substitute for the actual registry delta.\n\nThe accepted canonical B1 was separately materialized and used to detect historical operations that are already present in the corrected canonical B1. The 463-row Seller master checklist controls current-operation membership.\n\n## Counts\n\n- historical stages analyzed: **{len(stage_entries)}**\n- historical B49 registry aliases: **{len(final_old_registry)}**\n- unique historical Seller operation keys touched by B1-B49 deltas: **{len(all_historical_seller_ops)}**\n- unique historical Performance operation keys touched by B1-B49 deltas: **{len(all_historical_performance_ops)}**\n- aliases requiring fixed-cluster reclassification: **{len(set(reclassify_aliases))}**\n- aliases outside the current 463 Seller inventory requiring deprecated/replacement reconciliation: **{len(set(outside_current_inventory_aliases))}**\n- quarantined duplicate-number orphan branches: **{len(orphan_rows)}**\n\n## Operation-level canonical target counts\n\n{target_lines}\n\n## Salvage decision counts\n\n{decision_lines}\n\n## Fixed-cluster reclassification queue\n\n{reclass_lines}\n\n## Outside-current-inventory currentness queue\n\n{outside_lines}\n\n## Required corrections carried forward\n\n- B9/B17 are salvageable `reviews_questions` work with the accepted existing Personal Data gate preserved. Step 4 will audit attachment of that gate across the whole Seller set; Step 3 does not discard these operations merely because they can expose personal data.\n- Historical B6 Performance work is preserved separately for Step 6. It is excluded only from Seller-lineage replay, not from the product completion target.\n- `feature/ozon-b25-cancellation-read-completion-2026-08-28` and `feature/ozon-b26-fbo-posting-detail-read-2026-08-28` are quarantined because they are not in the accepted B49 lineage.\n\nNo fresh Seller or Performance business API request is made by this analysis.\n"""
    Path(args.out_summary).write_text(summary, encoding="utf-8")
    print(json.dumps(payload["counts"], ensure_ascii=False, sort_keys=True))
    print(json.dumps({"target_counts": target_counts, "decision_counts": decision_counts}, ensure_ascii=False, sort_keys=True))


if __name__ == "__main__":
    main()
