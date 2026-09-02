#!/usr/bin/env python3
"""Apply the exact Ozon live-repair changes with strict one-match guards.

This materializer changes real production files under dist-step7-candidate. It is
kept as reproducible evidence; it is not loaded by the extension at runtime.
"""

from __future__ import annotations

import argparse
import hashlib
from pathlib import Path


HERE = Path(__file__).resolve().parent
OZON_ROOT = HERE.parents[1]
SHARED = OZON_ROOT / "dist-step7-candidate" / "shared"
CONTRACT = SHARED / "ozon_contract.js"
ENTITLEMENTS = SHARED / "ozon_entitlements.js"


OLD_CAMPAIGN_REFINEMENT = '''  function campaignRefinementChoices(params, sourceCount) {
    const filters = {};
    for (const key of ["campaignIds", "advObjectType", "state"]) if (Object.prototype.hasOwnProperty.call(params, key)) filters[key] = params[key];
    const choices = [];
    if (!params.local_sort) {
      const page = Number(params.page || 1), pageSize = Number(params.pageSize || 100);
      choices.push({
        id: "next_page", purpose: "Получить следующую явную страницу кампаний без hidden pagination.",
        command: { operation: "performance_campaigns", params: { ...filters, page: page + 1, pageSize } }
      });
    }
    choices.push(
      { id: "active_campaigns", purpose: "Только активные кампании.", command: { operation: "performance_campaigns", params: { ...filters, state: "CAMPAIGN_STATE_RUNNING", page: 1, pageSize: 100 } } },
      { id: "latest_created", purpose: "Самые новые по createdAt; один provider request, затем локальная сортировка Bridge.", command: { operation: "performance_campaigns", params: { ...filters, local_sort: "created_at_desc", local_limit: 100 } } },
      { id: "latest_updated", purpose: "Последние изменённые по updatedAt; один provider request, затем локальная сортировка Bridge.", command: { operation: "performance_campaigns", params: { ...filters, local_sort: "updated_at_desc", local_limit: 100 } } },
      { id: "specific_campaign_ids", purpose: "Только конкретные кампании.", template: { operation: "performance_campaigns", params: { campaignIds: ["CAMPAIGN_ID"], page: 1, pageSize: 100 } } },
      { id: "campaign_products", purpose: "Товары конкретной рекламной кампании.", template: { operation: "performance_campaign_products", params: { campaignId: "CAMPAIGN_ID", page: 1, pageSize: 100 } } },
      { id: "campaign_product_statistics", purpose: "Статистика кампаний в разрезе товаров за период.", template: { operation: "performance_campaign_product", params: { campaignIds: ["CAMPAIGN_ID"], dateFrom: "YYYY-MM-DD", dateTo: "YYYY-MM-DD" } } },
      { id: "sku_statistics", purpose: "SKU-статистика по рекламным кампаниям за период.", template: { operation: "performance_sku_statistics", params: { campaignIds: ["CAMPAIGN_ID"], dateFrom: "YYYY-MM-DD", dateTo: "YYYY-MM-DD" } } }
    );
    return { source_count: Number(sourceCount || 0), choices };
  }
'''


