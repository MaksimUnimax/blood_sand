# Alice single-file repair — execution progress

Status: IN_PROGRESS / NOT READY FOR HANDOFF.

## Authorized scope
Owner explicitly requested the patch and requested progress persistence after a connection interruption. Alice has one attachment slot; the first permitted file must be delivered and other file-producing commands must yield explicit local deferred results to the LLM rather than silently failing the entire batch. Mixed text/help results must remain readable. Preserve ChatGPT multifile delivery, privacy, expiry, ownership, no hidden retry/refetch/resend and GATE-01..35.

## Authorities
- Accepted production/evidence baseline: 06ec1af2a1d90e2ff192e749b5bf90129963dd05.
- Baseline executable: aafd23cca6cb657ed8c453c54c6a0b70b5bf21f3.
- Recovery remote HEAD read: 4d447b96a5a3d71e639931f9b879a7f892d54419.
- New work already persisted before interruption: source-export workflow d0090b2; three staged candidate payload parts in commits 1219adb, 3c90eae, 4d447b9. No production files changed in these commits.
- Frozen source archive 34692411427: all 1442 exported file sizes, SHA256 and Git blob hashes reverified locally.

## Confirmed defect
file_delivery_model_policy adds a TXT companion for a mixed batch with one original file. file_delivery_port_worker then rejects two records against Alice max_files_per_turn=1. Logs contain successful report_file_get, report_info and local HELP before the delivery failure. User supplied successful ChatGPT two-original-files live control.

## Recovery cursor
Read mandatory gate and related rules completely; retrieve and inspect the three staged candidate parts rather than overwrite prior work; establish whether candidate payload is complete; reproduce baseline RED; finish dependency inventory and tests; perform ephemeral GREEN before production materialization; full regression/package/CI; remote readback; publish exact ZIP and expanded explanation.

## Current truth
Production patch: NOT MATERIALIZED.
Prior staged candidate validation: NOT YET RECOVERED; no PASS claimed.
Provider calls in this pass: 0.
New installable ZIP: NOT CREATED.
Live certification: PENDING POST-INSTALL.

Local environment cannot resolve public GitHub; use authorized GitHub connector and Actions artifact transfer, not credentials workarounds.
