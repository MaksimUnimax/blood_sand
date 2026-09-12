# Alice single-file delivery corrective pass — frozen plan

Authorization: operator explicitly ordered planning and execution in this conversation on 2026-09-12.
Base remote: 06ec1af2a1d90e2ff192e749b5bf90129963dd05; executable aafd23cca6cb657ed8c453c54c6a0b70b5bf21f3.
Branch: repair/ozon-alice-single-file-delivery-2026-09-12. No force/reset. No Ozon requests during repair.
Mandatory authority read fully: OZON_PATCH_DELIVERY_GATE.md (35 pre-handoff / 5 separate live gates).

## Frozen evidence
Alice manual batch at 11:46:00Z: report_file_get HTTP200 + independent report_info HTTP200 + HELP local section_selected; results 3; no delivery confirmation. Same two-API batch also failed without HELP at 11:44:56Z. Code builds an unnecessary TXT companion then rejects 2 > Alice max_files_per_turn=1. Failure clears owner batch/delivery and the model receives no result.
Positive control supplied by operator: ChatGPT delivery manual-delivery-191db138-0301-4571-b6fe-a45ec0bf59ca attached two originals (CSV 249856 bytes sha256 59208261eb93f7554163bf39264fd138a0e717fd9a8eccf1ab5cabbc59ee783b; XLSX 43240 bytes sha256 01673bd7581c7722254c70e987c983351b3727bf778a216edb4e4ef36fe62dbe). Both local bytes verified. These are evidence only; never re-query or publish business file contents.

## Scope and invariants
1. Alice-only finite one-file budget before physical execution; report_file_get and registry response_style=binary consume slots on successful file results. JSON info/create/HELP do not. Existing privacy/planning blocks take precedence. Reconstruct usage from durable completed entries, not module memory. Deferred command is a complete local result (HTTP0, external false) with exact validated next_command; no new provider retry/fanout/polling.
2. One original + short complete text: attach original, send other results/instructions as normal composer text. No synthetic second TXT for Alice. ChatGPT policy unchanged.
3. Text overflow is real: cannot fit original + >90000 UTF16 text + one-file limit. Preserve the original as the one current attachment and persist the COMPLETE result as a scoped expiring TXT artifact. Return a bounded notice and an explicit report_file_get next_command for its freshly created opaque ref. That next command reads local saved delivery bytes with zero Ozon calls; does not fake an Ozon HTTP200, does not call provider, does not repeat already executed commands. Same-origin/conversation, credential-revision and current personal-data checks, byte/hash/TTL validation. No new public marker or transport destination. Never truncate or rename provider bytes.
4. Alice pre-attachment failure must transition to the existing text result delivery with a safe local failure notice, not delete results and only toast. Only before attachment commit; unknown send/attachment outcome and non-owner must NEVER trigger a second send or overwrite unrelated composer text. Network/browser unavailability cannot promise receipt; keep the established safety boundary explicit.
5. Exact ZIP regression on Linux/Chrome/Windows, byte parity, negative controls, no silent reduction of old regression suite. Every changed execution byte invalidates previous package evidence. Live gates remain pending after install.

Expected production files: service_worker.js; shared/bridge_autorun_model.js; shared/file_delivery_model_policy.js; shared/file_delivery_port_worker.js; shared/llm_output_report_workflow_patch.js; attachment_delivery_port_content.js if needed for safe text fallback handover. No manifest, endpoints, accepted types, max_files_per_turn, provider/credentials, API mutations or business-data changes.

## Secondary sweep requirements
All queue entry status/kind and local-result consumers; logical vs physical counters; same/different duplicate refs; first-file failure; direct CSV/PDF/PNG and downloaded reports; pure/mixed HELP/API; report prefix; exact 90000 boundary including final marker; long-text spill; private/unknown refs; deferred refs expiry/account change/worker recreation; IDB transaction completion; Port ownership, send single flight and error phases; ChatGPT multi-file and large TXT; prior patched XLSX/expiry/HELP/SPA/UI close.

Current state at plan freeze: source audit complete; production unchanged; RED and ephemeral candidate tests next. No PASS claimed in advance.


## Refinements from the required secondary sweep (before publication)
- New local continuation refs reserve `rpf_[sp]_local_<uuid>` within the existing opaque-ref contract. Ordinary provider refs never access the new local IDB reader. Missing local refs must fail locally, even if a corrupt session contains a URL with that same ref.
- Eleven registry-declared binary routes covered. The two existing inline-PDF routes deliberately keep their separate explicit retrieval workflow; their successful acquisition still occupies the current Alice file budget. No implicit extra provider command is added to make them look like an immediate attachment.
- The preserved TXT deadline is absolute (one hour from the original claim), and is checked independently of cleanup. Recreating the worker or repeating a Port commit cannot renew it.
- An actually deferred full-text report prefix is not falsely acknowledged as delivered.
- On simultaneous artifact-storage failure and oversized error text, the bounded receipt is delivered and the full text remains in `retained_delivery_failure` on the current operation. This last-resort record is not advertised as a downloadable file and can be replaced by a later explicitly started operation. No fictitious next_command is emitted.
- Final test plan: 56 behavioral cases, 10 independent mutation controls, real Chrome Port/IDB/worker recreation, old 31 scripts, old expiry/consumer/worker/HELP/type/UI suites, same immutable ZIP on Linux/Chrome/Windows.
