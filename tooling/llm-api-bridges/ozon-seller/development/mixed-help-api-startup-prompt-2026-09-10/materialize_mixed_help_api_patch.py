#!/usr/bin/env python3
from __future__ import annotations

import pathlib
import subprocess
import sys

BASE_AUTHORITY = "572f0b66dd09ce3441f2b96270c5cae864da490b"
BASE_WORKER_BLOB = "ec988889597ad4df50c07006bc855ad32028fb10"

ROOT = pathlib.Path(__file__).resolve().parents[2]
DIST = ROOT / "dist-step7-candidate"
WORKER = DIST / "service_worker.js"
ENTRY = DIST / "service_worker_entry.js"
RUNTIME = DIST / "shared" / "runtime_names.js"
HELPER = DIST / "shared" / "mixed_batch_discovery.js"


def fail(message: str) -> None:
    raise SystemExit(f"MIXED_HELP_API_MATERIALIZE_FAIL: {message}")


def blob(path: pathlib.Path) -> str:
    return subprocess.check_output(["git", "hash-object", str(path)], text=True).strip()


def replace_once(text: str, old: str, new: str, label: str) -> str:
    count = text.count(old)
    if count != 1:
        fail(f"{label}: expected exactly one old fragment, found {count}")
    return text.replace(old, new, 1)


if not HELPER.exists():
    fail("shared/mixed_batch_discovery.js missing")

worker = WORKER.read_text(encoding="utf-8")
already_materialized = "OzonMixedBatchDiscovery.discover(source" in worker and "MIXED_HELP_AND_API" not in worker

if not already_materialized:
    actual_blob = blob(WORKER)
    if actual_blob != BASE_WORKER_BLOB:
        fail(f"service_worker.js base blob drift: expected {BASE_WORKER_BLOB}, got {actual_blob}")
    if worker.count('code: "MIXED_HELP_AND_API"') != 1:
        fail("expected exactly one blanket MIXED_HELP_AND_API rejection")
    start_marker = "function discoverBatchEntries(text) {"
    end_marker = "\nfunction batchEntryFromDiscovery"
    if worker.count(start_marker) != 1:
        fail("discoverBatchEntries definition cardinality is not 1")
    start = worker.index(start_marker)
    end = worker.index(end_marker, start)
    replacement = r'''function discoverBatchEntries(text) {
  const source = String(text || "");
  if (!globalThis.OzonMixedBatchDiscovery?.discover) {
    return [batchErrorEntry(Object.assign(new Error("Ordered mixed HELP/API discovery module is unavailable."), { code: "MIXED_BATCH_DISCOVERY_UNAVAILABLE" }), "mixed_batch_discovery", OzonContract.textFingerprint(source))];
  }
  let discovered;
  try {
    discovered = OzonMixedBatchDiscovery.discover(source, {
      commandPrefix: OzonRuntime.RUNTIME.commandPrefix,
      helpPrefixV1: OzonRuntime.RUNTIME.helpPrefix,
      helpPrefixV2: OzonRuntime.RUNTIME.helpPrefixV2 || "OZON_HELP_V2",
      apiDiscover: (value) => OzonContract.discoverCommands(value),
      parseHelp: (value) => OzonGuidance.parseHelp(value)
    });
  } catch (error) {
    return [batchErrorEntry(Object.assign(new Error(String(error?.message || error || "Mixed batch discovery failed.")), { code: String(error?.code || "MIXED_BATCH_DISCOVERY_FAILED_CLOSED") }), "mixed_batch_discovery", OzonContract.textFingerprint(source))];
  }
  return discovered.map((item) => {
    if (item.kind === "api") return batchEntryFromDiscovery(item.discovery);
    const help = item.help;
    if (!help?.ok) {
      return {
        kind: "guidance",
        status: "pending",
        guidance: {
          status: "guidance_error",
          cluster: null,
          section: null,
          version: Number(item.version || 1),
          error: String(help?.code || "HELP_DISCOVERY_FAILED_CLOSED")
        },
        request_id: null,
        http_status: 0,
        external_request_executed: false,
        report_text: null
      };
    }
    return {
      kind: "guidance",
      status: "pending",
      guidance: {
        status: help.section ? "section_selected" : "cluster_selected",
        cluster: help.cluster,
        section: help.section || null,
        version: Number(help.version || item.version || 1),
        error: null
      },
      request_id: null,
      http_status: 0,
      external_request_executed: false,
      report_text: null
    };
  });
}
'''
    worker = worker[:start] + replacement.rstrip("\n") + worker[end:]
    worker = replace_once(
        worker,
        "/* global BB2ConversationIdentity, BB2ManualControls, OzonRuntime, OzonCredentials, OzonOperationRegistry, OzonEntitlements, OzonContract, OzonGuidance, OzonWorkSessionModel, BridgeAutorunModel, ProviderTransportCore, OzonProvider */",
        "/* global BB2ConversationIdentity, BB2ManualControls, OzonRuntime, OzonCredentials, OzonOperationRegistry, OzonEntitlements, OzonContract, OzonGuidance, OzonMixedBatchDiscovery, OzonWorkSessionModel, BridgeAutorunModel, ProviderTransportCore, OzonProvider */",
        "worker global dependency declaration",
    )
    WORKER.write_text(worker, encoding="utf-8")