NEW_CAMPAIGN_REFINEMENT = '''  function detachedCampaignRefinementFilters(params) {
    const filters = {};
    if (Object.prototype.hasOwnProperty.call(params, "campaignIds")) {
      filters.campaignIds = params.campaignIds.map((campaignId) => String(campaignId));
    }
    for (const key of ["advObjectType", "state"]) {
      if (Object.prototype.hasOwnProperty.call(params, key)) filters[key] = params[key];
    }
    return filters;
  }

  function campaignRefinementChoices(params, sourceCount) {
    const filters = () => detachedCampaignRefinementFilters(params);
    const choices = [];
    if (!params.local_sort) {
      const page = Number(params.page || 1), pageSize = Number(params.pageSize || 100);
      choices.push({
        id: "next_page", purpose: "Получить следующую явную страницу кампаний без hidden pagination.",
        command: { operation: "performance_campaigns", params: { ...filters(), page: page + 1, pageSize } }
      });
    }
    choices.push(
      { id: "active_campaigns", purpose: "Только активные кампании.", command: { operation: "performance_campaigns", params: { ...filters(), state: "CAMPAIGN_STATE_RUNNING", page: 1, pageSize: 100 } } },
      { id: "latest_created", purpose: "Самые новые по createdAt; один provider request, затем локальная сортировка Bridge.", command: { operation: "performance_campaigns", params: { ...filters(), local_sort: "created_at_desc", local_limit: 100 } } },
      { id: "latest_updated", purpose: "Последние изменённые по updatedAt; один provider request, затем локальная сортировка Bridge.", command: { operation: "performance_campaigns", params: { ...filters(), local_sort: "updated_at_desc", local_limit: 100 } } },
      { id: "specific_campaign_ids", purpose: "Только конкретные кампании.", template: { operation: "performance_campaigns", params: { campaignIds: ["CAMPAIGN_ID"], page: 1, pageSize: 100 } } },
      { id: "campaign_products", purpose: "Товары конкретной рекламной кампании.", template: { operation: "performance_campaign_products", params: { campaignId: "CAMPAIGN_ID", page: 1, pageSize: 100 } } },
      { id: "campaign_product_statistics", purpose: "Статистика кампаний в разрезе товаров за период.", template: { operation: "performance_campaign_product", params: { campaignIds: ["CAMPAIGN_ID"], dateFrom: "YYYY-MM-DD", dateTo: "YYYY-MM-DD" } } },
      { id: "sku_statistics", purpose: "SKU-статистика по рекламным кампаниям за период.", template: { operation: "performance_sku_statistics", params: { campaignIds: ["CAMPAIGN_ID"], dateFrom: "YYYY-MM-DD", dateTo: "YYYY-MM-DD" } } }
    );
    return { source_count: Number(sourceCount || 0), choices };
  }
'''


OLD_ENTITLEMENT_ANCHOR = '''      "POST /v1/description-category/attribute/values/search": { default_access: "ALL_ACCOUNTS", endpoint_allowed_subscription_types: null, feature_rules: [] },
      "POST /v1/brand/company-certification/list": { default_access: "ALL_ACCOUNTS", endpoint_allowed_subscription_types: null, feature_rules: [] },
'''


NEW_ENTITLEMENT_ANCHOR = '''      "POST /v1/description-category/attribute/values/search": { default_access: "ALL_ACCOUNTS", endpoint_allowed_subscription_types: null, feature_rules: [] },
      "POST /v1/description-category/dependent-attributes": { default_access: "ALL_ACCOUNTS", endpoint_allowed_subscription_types: null, feature_rules: [] },
      "POST /v1/description-category/dependent-attributes/values": { default_access: "ALL_ACCOUNTS", endpoint_allowed_subscription_types: null, feature_rules: [] },
      "POST /v1/brand/company-certification/list": { default_access: "ALL_ACCOUNTS", endpoint_allowed_subscription_types: null, feature_rules: [] },
'''


def sha256(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()


def replace_once(path: Path, old: str, new: str, marker: str) -> bool:
    text = path.read_text(encoding="utf-8")
    count = text.count(old)
    if count == 1:
        path.write_text(text.replace(old, new, 1), encoding="utf-8", newline="\n")
        print(f"{marker}_APPLIED sha256={sha256(path)}")
        return True
    if count == 0 and new in text:
        print(f"{marker}_ALREADY_APPLIED sha256={sha256(path)}")
        return False
    raise SystemExit(f"{marker}: expected exactly one old block, found {count}; refusing non-deterministic edit")


def apply_step1() -> None:
    replace_once(
        CONTRACT,
        OLD_CAMPAIGN_REFINEMENT,
        NEW_CAMPAIGN_REFINEMENT,
        "OZON_SPECIFIC_CAMPAIGN_IDS_DETACHED_FILTER_REPAIR",
    )


def apply_step3() -> None:
    replace_once(
        ENTITLEMENTS,
        OLD_ENTITLEMENT_ANCHOR,
        NEW_ENTITLEMENT_ANCHOR,
        "OZON_DEPENDENT_ATTRIBUTE_ENTITLEMENTS_REPAIR",
    )


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("step", choices=("step1", "step3", "all"))
    args = parser.parse_args()
    if args.step in ("step1", "all"):
        apply_step1()
    if args.step in ("step3", "all"):
        apply_step3()


if __name__ == "__main__":
    main()
