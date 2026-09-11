# Alice auto-send after attachment — live failure authority

Date: 2026-09-11

## Previous exact installed corrective authority

- branch: `repair/ozon-alice-drag-drop-transport-2026-09-11`
- final branch head before this corrective line: `00db23087d657ccda3f2fc3bec45423c96ca21a7`
- exact executable source commit: `39eadd2699320774ef53964ea8cf347057c1b813`
- exact executable tree: `f8ec34c4754fb7369a5dbff618705b1d01c6e048`
- installed ZIP: `OZON_BRIDGE_v0.1.19_ALICE_DRAG_DROP_CORRECTIVE_20260911.zip`
- ZIP SHA-256: `069808508accbb6a091f3ae9358bfee43f27c42f60210899dd0fc621c12233dd`
- ZIP bytes: `249906`

The previous package remains historical evidence. This corrective work does not rewrite its PRE-HANDOFF result.

## Direct live evidence supplied by owner

The owner supplied a current Alice screenshot after installing the exact corrective ZIP plus a diagnostic export for the same session.

Observed in the screenshot:

1. One generated TXT is visibly attached in the Alice composer.
2. The visible attachment label begins `ozon-bridge-resu...` and Alice shows it as a TXT document around 375.5 KB.
3. The composer contains the short `OZON_BATCH_RESULT_V1` marker for delivery `manual-delivery-957d1ef3-d120-497a-abff-2ea0a6c4be38`.
4. The marker declares `delivery_representation = ATTACHED_COMPLETE_TEXT_DOCUMENT` and one generated TXT attachment.
5. Alice's purple arrow/send control is visibly present and appears enabled.
6. The message was not sent automatically.

Observed in the diagnostic export:

- Alice adapter selected for confirmed conversation `https://alice.yandex.ru|01a08b50-3c38-4000-a691-6fa5ee65b023`.
- `product_prices_bulk` executed exactly once and returned HTTP 200.
- `fbs_posting_list` was locally blocked by `OPERATION_DISABLED_BY_USER`; `external_request_executed=false` for that item. This is expected personal-data policy behavior and is not part of this corrective scope.
- `BATCH_COLLECTION_COMPLETED` records `result_count=2` and delivery id `manual-delivery-957d1ef3-d120-497a-abff-2ea0a6c4be38`.
- The supplied export ends at `BATCH_COLLECTION_COMPLETED`; it does not prove a later internal delivery error code. No such error code is inferred here.

## Proven failure boundary

The prior corrective package successfully crossed these live boundaries:

`collection -> generated TXT materialization -> Alice drag/drop attachment -> visible attachment -> marker staging`

The current live defect is downstream:

`attachment_ready / marker staged -> Send target resolution / validation / commit / click / user-turn confirmation`

The screenshot does **not** prove which one of those downstream internal substeps failed. The corrective implementation must first reproduce the exact topology-sensitive Send failure deterministically.

## QA defect in previous pre-handoff suite

The previous Alice DnD browser fixture exercised drag/drop transport and attachment readiness but did not execute the complete Alice Send dependency chain:

`Alice send-control resolution -> BB2ComposerSend.validateTarget -> stable target sampling -> clickSynchronously -> exactly-one click`

Therefore GATE coverage was incomplete for the live post-attachment Send boundary. This corrective line must add that missing dependency and negative controls before changing production code.

## Safety / scope boundaries

- provider calls before post-install live verification: `0`
- no personal-data policy bypass
- no hidden retry, pagination, fanout, provider refetch, reattach, or resend
- no changes to Ozon provider request semantics
- old package/hash/evidence remain preserved
- any Send ambiguity must fail closed
