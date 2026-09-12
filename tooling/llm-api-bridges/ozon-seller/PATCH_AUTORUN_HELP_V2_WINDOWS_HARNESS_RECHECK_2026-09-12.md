# Autorun HELP_V2 — Windows harness first-failure record

Authoritative first full run: `34679533392`.
Linux full exact-package regressions: PASS. Pinned Chrome real DOM and MV3 exact-package smoke: PASS.
Windows: FAIL on the first Node syntax command, before any product syntax was evaluated.
Finalization: blocked by the failed Windows job; no PRE-HANDOFF PASS issued.

## Actual error

`NODE_OPTIONS` used a quoted Windows path with backslashes. Node option parsing consumed the backslashes and tried to preload a nonexistent path equivalent to `D:ablood_sandblood_sandtoolingllm-api-bridgesozon-sellervalidationstep7-regression-v1network_guard.cjs`.

Evidence: artifact `10293206723` (`ozon-help-v2-windows-evidence`), files `failure.json` and `syntax-attachment_delivery_port_content.js.log`.

This was not an extension syntax error or a production dependency failure. The network guard failed to load before Node could evaluate the target.

## Correction

Only `validation/autorun-help-v2-marker-v1/run_final_suite.py` changes: serialize the absolute preloader path with `Path.resolve().as_posix()` rather than backslash-containing `str(Path.resolve())`. The guard remains enabled; no test or security check is removed.

Correction commit: `6b4188b45ceaf71636ebcda3fe94f8366a50136a`.

Production executable remains `0cc968ee4b76d41e9c0361a905812fe49f313585`, tree `f9aa7ea1b1d00d6d3abdb22f1bb6adba78a84a90`.
Exact installable ZIP remains 259715 bytes, SHA-256 `4dd7139232317b1e55c432d47bcb2a7ced89e8c425ffcdfab679694541d1a225`.

Required next verification: a new full Linux → browser/MV3 → Windows → finalization run. Earlier Linux/browser success must not be combined with a separately rerun Windows job to claim one full green cycle.

Real Ozon provider calls during this correction: 0.
