# Ozon Bridge v0.1.19 — fileless worker provider interception protocol

Date: 2026-08-19
Status: `EXISTING_ENVIRONMENT_CAPABILITY_PROTOCOL`
Scope: validation-environment procedure only. This is not a test program, runner, harness, fixture, validator, production change, Codex PASS or packaging authority.

## 1. Why this document exists

The current final validation authority remains:

`tooling/llm-api-bridges/ozon-seller/validation/CODEX_PRE_OPERATOR_TEST_CHECKLIST_2026-08-19.md`

That checklist is `CODEX_TEST_CHECKLIST_DOCUMENT_ONLY`. Codex may not create or modify test programs or test infrastructure during the final gate.

The remaining pre-Codex readiness question was whether the already-qualified Windows/CFT environment can safely return controlled Seller/Performance responses to normal requests made by the exact extension service worker without creating any new test file and without allowing real provider network.

This document records the ordinary DevTools/CDP mechanism already available in that environment.

## 2. Existing environment evidence

The standing accepted QA environment is documented by:

`tooling/llm-api-bridges/ozon-seller/OZON_BRIDGE_CODEX_QA_HARNESS_ACCEPTANCE_2026-08-17.md`

and the current environment authority:

`tooling/llm-api-bridges/ozon-seller/validation/environment/PUPPETEER_WINDOWS_CFT_QUALIFIED_ENVIRONMENT_2026-08-19.md`

The exact-current-candidate RERUN13/RERUN18 evidence already proves all of the following:

- Node `v24.12.0`;
- Puppeteer `25.4.0`;
- Chrome for Testing `151.0.7922.47`;
- exact current extension installed and enumerated;
- raw PAGE DevTools `Runtime`, `Page` and `Fetch` operation;
- exact candidate MV3 service-worker discovery and liveness;
- direct CDP session to the exact candidate service worker;
- generic service-worker CDP commands already executed through the direct session (`Runtime.enable`, `Runtime.evaluate`, `Network.enable`);
- real Ozon/Performance/ChatGPT request counters remained zero.

RERUN18 report authority:

`9188b934e1c648acecfa390cc5c49074195a3e4b`

The RERUN18 plan also records the generic direct-worker transport form:

`worker.client.send(<CDP method>, <params>)`

with raw-CDP fallback to the same exact active service-worker target.

## 3. Chromium/CDP capability authority

Primary DevTools Protocol authority:

`https://chromedevtools.github.io/devtools-protocol/tot/Fetch/`

The `Fetch` domain defines the required behavior:

- `Fetch.enable` enables `Fetch.requestPaused` for matching requests;
- a request paused at request stage remains paused until the client chooses `Fetch.failRequest`, `Fetch.fulfillRequest` or a continue method;
- `Fetch.fulfillRequest` supplies controlled status, response headers and response body;
- `Fetch.failRequest` supplies a controlled transport failure.

Primary Chromium service-worker DevTools authority:

`https://chromium.googlesource.com/chromium/src/+/f8623a024b29ff32d5e377b0f954d4df1d31170b/content/browser/devtools/service_worker_devtools_agent_host.cc`

`ServiceWorkerDevToolsAgentHost::AttachSession` installs both `NetworkHandler` and `FetchHandler` on a service-worker DevTools session. Therefore the already-proven direct CDP session to the exact extension service-worker target has the standard worker-side `Fetch` domain available; this does not require another runner or harness.

This is an environment capability, not a production behavior assumption.

## 4. Fixed safe request interception scope

For synthetic validation, enable request-stage interception only for these fixed provider contours:

- `https://api-seller.ozon.ru/*`
- `https://api-performance.ozon.ru/*`

Use request stage, before real external network.

The existing host-resolver block remains enabled as defense in depth:

- `api-seller.ozon.ru` -> `0.0.0.0`
- `api-performance.ozon.ru` -> `0.0.0.0`

For any paused Seller/Performance request in synthetic validation:

1. record URL, method and safe request metadata needed by the checklist;
2. increment the current-run physical request count in report evidence;
3. inspect request body only where the checklist requires physical-command verification;
4. never expose fake or real credentials in the final report;
5. resolve the paused request locally with `Fetch.fulfillRequest` or `Fetch.failRequest`;
6. **never call `Fetch.continueRequest` or `Fetch.continueWithAuth` for Seller/Performance provider patterns during synthetic validation.**

