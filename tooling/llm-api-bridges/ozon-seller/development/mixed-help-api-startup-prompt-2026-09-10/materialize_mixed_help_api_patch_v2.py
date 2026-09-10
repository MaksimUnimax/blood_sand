#!/usr/bin/env python3
from __future__ import annotations

import pathlib
import subprocess

BASE_AUTHORITY = "572f0b66dd09ce3441f2b96270c5cae864da490b"
BASE_WORKER_BLOB = "ec988889597ad4df50c07006bc855ad32028fb10"
BASE_ENTRY_BLOB = "c225dc2ea73faf1f087064bb492307ab0778af3a"
BASE_RUNTIME_BLOB = "cb1cf684f71974a26b9f3b745c986786f2cd3221"

ROOT = pathlib.Path(__file__).resolve().parents[2]
DIST = ROOT / "dist-step7-candidate"
WORKER = DIST / "service_worker.js"
ENTRY = DIST / "service_worker_entry.js"
RUNTIME = DIST / "shared" / "runtime_names.js"
HELPER = DIST / "shared" / "mixed_batch_discovery.js"


def fail(message: str) -> None:
    raise SystemExit(f"MIXED_HELP_API_MATERIALIZE_V2_FAIL: {message}")


def git_blob(path: pathlib.Path) -> str:
    return subprocess.check_output(["git", "hash-object", str(path)], text=True).strip()


def require_base_blob(path: pathlib.Path, expected: str, label: str) -> None:
    actual = git_blob(path)
    if actual != expected:
        fail(f"{label} base blob drift: expected {expected}, got {actual}")


def replace_once(text: str, old: str, new: str, label: str) -> str:
    count = text.count(old)
    if count != 1:
        fail(f"{label}: expected exactly one old fragment, found {count}")
    return text.replace(old, new, 1)


def replace_line_once(text: str, needle: str, replacement_lines: list[str], label: str) -> str:
    lines = text.splitlines(keepends=True)
    matches = [idx for idx, line in enumerate(lines) if needle in line]
    if len(matches) != 1:
        fail(f"{label}: expected exactly one line containing {needle!r}, found {len(matches)}")
    idx = matches[0]
    newline = "\r\n" if lines[idx].endswith("\r\n") else "\n"
    rendered = "".join(line + newline for line in replacement_lines)
    lines[idx] = rendered
    return "".join(lines)


for required in [WORKER, ENTRY, RUNTIME, HELPER]:
    if not required.exists():
        fail(f"required file missing: {required.relative_to(ROOT)}")

worker = WORKER.read_text(encoding="utf-8")
worker_materialized = "OzonMixedBatchDiscovery.discover(source" in worker and "MIXED_HELP_AND_API" not in worker
if not worker_materialized:
    require_base_blob(WORKER, BASE_WORKER_BLOB, "service_worker.js")
    if worker.count('code: "MIXED_HELP_AND_API"') != 1:
        fail("expected exactly one blanket MIXED_HELP_AND_API rejection before repair")
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
        "OzonContract, OzonGuidance, OzonWorkSessionModel",
        "OzonContract, OzonGuidance, OzonMixedBatchDiscovery, OzonWorkSessionModel",
        "worker global dependency declaration",
    )
    WORKER.write_text(worker, encoding="utf-8")

worker = WORKER.read_text(encoding="utf-8")
if "MIXED_HELP_AND_API" in worker:
    fail("blanket mixed rejection remains after worker materialization")
if worker.count("OzonMixedBatchDiscovery.discover(source") != 1:
    fail("ordered mixed discovery call cardinality is not 1")
if worker.count("OzonMixedBatchDiscovery") < 2:
    fail("worker global declaration/call did not materialize")

entry = ENTRY.read_text(encoding="utf-8")
helper_import = 'importScripts("shared/mixed_batch_discovery.js");'
if helper_import not in entry:
    require_base_blob(ENTRY, BASE_ENTRY_BLOB, "service_worker_entry.js")
    entry = replace_once(
        entry,
        'importScripts("shared/ai_delivery_capabilities.js");\nimportScripts("service_worker.js");',
        'importScripts("shared/ai_delivery_capabilities.js");\nimportScripts("shared/mixed_batch_discovery.js");\nimportScripts("service_worker.js");',
        "service worker bootstrap import",
    )
    ENTRY.write_text(entry, encoding="utf-8")
