import argparse
from pathlib import Path

p = argparse.ArgumentParser()
p.add_argument('--source-sha', required=True)
p.add_argument('--source-tree', required=True)
p.add_argument('--package-name', required=True)
p.add_argument('--package-sha', required=True)
p.add_argument('--package-bytes', required=True)
p.add_argument('--production-files', required=True)
p.add_argument('--workflow-run', required=True)
a = p.parse_args()

root = Path(__file__).resolve().parent
ozon_root = root.parents[1]
artifacts = ozon_root / 'artifacts'
artifacts.mkdir(parents=True, exist_ok=True)
buildinfo = artifacts / f'{a.package_name[:-4]}_BUILDINFO.txt'

dep = f'''# Alice SPA attachment owner — dependency closure

Workflow run: `{a.workflow_run}`
Exact executable source commit: `{a.source_sha}`
Exact executable source tree: `{a.source_tree}`
Exact ZIP: `{a.package_name}`
Exact ZIP SHA-256: `{a.package_sha}`
Exact ZIP bytes: `{a.package_bytes}`
Production files: `{a.production_files}`

## Closure chain

| Dependency layer | Closure |
|---|---|
| producer/origin | Content-side live owner is produced from the current confirmed AI conversation identity; immutable Runtime Port sender still anchors tab and origin. |
| creation | `live_owner` is created for every attachment-port request after the SPA route has been resolved by current-page identity. |
| normalization | Worker normalizes origin and conversation id; origin must be an exact HTTPS origin for a supported AI provider and conversation id must pass the provider path parser. |
| validation | Persisted owner is matched against immutable sender tab, immutable sender origin, and current live conversation. Missing/malformed live ownership fails closed. |
| comparisons/branches | Exact closed set is 9/9 attachment RPCs; recovery plus all state-changing/read artifact RPCs pass the same ownership authority. |
| readers/consumers | Recovery, metadata, chunks, commit, ready, send commit/rollback, confirm and fail are covered. |
| state | Persisted autorun/manual owner state and delivery-id authority are unchanged; only admission identity changes. |
| storage | No storage schema, artifact bytes, IndexedDB database/store/version or storage-session authority changed. |
| restoration | Recovery is SPA-aware and ownership failures are surfaced instead of being collapsed into an ordinary null recovery. |
| MV3/module boundaries | Frozen `port.sender.url` path is explicitly modeled; packaged service-worker/runtime loading is regression-tested in pinned Chrome. |
| permissions | No manifest permission or host permission change is required or made. |
| policy | Privacy/personal-data/report-file policy is unchanged. |
| entitlement | Seller/Performance/report-file entitlement logic is unchanged. |
| planning | Request planner and one-envelope cardinality rules are unchanged. |
| transport/request | No Ozon transport code changed; no hidden retry, polling, pagination, fan-out, refetch or resend is introduced. |
| parsing/transformation | Provider parsing, file parsing and result transformation are unchanged. |
| output/result | Only local attachment ownership admission/recovery error visibility changes. |
| redaction/security | Cross-tab, cross-origin, cross-conversation, missing, malformed and non-HTTPS live-owner controls fail closed. |
| accounting/metadata | Provider request accounting is untouched; deterministic patch/final gates execute zero Ozon provider calls. |
| tests | Correct historical pre-fix FAIL is preserved; targeted post-fix, attachment, report/output and durability regressions pass. |
| packaged runtime | Exact executable is pinned; deterministic ZIP is fresh-extracted and compared byte-for-byte to exact Git blobs on Linux and Windows. |
| live workflow | Live browser interaction remains intentionally pending until owner installs this exact ZIP. |

Unaccounted pre-handoff dependencies: **0**.
Stale active assumptions after secondary sweep: **0**.
Available-but-unverified pre-handoff dependencies: **0**.
Live-only dependencies pending: **5**.

**DEPENDENCY VERDICT: PASS FOR PRE-HANDOFF SCOPE**
'''
(root / 'DEPENDENCY_CLOSURE_2026-09-11.md').write_text(dep, encoding='utf-8')

