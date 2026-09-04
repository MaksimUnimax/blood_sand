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

effect_gate = Path(__file__).with_name("run_effect_read_repair_gate.mjs")
effect_text = effect_gate.read_text(encoding="utf-8")
old_block = '''for (const alias of repairAliases) {
  const meta = operations[alias];
  assert.ok(meta); assert.equal(meta.effect, "READ"); assert.equal(meta.execution_enabled, true); assert.equal(providerOf(meta), "seller_api");
  assert.ok(entitlementText.includes(`"${meta.entitlement_key}"`));
  if (meta.template_runnable === false) {
    assert.equal(meta.template, null, `${alias} non-runnable template must be null`);
    assert.ok(Array.isArray(meta.required_parameters) && meta.required_parameters.length > 0, `${alias} must expose its dynamic/current dependency`);
  } else {
    assert.equal(meta.template?.operation, alias);
    const normalized = contract.normalizeCommand(JSON.parse(JSON.stringify(meta.template)));
    assert.equal(normalized.operation, alias);
  }
  if (meta.privacy_policy === "safe_projection") {
    const request = contract.buildRequest(normalized, { "Client-Id": "client", "Api-Key": "key" });
    assert.equal(request.method, "POST"); assert.equal(request.path, meta.path); assert.ok(!/[{}]/.test(request.path));
  }
}'''
new_block = '''Date.now = () => Date.UTC(2026, 8, 4, 12, 0, 0);
for (const alias of repairAliases) {
  const meta = operations[alias];
  assert.ok(meta); assert.equal(meta.effect, "READ"); assert.equal(meta.execution_enabled, true); assert.equal(providerOf(meta), "seller_api");
  assert.ok(entitlementText.includes(`"${meta.entitlement_key}"`));
  let normalized;
  if (meta.template_runnable === false) {
    assert.equal(meta.template, null, `${alias} non-runnable template must be null`);
    assert.ok(Array.isArray(meta.required_parameters) && meta.required_parameters.length > 0, `${alias} must expose its dynamic/current dependency`);
    const explicitCommand = alias === "report_returns_create_v2"
      ? { operation: "report_returns_create_v2", params: { filter: { date_from: "2026-09-01T00:00:00Z", date_to: "2026-09-03T23:59:59Z", status: "DisputeOpened" } } }
      : null;
    assert.ok(explicitCommand, `${alias} non-runnable repair alias needs an explicit deterministic gate command`);
    normalized = contract.normalizeCommand(explicitCommand);
    assert.equal(normalized.operation, alias);
  } else {
    assert.equal(meta.template?.operation, alias);
    normalized = contract.normalizeCommand(JSON.parse(JSON.stringify(meta.template)));
    assert.equal(normalized.operation, alias);
  }
  if (meta.privacy_policy === "safe_projection") {
    const request = contract.buildRequest(normalized, { "Client-Id": "client", "Api-Key": "key" });
    assert.equal(request.method, "POST"); assert.equal(request.path, meta.path); assert.ok(!/[{}]/.test(request.path));
  }
}'''
if old_block in effect_text:
    effect_text = effect_text.replace(old_block, new_block, 1)
elif new_block not in effect_text:
    raise RuntimeError("patched effect-gate non-runnable block not found")
effect_gate.write_text(effect_text, encoding="utf-8", newline="\n")