else:
    if "MIXED_HELP_AND_API" in worker:
        fail("materialized worker still contains blanket mixed rejection")

entry = ENTRY.read_text(encoding="utf-8")
helper_import = 'importScripts("shared/mixed_batch_discovery.js");'
if helper_import not in entry:
    entry = replace_once(
        entry,
        'importScripts("shared/ai_delivery_capabilities.js");\nimportScripts("service_worker.js");',
        'importScripts("shared/ai_delivery_capabilities.js");\nimportScripts("shared/mixed_batch_discovery.js");\nimportScripts("service_worker.js");',
        "service worker bootstrap import",
    )
    ENTRY.write_text(entry, encoding="utf-8")
if entry.index(helper_import) > entry.index('importScripts("service_worker.js");'):
    fail("mixed discovery helper loads after service worker")

runtime = RUNTIME.read_text(encoding="utf-8")
contract_phrase = "Граница команды — envelope"
if contract_phrase not in runtime:
    api_line = '    "Для запроса данных напиши: OZON_API_V1 + один JSON-объект вида {\\"operation\\":\\"разрешённый_alias\\",\\"params\\":{}}.",\n'
    inserted = api_line + (
        '    "Граница команды — envelope: OZON_API_V1 плюс следующий JSON-объект. Assistant response, Markdown code block и Manual UI capture не являются границей команды.",\n'
        '    "В одном ответе могут находиться несколько независимых command envelopes; OZON_HELP_V2 и OZON_API_V1 могут находиться в одном ответе и обрабатываются последовательно в исходном порядке.",\n'
        '    "HELP обрабатывается локально и не выполняет provider business request; физические business requests создают только допущенные OZON_API_V1 команды.",\n'
    )
    runtime = replace_once(runtime, api_line, inserted, "startup command-boundary insertion")
    old_guidance = '    "Если точная команда не ясна, используй guidance. OZON_GUIDANCE_RESULT_V2 сначала показывает кластер/секции. Выбирай их отдельной новой командой OZON_HELP_V2 вида {\\"cluster\\":\\"cluster_id\\"} или {\\"cluster\\":\\"cluster_id\\",\\"section\\":\\"section_id\\"}.",'
    new_guidance = '    "Если точная API-команда не ясна, используй guidance: OZON_HELP_V2 вида {\\"cluster\\":\\"cluster_id\\"} или {\\"cluster\\":\\"cluster_id\\",\\"section\\":\\"section_id\\"}. Guidance может быть отдельным envelope в том же ответе рядом с независимыми API-envelope.",'
    runtime = replace_once(runtime, old_guidance, new_guidance, "startup guidance wording")
    request_line = '    "Одна OZON_API_V1 команда создаёт не более одного business request к выбранному Ozon API. Никаких скрытых retry, pagination-loop или fan-out business operations.",\n'
    inserted_request = request_line + (
        '    "Зависимые цепочки нельзя заранее батчить: следующий envelope формируй только после фактического результата предыдущего и используй только свежий code, file_ref, cursor, offset, last_id, page или другой opaque value из этой цепочки.",\n'
        '    "Polling также не запускается скрыто: если нужен новый read, он должен быть новой явной командой.",\n'
    )
    runtime = replace_once(runtime, request_line, inserted_request, "startup dependency-chain insertion")
    RUNTIME.write_text(runtime, encoding="utf-8")

if "отдельной новой командой OZON_HELP_V2" in RUNTIME.read_text(encoding="utf-8"):
    fail("stale separate-only HELP wording remains in startup prompt")

