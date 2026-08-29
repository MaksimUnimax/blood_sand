#!/usr/bin/env python3
import argparse
import csv
import hashlib
import json
from collections import Counter
from pathlib import Path

SWAGGER_BYTES = 304771
SWAGGER_SHA256 = "7436e4a3e40b4d5bf926a887d7891c1db264cbb6582266299a2df10f67592fec"
SWAGGER_PATHS = 47
SWAGGER_OPERATIONS = 48

# method|path|operationId|deprecated|summary
SOURCE_ROWS = """GET|/api/client/campaign|ListCampaigns|0|Список кампаний
GET|/api/client/campaign/{campaignId}/objects|ListCampaignObjects|0|Список продвигаемых объектов в кампании
GET|/api/client/limits/list|GetLimitsList|0|Лимиты ставок для инструментов продвижения
POST|/api/client/min/sku|ExternalCampaign_BidBySKU|0|Минимальная ставка для товаров по SKU
GET|/api/client/products_with_bonuses|ExternalCampaign_ListProductsWithBonuses2|0|Список товаров с бонусами
POST|/api/client/statistics|SubmitRequest|0|Статистика по кампании
POST|/api/client/statistics/video|VideoCampaignsSubmitRequest|0|Статистика по показам видеобаннера
POST|/api/client/statistics/attribution|AttributionSubmitRequest|0|Отчёт по заказам
GET|/api/client/statistics/{UUID}|StatisticsCheck|0|Cтатус отчёта
GET|/api/client/statistics/list|ListReports|0|Список отчётов, сгенерированных через интерфейс
GET|/api/client/statistics/externallist|ListReportsExternal|0|Список отчётов, сгенерированных через API
GET|/api/client/statistics/report|DownloadStatistics|0|Получить отчёты
GET|/api/client/statistics/campaign/media|MediaCampaignList|0|Статистика по медийным кампаниям
GET|/api/client/statistics/campaign/product|ProductCampaignList|0|Статистика по кампании Оплата за клик
GET|/api/client/statistics/expense|GetCampaignExpense|0|Статистика по расходу кампаний
GET|/api/client/statistics/daily|GetCampaignDailyStats|0|Дневная статистика по кампаниям
POST|/api/client/statistic/orders/generate|SearchPromoOrdersReportSubmitRequest|0|Получить отчёт по заказам в оплате за заказ — выбранные товары
POST|/api/client/statistic/products/generate|SearchPromoProductsReportSubmitRequest|0|Получить отчёт по товарам в оплате за заказ — выбранные товары
GET|/api/client/statistics/all_sku_promo/orders/generate|GenerateAllSkuPromoOrdersReport|0|Получить отчёт по заказам в оплате за заказ — все товары
GET|/api/client/statistics/all_sku_promo/products/generate|GenerateAllSkuPromoProductsReport|0|Получить отчёт по товарам в оплате за заказ — все товары
POST|/api/client/statistics/phrases|ExternalStatistics_StatisticsPhrasesSubmitRequest2|0|Отчёт по поисковым запросам
POST|/api/client/statistics/products/sku|SearchPromoProductsSKUStatistics2|0|Получить статистику по товарам в оплате за клик
POST|/api/client/campaign/cpc/v2/product|CreateProductCampaignCPCV2|0|Создать кампанию с оплатой за клики
POST|/external/api/dynamic_budget|CalculateDynamicBudget|1|Рассчитать минимальный бюджет кампании
POST|/api/client/campaign/{campaignId}/activate|ActivateCampaign|0|Активировать кампанию
POST|/api/client/campaign/{campaignId}/deactivate|DeactivateCampaign|0|Выключить кампанию
PATCH|/api/client/campaign/{campaignId}|PatchProductCampaign|0|Параметры кампании
POST|/api/client/campaign/{campaignId}/products|AddProducts|0|Добавить товары в кампанию
PUT|/api/client/campaign/{campaignId}/products|UpdateProducts|0|Обновить ставки товаров
GET|/api/client/campaign/{campaignId}/v2/products|GetProductsV2|0|Список товаров кампании
POST|/api/client/campaign/{campaignId}/products/delete|DeleteProducts|0|Удалить товары из кампании
GET|/api/client/campaign/{campaignId}/products/bids/competitive|GetProductsCompetitiveBids|0|Конкурентные ставки для товара
POST|/api/client/campaign/search_promo/v2/products|ExternalCampaign_ListSearchPromoProductsV2|0|Список товаров в продвижении в оплате за заказ
POST|/api/client/search_promo/bids/recommendation|ExternalCampaign_GetProductsRecommendedBids|1|Рекомендованные ставки для товаров
POST|/api/client/campaign/search_promo/v2/bids/set|ExternalCampaign_SetSearchPromoBidsV2|1|Установить ставку на товар
POST|/api/client/search_promo/get_cpo_min_bids|ExternalCampaign_GetCPOMinBids|0|Получить фиксированные ставки для товаров
POST|/api/client/search_promo/product/enable|ExternalCampaign_BatchEnableProducts|0|Включить продвижение товара в оплате за заказ
POST|/api/client/search_promo/product/disable|ExternalCampaign_BatchDisableProducts|0|Отключить продвижение товара в оплате за заказ
POST|/api/client/campaign/search_promo/v2/bids/delete|ExternalCampaign_DeleteSearchPromoBidsV2|0|Удалить товар из продвижения в оплате за заказ
GET|/api/client/campaign/all_sku_promo/activate|ActivateAllSkuPromoCampaign|0|Включить продвижение в оплате за заказ — все товары
GET|/api/client/campaign/all_sku_promo/deactivate|DeactivateAllSkuPromoCampaign|0|Выключить продвижение в оплате за заказ — все товары
GET|/api/client/campaign/all_sku_promo/set_bid|SetAllSkuPromoCampaignBid2|0|Установить ставку для продвижения в Оплате за заказ — все товары
POST|/api/client/campaign/search_promo/carrots/enable|ExternalCampaign_BatchEnableCarrots4|0|Включить продвижение товаров в акции «Морковск»
POST|/api/client/campaign/search_promo/carrots/disable|ExternalCampaign_BatchDisableCarrots4|0|Отключить продвижение товаров в акции «Морковск»
POST|/api/client/vendors/statistics|VendorStatisticsSubmitRequest|0|Отчёт с аналитикой внешнего трафика
GET|/api/client/vendors/statistics/list|VendorStatisticsListReports|0|Список запрошенных отчётов с аналитикой внешнего трафика
GET|/api/client/vendors/statistics/{UUID}|VendorStatisticsCheck|0|Информация об отчёте по UUID
GET|/api/client/organisation/vendor_tag|GetVendorTag|0|Метка организации для внешних рекламных кампаний"""

