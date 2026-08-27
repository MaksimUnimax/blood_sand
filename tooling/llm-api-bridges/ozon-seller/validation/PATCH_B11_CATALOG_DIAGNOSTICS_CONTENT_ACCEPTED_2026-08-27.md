# Patch B11 Catalog Diagnostics / Content — ACCEPTED

Date: 2026-08-27
Status: `PATCH_B11_CATALOG_DIAGNOSTICS_CONTENT_ACCEPTED`

## Acceptance authority

- Repository: `MaksimUnimax/blood_sand`
- Exact tested B11 candidate: `fdbb557003b71f98079807d6719d79bf10a02ff9`
- Independent validation commit: `71698283fde5215ea526df20892175941bbd3002`
- Accepted B10 authority: `6c6ce7adab35b199b444a96e0e3ae7ecc3b20e33`
- B11 gzip SHA-256: `1f402a1974a61b329faca98ee1e9e807f9088c370aed433dfdb56d03de44094b`
- B11 raw patch SHA-256: `6128fe139a43f9008c5f13483ae47b8ced1b8ef01628379f7ef3748c624cc180`
- Accepted production file count: `21`
- Accepted production tree SHA-256: `6362eba1469f9e3fdd3a34a27e33ea6db5d3dce82d851955cbdc06b6104b0caa`

## Accepted scope

B11 adds eight fixed read-only Seller catalog/content operations:

- `product_content_rating` -> `POST /v1/product/rating-by-sku`
- `product_info_description` -> `POST /v1/product/info/description`
- `product_upload_quota` -> `POST /v4/product/info/limit`
- `product_subscription_count` -> `POST /v1/product/info/subscription`
- `product_related_sku` -> `POST /v1/product/related-sku/get`
- `product_pictures_info` -> `POST /v2/product/pictures/info`
- `product_wrong_volume` -> `POST /v1/product/info/wrong-volume`
- `product_discounted_info` -> `POST /v1/product/info/discounted`

All remain fixed `seller_api`, `READ`, `single_read` operations. B11 introduces no automatic pagination, retry, fanout, provider chaining or media fetching. Image/media URLs returned by Ozon are data only and are not followed automatically.

## Accepted production identities

- `shared/ozon_operation_registry.js` -> `15423c269337254e9d1e8941fe12a7be944fcef282a2bea45d0911bebdbed85f`
- `shared/ozon_contract.js` -> `12e95fe5154c42bdd163fcf31683c7cb532f8f3baaf05e1c1a415d640a91295d`
- `shared/ozon_entitlements.js` -> `3bd2cd3b81202fcf16b3b344e68edcd97251f4dd8373a1e03f9ac20fa420879c`

Protected runtime files, including content script, service worker, Autorun, Work session, provider, transport, Manual controls and guidance, remain unchanged from accepted B10.

## Validation

GitHub Actions run `32965676909` passed on exact B11 candidate head `fdbb557003b71f98079807d6719d79bf10a02ff9` after the validation-only carry-forward workflow correction. Linux and Windows both passed.

Artifact `9605570883` was published with digest `sha256:4233e2f93d8caeab8a4acdb150119f94de8fc8caa460b75cd9f56e0c7149993c`.

Independent validation commit `71698283fde5215ea526df20892175941bbd3002` is exactly one commit ahead of the tested candidate and changes only:

`tooling/llm-api-bridges/ozon-seller/validation/PATCH_B11_CATALOG_DIAGNOSTICS_CONTENT_INDEPENDENT_TEST_RESULT_2026-08-26.md`

The independent result records all required B11 PASS markers, B1-B10 accepted-base carry-forward PASS, all 18 production JavaScript syntax checks PASS, Seller business requests = `0`, Performance business requests = `0`, credentials used = `0`, and tester production modifications = `0`.

Independent final decision:

`PATCH_B11_CATALOG_DIAGNOSTICS_CONTENT_INDEPENDENT_TEST_PASS`

## Gate for subsequent work

B11 Catalog Diagnostics / Content is accepted. Subsequent Ozon work must continue evidence-first from this B11 authority. Autorun, Work-session lifecycle, Manual-mode behavior, provider transport, credentials and unrelated runtime semantics remain protected unless separately reviewed and gated.
