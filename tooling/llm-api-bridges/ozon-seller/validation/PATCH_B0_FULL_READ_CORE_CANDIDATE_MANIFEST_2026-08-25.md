# Patch B0 — Full Read Core candidate manifest

Date: 2026-08-25
Status: browser candidate; local deterministic regressions PASS; independent browser acceptance required.
Baseline: exact A.5 production tree from `9ebc673c2e0dd9dc24f6cbab90455396328f0aad`.
Branch: `feature/ozon-full-read-core-b0-2026-08-25`.

## Scope

Patch B0 is the one-time architecture layer required before adding the remaining Seller READ contracts.

Production changes:

- introduce `shared/ozon_operation_registry.js` as the authoritative operation metadata registry;
- derive guidance clusters/cards from that registry;
- retain compatibility aliases `stock_inventory -> stocks_inventory` and `fulfillment_supply -> supplies_fbo`;
- add `OZON_HELP_V2` cluster+section guidance without removing V1;
- introduce `shared/ozon_entitlements.js` with bundled last-known-good entitlement metadata and a fixed-source Swagger compiler;
- preserve the existing `/v1/seller/info` capability probe but drive subscription decisions from entitlement metadata instead of hard-coded planning branches;
- remove silent partial execution of analytics commands: requested metrics/dimensions/sort/history are never silently removed;
- add explicit `OZ_REFRESH_SELLER_API_METADATA` infrastructure action against only `https://docs.ozon.ru/api/seller/swagger.json`;
- retain the previous metadata snapshot on refresh failure;
- unknown/stale subscription rules do not produce guessed Premium blocks; exact safe requests may reach Ozon;
- implement `posting_fbs_get` as a fixed READ contract with strict request normalization;
- implement global `Показывать личные данные` policy, default OFF;
- OFF -> zero Ozon business requests and local `personal_data_setting_required` result;
- ON -> configured personal-data READ operations may execute; no automatic replay of an earlier blocked command;
- add popup controls for personal-data policy and explicit Seller API metadata refresh;
- do not change Autorun semantics, work-session lifecycle, provider quota/cache/history/no-replay semantics, credentials, or transport ownership.

## Production identity

Production file count: **21**.

Changed/new production identities:

- `manifest.json`: `f170949e9f972ecbc8c685a3cb753151c3363afa7664a3df76e67f413a396fc1`
- `popup.html`: `a36539a6b16e423d1a91fff518af140b37934281ba2d2be8c4c1091ba32d72a3`
- `popup.js`: `9f6ec207f4bed3bae0de912fca2f3347cc286ced9ca310369f10269400819070`
- `service_worker.js`: `b995ad6eaf6556eac31f728a3640b77b08d6354d5e7e22f5a34f030902059f87`
- `shared/runtime_names.js`: `a94bef6a25e83170ded3416bdca39a2921fa67d7a9c93504d001beebebc24a59`
- `shared/ozon_contract.js`: `e7ce6d7c77360529097ac0bcd5981f2dd4dc1856fb279b4d14364fe394ff5992`
- `shared/ozon_guidance.js`: `8de69833524c569bed09d5799479f2a0cd8f1844a2cf5d7d460caa3b1bb74508`
- `shared/ozon_operation_registry.js`: `b5b16f7cb11cf92823920f49dd4ba2c66f17e830adb6edad575f1f995c16d673`
- `shared/ozon_entitlements.js`: `6bd6f949d7aff29f80ce9e48154a37446dd5f9acc9fcd6528e9d1d4578a37ca5`

Production tree SHA-256: `d313bcfdb7597e8ffc9593120f807c64ed9bd4952f6c07a69368361c3435ccfe`.

Candidate ZIP:

- `OZON_BRIDGE_v0.1.19_FULL_READ_CORE_B0_BROWSER_CANDIDATE_2026-08-25.zip`
- size: `151849` bytes
- SHA-256: `4233bd16941828489f5cdbefcef16d16a8e947020ee865daf0b21f3ee883ddcd`

## Local regression evidence

PASS markers:

```text
B0_REGISTRY_GUIDANCE_PASS
B0_PERSONAL_DATA_CONTRACT_PASS
B0_ENTITLEMENT_EXACT_REQUEST_PASS
B0_DYNAMIC_SWAGGER_COMPILER_PASS
B0_COMPATIBILITY_CLUSTER_ALIASES_PASS
B0_NODE_CHECK_PASS
B0_ZIP_BYTE_TREE_PASS
```

The regression proves:

- one registry owns operation cluster/section metadata;
- V1 compatibility aliases work;
- V2 section guidance works;
- `posting_fbs_get` is fixed to `POST /v3/posting/fbs/get` and rejects unknown request fields;
- personal fields are retained only by the authorized personal-data result policy;
- ordinary safe-read sanitizers remain redacting;
- current enabled Seller operations have bundled entitlement knowledge;
- restricted analytics requests preserve the exact requested command and reject locally only when the metadata rule is known and the seller subscription is insufficient;
- unknown entitlement metadata never invents a Premium restriction;
- Swagger compiler assigns an entitlement record to every parsed operation and can recover endpoint/feature restrictions.

## Required independent browser acceptance

Codex/tester must use the exact candidate identity and must not edit production code.

Minimum acceptance matrix:

1. existing A.5 Work-session start/hide/show/finish/resume behavior remains functional;
2. Autorun behavior is unchanged; no new Autorun control or timing semantics;
3. old `OZON_HELP_V1 {"cluster":"stock_inventory"}` returns the new `stocks_inventory` content and includes `stocks_current`;
4. old `fulfillment_supply` remains accepted and maps to `supplies_fbo`;
5. `OZON_HELP_V2` can select `orders_postings` then `fbs_postings` and exposes `posting_fbs_get` as conditional personal-data READ;
6. with `Показывать личные данные` OFF, a valid `posting_fbs_get` command produces local `personal_data_setting_required`, `external_request_executed=false`, `physical_business_request_count=0`, and Manual returns READY;
7. enabling the checkbox does not replay the blocked command;
8. after ON, explicitly resubmitting the same valid command executes exactly one Seller request and delivers the authorized result only to the bound conversation;
9. diagnostics do not contain customer payload fields;
10. after confirmed delivery, durable batch/outgoing personal payload is scrubbed by the existing completion path;
11. a restricted analytics request on a non-entitled account is rejected without changing/removing the requested restricted metric;
12. an unrestricted analytics request works as before;
13. `Update Ozon API rules` never performs an Ozon business request, does not touch quota/cache/history/work-session state, and on success reports validated operation/rule counts;
14. an update failure leaves the previous metadata summary unchanged/usable;
15. provider requests remain fixed-host/fixed-method and no AI-supplied transport/auth fields are accepted.

No candidate is accepted until this browser matrix is independently recorded PASS.
