# R4 Stage 06 — current Ozon Bridge dependency — 2026-08-26

Status: **WAIT FOR CURRENT BRIDGE RUNTIME ROLLOUT — NO EXTRA BRIDGE DEVELOPMENT REQUIRED FOR CURRENT STAGE 06 NEED**

## What Stage 06 needs

Current Tier A product-passport enrichment needs read-only seller data for selected SKUs, primarily:
- `seller_product_info_list` -> `POST /v3/product/info/list`;
- `seller_product_attributes` -> `POST /v4/product/info/attributes`;
- later, where passport completion requires it, current price/listing state reads from accepted B2.

## Current running-extension observation

The installed extension that answered the Stage 06 test command identified itself as version `0.1.19`, but returned legacy `OZON_GUIDANCE_RESULT_V1` with only six old clusters and rejected `seller_product_info_list` locally as `UNSUPPORTED_OPERATION`.

No Seller request was made:
- `external_request_executed=false`;
- `physical_business_request_count=0`.

This is treated as a deployed-runtime lag/mismatch, not evidence that the current bridge source lacks the operation.

## Current bridge work checked in repository

Latest Ozon bridge branch observed at this checkpoint:
- `feature/ozon-b10-seller-health-ratings-2026-08-26`.

Latest accepted B10 commit:
- `6c6ce7adab35b199b444a96e0e3ae7ecc3b20e33` — `validation(ozon): accept B10 seller health ratings`.

B10 acceptance:
- exact tested candidate `193cdd510368bcb94f8d8d17a7084275fec12add`;
- accepted production tree SHA-256 `b5af358d19c5e4a720b34f61a6487a20bc07c82c7689a205fde96853c26d46b6`;
- independent validation explicitly passed all prescribed B1-B9 carry-forward markers.

No B11 branch was present when checked immediately after B10 acceptance.

## Does the current bridge line contain the functionality Stage 06 needs?

**YES.**

B1 Assortment Master already accepted:
- `seller_product_list`;
- `seller_product_info_list`;
- `seller_product_attributes`.

B2 additionally accepted current price/listing reads including `product_prices_bulk` and related listing-state operations.

The current accepted B10 line is cumulative and independent validation explicitly confirms B1-B9 carry-forward. Therefore the current bridge code line already contains the current Stage 06 product-detail / attributes capability; it does not need a separate new feature patch for this research task.

## Operational decision

Do **not** install an older B8 artifact solely for Stage 06.

Pause Tier A enrichment until the currently developed/accepted bridge line is packaged/deployed into the extension runtime the operator is actually using. After that rollout, retry the same minimal Tier A read. If the new current runtime still rejects `seller_product_info_list`, treat that as a packaging/runtime exposure defect of the current bridge release, not as a missing Seller API feature.

Stage 06 may continue with repository-only/customer evidence work that does not require these missing live reads, but live Tier A passport enrichment remains blocked until the current runtime rollout.
