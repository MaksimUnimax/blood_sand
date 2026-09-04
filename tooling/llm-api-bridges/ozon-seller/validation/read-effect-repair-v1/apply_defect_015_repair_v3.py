#!/usr/bin/env python3
from pathlib import Path

v1 = Path(__file__).with_name("apply_defect_015_repair.py")
source = v1.read_text(encoding="utf-8")
replacements = [
    (
        "return compiled.sub(replacement, text, count=1)",
        "return compiled.sub(lambda _: replacement, text, count=1)",
    ),
    (
        'anchor = "  const IMPLEMENTATION_BINDINGS = deepFreeze({"',
        'anchor = "  const IMPLEMENTATION_BINDINGS = Object.freeze({"',
    ),
    (
        "r'execution_enabled: (?:true|false), currentness: \"[^\"]+\"',",
        "r'execution_enabled: (?:true|false),\\s*currentness: \"[^\"]+\"',",
    ),
    (
        'text = replace_once(text, "JSON.parse(JSON.stringify(operations[alias].template))", "commandFor(alias)", "e2e alias command fixture")',
        'text = text.replace("JSON.parse(JSON.stringify(operations[alias].template))", "commandFor(alias)")',
    ),
]
for old, new in replacements:
    count = source.count(old)
    if count != 1:
        raise RuntimeError(f"expected exactly one applicator patch site for {old!r}, got {count}")
    source = source.replace(old, new, 1)
namespace = {"__name__": "__main__", "__file__": str(v1)}
exec(compile(source, str(v1), "exec"), namespace, namespace)

gate = Path(__file__).with_name("run_defect_015_date_repair_gate.mjs")
gate_text = gate.read_text(encoding="utf-8")
old = "registry.OPERATIONS.fbs_stock_by_warehouse_v2.execution_enabled"
new = "registry.OPERATIONS.fbs_stock_by_warehouse.execution_enabled"
if old in gate_text:
    gate_text = gate_text.replace(old, new, 1)
elif new not in gate_text:
    raise RuntimeError("DEFECT-015 gate FBS stock replacement assertion not found")
gate.write_text(gate_text, encoding="utf-8", newline="\n")
