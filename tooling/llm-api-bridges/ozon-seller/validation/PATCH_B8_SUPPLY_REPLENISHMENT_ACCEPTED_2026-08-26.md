# Patch B8 Supply / Replenishment — ACCEPTED

Date: 2026-08-26
Status: `PATCH_B8_SUPPLY_REPLENISHMENT_ACCEPTED`

## Acceptance authority

- Repository: `MaksimUnimax/blood_sand`
- Exact independently tested candidate: `d40d213de9c6d753f21525a4797671401d585218`
- Independent validation commit: `da9ce3ad474fa1003a42acecf36d68d4e616cc64`
- Accepted B7 authority: `3769590c49e3deb5951769b3a27c79706a4f3ba9`
- B8 gzip transport SHA-256: `2b407798ee27593c88239131234780b7a7d8dcf29ed7a7104f439a41a64f26b7`
- B8 raw patch SHA-256: `b3b685b928857d31bc2de6bf65f761c39ab66391c439ce8a65ecb38f7e83ec86`
- Accepted production file count: `21`
- Accepted production tree SHA-256: `c96f993566ff0e715cd7959182ef787639d20accfb578de2e8495b85a79d6d84`

## Accepted scope

B8 closes roadmap priority `P1_supply_replenishment` with the current Seller API supply read core:

- `supply_order_list` -> `POST /v3/supply-order/list`
- `supply_order_get` -> `POST /v3/supply-order/get`
- `supply_order_status_counter` -> `POST /v1/supply-order/status/counter`
- `supply_order_bundle` -> `POST /v1/supply-order/bundle`
- `supply_order_timeslot_list` -> `POST /v2/supply-order/timeslot/list`
- `supply_order_details` -> `POST /v1/supply-order/details`

The first four current reads were added/reviewed as the missing supply read core and the two already-enabled reads were revalidated against the exact current Seller Swagger. All six are fixed `seller_api`, `READ`, `single_read`, safe-projection operations with no caller-controlled URL, host, path, method, headers or authorization material. No hidden retry, automatic pagination, identifier fanout, provider chaining or capability probe is introduced.

## Currentness boundary

The accepted B8 currentness gate excludes the removed legacy list/get methods:

- `/v1/supply-order/list`
- `/v1/supply-order/get`
- `/v1/supply-order/items`
- `/v2/supply-order/list`
- `/v2/supply-order/get`

`/v1/supply-order/timeslot/get` is not enabled. The exact Seller Swagger records that it was disabled on 19 August 2026 and directs callers to `/v2/supply-order/timeslot/list`, which is the route accepted in B8.

`/v1/supply-order/shipment-plan-compliance/get`, mutation workflows, draft creation, act mutations, pass mutations, timeslot updates, cargo mutations, report workflows and beta FBO act operations are not promoted by B8.

## Contract closure

B8 closes pre-existing schema drift in the accepted supply operations:

- `supply_order_get.order_ids` is now strictly validated as string `int64`, maximum 50, with undeclared fields rejected;
- `supply_order_details` is closed to exact `order_id` and rejects undeclared fields;
- `supply_order_timeslot_list` requires exact safe integer `order_id`;
- list and bundle operations enforce the exact documented bounds, enums and nested contracts without automatic continuation or fanout.

## Privacy

`supply_order_details` continues to redact driver name, driver phone and vehicle number. Operational warehouse addresses already explicitly permitted by the safe projection remain available. No new personal-data surface or setting was introduced.

## Exact production identities

Accepted changed production files:

- `shared/ozon_operation_registry.js` -> `a2ecd81db1862281bd5dc12284a16c46e1ad61cab48a4c7406b50245d8dcd796`
- `shared/ozon_contract.js` -> `49dfac7276311b391bc9918348edca0086e5832de359a693c10e6d912487e447`
- `shared/ozon_entitlements.js` -> `cee472cfe526776a774c173033f1c94769b79d926668ffe892194fb4dbaab6bc`

Protected runtime identities remain unchanged, including `content_script.js`, `service_worker.js`, `shared/bridge_autorun_model.js`, `shared/work_session_model.js`, `shared/ozon_provider.js`, `shared/provider_transport_core.js` and `shared/manual_controls.js`.

B7 analytics/search semantics remain preserved on the B8 tree, including exact routes, Premium/Premium Pro parsing behavior and the existing analytics 60-second provider interval plus 5-second launch safety.

## Exact Swagger authority

Author-side validation used the original operator-supplied Seller Swagger:

- byte length: `3933043`
- SHA-256: `39e053a147180d1df4ded6ed0272aaaf02dd6a371144d8ebed7113fd218e4b40`
- OpenAPI: `3.0.0`
- paths: `463`

Exact Swagger/currentness and entitlement gates passed author-side. The independent tester did not have the exact raw Swagger and correctly did not substitute another authority; this environment-only omission is not an acceptance failure.

## CI validation

GitHub Actions run `32956210474` completed successfully on exact candidate `d40d213de9c6d753f21525a4797671401d585218`.

Both jobs passed:

- Linux exact materialization, carry-forward gates, B8 regression, JavaScript syntax and artifact publication;
- Windows patch identity, exact materialization, carry-forward gates, B8 regression and JavaScript syntax.

Artifact `9602060227` was published with GitHub digest:

`sha256:1b2b7bef857f705c1fe4b960c8d32f3cd205dca89eb16736b576bb1a77c61db9`

## Independent validation

Independent validation commit `da9ce3ad474fa1003a42acecf36d68d4e616cc64` is exactly one commit ahead of the tested B8 candidate. Its merge-base is the candidate and its only changed file is:

`tooling/llm-api-bridges/ozon-seller/validation/PATCH_B8_SUPPLY_REPLENISHMENT_INDEPENDENT_TEST_RESULT_2026-08-26.md`

No production file changed in the independent-test commit.

The independent result records:

- exact candidate revision and B7 authority;
- gzip/raw patch identities matched;
- exact 21-file production tree matched;
- B1-B6 carry-forward passed;
- exact B7-base regression passed;
- B7 semantic carry-forward on B8 passed;
- B8 registry, exact request, contract, guidance, privacy and protected-runtime gates passed;
- all 18 production JavaScript files passed syntax validation;
- Seller business requests = `0`;
- Performance business requests = `0`;
- credentials used = `0`;
- tester production modifications = `0`.

Independent final decision:

`PATCH_B8_SUPPLY_REPLENISHMENT_INDEPENDENT_TEST_PASS`

## Gate for subsequent work

B8 Supply / Replenishment is accepted.

Subsequent Ozon roadmap work must continue evidence-first from this accepted B8 authority. Autorun, Work-session lifecycle, Manual-mode behavior, provider transport, credentials and unrelated runtime semantics remain protected unless separately reviewed and gated.
