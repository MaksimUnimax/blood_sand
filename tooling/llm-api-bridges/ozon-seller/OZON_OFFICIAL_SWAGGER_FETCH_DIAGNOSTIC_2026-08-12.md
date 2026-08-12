# Ozon official Swagger fetch diagnostic — 2026-08-12

Status: **OFFICIAL SPEC URLS IDENTIFIED / DATACENTER FETCH BLOCKED / USER-BROWSER CAPTURE REQUIRED**

## Goal

Obtain machine-readable Ozon-owned API contracts so method limits, schemas, enums, pagination and deprecations can be derived from the official specification instead of HTML parsing or guessed constants.

## Official spec targets

- Seller API: `https://docs.ozon.ru/api/seller/swagger.json`
- Performance API: `https://docs.ozon.ru/api/performance/swagger.json`

These are treated as the target Ozon-owned machine-readable documents. A fetched artifact is accepted only if it parses as JSON and contains either `swagger` or `openapi` plus an object-valued `paths` member.

## Server/client probes

### Plain HTTP client

GitHub Actions probe against both target URLs observed:

1. initial request redirects with HTTP 307 to the same path with `?__rr=1`;
2. Ozon sets an anti-bot/session cookie;
3. the redirected request returns HTTP 403 and an Ozon incident/support response rather than a Swagger document.

Following redirects blindly therefore cannot retrieve the spec.

### Real Chrome on GitHub-hosted runner

A second probe used system Google Chrome (`/usr/bin/google-chrome`) through Puppeteer in non-headless mode under Xvfb, without stealth/fingerprint modification.

Observed on 2026-08-12:

- Seller documentation root: HTTP 403, final URL includes `?__rr=1`;
- Seller `swagger.json`: HTTP 403, HTML response instead of JSON;
- Performance documentation root: HTTP 403;
- Performance `swagger.json`: HTTP 403, HTML response instead of JSON.

Therefore the failure is not specific to curl/requests and is consistent with Ozon blocking the GitHub-hosted/datacenter execution environment.

## Policy consequence

Do not attempt anti-bot evasion or treat third-party mirrors as authoritative.

The next authoritative acquisition path is a normal user Chrome session on a non-datacenter network. The bridge/helper may read only the two fixed Ozon-owned spec URLs, validate the returned document as OpenAPI/Swagger, cache a local snapshot and expose targeted contract fragments to ChatGPT.

## Limit policy

For bridge limits and data collection design:

1. current Ozon-owned Swagger/OpenAPI constraints are primary evidence where present;
2. current Ozon-owned changelog/notifications are used for dynamic/deprecation/currentness constraints;
3. live Seller/Performance API probes confirm account/runtime behavior;
4. arbitrary bridge safety caps are not interpreted as Ozon capability limits;
5. if a bridge-local cap prevents an otherwise valid Ozon request/response, that cap is implementation debt and should be raised or redesigned.

## Already measured live boundary

For `POST /v1/analytics/data` with the same 30-day SKU request shape and metrics `ordered_units` + `revenue`:

- `limit = 1000` returned HTTP 200;
- `limit = 1001` returned HTTP 400.

This is live behavioral evidence. The exact documented constraint still needs to be read from the current official spec once the user-browser snapshot is acquired.
