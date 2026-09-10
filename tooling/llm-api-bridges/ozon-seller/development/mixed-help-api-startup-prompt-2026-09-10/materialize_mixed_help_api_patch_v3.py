#!/usr/bin/env python3
from __future__ import annotations

import json
import pathlib
import subprocess
import sys

ROOT = pathlib.Path(__file__).resolve().parents[2]
DIST = ROOT / "dist-step7-candidate"
RUNTIME = DIST / "shared" / "runtime_names.js"
WORKER = DIST / "service_worker.js"
ENTRY = DIST / "service_worker_entry.js"
HELPER = DIST / "shared" / "mixed_batch_discovery.js"
V2 = pathlib.Path(__file__).with_name("materialize_mixed_help_api_patch_v2.py")


def fail(message: str) -> None:
    raise SystemExit(f"MIXED_HELP_API_MATERIALIZE_V3_FAIL: {message}")


subprocess.run([sys.executable, str(V2)], check=True)

runtime = RUNTIME.read_text(encoding="utf-8")
needle = "Если точная API-команда не ясна, используй guidance:"
lines = runtime.splitlines(keepends=True)
matches = [index for index, line in enumerate(lines) if needle in line]
if len(matches) != 1:
    fail(f"startup HELP line cardinality is {len(matches)}, expected 1")

message = (
    'Если точная API-команда не ясна, используй guidance: OZON_HELP_V2 вида '
    '{"cluster":"cluster_id"} или {"cluster":"cluster_id","section":"section_id"}. '
    'Guidance может быть отдельным envelope в том же ответе рядом с независимыми API-envelope.'
)
index = matches[0]
newline = "\r\n" if lines[index].endswith("\r\n") else "\n"
lines[index] = "    " + json.dumps(message, ensure_ascii=False) + "," + newline
RUNTIME.write_text("".join(lines), encoding="utf-8")

runtime = RUNTIME.read_text(encoding="utf-8")
if '\n    \\"Если точная API-команда' in runtime:
    fail("escaped source quote remains before startup HELP string")
for required in [
    "Граница команды — envelope",
    "OZON_HELP_V2 и OZON_API_V1 могут находиться в одном ответе",
    "HELP обрабатывается локально и не выполняет provider business request",
    "Зависимые цепочки нельзя заранее батчить",
    "используй только свежий code, file_ref, cursor",
    "Polling также не запускается скрыто",
]:
    if required not in runtime:
        fail(f"required startup rule missing after syntax-safe rewrite: {required}")
if "Выбирай их отдельной новой командой OZON_HELP_V2" in runtime:
    fail("stale HELP separate-only wording remains")

worker = WORKER.read_text(encoding="utf-8")
entry = ENTRY.read_text(encoding="utf-8")
if "MIXED_HELP_AND_API" in worker:
    fail("blanket mixed rejection remains")
if worker.count("OzonMixedBatchDiscovery.discover(source") != 1:
    fail("ordered mixed discovery call cardinality is not 1")
if entry.count('importScripts("shared/mixed_batch_discovery.js");') != 1:
    fail("mixed helper bootstrap import cardinality is not 1")
if entry.index('importScripts("shared/mixed_batch_discovery.js");') > entry.index('importScripts("service_worker.js");'):
    fail("mixed helper loads after service worker")

for script in [WORKER, ENTRY, RUNTIME, HELPER]:
    subprocess.run(["node", "--check", str(script)], check=True)

print("START_PROMPT_SYNTAX_SAFE_REWRITE_PASS")
print("PRODUCTION_JS_TARGET_SYNTAX_PASS")
print("MIXED_HELP_API_MATERIALIZE_V3_PASS")