start_prompt_doc = r'''# START_PROMPT_CURRENT

Status: CURRENT runtime authority for the Ozon Seller Bridge candidate.
Executable source: `dist-step7-candidate/shared/runtime_names.js` → `DEFAULT_AUTO_START_TEXT`.

## Mandatory command semantics

- A command boundary is an envelope, not an assistant response, Markdown code block, or Manual UI capture.
- API envelope: `OZON_API_V1` + the next JSON object with top-level `operation` and `params` only.
- HELP envelope: `OZON_HELP_V2` + the next JSON object containing `cluster` and optional `section`; V1 remains compatibility fallback.
- Multiple independent API and HELP envelopes may coexist in one assistant response and are processed sequentially in source order.
- HELP is local guidance: `external_request_executed=false`, `physical_business_request_count=0`.
- One explicit API command creates at most one physical provider business request.
- Hidden retry, automatic pagination, polling and fan-out are forbidden.
- Dependent workflows are never pre-batched. `code`, `file_ref`, `cursor`, `offset`, `last_id`, `page` and other opaque dependencies must come fresh from the immediately relevant prior result.
- Transport/auth fields are not supplied by the assistant.
- Bridge operations are read-only; privacy and entitlement blocks fail closed.
- After each result, analyze evidence before producing the next read. When no further Ozon read is needed, answer `сбор закончен.`

## Runtime prompt synchronization rule

This document is a human-readable authority mirror. The text actually injected into a new AI work session remains `OzonRuntime.DEFAULT_AUTO_START_TEXT`; CI must reject drift that removes the command-boundary, mixed HELP/API, zero-provider HELP, fresh-dependency, or no-hidden-request rules.
'''

response_forms_doc = r'''# BRIDGE_RESPONSE_FORMS_CURRENT

Status: CURRENT response/envelope authority for Ozon Seller Bridge.

## Source and envelope boundaries

A code block is not a command boundary. An assistant response is not a command boundary. Manual UI capture is not a command boundary. The parser discovers explicit envelopes from admitted source text and preserves source order.

### API envelope

```text
OZON_API_V1
{"operation":"allowed_alias","params":{}}
```

One explicit API envelope may cause at most one physical Ozon business request. No hidden retry, pagination, polling or fan-out.

### HELP envelope

```text
OZON_HELP_V2
{"cluster":"stocks_inventory"}
```

HELP is resolved locally. It contributes zero physical provider business requests.

### HELP + API in the same assistant response

```text
OZON_HELP_V2
{"cluster":"finance"}

OZON_API_V1
{"operation":"seller_product_list","params":{"filter":{},"limit":1}}
```

HELP and API may appear in the same assistant response. They enter one typed ordered batch and are processed in source order. A malformed envelope becomes a local/pre-execution error for that envelope and must not erase later independent envelopes.

## Result forms

- `OZON_GUIDANCE_RESULT_V2`: local guidance result; no provider business request.
- `OZON_RESULT_V1`: one logical API result.
- `OZON_BATCH_RESULT_V1`: ordered aggregate of admitted batch entries/results. Batch result cardinality is not provider-request cardinality.

Accounting must expose logical and physical work separately. `N` explicit independent API commands imply at most `N` physical business requests. HELP entries do not increase that physical count.

## Dependent chains

A chain such as `create → fresh code → info → fresh file_ref → file_get` is emitted step by step. Never reconstruct, reuse from an unrelated chain, or pre-invent opaque dependencies.

## Delivery forms

- Small complete generated result → ordinary text.
- Large complete generated result → complete generated text attachment plus short marker.
- Original provider file → original provider bytes as attachment; do not substitute generated text and do not expose raw base64 in the ordinary result.
'''

