# R4 — Ozon runtime vs accepted B8 mismatch

Date: 2026-08-26
Status: **CONFIRMED — runtime update required before targeted passport enrichment**

## Direct runtime evidence

Attempted read-only B1 operation:

` seller_product_info_list ` with five Tier A SKUs.

Observed bridge response:
- bridge version string: `0.1.19`;
- `UNSUPPORTED_OPERATION`;
- guidance marker: `OZON_GUIDANCE_RESULT_V1`;
- guidance version: `1`;
- only six legacy clusters returned;
- `external_request_executed=false`;
- `physical_business_request_count=0`;
- Seller API was not reached.

Raw evidence:
`marketing/data/raw/marketplace/ozon/20260826T1139Z__ozon__seller-product-info-list__runtime-unsupported.md`

## Accepted contract comparison

Accepted B1 adds:
- `seller_product_list` -> `POST /v3/product/list`;
- `seller_product_info_list` -> `POST /v3/product/info/list`;
- `seller_product_attributes` -> `POST /v4/product/info/attributes`.

Accepted B8 carries B1-B7 forward and is the current accepted read-core authority.

Therefore the observed running 0.1.19 runtime is **not byte/feature-equivalent to the accepted B8 tree**, despite sharing the same manifest version string.

This is a local extension runtime mismatch, not an Ozon endpoint/access failure.

## Accepted B8 CI artifact

Workflow run: `32956210474`
Head commit: `d40d213de9c6d753f21525a4797671401d585218`
Artifact ID: `9602060227`
Artifact name: `ozon-b8-supply-replenishment-candidate`
Artifact digest: `sha256:1b2b7bef857f705c1fe4b960c8d32f3cd205dca89eb16736b576bb1a77c61db9`
Accepted production tree SHA-256: `c96f993566ff0e715cd7959182ef787639d20accfb578de2e8495b85a79d6d84`

The downloaded workflow artifact contains the exact extension tree under `ozon-b8-exact/`, including:
- `shared/ozon_operation_registry.js` with `seller_product_info_list` and `seller_product_attributes`;
- `shared/ozon_guidance.js` with `OZON_HELP_V2` / Guidance V2;
- 21 accepted production files plus checksum manifests.

## Gate

Do not issue another B1+ business command against the currently running extension.

Next action:
1. replace/reload the running unpacked extension with the accepted B8 `ozon-b8-exact/` tree;
2. preserve/configure credentials as appropriate for the fresh extension load;
3. retry the same five-SKU `seller_product_info_list` command once;
4. only after a real Seller response, save/normalize Tier A passport enrichment and decide whether `seller_product_attributes` is still required.

No Stage 06 evidence conclusion is changed by this mismatch. 06.2 and 06.3 remain complete; targeted enrichment is temporarily gated by runtime deployment state.
