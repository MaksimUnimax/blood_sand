# Ozon multi-AI file delivery — LIVE-GATE-03 wake failure evidence

Date: 2026-09-08

Status: `LIVE_GATE_03_BLOCKED__EVENT_DRIVEN_ATTACHMENT_WAKE_DEFECT`

Authorization for the corrective patch cycle: operator current-turn command `Делай патч, правила блдяь патч соблюдай!!!`.

## 1. Scope of this frozen defect set

This evidence freezes the operator-observed failure before executable repair. The failing surface is the shared ChatGPT attachment-delivery wake path used after a batch has already completed. It is not an Ozon provider/account permission failure and does not authorize a duplicate provider request.

Planned corrective executable scope is limited to:

- `dist-step7-candidate/attachment_delivery_port_content.js`;
- targeted deterministic regression(s) for normal-start wake export/dispatch;
- the intersecting multi-AI file-delivery regression guard;
- patch validation/evidence documentation.

No provider API contract, credentials, entitlement, report parsing, manifest host permission, business operation, or request-count contract is to be changed by this patch.

## 2. Exact live workflow already executed

The LIVE-GATE-03 chain was intentionally sequential and used fresh dependent values:

1. `report_placement_by_products_create` for `2026-08-01` through `2026-08-31` returned HTTP 200 and fresh code `REPORT_seller_placement_by_products_2093109_1788854851_01a0800e-d8d1-7c2c-8614-6d5b81445a2b`.
2. `report_info` with that fresh code returned HTTP 200, `status=success`, and fresh `report_file_ref=rpf_s_6d2988ac-8b60-4916-beb2-d5f9acd147ab`.
3. `report_file_get` used exactly that fresh ref. The observed provider execution completed HTTP 200, the logical result was stored, and the batch reached `BATCH_COLLECTION_COMPLETED`.

Observed failing delivery identity:

- `report_file_get` request id: `d1bcede0-5c3a-4825-ba60-c16544bdd5ac`;
- delivery id: `manual-delivery-aef80a92-3408-4acd-805d-73463c0967eb`;
- logical command fingerprint: `08ab4d88`;
- physical command fingerprint: `43d0e0ce`;
- `command_transformed=true` for the opaque report-file provider transport;
- provider HTTP status: `200`;
- terminal collection event: `BATCH_COLLECTION_COMPLETED`.

No second `report_file_get` is authorized or required for this repair cycle. The completed provider request is preserved as live evidence.

## 3. Exact failure boundary

The operator saw no attachment/delivery action after `BATCH_COLLECTION_COMPLETED`.

Source reconstruction on the exact installed candidate found the normal-start dependency break:

- `shared/file_delivery_wake_worker.js` emits `OZ_ATTACHMENT_DELIVERY_WAKE` when an owner enters `attachment_watch_v1`;
- `attachment_delivery_wake_content.js` accepts that wake only when `globalThis.__OZON_ATTACHMENT_DELIVERY_PORT_RUNTIME__.recoverCurrent` is a function;
- `attachment_delivery_port_content.js` defines local `recoverCurrent()` but does not export it to the runtime object during normal initialization;
- the only assignment `runtime.recoverCurrent = recoverCurrent` is inside `scheduleReconnect()`;
- therefore a healthy named Port that never disconnects leaves `runtime.recoverCurrent` undefined when the storage wake arrives;
- the wake listener returns without recovery;
- the remaining fallback is the independent `RECOVERY_POLL_MS = 60_000` timer.

This explains why the new event-driven wake contract is not actually established on normal startup even though the attachment pipeline itself can work when recovery is reached by another path.

## 4. Regression gap that allowed PRE-HANDOFF PASS

Two existing checks are insufficient for this defect:

1. `run_multi_ai_file_delivery_patch.mjs` only checks that the source text contains `runtime.recoverCurrent = recoverCurrent;`; it does not prove the assignment occurs on normal initialization before wake handling.
2. `run_file_delivery_live_stop_repro.mjs` creates a synthetic content runtime object that already contains a working `recoverCurrent()` method before loading `attachment_delivery_wake_content.js`; therefore it bypasses the missing production export.

The corrective regression must load the real production `attachment_delivery_port_content.js` with a healthy Port/no reconnect, prove the runtime exports `recoverCurrent` immediately, deliver `OZ_ATTACHMENT_DELIVERY_WAKE`, and prove an immediate named-Port recovery request occurs without advancing the 60-second fallback timer.

## 5. Claims deliberately not made from this live run

This frozen evidence does **not** claim any of the following as PASS:

- original provider-file artifact persistence in IndexedDB for this exact live run;
- actual file attachment into ChatGPT for this exact live run;
- automatic Send for this exact live run;
- post-send confirmation/READY for this exact live run;
- LIVE-GATE-03 completion.

Those remain to be proven after a corrected, fully pre-handoff-gated candidate is installed. The current provider request must not be repeated merely to diagnose the wake defect.
