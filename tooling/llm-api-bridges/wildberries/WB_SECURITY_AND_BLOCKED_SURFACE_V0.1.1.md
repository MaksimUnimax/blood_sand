# Wildberries Bridge v0.1.1 — security boundary

## Fail-closed execution

The LLM supplies only `operation` plus operation params. URL, host, method, headers, Authorization, token, X-Client-Secret and arbitrary transport controls are recursively rejected. The executable registry accepts only current entries classified `READ`.

## Credentials

Seller credentials stay in local extension storage. Network auth is built in the worker/provider layer as `Authorization: Bearer <token>`; `X-Client-Secret` is emitted only for Service/Basic flows. Personal token + client secret is rejected.

## One command = one request

One accepted `WB_API_V1` command performs at most one external request. There is no automatic network retry, pagination loop, fan-out or report polling. Next page, report status/download and explicit report retry are separate commands.

## PII

Direct buyer/customer identity surfaces are not in the allowlist. Included order/review/question/return contours pass through recursive secret/PII sanitization before `WB_RESULT_V1` delivery.

Examples intentionally blocked from direct execution include buyer/client-info endpoints, buyer chat, driver pass identity data, mutation endpoints for stocks/prices/cards/orders/supplies/advertising/feedback/questions/returns, deprecated endpoints, and UNKNOWN-effect operations.

## Package

The production ZIP contains 17 source/runtime files only. No tests, evidence, credentials backup, seller token, CRX, PEM/private key or package metadata are included.