entry = ENTRY.read_text(encoding="utf-8")
if entry.count(helper_import) != 1:
    fail("mixed discovery helper bootstrap cardinality is not 1")
if entry.index(helper_import) > entry.index('importScripts("service_worker.js");'):
    fail("mixed discovery helper loads after service worker")

runtime = RUNTIME.read_text(encoding="utf-8")
if "Граница команды — envelope" not in runtime:
    require_base_blob(RUNTIME, BASE_RUNTIME_BLOB, "runtime_names.js")
    original_api_line = next((line for line in runtime.splitlines() if "Для запроса данных напиши: OZON_API_V1" in line), None)
    if original_api_line is None:
        fail("startup API command line anchor missing")
    runtime = replace_line_once(
        runtime,
        "Для запроса данных напиши: OZON_API_V1",
        [
            original_api_line,
            '    "Граница команды — envelope: OZON_API_V1 плюс следующий JSON-объект. Assistant response, Markdown code block и Manual UI capture не являются границей команды.",',
            '    "В одном ответе могут находиться несколько независимых command envelopes; OZON_HELP_V2 и OZON_API_V1 могут находиться в одном ответе и обрабатываются последовательно в исходном порядке.",',
            '    "HELP обрабатывается локально и не выполняет provider business request; физические business requests создают только допущенные OZON_API_V1 команды.",',
        ],
        "startup command-envelope rules",
    )
    runtime = replace_line_once(
        runtime,
        "Если точная команда не ясна, используй guidance.",
        [
            r'    "Если точная API-команда не ясна, используй guidance: OZON_HELP_V2 вида {\"cluster\":\"cluster_id\"} или {\"cluster\":\"cluster_id\",\"section\":\"section_id\"}. Guidance может быть отдельным envelope в том же ответе рядом с независимыми API-envelope.",'
        ],
        "startup HELP wording",
    )
    original_request_line = next((line for line in runtime.splitlines() if "Одна OZON_API_V1 команда создаёт не более одного business request" in line), None)
    if original_request_line is None:
        fail("startup one-command/one-request line anchor missing")
    runtime = replace_line_once(
        runtime,
        "Одна OZON_API_V1 команда создаёт не более одного business request",
        [
            original_request_line,
            '    "Зависимые цепочки нельзя заранее батчить: следующий envelope формируй только после фактического результата предыдущего и используй только свежий code, file_ref, cursor, offset, last_id, page или другой opaque value из этой цепочки.",',
            '    "Polling также не запускается скрыто: если нужен новый read, он должен быть новой явной командой.",',
        ],
        "startup dependent-chain rules",
    )
    RUNTIME.write_text(runtime, encoding="utf-8")

runtime = RUNTIME.read_text(encoding="utf-8")
for required_phrase in [
    "Граница команды — envelope",
    "OZON_HELP_V2 и OZON_API_V1 могут находиться в одном ответе",
    "HELP обрабатывается локально и не выполняет provider business request",
    "Зависимые цепочки нельзя заранее батчить",
    "используй только свежий code, file_ref, cursor",
    "Polling также не запускается скрыто",
]:
    if required_phrase not in runtime:
        fail(f"runtime startup rule missing: {required_phrase}")
if "Выбирай их отдельной новой командой OZON_HELP_V2" in runtime:
    fail("stale HELP-separate-only wording remains")