A request fulfilled/failed while paused at request stage is not allowed to proceed to the real provider. The final report must still require:

`REAL_OZON_REQUESTS=0`

`REAL_PERFORMANCE_REQUESTS=0`

## 5. No test code may be created

This protocol does not authorize writing a helper around CDP.

During the final Codex gate:

- do not create `.js`, `.mjs`, `.py`, `.ps1` or other test files;
- do not create a validator, runner, harness, fixture or helper;
- do not create an assertion ledger or authority bundle;
- do not modify production;
- use the already-existing direct worker DevTools/CDP session and ordinary DevTools/Protocol Monitor facilities of the qualified environment.

The mechanism is the browser's existing DevTools protocol, not new project test infrastructure.

## 6. Safe Seller synthetic responses

Use only minimal synthetic response fields required by the current reviewed bridge contract. Never use real seller/customer data.

### 6.1 Capability — entitled

For the fixed internal request:

`POST https://api-seller.ozon.ru/v1/seller/info`

an entitled synthetic response may be fulfilled as HTTP 200 JSON:

```json
{
  "subscription": {
    "type": "PREMIUM_PLUS",
    "is_premium": true
  },
  "company": {
    "name": "SYNTHETIC_MUST_NOT_REACH_AI"
  },
  "inn": "0000000000"
}
```

The extra synthetic identity fields are present only to verify that the bridge does not expose raw seller-info identity/company data to AI output.

### 6.2 Capability — non-entitled / restricted planning

Use HTTP 200 JSON:

```json
{
  "subscription": {
    "type": "UNSPECIFIED",
    "is_premium": false
  },
  "company": {
    "name": "SYNTHETIC_MUST_NOT_REACH_AI"
  }
}
```

### 6.3 Valid analytics result

For a physical `analytics_data` request with two metrics in the observed physical order, a minimal controlled HTTP 200 JSON result is:

```json
{
  "result": {
    "data": [
      {
        "dimensions": [
          {"id": "2026-08-17", "name": "2026-08-17"}
        ],
        "metrics": [100, 7]
      }
    ],
    "totals": [100, 7]
  }
}
```

For a one-metric physical request, use the same shape with one `metrics` value and one `totals` value. The fixture cardinality must match the actual paused physical request; do not guess metric order.

### 6.4 Malformed HTTP-200 verifier case

Return HTTP 200 with deliberately incompatible metric cardinality, for example a physical two-metric request with:

```json
{
  "result": {
    "data": [
      {
        "dimensions": [
          {"id": "2026-08-17", "name": "2026-08-17"}
        ],
        "metrics": [100]
      }
    ],
    "totals": [100]
  }
}
```

This is used only for the verifier fail-closed check. It must produce one provider attempt and no retry.

### 6.5 HTTP 429 / Retry-After

Fulfill the paused request locally with:

- HTTP status `429`;
- `Content-Type: application/json`;
- controlled `Retry-After`, for example `70` seconds;
- synthetic body such as:

```json
{"code":"TOO_MANY_REQUESTS","message":"synthetic validation 429"}
```

The bridge must not immediately retry. The observed next-allowed deadline may move later but never earlier.

### 6.6 Controlled transport failure

Use `Fetch.failRequest` on the paused request with a normal network failure reason such as `Failed`.

The result must truthfully indicate that an external request was attempted by the bridge while the validation environment prevented real provider traffic. No automatic retry is permitted.

## 7. Physical request counting

`Fetch.requestPaused` at the worker target is the current-run physical provider-attempt observation point.

For each scenario record, without secrets:

- provider contour: Seller or Performance;
- path;
- HTTP method;
- ordinal physical attempt within the scenario;
- whether it was locally fulfilled or locally failed;
- synthetic response status when fulfilled.

A cache hit, pre-execution rejection, all-restricted planning result, Manual OFF toggle or other zero-provider case must produce **no matching worker `Fetch.requestPaused` provider event**.

This gives B02–B09/B14 an observable physical-call counter without creating a test program.

## 8. B06 normal quota sequence

B06 must still use real elapsed time. This protocol does not authorize fake timing/storage state.

