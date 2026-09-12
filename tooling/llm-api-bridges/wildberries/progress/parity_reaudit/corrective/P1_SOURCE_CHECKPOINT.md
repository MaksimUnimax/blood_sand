# P1 source checkpoint
Date: 2026-09-12
Status: P1 IN_PROGRESS / INITIAL ERRORS WIP PRESERVED / NOT RELEASE

Initial-errors cursor v8 was read back at de51ed7678fc4af6c01c9cc102e40fc925a84d34; blob 1009b110459c8fce2c34520b38e39d2a4c47cdaa matches update response. Initial_errors checkpoint/patch/runners remain authoritative for that bounded block.

## Newly verified source, not another history restart
GitHub commit 97f1abc0ecaa04c6e24d0c32f8525b126b05d0e1 identifies executable 1b3f0961ff9399430c9e5b3b70a4188f1282429d and workflow 34665593546. Downloaded its artifact 10289311013 through the connected GitHub action. Local wrapper ZIP: 258561 bytes, SHA256 f712fbfcbf5ddf5aa2c39b18b750bedf3518cc7c6d438e4c7e26cbda9c2e85c0. Inside: OZON_BRIDGE_v0.1.19_GLOBAL_IDLE_WORK_RESTART_20260912.zip, 259583 bytes, SHA256 78ff3b6681759a308e8aac1debfb8832fa04cc28599859a0979341cce3e4e2ac, 32 production files. Safe-extracted to /mnt/data/wb_parity_corrective_2026-09-12/ozon_latest; identity in OZON_LATEST_INPUT.json.
This is accepted PRE-HANDOFF source, not owner LIVE acceptance: Ozon evidence itself states LIVE pending. Source is used as executable oracle with that boundary explicit.

## Additional confirmed defect
WB content_script.js lines 543–575 mutate native Copy styles/title and install capture click handler to execute WB. The comment claiming native Copy untouched is contradicted by executable code. Native Copy must remain ordinary Copy, with separate extension-owned WB button in one top-level Shadow DOM overlay. Simply recoloring native Copy purple would not fix this. Latest Ozon popup.html full 1–81 explicitly states this structure; matching actual overlay is next source.

## Late Start/idle-plaque semantics
The late Ozon patch distinguishes idle attachment diagnostics from active-delivery failures; only idle noise is suppressed. Existing and new-chat Start share durable worker-owned intent/revision and Send commit before click. ACTIVE_VISIBLE waits for correlated complete assistant response, not immediate state flip. Unknown post-click outcome is persisted/no retry. Current WB Start does not satisfy that protocol; rebuilding only labels is insufficient. P4/P7 start/recovery transaction remains explicitly open until implemented and tested.

## Read/harness note
An attempted local range read used wrong CLI spacing instead of file::start::end; output was truncated and subsequent pseudo-path failed. It is not full-file evidence. Re-read needed ranges with correct helper syntax. No production was changed by that read failure.

## Next concrete work
Port actual Ozon extension-owned overlay (WB visual identity), Work-only button state and one popup renderer; add red/green DOM and worker tests. Preserve safe-error work and all WB provider serialization. Do not expose a misleading Start success before implementing the pending transaction. No real provider calls, no owner tests, no new release yet.