(ROOT / "START_PROMPT_CURRENT.md").write_text("""# START_PROMPT_CURRENT\n\nStatus: CURRENT runtime authority mirror for Ozon Seller Bridge v0.1.19 candidate.\nExecutable authority: `dist-step7-candidate/shared/runtime_names.js` → `DEFAULT_AUTO_START_TEXT`.\n\n## Mandatory semantics\n\n- Command boundary is an envelope, not an assistant response, Markdown code block, or Manual UI capture.\n- API envelope is `OZON_API_V1` plus the next JSON object with top-level `operation` and `params` only.\n- HELP envelope is `OZON_HELP_V2` plus the next JSON object containing `cluster` and optional `section`; V1 is compatibility fallback.\n- Multiple independent API and HELP envelopes may coexist in one assistant response and are processed sequentially in source order.\n- HELP is local guidance: `external_request_executed=false`, `physical_business_request_count=0`.\n- One explicit API command creates at most one physical provider business request.\n- Hidden retry, automatic pagination, polling and fan-out are forbidden.\n- Dependent workflows are never pre-batched. `code`, `file_ref`, `cursor`, `offset`, `last_id`, `page` and other opaque dependencies must come fresh from the immediately relevant prior result.\n- Transport/auth fields are not supplied by the assistant.\n- Bridge operations are read-only; privacy and entitlement blocks fail closed.\n- After each result, analyze evidence before producing the next read. When no further Ozon read is needed, answer `сбор закончен.`\n\nCI must reject drift between this mirror and the executable startup prompt for the envelope-boundary, mixed HELP/API, HELP-zero-provider, fresh-dependency and no-hidden-request rules.\n""", encoding="utf-8")

(ROOT / "BRIDGE_RESPONSE_FORMS_CURRENT.md").write_text("""# BRIDGE_RESPONSE_FORMS_CURRENT\n\nStatus: CURRENT Ozon Seller Bridge response/envelope authority.\n\n## Source and envelope boundaries\n\nA code block is not a command boundary. An assistant response is not a command boundary. Manual UI capture is not a command boundary. The parser discovers explicit envelopes from admitted source text and preserves source order.\n\n### API envelope\n\n```text\nOZON_API_V1\n{\"operation\":\"allowed_alias\",\"params\":{}}\n```\n\nOne explicit API envelope may cause at most one physical Ozon business request. No hidden retry, pagination, polling or fan-out.\n\n### HELP envelope\n\n```text\nOZON_HELP_V2\n{\"cluster\":\"stocks_inventory\"}\n```\n\nHELP is resolved locally and contributes zero physical provider business requests.\n\n### HELP and API in the same assistant response\n\n```text\nOZON_HELP_V2\n{\"cluster\":\"finance\"}\n\nOZON_API_V1\n{\"operation\":\"seller_product_list\",\"params\":{\"filter\":{},\"limit\":1}}\n```\n\nHELP and API may coexist in the same assistant response. They enter one typed ordered batch and are processed in source order. A malformed envelope becomes a local/pre-execution error for that envelope and must not erase later independent envelopes.\n\n## Result and accounting forms\n\n- `OZON_GUIDANCE_RESULT_V2`: local guidance result; no provider business request.\n- `OZON_RESULT_V1`: one logical API result.\n- `OZON_BATCH_RESULT_V1`: ordered aggregate; aggregate cardinality is not provider-request cardinality.\n\nLogical and physical work are reported separately. `N` explicit independent API commands imply at most `N` physical business requests. HELP entries do not increase the physical count.\n\n## Dependent chains\n\nA chain such as `create → fresh code → info → fresh file_ref → file_get` is emitted step by step. Never reconstruct, reuse from an unrelated chain, or pre-invent opaque dependencies.\n\n## Delivery forms\n\n- Small complete generated result → ordinary text.\n- Large complete generated result → complete generated-text attachment plus short marker.\n- Original provider file → original provider bytes as attachment; do not substitute generated text and do not expose raw base64 in the ordinary result.\n""", encoding="utf-8")

