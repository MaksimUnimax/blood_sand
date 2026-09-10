#!/usr/bin/env python3
from __future__ import annotations

import pathlib
import subprocess
import sys

ROOT = pathlib.Path(__file__).resolve().parents[2]
DIST = ROOT / "dist-step7-candidate"
WORKER = DIST / "service_worker.js"
V3 = pathlib.Path(__file__).with_name("materialize_mixed_help_api_patch_v3.py")
BASE_WORKER_BLOB = "ec988889597ad4df50c07006bc855ad32028fb10"


def fail(message: str) -> None:
    raise SystemExit(f"MIXED_HELP_API_MATERIALIZE_V4_FAIL: {message}")


def git_blob(path: pathlib.Path) -> str:
    return subprocess.check_output(["git", "hash-object", str(path)], text=True).strip()


def function_span(source: str, function_name: str) -> tuple[int, int]:
    marker = f"function {function_name}("
    starts = []
    cursor = 0
    while True:
        index = source.find(marker, cursor)
        if index < 0:
            break
        starts.append(index)
        cursor = index + len(marker)
    if len(starts) != 1:
        fail(f"{function_name}: expected exactly one definition, found {len(starts)}")
    start = starts[0]
    brace = source.find("{", start + len(marker))
    if brace < 0:
        fail(f"{function_name}: opening brace missing")

    depth = 0
    quote = None
    escaped = False
    line_comment = False
    block_comment = False
    index = brace
    while index < len(source):
        char = source[index]
        nxt = source[index + 1] if index + 1 < len(source) else ""
        if line_comment:
            if char == "\n":
                line_comment = False
            index += 1
            continue
        if block_comment:
            if char == "*" and nxt == "/":
                block_comment = False
                index += 2
                continue
            index += 1
            continue
        if quote is not None:
            if escaped:
                escaped = False
            elif char == "\\":
                escaped = True
            elif char == quote:
                quote = None
            index += 1
            continue
        if char == "/" and nxt == "/":
            line_comment = True
            index += 2
            continue
        if char == "/" and nxt == "*":
            block_comment = True
            index += 2
            continue
        if char in ('"', "'", "`"):
            quote = char
            index += 1
            continue
        if char == "{":
            depth += 1
        elif char == "}":
            depth -= 1
            if depth == 0:
                return start, index + 1
            if depth < 0:
                fail(f"{function_name}: negative brace depth")
        index += 1
    fail(f"{function_name}: unterminated function")


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
}'''

worker = WORKER.read_text(encoding="utf-8")
materialized = "OzonMixedBatchDiscovery.discover(source" in worker and "MIXED_HELP_AND_API" not in worker
if not materialized:
    actual = git_blob(WORKER)
    if actual != BASE_WORKER_BLOB:
        fail(f"service_worker.js base blob drift: expected {BASE_WORKER_BLOB}, got {actual}")
    if worker.count('code: "MIXED_HELP_AND_API"') != 1:
        fail("expected exactly one blanket MIXED_HELP_AND_API rejection")
    start, end = function_span(worker, "discoverBatchEntries")
    worker = worker[:start] + replacement + worker[end:]
    old_global = "OzonContract, OzonGuidance, OzonWorkSessionModel"
    if worker.count(old_global) != 1:
        fail(f"worker global dependency anchor cardinality is {worker.count(old_global)}, expected 1")
    worker = worker.replace(old_global, "OzonContract, OzonGuidance, OzonMixedBatchDiscovery, OzonWorkSessionModel", 1)
    WORKER.write_text(worker, encoding="utf-8")

worker = WORKER.read_text(encoding="utf-8")
if "MIXED_HELP_AND_API" in worker:
    fail("blanket mixed rejection remains after structural replacement")
if worker.count("OzonMixedBatchDiscovery.discover(source") != 1:
    fail("ordered mixed discovery call cardinality is not 1")
start, end = function_span(worker, "discoverBatchEntries")
function_text = worker[start:end]
for token in ["item.kind === \"api\"", "batchEntryFromDiscovery(item.discovery)", "kind: \"guidance\"", "external_request_executed: false"]:
    if token not in function_text:
        fail(f"materialized discoverBatchEntries missing token: {token}")

# v3 now sees an already-materialized worker and safely handles entry, startup prompt,
# authority docs, and final production-JS syntax checks without relying on the obsolete
# discoverBatchEntries textual end anchor in v2.
subprocess.run([sys.executable, str(V3)], check=True)

print("STRUCTURAL_FUNCTION_REPLACEMENT_PASS")
print("MIXED_HELP_API_MATERIALIZE_V4_PASS")
