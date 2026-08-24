# Patch A.1 completion-retest classification

Branch: `fix/ozon-work-session-finish-no-autorun-2026-08-24`

Prior result commit: `735029a09e93a54cd68d9fe66484bbef26e6b12b`

## What is already proven

The Patch A.1 candidate identity passed materialization and syntax verification. Executed browser assertions reported:

- A — PASS
- B — PASS
- C — PASS
- F — PASS
- G send-vs-dictation control discrimination — PASS
- H — PASS

The original R2 production defect is therefore fixed: `OZ_WORK_FINISH` returned `ok=true`, the session became `inactive`, the binding was retired, Autorun remained absent, and a subsequent Start returned the session to `active_visible` with exactly one prompt.

No executed product assertion in commit `735029a09e93a54cd68d9fe66484bbef26e6b12b` failed.

## What remains unproven

Only these ChatGPT acceptance assertions remain incomplete:

1. D — explicit Refresh on `active_visible`.
2. E — Refresh while `active_hidden`, restore hidden, then Show.
3. Three consecutive local-only `OZON_HELP_V1` manual deliveries through the real production delivery/composer path.

Alice was `NOT_EXECUTED` only because no established installed Alice test environment exists. Alice unavailability is environment-only and is not a Patch A.1 product rejection criterion by itself.

## Acceptance rule for the completion run

Do not modify or rematerialize different production bytes. Use the same Patch A.1 candidate tree identity:

- production files: `19`
- `service_worker.js` SHA-256: `f9cb0720f411b479a22f00cb0ba7a3553de8ae8fba62de5a27a904b6d27a287c`
- tree-manifest SHA-256: `bb3cd062be3b5839c7dc11b029ba3d661caaa78e298669742884b920c1d5df33`

If D, E and the required three local deliveries all PASS and no new executed product assertion fails, the candidate is accepted for Patch A on ChatGPT. Alice remains a separately recorded environment-only `NOT_EXECUTED` item.

If D or E actually executes and the production lifecycle fails, report that exact product failure instead of repairing it.

If a local delivery actually executes and fails in the production path, report the exact delivery state/diagnostics instead of repairing it.

Decision marker for a fully passing completion run:

`PATCH_A1_BROWSER_CANDIDATE_ACCEPTED`