EXISTING_CURRENT_READS = {
    "GET /api/client/campaign": "performance_campaigns",
    "GET /api/client/campaign/{campaignId}/objects": "performance_campaign_objects",
    "GET /api/client/limits/list": "performance_bid_limits",
    "POST /api/client/statistics/products/sku": "performance_sku_statistics",
    "GET /api/client/campaign/{campaignId}/v2/products": "performance_campaign_products",
    "POST /api/client/campaign/search_promo/v2/products": "performance_search_promo_products",
}

MISSING_READS = {
    "POST /api/client/min/sku": ("performance_min_bid_by_sku", "DIRECT_JSON"),
    "GET /api/client/products_with_bonuses": ("performance_products_with_bonuses", "DIRECT_JSON"),
    "GET /api/client/statistics/{UUID}": ("performance_statistics_status", "DIRECT_JSON"),
    "GET /api/client/statistics/list": ("performance_statistics_list_ui", "DIRECT_JSON"),
    "GET /api/client/statistics/externallist": ("performance_statistics_list_api", "DIRECT_JSON"),
    "GET /api/client/statistics/report": ("performance_statistics_report_download", "DIRECT_BINARY"),
    "GET /api/client/statistics/campaign/media": ("performance_media_csv", "DIRECT_BINARY"),
    "GET /api/client/statistics/campaign/product": ("performance_campaign_product_csv", "DIRECT_BINARY"),
    "GET /api/client/statistics/expense": ("performance_expense_csv", "DIRECT_BINARY"),
    "GET /api/client/statistics/daily": ("performance_daily_csv", "DIRECT_BINARY"),
    "GET /api/client/campaign/{campaignId}/products/bids/competitive": ("performance_competitive_bids", "DIRECT_JSON"),
    "POST /api/client/search_promo/get_cpo_min_bids": ("performance_cpo_min_bids", "DIRECT_JSON"),
    "GET /api/client/vendors/statistics/list": ("performance_vendor_statistics_list", "DIRECT_JSON"),
    "GET /api/client/vendors/statistics/{UUID}": ("performance_vendor_statistics_status", "DIRECT_JSON"),
    "GET /api/client/organisation/vendor_tag": ("performance_vendor_tag", "DIRECT_JSON"),
}

