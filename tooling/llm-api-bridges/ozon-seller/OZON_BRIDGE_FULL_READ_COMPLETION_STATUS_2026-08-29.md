# Ozon Bridge full-read completion — current status

Date: 2026-08-29  
Status authority for current roadmap position after canonical B1 acceptance.

## Current roadmap

1. ✅ Закрепить исправленную базу и formal acceptance canonical B1.
2. 🔄 Построить master-checklist всех 463 Seller + 48 Performance операций.
3. ⬜ Восстановить полный Seller read-набор из полезной работы B1–B49 по правильным разделам.
4. ⬜ Проверить существующий Personal Data gate на всём Seller read-наборе.
5. ⬜ Реализовать все допустимые Seller read-workflow/report/document операции.
6. ⬜ Завершить Performance API coverage по всем 48 операциям.
7. ⬜ Финальная полнота Seller: 463/463 имеют окончательное решение.
8. ⬜ Финальная полнота Performance: 48/48 имеют окончательное решение.
9. ⬜ Полная интеграционная проверка расширения.
10. ⬜ Release acceptance и финальный installable artifact.

Финальный маркер всей работы остаётся:

`FULL_OZON_READ_COVERAGE_ACCEPTED`

## Step 1 closure

Canonical V2 B1 `stocks_inventory + warehouse_logistics` formally accepted by:

`validation/PATCH_V2_B1_STOCKS_WAREHOUSE_ACCEPTED_2026-08-29.md`

Accepted production candidate: `10260c0c672cebd6cdb0a42cb4568bf87f9ca3c7`.

The following docs-only commit `d216ea6954e407b2ea2cb69482f7eaf782b80b5c` changed no production code.

Acceptance confirms:

- 30 Seller reads = 6 `stocks_inventory` + 24 `warehouse_logistics`;
- exact 21-file / 18-JavaScript production tree;
- production tree SHA-256 `c007f650cb46c0575561532d11a2aa4355f650dfb37be4396c6e8065c1f3276f`;
- GitHub Actions run `33227432407` Linux PASS + Windows PASS;
- CI artifact `9707334603` independently downloaded and verified;
- artifact digest `sha256:01d27dc568a6e966e2bb581a0178e9f59719b6297ffc0fc2282ca0946be3fd2c`;
- no fresh Seller/Performance business requests;
- no credentials;
- no production modification during acceptance.

## Correct interpretation of the old B1–B49 reconciliation

The old reconciliation remains useful for identifying the implementation-order drift and salvage locations, but two conclusions are superseded by the later full-read completion roadmap.

### Personal Data correction

Do not treat accepted B9/B17 as automatically defective merely because review/question responses can contain personal data.

Accepted B0 already defines the operator Personal Data gate:

- OFF blocks before provider execution and produces zero physical business requests;
- enabling the setting does not replay the blocked command;
- ON requires an explicit resubmit;
- the explicit resubmit may execute the allowed read.

Accepted B9 keeps `review_list`, `review_info`, and `question_list` behind that existing gate. Accepted B17 states that Personal Data gating remains intact for its extended review/question reads. These implementations are useful salvage/reference for canonical rebuild.

The later required work is to verify that every Seller operation that needs the Personal Data setting is correctly attached to this existing gate. Do not invent a replacement privacy mechanism solely because an operation can return personal data.

### Performance correction

Do not drop Performance API from the product completion goal.

Accepted Performance B6 is valid separate-provider work. It used the exact Performance Swagger:

- 304,771 bytes;
- SHA-256 `7436e4a3e40b4d5bf926a887d7891c1db264cbb6582266299a2df10f67592fec`;
- 47 paths;
- 48 HTTP operations.

B6 accepted a Performance Read Core and preserved existing Performance reads, but it did not prove full 48/48 coverage. Final product completion therefore requires a complete 48-operation Performance master-checklist and implementation of every admissible read/read-workflow while mutations remain unavailable.

## Where the old work actually went wrong

The accepted B0 was the last clean roadmap base. The first post-B0 implementation batch already diverged from the fixed V2 order: old B1 implemented catalogue assortment while canonical V2 B1 was defined as stocks + warehouse logistics.

The process failure was not that all B1–B49 code was useless. Much of it is validated read-contract work. The failure was using research/contract-gap queues as an implementation roadmap and then assigning every next discovered gap a new B-number.

Consequences recorded by the reconciliation and later roadmap:

- useful implementations landed in the wrong canonical phase;
- several batches mixed business domains that must be split;
- at least one unauthorized top-level Seller taxonomy (`seller_health`) appeared;
- research queues with `implementation_allowed: false` were treated as implementation ordering;
- no final full-contract gate proved every Seller operation had a terminal decision;
- systematic Seller read-workflow/report/document completion was not done;
- full Performance 48/48 completion was not done.

Do not delete B1–B49 wholesale. Use accepted/validated pieces as salvage/reference under the master-checklist and fixed canonical business groups.

## Step 2 — current action

Before any further endpoint expansion, build one machine-readable/checkable master inventory containing exactly:

- 463 Seller operation rows from the exact Seller Swagger;
- 48 Performance operation rows from the exact Performance Swagger.

Each row must at least record:

- provider/API;
- HTTP method + fixed path;
- plain-language purpose;
- current/deprecated state;
- read / read-workflow / mutation / unresolved classification;
- whether Bridge already implements it;
- accepted/salvage source when implemented;
- Personal Data requirement;
- entitlement/subscription rule where applicable;
- quota/rate-limit rule where applicable;
- pagination model;
- workflow role;
- final action: keep / move / add / replace / block / research.

No Seller or Performance operation may remain unknown/unclassified/pending at the final completeness gate.

No B50/B51/... endpoint-selection work is authorized.