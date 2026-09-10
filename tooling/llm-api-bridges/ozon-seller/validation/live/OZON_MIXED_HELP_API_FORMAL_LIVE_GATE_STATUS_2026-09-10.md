# Ozon mixed HELP/API — formal LIVE-GATE status — 2026-09-10

Status: LIVE CERTIFICATION PENDING.

Authority: `OZON_PATCH_DELIVERY_GATE.md`, section 8, LIVE-GATE-01..05.
Live observations: `validation/live/OZON_MIXED_HELP_API_LIVE_EVIDENCE_2026-09-10.md`.

## Formal mapping

### LIVE-GATE-01 — Exact user-observed workflow on installed candidate

Status: PASS.

Evidence: LIVE TEST 01 executed the repaired HELP→API workflow through the installed bridge. HELP and API coexisted in one assistant source, source order was preserved, HELP stayed local, and the API reached Ozon with HTTP 200. The repaired failure had no generated cross-command opaque dependency, so there was no fresh code/file_ref/cursor to generate for this workflow.

### LIVE-GATE-02 — Lifecycle-sensitive live path

Status: PENDING POST-INSTALL LIFECYCLE PROOF.

Reason: five successful live cases were observed, but none contains positive evidence that the installed MV3 service worker was deliberately terminated/recreated between live attempts. Same-instance or unknown-instance success cannot be promoted to lifecycle PASS. The available Opera Browser Connector currently reports that the browser is not connected because `Allow AI connection` is disabled, so direct browser-controlled worker recreation cannot be evidenced from the assistant side.

Required closure: deliberately reload/restart the installed extension/browser boundary, then rerun the exact mixed HELP→API positive control and record the returned result.

### LIVE-GATE-03 — Complete real-result validation

Status: PASS for the touched mixed-batch contract.

Evidence across LIVE TEST 01..05:
- live logical and physical business-request counts observed;
- `external_request_executed` observed on local and provider-executed entries;
- provider result HTTP 200 observed on valid API controls;
- provider classification `ozon` / `seller_api` observed;
- entitlement `SUPPORTED_AND_ENTITLED` observed on enabled API controls;
- `exact_request_preserved=true` observed;
- logical and physical fingerprints match and `command_transformed=false`;
- disabled/malformed entries remain local with zero provider business requests;
- aggregate physical counts prove no second business request on these single-flight controls;
- no automatic pagination/polling/fan-out is evidenced by the bounded live outputs and accounting.

Privacy/redaction implementation itself was not modified by this patch; any relevant live regression obligation is tracked under LIVE-GATE-04 rather than inferred here.

### LIVE-GATE-04 — Relevant live regression guards

Status: PARTIAL / PENDING FINAL TOUCHED-SURFACE OBSERVATION.

Already live-proved:
- request preservation and no transformation;
- entitlement honesty on enabled command;
- provider classification;
- disabled alias remains fail-closed before provider execution;
- malformed HELP/API isolation;
- later independent envelopes survive;
- guidance contributes zero provider business requests.

Still not live-observed:
- the changed installed startup-prompt user-visible surface. `START_PROMPT_CURRENT.md`/`DEFAULT_AUTO_START_TEXT` was changed by this repair and therefore must not be claimed live-correct solely from CI/package evidence.

Required closure: observe the installed bridge startup prompt after an actual extension/browser lifecycle restart and verify that it states the envelope boundary, mixed HELP/API allowance, local HELP/zero-provider rule, fresh dependent-value rule, and no hidden polling/retry/pagination/fan-out semantics.

### LIVE-GATE-05 — CI/package PASS is not LIVE PASS

Status: PASS as a certification discipline guard.

Evidence: post-install live observations were collected separately from CI/package evidence; the live ledger has deliberately remained `LIVE VALIDATION IN PROGRESS` and no PRE-HANDOFF PASS was promoted to LIVE PASS. Five actual installed-runtime results exist, while unresolved LIVE-GATE-02/04 remain explicitly open.

## Current formal verdict

- LIVE-GATE-01: PASS
- LIVE-GATE-02: PENDING
- LIVE-GATE-03: PASS
- LIVE-GATE-04: PARTIAL / PENDING
- LIVE-GATE-05: PASS
- LIVE CERTIFICATION: PENDING

No additional Ozon provider read is required before the lifecycle restart. The next provider command should be the exact HELP→API positive control only after the operator has deliberately recreated the installed extension/browser lifecycle boundary. The startup-prompt observation should be captured during the same lifecycle exercise if possible.
