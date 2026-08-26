# Patch B5 — Finance / Realization operator Swagger evidence

Date: 2026-08-26
Authority: exact operator-supplied Ozon Seller Swagger

- file size: `3933043` bytes
- SHA-256: `39e053a147180d1df4ded6ed0272aaaf02dd6a371144d8ebed7113fd218e4b40`
- OpenAPI: `3.0.0`
- server: `api-seller.ozon.ru`

## P0_finance_realization queue paths

Exact repo queue contains seven entries:

1. `finance_accrual_postings` -> `/v1/finance/accrual/postings`
2. `finance_accrual_types` -> `/v1/finance/accrual/types`
3. `finance_accrual_by_day` -> `/v1/finance/accrual/by-day`
4. `finance_realization_posting` -> `/v1/finance/realization/posting`
5. `realization_report_create` -> `/v1/report/realization/posting/create`
6. `report_list` -> `/v1/report/list`
7. `report_info` -> `/v1/report/info`

## Exact current method facts

### POST `/v1/finance/accrual/postings`

- operationId: `GetFinanceAccrualPostings`
- request body: `finance.v1.GetFinanceAccrualPostingsRequest`
- required: `posting_numbers`
- `posting_numbers`: array of strings, minItems `1`, maxItems `200`
- response is a direct read of accruals for explicit postings.

### POST `/v1/finance/accrual/types`

- operationId: `GetFinanceAccrualTypes`
- **no OpenAPI requestBody**
- response is the accrual-type dictionary.

### POST `/v1/finance/accrual/by-day`

- operationId: `GetFinanceAccrualByDay`
- request body: `finance.v1.GetFinanceAccrualByDayRequest`
- required: `date`, `last_id`
- earliest documented date: `2022-01-01`
- first request uses empty `last_id`
- continuation uses caller-supplied previous response `last_id`
- `last_id` lifetime documented as 15 minutes
- no automatic continuation is authorized.

### POST `/v1/finance/realization/posting`

- operationId: `FinanceAPI_GetRealizationReportV1`
- request requires `month`, `year`
- official operation warning: method is unavailable to sellers that concluded a contract with ТОО «ОЗОН Маркетплейс Казахстан».
- current bridge entitlement model represents subscription restrictions, not this contract/jurisdiction eligibility.
- therefore B5 does **not** expose this operation rather than falsely classify it as `ALL_ACCOUNTS`.

### POST `/v1/report/realization/posting/create`

- operationId: `CreateCompanyFinanceRealizationPostingReport`
- creates a server-side report.
- excluded from B5 pure-read gate.
- no create/poll/retrieve chain is authorized.

### POST `/v1/report/list`

- operationId: `ReportAPI_ReportList`
- returns reports formed previously.
- required: `page`, `page_size`
- `page_size` documented maximum: `1000`
- `report_type` description enumerates:
  `ALL`, `SELLER_PRODUCTS`, `SELLER_STOCK`, `SELLER_RETURNS`, `SELLER_POSTINGS`,
  `SELLER_DISCOUNTED`, `MUTUAL_SETTLEMENT`, `DOCUMENT_B2B_SALES`,
  `COMPENSATION_REPORT`, `DECOMPENSATION_REPORT`, `MARKED_PRODUCTS_SALES`,
  `SELLER_PLACEMENT_BY_PRODUCTS`, `SELLER_PLACEMENT_BY_SUPPLIES`.
- response contains a `file` download link for an already generated report.

### POST `/v1/report/info`

- operationId: `ReportAPI_ReportInfo`
- required `code` string
- reads information about an existing report
- response contains a `file` download link for the generated report.

## Safety consequence for report metadata

Existing reports may include postings/returns. B5 keeps `report_list` and `report_info` as safe metadata reads but redacts the response `file` download link from model-visible results. B5 never downloads a report file and never chains list/info into report creation or file retrieval.

## Entitlement evidence

The official Swagger entitlement compiler yields `ALL_ACCOUNTS` for the five enabled B5 reads:

- `POST /v1/finance/accrual/postings`
- `POST /v1/finance/accrual/types`
- `POST /v1/finance/accrual/by-day`
- `POST /v1/report/list`
- `POST /v1/report/info`

The Kazakhstan restriction on `/v1/finance/realization/posting` is non-subscription account eligibility and is deliberately not converted into a false subscription rule.