(ROOT / "AI_TEST_REPORT_FORMAT_CURRENT.md").write_text("""# AI_TEST_REPORT_FORMAT_CURRENT\n\nStatus: CURRENT mandatory reporting contract for Ozon Bridge business tests and executable repairs.\n\n## Required report sections\n\n1. Identity: repository, branch, base authority, exact source commit/tree, exact artifact name/bytes/SHA-256, CI run, runtime version, pre-handoff/live status.\n2. What / how / why: exact business or defect objective, path, product-value reason, PASS criteria, actual result, remaining unknowns, next action.\n3. Request truth/accounting: exact envelope/fingerprint where permitted, request ID, HTTP/provider verdict, `external_request_executed`, logical result count, physical business request count, exact/transformed metadata, pagination/retry metadata and opaque-dependency provenance.\n4. Dependency audit: producer → normalization → validation → branches → all readers/consumers → state/storage → recovery/lifecycle → module boundaries → permissions/policy/entitlement → planning → transport/request → parsing/transformation → output → redaction/security → accounting → tests → packaged runtime → live workflow.\n5. Secondary sweep and closed-set audit after the first confirmed root cause.\n6. Totals required for pre-handoff PASS: `unaccounted_dependencies=0`, `stale_assumptions=0`, `available_but_unverified_dependencies=0`.\n7. Evidence-only statuses: `PASS`, `FAIL`, `BLOCKED`, `NOT RUN`, `PENDING POST-INSTALL`. Planned work is never reported as complete. `PRE-HANDOFF PASS` is not `LIVE PASS`.\n\n## GATE-01 through GATE-35\n\n- GATE-01 explicit operator authorization.\n- GATE-02 prior live/evidence state correctly closed or frozen.\n- GATE-03 exact repair scope/diff identified.\n- GATE-04 no hidden/out-of-scope changes or unauthorized ref mutation.\n- GATE-05 failing workflow reconstructed end-to-end.\n- GATE-06 diagnosis continued after first root cause.\n- GATE-07 complete dependency/state inventory.\n- GATE-08 each dependency traced to terminal behavior/test.\n- GATE-09 repair aligned with existing architecture.\n- GATE-10 provider/account blockers not mislabeled as Bridge defects.\n- GATE-11 durability/fail-closed semantics classified.\n- GATE-12 lifecycle recreation covered when state crosses lifecycle boundaries.\n- GATE-13 same-instance testing is not sole evidence when lifecycle matters.\n- GATE-14 positive flow uses fresh real dependencies.\n- GATE-15 stale/unknown/malformed/expired dependencies fail closed.\n- GATE-16 browser/MV3 boundary covered.\n- GATE-17 manifest/runtime/network permission parity.\n- GATE-18 exact installable artifact verified.\n- GATE-19 post-build executable changes invalidate old package evidence.\n- GATE-20 exact/transformed request semantics truthful.\n- GATE-21 logical/physical/external accounting truthful.\n- GATE-22 no hidden retry/duplicate/refetch/provider requests.\n- GATE-23 positive and negative controls.\n- GATE-24 entitlement fail-honest.\n- GATE-25 privacy/personal-data policy preserved.\n- GATE-26 provenance preserved.\n- GATE-27 redaction preserved.\n- GATE-28 protected URL/base64/credential/raw-data leakage absent.\n- GATE-29 trusted-host/HTTPS/SSRF/credential boundaries preserved.\n- GATE-30 targeted regression for the new defect.\n- GATE-31 regressions for intersecting prior repairs.\n- GATE-32 fullest available deterministic product-flow reproduction.\n- GATE-33 no stale/fabricated success dependencies.\n- GATE-34 no undeclared provider-side mutation.\n- GATE-35 full green run after the last executable change.\n\n## LIVE-GATE-01 through LIVE-GATE-05\n\nAlways report LIVE-GATE-01, LIVE-GATE-02, LIVE-GATE-03, LIVE-GATE-04 and LIVE-GATE-05 individually. Any genuinely live-only check not yet executed is `PENDING POST-INSTALL`, never `PASS`.\n""", encoding="utf-8")

for doc in ["START_PROMPT_CURRENT.md", "BRIDGE_RESPONSE_FORMS_CURRENT.md", "AI_TEST_REPORT_FORMAT_CURRENT.md"]:
    target = ROOT / doc
    if not target.exists() or not target.read_text(encoding="utf-8").strip():
        fail(f"authority document missing/empty: {doc}")

print(f"BASE_AUTHORITY={BASE_AUTHORITY}")
print(f"BASE_WORKER_BLOB={BASE_WORKER_BLOB}")
print(f"BASE_ENTRY_BLOB={BASE_ENTRY_BLOB}")
print(f"BASE_RUNTIME_BLOB={BASE_RUNTIME_BLOB}")
print(f"WORKER_STATE={'ALREADY_MATERIALIZED' if worker_materialized else 'PATCHED'}")
print("MIXED_HELP_API_MATERIALIZE_V2_PASS")
