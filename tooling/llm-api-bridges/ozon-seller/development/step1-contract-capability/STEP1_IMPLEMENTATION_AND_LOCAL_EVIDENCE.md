# Step 1 — Contract + Capability layer — implementation and local evidence

Date: 2026-08-17
Repository: `MaksimUnimax/blood_sand`
Development branch: `dev/ozon-v0.1.19-step1-contract-capability-2026-08-17`
Exact operator baseline commit: `06bbed6649b11c6fd4b81b224ef41d8833ea267c`
Operator baseline ZIP SHA-256: `2b86518bfdc81081e271c7f8346188fc7047999385d1da4428fa2a133dba15bf`
Status: **Step 1 development candidate; not a canonical release; not live-browser accepted yet.**

## Scope

This step implements only the Contract + Seller Capability layer required before request coalescing/quota scheduling.

Pipeline added before business execution:

`parse complete clicked batch -> strict contract validation -> resolve Seller capability at most once when required -> entitlement-plan every logical command -> existing serial business executor`

This step deliberately does **not** implement Step 2 coalescing, Step 3 quota scheduling/response verifier, or Step 4 cache/prefetch.

## Exact reconstruction

The exact operator v0.1.19 baseline is stored at:

`development/operator-v0.1.19/ozon-bridge-v0.1.19-extension.zip`

The Step 1 patch is stored in eight ordered UTF-8 parts under:

`development/step1-contract-capability/patch-parts/`

Concatenate exactly in lexical order `00` through `07` to obtain:

`OZON_BRIDGE_V0.1.19_STEP1_CONTRACT_CAPABILITY.patch`

Expected concatenated patch SHA-256:

`5afe153c15eb4005a836d005bab531f8905dbdcd5b0541d52a6112a3ebb0e3ce`

Apply it at the root of a fresh extraction of the exact operator ZIP. A deterministic ZIP built from the resulting 17-file production tree has local SHA-256:

`422d193f4bd375ecff9041ffd1aebe5c277879ba3d9a06fee113c72d57e505a9`

The intermediate candidate keeps manifest/runtime version `0.1.19` intentionally. This is not a v0.1.20 release declaration.

## Production source delta

Exactly three production files differ from the operator v0.1.19 baseline:

- `service_worker.js`
  - baseline: `8b8190803b28daf9da8b852bddbcfb1d6c079bb93eee9eda35fed516764458ec`
  - candidate: `b594872cff8f7049a441ffe8fe422d761069a14a48a1d32e7e54f568c7f0502a`
- `shared/ozon_contract.js`
  - baseline: `b3497d3cec56a7591dce0f266ee5e9683613e5375be1b0c72b063bff8305fb1e`
  - candidate: `b8f39ded0163f45714eebff7f8c1a35242712918df5568935fbc77a442cc2987`
- `shared/ozon_provider.js`
  - baseline: `318ca0e872942b08a92ce787bc5b3ed8637434318a534f528e387206731c2455`
  - candidate: `5e6d6bdf47e2561b0a015836d5a0f1c5ed28bd2a9625e84aadfdc49ab17deb74`

The other fourteen production files are byte-identical to operator v0.1.19, including all AI DOM/binding/composer files and Performance credential/transport dependencies:

- `content_script.js` — `b80fcf1784e083292cc48c0780480651b144a96494083c7df2af3dce97504132`
- `manifest.json` — `6ed5ecc768cc980d256b5bfb69f00c9a4006ec2eb2bd6c96f9d261d7a018e0fb`
- `popup.css` — `dd7249e12813f54af66b35a07dab93189d6643416019f0873f9d5624297e34b5`
- `popup.html` — `5fdf3932ef0f523626da65fff4c5919df19c321bc23fee861e95d5d940a185d5`
- `popup.js` — `8e1d95340d3e87b8a8cadda50276033e336f633469a5dbceaacd74b2d10239fd`
- `shared/ai_adapters.js` — `5a7307557998d4281d12fb750fb0d05fa787d2a4550281d006ebbc6a2006e4e9`
- `shared/bridge_autorun_model.js` — `c248915a64ea0d9e2db014d66ab27a4bc182553cc24c5d6d0c9f43729e6e20b5`
- `shared/composer_send.js` — `3e9421e8e1bc209af635e2b90d957e558301763572a42875b95c8973ca75b736`
- `shared/conversation_identity.js` — `939036acd95ccb3dfe00f05b5d49568615f6d798a023a0ec995e38267fb68f57`
- `shared/manual_controls.js` — `81f302487da7b5ff7c1b746298353438b2cfec100a5bb8f7fa2c80d1e033c81e`
- `shared/ozon_credentials.js` — `286c6021f958e41912842569bcfa0d0dfe920eed8ce1646014899a1de064415d`
- `shared/proven_writing_block_capture.js` — `5b0eaac9619cb827d1e74c61f53e2755c084a1d4b60c64d23f5fd4a5354c3aef`
- `shared/provider_transport_core.js` — `9c33c7c2448959f75eb5d0c2b36137bba68085c4b93a90a8c67d1ee86de4aa39`
- `shared/runtime_names.js` — `2abc73a8c6f5ba29e71c352c452fcc4da1cbf278de988fdc070dc5414d908292`

## Contract hardening

`shared/ozon_contract.js` now performs reviewed operation-specific validation before provider execution.

### analytics_data