Required sequence:

1. configure fake validation Seller credentials through the normal extension settings surface;
2. enable worker request-stage `Fetch` interception before triggering provider work;
3. perform the first cold-cache analytics request and locally fulfill its normal Seller request with a valid synthetic 200 response;
4. immediately trigger a different cold-cache analytics request for the same fake Seller;
5. verify no second provider `requestPaused` event occurs before quota release;
6. observe the real decreasing countdown;
7. optionally restart the permitted page/content or MV3 lifecycle while waiting;
8. after the real due time, require exactly one new paused Seller request and locally fulfill it;
9. repeat the required same-Seller/different-owner, different-Seller and API-key-rotation cases using normal settings changes, not synthetic storage deadlines;
10. exercise 429 with the controlled `Retry-After` response above.

Required unchanged values:

- provider minimum `60000 ms`;
- bridge safety `5000 ms`;
- effective interval `65000 ms`.

## 9. B08 cache observation

After a verified synthetic analytics 200 result:

- a compatible same-Seller request before TTL must not produce another provider `requestPaused` event;
- safe metric-superset reuse must project correctly;
- different Seller / incompatible semantics / expired entry must produce a new provider attempt when otherwise executable;
- malformed/429/transport-failed results must not become reusable verified cache entries;
- serialized cache must not contain credentials.

TTL remains `60000 ms`.

## 10. B10–B13 product/browser flows

B10–B13 obtain a normal ready report through the same real product path plus locally fulfilled provider responses; do not inject a fabricated report directly into product storage merely to create delivery state.

Then perform the current document-only browser scenarios on synthetic ChatGPT/Alice pages:

- empty composer;
- occupied composer;
- missing composer and later restore;
- pending pre-insert Manual OFF -> ON;
- two ChatGPT owners;
- ChatGPT/Alice isolation;
- native Copy independence;
- lifecycle restart/recovery;
- one insertion / at most one recognized Send / Microphone-ready completion semantics.

Provider replay is detected by an unexpected additional provider `Fetch.requestPaused` event.

## 11. B14 Performance boundary without invented business schema

Do not invent a Performance business response schema.

Use the exact current candidate's supported Performance command/contract and fake validation Performance credentials through the normal settings surface.

Procedure:

1. enable the same request-stage worker `Fetch` interception for `https://api-performance.ozon.ru/*`;
2. trigger a Performance-only product flow;
3. if the first paused Performance request is token acquisition, inspect the actual current request boundary and locally fulfill only the minimum synthetic token response required by the current candidate, for example an `access_token` with a bounded synthetic expiry; do not infer unrelated provider fields;
4. when the actual Performance business request is paused, inspect fixed host/method and verify Performance bearer auth semantics without recording the token value;
5. terminate that business request locally with `Fetch.failRequest` if no provider business response body is required by the B14 boundary assertion;
6. verify no Seller capability request was observed;
7. verify Seller analytics quota/cache state was not entered or mutated by the Performance-only flow;
8. require `REAL_PERFORMANCE_REQUESTS=0`.

If the current candidate does not expose a supported AI-callable Performance command in its actual contract, do not invent one. In that case B14 is performed against the actual existing Performance connection/test surface exposed by the extension, still using the same worker interception and the same zero-real-network rule.

## 12. Failure safety

If `Fetch.enable` is unexpectedly rejected on the exact extension service-worker target, or no `Fetch.requestPaused` event is observed for a request that would otherwise leave the worker, that is an **environment capability failure**, not a production failure.

In that case:

- stop that dependent scenario;
- preserve zero real network;
- classify the dependent B-block `BLOCKED` with the exact DevTools error;
- do not create a helper/runner to work around it;
- continue independent blocks where safe.

This failure clause does not authorize a new Codex run before pre-Codex readiness is established; it is only a safety rule for the eventual consolidated validation.

## 13. Readiness conclusion

The execution mechanism required by B04–B09/B14 is no longer an undefined new-test-infrastructure requirement.

It is composed entirely of already-established ordinary environment components:

`qualified CFT 151 -> exact extension -> exact service worker -> already-proven direct generic CDP session -> built-in service-worker FetchHandler -> request-stage Fetch pause -> local fulfill/fail`

No production byte changes and no test program is required by this protocol.