report_format_doc = r'''# AI_TEST_REPORT_FORMAT_CURRENT

Status: CURRENT mandatory reporting contract for Ozon Bridge business tests and executable repairs.

## 1. Identity

Record repository, branch, base authority, source commit/tree, exact artifact name/bytes/SHA-256, CI run, runtime version and whether the report is pre-handoff or live evidence.

## 2. What / how / why

State the business or defect objective, exact test path, why it matters to product value, PASS criteria, actual result, what remains unproven, and the next action.

## 3. Request truth and accounting

For every provider-facing command record exact envelope/fingerprint where permitted, request ID, HTTP/provider verdict, `external_request_executed`, logical result count, physical business request count, `exact_request_preserved`, `command_transformed`, pagination/retry metadata and any opaque dependency provenance.

## 4. Dependency audit

For every changed behavior trace: producer → normalization → validation → branches → all readers/consumers → state/storage → recovery/lifecycle → module boundaries → permissions/policy/entitlement → planning → transport/request → parsing/transformation → output → redaction/security → accounting → tests → packaged runtime → live workflow.

Required totals: `unaccounted_dependencies=0`, `stale_assumptions=0`, `available_but_unverified_dependencies=0` for a pre-handoff PASS. Do not stop at the first root cause; include secondary sweep and closed-set audit.

## 5. Status vocabulary

Use only evidence-supported states: `PASS`, `FAIL`, `BLOCKED`, `NOT RUN`, `PENDING POST-INSTALL`. Never report planned or unexecuted work as completed. `PRE-HANDOFF PASS` is not `LIVE PASS`.

## 6. Patch gates

Report every gate individually:

- `GATE-01` explicit operator authorization.
- `GATE-02` prior live/evidence state correctly closed or frozen.
- `GATE-03` exact repair scope/diff identified.
- `GATE-04` no hidden/out-of-scope changes or unauthorized ref mutation.
- `GATE-05` failing workflow reconstructed end-to-end.
- `GATE-06` diagnosis continued after first root cause.
- `GATE-07` complete dependency/state inventory.
- `GATE-08` each dependency traced to terminal behavior/test.
- `GATE-09` repair aligned with existing architecture.
- `GATE-10` provider/account blockers not mislabeled as Bridge defects.
- `GATE-11` durability/fail-closed semantics classified.
- `GATE-12` lifecycle recreation covered when state crosses lifecycle boundaries.
- `GATE-13` same-instance testing is not the sole evidence when lifecycle matters.
- `GATE-14` positive flow uses fresh real dependencies.
- `GATE-15` stale/unknown/malformed/expired dependencies fail closed.
- `GATE-16` browser/MV3 boundary covered.
- `GATE-17` manifest/runtime/network permission parity.
- `GATE-18` exact installable artifact verified.
- `GATE-19` post-build executable changes invalidate old package evidence.
- `GATE-20` exact/transformed request semantics truthful.
- `GATE-21` logical/physical/external accounting truthful.
- `GATE-22` no hidden retry/duplicate/refetch/provider requests.
- `GATE-23` positive and negative controls.
- `GATE-24` entitlement fail-honest.
- `GATE-25` privacy/personal-data policy preserved.
- `GATE-26` provenance preserved.
- `GATE-27` redaction preserved.
- `GATE-28` protected URL/base64/credential/raw-data leakage absent.
- `GATE-29` trusted-host/HTTPS/SSRF/credential boundaries preserved.
- `GATE-30` targeted regression for the new defect.
- `GATE-31` regressions for intersecting prior repairs.
- `GATE-32` fullest available deterministic product-flow reproduction.
- `GATE-33` no stale/fabricated success dependencies.
- `GATE-34` no undeclared provider-side mutation.
- `GATE-35` full green run after the last executable change.

## 7. Live gates

Always report `LIVE-GATE-01` through `LIVE-GATE-05` with actual state. A genuinely live-only check that has not occurred is `PENDING POST-INSTALL`, never `PASS`.
'''

(ROOT / "START_PROMPT_CURRENT.md").write_text(start_prompt_doc, encoding="utf-8")
(ROOT / "BRIDGE_RESPONSE_FORMS_CURRENT.md").write_text(response_forms_doc, encoding="utf-8")
(ROOT / "AI_TEST_REPORT_FORMAT_CURRENT.md").write_text(report_format_doc, encoding="utf-8")

final_worker = WORKER.read_text(encoding="utf-8")
if "MIXED_HELP_AND_API" in final_worker:
    fail("blanket mixed HELP/API rejection remains")
if final_worker.count("OzonMixedBatchDiscovery.discover(source") != 1:
    fail("ordered mixed discovery call cardinality is not 1")
if ENTRY.read_text(encoding="utf-8").count(helper_import) != 1:
    fail("bootstrap helper import cardinality is not 1")

print(f"BASE_AUTHORITY={BASE_AUTHORITY}")
print(f"BASE_WORKER_BLOB={BASE_WORKER_BLOB}")
print(f"MATERIALIZATION_STATE={'ALREADY_MATERIALIZED' if already_materialized else 'PATCHED'}")
print("MIXED_HELP_API_MATERIALIZE_PASS")
