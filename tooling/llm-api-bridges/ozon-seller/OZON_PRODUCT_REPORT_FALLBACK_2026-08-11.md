# Ozon Seller API — generated product report fallback — 2026-08-11

Статус: **CURRENT GENERATED-REPORT FAMILY / PRODUCT MASTER FALLBACK CANDIDATE / OUTPUT SCHEMA PENDING**

## Why this exists

The primary Product Master research chain uses current product list/info/attributes/pictures/category/price/stock families. Several desired fields are still not proven on the current direct-read contracts, including title/name, barcodes and dimensions/weight.

This pass checked whether Ozon's generated product report can provide a second official read route without inheriting fields from obsolete API versions.

## Current Ozon-owned evidence

### `/v1/report/products/create`

Ozon Seller API notification on **2026-01-22** explicitly updated the description of request parameter:

- `visibility`.

This is fresh evidence that `/v1/report/products/create` remained an active documented family in January 2026.

Earlier Ozon-owned report-lifecycle evidence on 2024-07-30 / 2024-08-02 grouped `/v1/report/products/create` with other generated report methods and updated descriptions of `code` and `file` parameters across report requests/responses.

Related current report infrastructure is independently active in 2026:

- `/v1/report/info`;
- `/v1/report/list`.

Their current research contract includes report type / expiry fragments elsewhere in this project.

## What is confirmed

- exact path family: `/v1/report/products/create`;
- generated-report semantics rather than ordinary synchronous JSON list semantics;
- current request fragment: `visibility`;
- generated report lifecycle uses report metadata/file concepts (`code`, `file`) in Ozon's report family;
- a future bridge must model creation and later status/info/retrieval as separate explicit operations.

## What is NOT confirmed

The accessible Ozon-owned index does **not** expose the current product-report output columns/schema.

Therefore this artifact does not claim that the generated report contains:

- title/name;
- seller article/offer id;
- SKU/product id;
- barcode;
- dimensions/weight;
- category/type;
- moderation/error state;
- price/stock;
- any other field not explicitly verified from the current report contract.

These Product Master gaps stay open until Ozon-owned current report output documentation is retrieved.

## Operation locator / report type

A canonical `#operation/...` identifier and exact current `report_type` value were **not recovered from Ozon-owned indexed evidence in this pass**.

Do not infer them from naming conventions.

## Architecture disposition

`/v1/report/products/create` is a **fallback/alternate extraction candidate**, not a replacement for the direct Product Master chain.

Rules for future provider design:

1. one explicit command may create one report job;
2. report creation must not trigger hidden polling;
3. a later explicit operation checks report status/info/list;
4. a later explicit retrieval operation obtains the generated file when ready;
5. no report column is promised until the current Ozon-owned output schema is verified;
6. no silent fan-out from product list to report generation;
7. no use of old report examples to fill current fields by assumption.

## Gate impact

This candidate improves resilience of the future Product Master ingestion design but **does not close `catalog_product_master`** and does not authorize 03A.4.

Remaining research:

- current HTTP verb/full request body;
- exact report type;
- report job response;
- current output columns/file format/encoding;
- visibility enum semantics;
- history/snapshot semantics;
- permissions/rate/product-operation constraints;
- current deprecation check immediately before implementation.