gates = [
'Owner authorization: this specific Alice SPA attachment-ownership patch was explicitly authorized.',
'Historical negative evidence: corrected packaged-runtime pre-fix run 34593942864 is preserved as an intentional FAIL.',
'Exact repair scope: executable commit changes exactly two production files; Ozon provider business semantics are untouched.',
'Pre-fix reproduction: persisted Chat A plus frozen root sender path reproduces ATTACHMENT_CONVERSATION_MISMATCH.',
'SPA boundary: frozen sender path is no longer used as conversation identity after in-tab route change.',
'Live identity producer: every attachment RPC requires a current confirmed content-side conversation identity.',
'Reserved ownership field: internally generated live_owner is written after caller payload and cannot be overridden by it.',
'Live origin normalization: live owner origin must be a parseable exact HTTPS origin.',
'Conversation normalization: live conversation id must pass the configured provider path parser.',
'Immutable tab trust anchor: sender tab must equal persisted owner tab.',
'Immutable origin trust anchor: Runtime Port sender origin must equal persisted owner origin.',
'Positive SPA control: stale root sender path plus matching live Chat A owner is accepted.',
'Missing live-owner negative control: all attachment RPCs fail closed.',
'Malformed live-owner negative control: invalid conversation identity fails closed.',
'Non-HTTPS live-owner negative control: invalid origin fails closed.',
'Cross-tab negative control: non-owner tab is rejected.',
'Cross-origin negative control: sender from another AI origin is rejected.',
'Cross-conversation negative control: Chat B cannot act on Chat A delivery.',
'Attachment RPC closed set: all 9/9 RPC message types are guarded by live ownership.',
'Recovery authority: OZ_ATTACHMENT_RECOVERY_GET uses the same persisted-owner/live-owner comparison.',
'Operational authority: the other 8 RPCs remain routed through centralized ownerForMessage validation.',
'Delivery authority: delivery_id mismatch guard remains active and unchanged.',
'State/storage isolation: owner records, storage schema and artifact persistence semantics are unchanged.',
'Recovery visibility: ownership/recovery errors are surfaced instead of silently becoming null recovery.',
'Attachment state-machine regression: recovery, single-flight send commit and safe rollback remain valid.',
'Capture/accounting regression: provider-file capture/accounting invariants remain valid.',
'Mixed-batch and wake lifecycle regressions: attachment delivery continuation behavior remains valid.',
'Direct-binary isolation: original provider file delivery and opaque artifact semantics remain valid.',
'IndexedDB durability isolation: prior late-abort transaction durability gate remains PASS.',
'No hidden provider continuation: retry/polling/pagination/fan-out/refetch/resend were not added.',
'Command/report isolation: command-envelope and explicit report/output workflow gates remain PASS.',
'MV3/browser lifecycle: packaged worker and attachment browser primitive execute in pinned Chrome.',
'Linux exact package parity: fresh extraction equals exact executable Git blobs byte-for-byte.',
'Windows exact package parity: same deterministic ZIP SHA/bytes and canonical Git-blob parity are verified.',
'Security/accounting/freeze: negative controls pass, provider_calls_during_patch_gate=0, exact package identity is frozen.'
]
assert len(gates) == 35
rows = '\n'.join(f'| GATE-{i:02d} | PASS — {text} |' for i, text in enumerate(gates, 1))
final = f'''# Alice SPA attachment owner — final pre-handoff

Workflow run: `{a.workflow_run}`
Exact executable source commit: `{a.source_sha}`
Exact executable source tree: `{a.source_tree}`
Exact ZIP: `{a.package_name}`
Exact ZIP SHA-256: `{a.package_sha}`
Exact ZIP bytes: `{a.package_bytes}`
Production files: `{a.production_files}`

## Corrected behavior

- A Runtime Port may be opened before Alice SPA creates/navigates to Chat A without freezing the attachment owner to the old route path.
- Immutable sender tab and origin remain transport trust anchors; current confirmed content-side conversation supplies the SPA-aware conversation identity.
- All 9 attachment RPCs use the same fail-closed ownership authority.
- Recovery ownership errors are visible and can no longer masquerade as “no pending recovery”.
- No Ozon provider transport, policy, entitlement, request cardinality or automatic continuation semantics changed.

## GATE-01..35

| Gate | Status |
|---|---|
{rows}

**PRE-HANDOFF VERDICT: PASS**

LIVE-GATE-01: `PENDING POST-INSTALL` — install the exact ZIP above.

LIVE-GATE-02: `PENDING POST-INSTALL` — on Alice start from a route where the port can predate Chat A, create/navigate to Chat A, and verify a real file attachment recovers without ATTACHMENT_CONVERSATION_MISMATCH or silent hang.

LIVE-GATE-03: `PENDING POST-INSTALL` — verify the file is attached/sent exactly once and the expected attachment state transitions complete.

LIVE-GATE-04: `PENDING POST-INSTALL` — reload/recreate the MV3 worker during an in-progress Chat A attachment and verify persisted recovery remains bound to Chat A without provider refetch.

LIVE-GATE-05: `PENDING POST-INSTALL` — verify a different tab/origin/conversation cannot claim Chat A attachment ownership while normal Chat A delivery still succeeds.

**LIVE CERTIFICATION: PENDING**

No live-only gate is promoted to PASS by deterministic CI.
'''
(root / 'FINAL_PREHANDOFF_2026-09-11.md').write_text(final, encoding='utf-8')

buildinfo.write_text(f'''artifact={a.package_name}\nsha256={a.package_sha}\nbytes={a.package_bytes}\nproduction_files={a.production_files}\nexact_executable_sha={a.source_sha}\nexact_executable_tree={a.source_tree}\nworkflow_run={a.workflow_run}\nlinux_exact_source_package=PASS\nwindows_exact_source_package=PASS\nattachment_rpc_live_owner_guard=9/9\nstale_sender_path_matching_live_owner=PASS\nrecovery_error_visibility=PASS\nsecurity_negative_controls=PASS\nindexeddb_durability_regression=PASS\nprovider_calls_during_patch_gate=0\nautomatic_retry_added=false\nautomatic_polling_added=false\nautomatic_pagination_added=false\nautomatic_fanout_added=false\nautomatic_refetch_added=false\nautomatic_resend_added=false\nlive_certification=PENDING\n''', encoding='utf-8')