DOCUMENTED_JSON_VARIANTS = {
    "GET /api/client/statistics/campaign/media": ("performance_media", "/api/client/statistics/campaign/media/json"),
    "GET /api/client/statistics/campaign/product": ("performance_campaign_product", "/api/client/statistics/campaign/product/json"),
    "GET /api/client/statistics/expense": ("performance_expense", "/api/client/statistics/expense/json"),
    "GET /api/client/statistics/daily": ("performance_daily", "/api/client/statistics/daily/json"),
}

ASYNC_REPORT_GENERATION = {
    "POST /api/client/statistics",
    "POST /api/client/statistics/video",
    "POST /api/client/statistics/attribution",
    "POST /api/client/statistic/orders/generate",
    "POST /api/client/statistic/products/generate",
    "GET /api/client/statistics/all_sku_promo/orders/generate",
    "GET /api/client/statistics/all_sku_promo/products/generate",
    "POST /api/client/statistics/phrases",
    "POST /api/client/vendors/statistics",
}

MUTATIONS = {
    "POST /api/client/campaign/cpc/v2/product",
    "POST /api/client/campaign/{campaignId}/activate",
    "POST /api/client/campaign/{campaignId}/deactivate",
    "PATCH /api/client/campaign/{campaignId}",
    "POST /api/client/campaign/{campaignId}/products",
    "PUT /api/client/campaign/{campaignId}/products",
    "POST /api/client/campaign/{campaignId}/products/delete",
    "POST /api/client/campaign/search_promo/v2/bids/set",
    "POST /api/client/search_promo/product/enable",
    "POST /api/client/search_promo/product/disable",
    "POST /api/client/campaign/search_promo/v2/bids/delete",
    "GET /api/client/campaign/all_sku_promo/activate",
    "GET /api/client/campaign/all_sku_promo/deactivate",
    "GET /api/client/campaign/all_sku_promo/set_bid",
    "POST /api/client/campaign/search_promo/carrots/enable",
    "POST /api/client/campaign/search_promo/carrots/disable",
}

DEPRECATED_READLIKE = {
    "POST /external/api/dynamic_budget",
    "POST /api/client/search_promo/bids/recommendation",
}


def parse_source_rows():
    rows = []
    for raw in SOURCE_ROWS.splitlines():
        method, path, operation_id, deprecated, summary = raw.split("|", 4)
        rows.append({
            "operation_key": f"{method} {path}",
            "http_method": method,
            "fixed_path": path,
            "operation_id": operation_id,
            "deprecated": deprecated == "1",
            "summary": summary,
        })
    return rows


