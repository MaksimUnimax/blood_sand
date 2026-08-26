# R4 — Ozon fresh baseline gate — 2026-08-26

Status: **READY — ONE EXPLICIT REQUEST AUTHORIZED**

Stage: Roadmap 06.2

## Why a fresh request is still needed

Accepted historical evidence now proves a complete 76-item Ozon product-level stock snapshot on 2026-08-11/12. The fresh request is therefore for **currentness/change detection**, not to reconstruct historical completeness.

## Current bridge contract verified

Source lineage checked:
- Ozon Bridge v0.1.19 live-test index on `fix/ozon-work-composer-control-2026-08-21`;
- live test 9.3;
- live test 10.3.

Direct verified facts:
- command prefix: `OZON_API_V1`;
- operation: `stocks_current`;
- valid params envelope includes `filter` and `limit`;
- `filter:{}` is accepted in the v0.1.19 test contract;
- `limit` minimum 1, maximum 1000;
- documented `filter.product_id` is an array when used;
- one accepted explicit command performs at most one physical Ozon business request;
- no hidden pagination is assumed.

Verified v0.1.19 negative-boundary command:
`{"operation":"stocks_current","params":{"filter":{},"limit":1001}}`
was rejected locally with zero physical requests because the maximum is 1000.

Verified v0.1.19 positive filter command:
`{"operation":"stocks_current","params":{"filter":{"product_id":["1082848375"]},"limit":1}}`
executed exactly one physical request and returned HTTP 200.

## Authorized first refresh command

`{"operation":"stocks_current","params":{"filter":{},"limit":1000}}`

Interpretation rules after result:
1. save the complete returned result before analysis;
2. record `total`, item count and exact `cursor`;
3. non-empty cursor means **NOT terminal yet** even if item count appears to equal total;
4. do not invent continuation shape; verify exact cursor request contract before issuing a second request;
5. compare fresh identities to historical 76 only after fresh enumeration reaches explicit terminal state;
6. stock quantities are snapshot facts only.

## No fan-out yet

Do not combine this command with analytics, product detail, price or attributes in the same Stage 06.2 pass. Change detection is evaluated first.