- validates required `date_from`, `date_to`, `dimension`, `metrics`, `limit`;
- accepts documented analytics date shape `YYYY-MM-DD` or RFC3339 date-time;
- validates reviewed dimensions;
- validates reviewed metric names and rejects model inventions such as `orders_count` locally;
- max 14 metrics remains provider-owned;
- validates filter object fields, comparison operation, metric/dimension key and forbids `brand` as documented filter key;
- validates sort metric and `ASC`/`DESC`;
- preserves provider limit `1..1000` and offset `>=0`.

Universal analytics metrics are `revenue` and `ordered_units`. Reviewed subscription-restricted metrics are represented explicitly. Universal dimensions and restricted dimensions are represented separately.

### product_queries / product_queries_details

- `date_from` and optional `date_to` must be RFC3339 date-time;
- SKU values are validated as string `int64` values;
- provider page/page_size/SKU/limit_by_sku boundaries are preserved;
- sort enums are validated locally;
- no generic arbitrary bridge byte/depth/item caps were reintroduced.

## Seller capability resolver

`shared/ozon_provider.js` adds an **internal-only** fixed `POST /v1/seller/info` capability probe.

It uses the existing trusted Seller host and credential headers. Assistant text cannot select this path, host, method or auth. `seller_info` is not added as an `OZON_API_V1` operation.

The raw `/v1/seller/info` response is never returned to the AI. The resolver projects only:

- capability status;
- subscription type;
- `is_premium` when the provider supplies it;
- probe performed flag;
- probe HTTP status;
- safe probe error code.

Company identity, INN/OGRN, ratings and unrelated seller-info fields are discarded before planning/reporting.

Recognized subscription types:

`UNKNOWN`, `UNSPECIFIED`, `PREMIUM`, `PREMIUM_LITE`, `PREMIUM_PLUS`, `PREMIUM_PRO`.

## Batch capability invariant

`service_worker.js` resolves capability before any business provider call in a clicked batch.

For one clicked logical batch:

- no capability-sensitive requirement -> zero `/v1/seller/info` probes;
- capability-sensitive requirements -> at most one fresh probe;
- thirty capability-sensitive commands do not produce thirty probes;
- probe state is durable in the batch;
- if a worker restart observes a probe owned by the previous worker session, it does **not** retry the probe; entitlement becomes unknown and planning proceeds fail-closed.

The capability probe is infrastructure. It is not inserted as a separate logical `OZON_RESULT` item.

## Entitlement semantics

Planner states are represented as:

- `SUPPORTED_AND_ENTITLED`;
- `SUPPORTED_BUT_NOT_ENTITLED`;
- `ENTITLEMENT_UNKNOWN`;
- local `UNSUPPORTED`/validation rejection before planning where the contract itself does not support the requested value.

For `analytics_data`:

- universal-only scope proceeds without a capability probe;
- Premium Plus/Pro receives full reviewed analytics scope;
- mixed universal + restricted metrics on a non-entitled or unknown account omit only the restricted metrics, execute the universal subset, and report the omission explicitly;
- if all requested metrics are restricted, zero analytics business requests are executed;
- restricted dimensions, filters, sort or >3-month history reject the whole logical command rather than silently change its semantics.

For product query analytics:

- capability is resolved because subscription changes response/history scope;
- recent requests may execute with explicit partial/unknown scope metadata;
- history older than one month requires a reviewed Premium tier or fails before the business request;
- restricted `product_queries_details` sort entitlement is handled conservatively; Premium Pro is not guessed into a sort entitlement that the captured contract does not state explicitly.

## Logical vs physical command reporting

Provider execution can receive a safe entitlement-filtered physical command while preserving the original logical command as AI-facing identity.

Reports now expose reviewed planning metadata and logical/physical fingerprints. Provider execution errors also retain Step 1 planning metadata.

No Step 2 coalescing or deduplication is introduced here. Existing serial batch execution remains.

## Local evidence

Local tests were executed against the candidate production code with mocked provider transport / VM worker state.

Result:

`ALL_LOCAL_STEP1_TESTS_PASS`

Covered behavior includes:

- all 17 production JavaScript files pass `node --check`;
- invalid `orders_count`, analytics dimension/sort/filter fail before network;
- product-query date-only input fails; RFC3339 input passes;
- invalid SKU and sort values fail locally;
- direct AI `seller_info` remains unsupported;
- universal analytics requires zero capability probes;
- mixed restricted analytics produces safe physical metric subset and explicit partial planning;
- all-restricted analytics produces a planning error with zero analytics business calls;
- restricted dimension is rejected rather than semantically rewritten;
- Premium Plus/Pro analytics full scope passes;
- product-query recent/old history entitlement cases;
- details restricted-sort entitlement cases including conservative Premium Pro ambiguity;
- mocked `/v1/seller/info` executes exactly once and raw company data is not returned;
- logical report retains planning while physical request contains only allowed metrics;
- 30 capability-sensitive commands -> exactly one capability probe;
- 30 universal analytics commands -> zero capability probes;
- worker-restart stale probe -> no second probe.

This evidence is **local Node/VM evidence only**. It is not a live-browser PASS and not a real Ozon provider PASS.

## Protected boundaries

Step 1 must be rejected if independent validation finds any unintended expansion of:

- ChatGPT/Alice DOM binding or composer/delivery behavior;
- conversation ownership / fail-closed identity;
- arbitrary assistant-controlled URL/method/header/auth;
- mutation/write operations;
- customer PII surfaces;
- Performance API host/auth/operation behavior;
- hidden retry/pagination/fan-out;
- generic invented data caps or silent truncation.

Independent Codex validation is required before Step 2 begins.