def validate_exact_swagger(path: Path, expected_keys: set[str]):
    data = path.read_bytes()
    if len(data) != SWAGGER_BYTES:
        raise RuntimeError(f"Performance Swagger bytes {len(data)} != {SWAGGER_BYTES}")
    actual_sha = hashlib.sha256(data).hexdigest()
    if actual_sha != SWAGGER_SHA256:
        raise RuntimeError(f"Performance Swagger SHA {actual_sha} != {SWAGGER_SHA256}")
    doc = json.loads(data)
    paths = doc.get("paths", {})
    if len(paths) != SWAGGER_PATHS:
        raise RuntimeError(f"Performance Swagger paths {len(paths)} != {SWAGGER_PATHS}")
    methods = {"get", "post", "put", "patch", "delete", "head", "options", "trace"}
    keys = set()
    for p, item in paths.items():
        for method in item:
            if method.lower() in methods:
                keys.add(f"{method.upper()} {p}")
    if len(keys) != SWAGGER_OPERATIONS or keys != expected_keys:
        raise RuntimeError(f"Performance Swagger operation set mismatch: count={len(keys)} delta={sorted(keys ^ expected_keys)}")
    print("PERFORMANCE_STEP6_EXACT_SWAGGER_IDENTITY_PASS")


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--swagger")
    ap.add_argument("--out-json", required=True)
    ap.add_argument("--out-csv", required=True)
    ap.add_argument("--out-summary", required=True)
    args = ap.parse_args()

    rows = parse_source_rows()
    if len(rows) != 48 or len({r["operation_key"] for r in rows}) != 48:
        raise RuntimeError("embedded Performance inventory must contain 48 unique operations")
    keys = {r["operation_key"] for r in rows}

    classified = set(EXISTING_CURRENT_READS) | set(MISSING_READS) | ASYNC_REPORT_GENERATION | MUTATIONS | DEPRECATED_READLIKE
    if classified != keys:
        raise RuntimeError(f"classification is not exhaustive: {sorted(classified ^ keys)}")
    if sum(map(len, [EXISTING_CURRENT_READS, MISSING_READS, ASYNC_REPORT_GENERATION, MUTATIONS, DEPRECATED_READLIKE])) != 48:
        raise RuntimeError("classification sets overlap")

    if args.swagger:
        validate_exact_swagger(Path(args.swagger), keys)

    for row in rows:
        key = row["operation_key"]
        if key in EXISTING_CURRENT_READS:
            row.update(step6_decision="READ_ALREADY_IMPLEMENTED_CURRENT_PATH", alias=EXISTING_CURRENT_READS[key], response_kind="DIRECT_JSON")
        elif key in MISSING_READS:
            alias, response_kind = MISSING_READS[key]
            row.update(step6_decision="READ_IMPLEMENT_STEP6", alias=alias, response_kind=response_kind)
        elif key in ASYNC_REPORT_GENERATION:
            row.update(step6_decision="BLOCK_ASYNC_REPORT_GENERATION")
        elif key in MUTATIONS:
            row.update(step6_decision="BLOCK_MUTATION_SIDE_EFFECT")
        else:
            row.update(step6_decision="SKIP_DEPRECATED_READLIKE")
        if key in DOCUMENTED_JSON_VARIANTS:
            alias, path = DOCUMENTED_JSON_VARIANTS[key]
            row["documented_json_variant_alias"] = alias
            row["documented_json_variant_path"] = path

    counts = Counter(r["step6_decision"] for r in rows)
    expected_counts = {
        "READ_ALREADY_IMPLEMENTED_CURRENT_PATH": 6,
        "READ_IMPLEMENT_STEP6": 15,
        "BLOCK_ASYNC_REPORT_GENERATION": 9,
        "BLOCK_MUTATION_SIDE_EFFECT": 16,
        "SKIP_DEPRECATED_READLIKE": 2,
    }
    if dict(counts) != expected_counts:
        raise RuntimeError(f"unexpected counts {dict(counts)}")

    out = {
        "schema": "OZON_PERFORMANCE_STEP6_EXACT_MATRIX_V1",
        "as_of": "2026-08-29",
        "roadmap_step": 6,
        "authority": {
            "swagger_bytes": SWAGGER_BYTES,
            "swagger_sha256": SWAGGER_SHA256,
            "openapi": "3.0.0",
            "paths": SWAGGER_PATHS,
            "operations": SWAGGER_OPERATIONS,
        },
        "invariants": [
            "PERFORMANCE_PROVIDER_REMAINS_SEPARATE",
            "ONE_EXPLICIT_COMMAND_ONE_BUSINESS_REQUEST",
            "NO_HIDDEN_PAGINATION",
            "NO_HIDDEN_RETRY",
            "NO_HIDDEN_POLLING",
            "NO_HIDDEN_FANOUT",
            "NO_PROVIDER_CHAINING",
            "ASYNC_REPORT_GENERATION_REMAINS_BLOCKED",
            "PERFORMANCE_MUTATIONS_REMAIN_BLOCKED",
            "DOCUMENTED_JSON_VARIANTS_DO_NOT_REPLACE_CURRENT_METHOD_PATH_COUNT",
        ],
        "counts": {
            "rows": 48,
            "admissible_current_reads": 21,
            "already_implemented_current_path_reads": 6,
            "new_reads_to_implement": 15,
            "documented_json_variants_already_preserved": 4,
            **expected_counts,
        },
        "rows": rows,
    }
    Path(args.out_json).write_text(json.dumps(out, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

    fields = ["operation_key", "http_method", "fixed_path", "operation_id", "summary", "deprecated", "step6_decision", "alias", "response_kind", "documented_json_variant_alias", "documented_json_variant_path"]
    with Path(args.out_csv).open("w", encoding="utf-8", newline="") as f:
        writer = csv.DictWriter(f, fieldnames=fields)
        writer.writeheader()
        for row in rows:
            writer.writerow({k: row.get(k, "") for k in fields})

    lines = [
        "# Ozon Performance Step 6 exact 48-operation matrix",
        "",
        "Status: `PERFORMANCE_STEP6_EXACT_MATRIX_BUILT`",
        "",
        "## Exact authority",
        "",
        f"- Swagger bytes: `{SWAGGER_BYTES}`",
        f"- Swagger SHA-256: `{SWAGGER_SHA256}`",
        f"- Paths: `{SWAGGER_PATHS}`",
        f"- HTTP operations: `{SWAGGER_OPERATIONS}`",
        "",
        "## Step 6 split",
        "",
        "- admissible current reads/read-results: **21**",
        "- already implemented on exact current method+path: **6**",
        "- new current reads to implement: **15**",
        "- existing documented `/json` variants preserved: **4**",
        "- async report-generation starts kept blocked: **9**",
        "- mutations kept blocked: **16**",
        "- deprecated read-like endpoints not added to current read surface: **2**",
        "",
        "The four `/json` routes are documented variants of current statistics operations. They remain useful compatibility/read routes, but do not replace the exact base `method + path` rows in the 48-operation completeness count.",
        "",
        "## Missing current reads to implement",
        "",
    ]
    for row in rows:
        if row["step6_decision"] == "READ_IMPLEMENT_STEP6":
            lines.append(f"- `{row['alias']}` — `{row['operation_key']}` — `{row['response_kind']}`")
    lines += [
        "",
        "## Safety boundary",
        "",
        "The existing accepted Performance mutation blocklist already matches all 16 current mutation operations selected by this matrix. The existing accepted async-report side-effect blocklist already matches all 9 report-generation starts selected by this matrix. Step 6 must preserve both blocklists.",
        "",
    ]
    Path(args.out_summary).write_text("\n".join(lines), encoding="utf-8")

    print(json.dumps(out["counts"], sort_keys=True))
    print("PERFORMANCE_STEP6_48_OPERATION_CLASSIFICATION_PASS")


if __name__ == "__main__":
    main()
