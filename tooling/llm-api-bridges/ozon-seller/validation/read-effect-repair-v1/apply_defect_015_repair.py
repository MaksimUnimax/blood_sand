#!/usr/bin/env python3
from __future__ import annotations

import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[5]
PROJECT = ROOT / "tooling" / "llm-api-bridges" / "ozon-seller"
SHARED = PROJECT / "dist-step7-candidate" / "shared"
CONTRACT = SHARED / "ozon_contract.js"
REGISTRY = SHARED / "ozon_operation_registry.js"
BUNDLE = PROJECT / "dist" / "ozon-seller-mcp-nodebundle.js"
VALIDATION = PROJECT / "validation" / "read-effect-repair-v1"


def read(path: Path) -> str:
    return path.read_text(encoding="utf-8")


def write(path: Path, text: str) -> None:
    path.write_text(text, encoding="utf-8", newline="\n")


def replace_once(text: str, old: str, new: str, label: str) -> str:
    if new in text:
        return text
    count = text.count(old)
    if count != 1:
        raise RuntimeError(f"{label}: expected exactly one old fragment, got {count}")
    return text.replace(old, new, 1)


def regex_replace_once(text: str, pattern: str, replacement: str, label: str, flags: int = 0) -> str:
    compiled = re.compile(pattern, flags)
    matches = list(compiled.finditer(text))
    if len(matches) != 1:
        raise RuntimeError(f"{label}: expected exactly one match, got {len(matches)}")
    return compiled.sub(replacement, text, count=1)


def operation_block(text: str, alias: str) -> tuple[int, int, str]:
    marker = f"\n    {alias}: {{\n"
    start = text.find(marker)
    if start < 0:
        raise RuntimeError(f"registry operation not found: {alias}")
    start += 1
    next_match = re.search(r"\n    [a-z][a-z0-9_]*: \{\n", text[start + len(alias) + 7 :])
    if next_match:
        end = start + len(alias) + 7 + next_match.start() + 1
    else:
        end_marker = "\n  });\n\n  function canonicalClusterId"
        end = text.find(end_marker, start)
        if end < 0:
            raise RuntimeError(f"cannot locate registry operation end: {alias}")
    return start, end, text[start:end]


def edit_operation(text: str, alias: str, editor) -> str:
    start, end, block = operation_block(text, alias)
    new_block = editor(block)
    if new_block == block:
        return text
    return text[:start] + new_block + text[end:]


def set_template(block: str, value: str) -> str:
    if value in block:
        return block
    block, count = re.subn(r"template: [^\n]+", value, block, count=1)
    if count != 1:
        raise RuntimeError("template field not found exactly once")
    return block


def set_lifecycle(block: str, currentness: str, reason: str) -> str:
    block, count = re.subn(
        r'execution_enabled: (?:true|false), currentness: "[^"]+"',
        f'execution_enabled: false, currentness: "{currentness}"',
        block,
        count=1,
    )
    if count != 1 and f'execution_enabled: false, currentness: "{currentness}"' not in block:
        raise RuntimeError("lifecycle fields not found exactly once")
    block, count = re.subn(r'guidance_visibility: "[^"]+"', 'guidance_visibility: "hidden"', block, count=1)
    if count != 1 and 'guidance_visibility: "hidden"' not in block:
        raise RuntimeError("guidance_visibility not found")
    block = set_template(
        block,
        f'template: null, template_runnable: false, required_parameters: ["{reason}"]',
    )
    return block


def append_marked(path: Path, marker: str, section: str) -> None:
    text = read(path)
    if marker in text:
        return
    if not text.endswith("\n"):
        text += "\n"
    text += "\n" + section.strip() + "\n"
    write(path, text)


contract = read(CONTRACT)

# Harden the existing RFC3339 helper itself so impossible calendar dates / 24:xx
# cannot pass merely because JavaScript normalizes them.
if "DEFECT_015_STRICT_RFC3339_V1" not in contract:
    contract = regex_replace_once(
        contract,
        r'  function requireRfc3339DateTime\(value, path\) \{\n.*?\n  \}\n',
        '''  function requireRfc3339DateTime(value, path) {
    const text = requireString(value, path).trim();
    const match = text.match(/^(\\d{4}-\\d{2}-\\d{2})T(\\d{2}):(\\d{2}):(\\d{2})(?:\\.\\d{1,9})?(?:Z|[+-]\\d{2}:\\d{2})$/);
    if (!match) fail("INVALID_OPERATION_PARAMS", `${path} должен быть RFC3339 date-time с часовым поясом.`);
    requireDateYmd(match[1], path);
    if (Number(match[2]) > 23 || Number(match[3]) > 59 || Number(match[4]) > 59 || Number.isNaN(Date.parse(text))) {
      fail("INVALID_OPERATION_PARAMS", `${path} должен быть корректным RFC3339 date-time с часовым поясом.`);
    }
    return text;
  }
  // DEFECT_015_STRICT_RFC3339_V1
''',
        "strict RFC3339 helper",
        re.S,
    )

# finance_balance is the live-confirmed wire-format defect: this normalizer must
# accept real YMD directly, before the consolidated post-normalization guards.
if "DEFECT_015_FINANCE_BALANCE_YMD_V1" not in contract:
    contract = regex_replace_once(
        contract,
        r'  function normalizeFinanceBalanceParams\(params\) \{\n.*?\n  \}\n',
        '''  function normalizeFinanceBalanceParams(params) {
    const normalized = requirePlainObject(params, "params");
    assertAllowedFields(normalized, ["date_from", "date_to"]);
    normalized.date_from = requireDateYmd(requireField(normalized, "date_from"), "params.date_from");
    normalized.date_to = requireDateYmd(requireField(normalized, "date_to"), "params.date_to");
    return normalized;
  }
  // DEFECT_015_FINANCE_BALANCE_YMD_V1
''',
        "finance_balance YMD normalizer",
        re.S,
    )

# Strengthen shared effect-repair schema formats instead of patching each report.
contract = replace_once(
    contract,
    '      if (schema.format === "date" && !/^\\d{4}-\\d{2}-\\d{2}$/.test(value)) fail("INVALID_OPERATION_PARAMS", `${path} должен быть датой YYYY-MM-DD.`);',
    '      if (schema.format === "date") requireDateYmd(value, path);',
    "effect-repair real YMD",
)
contract = replace_once(
    contract,
    '      if (schema.format === "date-time" && !Number.isFinite(Date.parse(value))) fail("INVALID_OPERATION_PARAMS", `${path} должен быть ISO date-time.`);',
    '      if (schema.format === "date-time") requireRfc3339DateTime(value, path);',
    "effect-repair strict RFC3339",
)

if "DEFECT_015_CONSOLIDATED_GUARDS_V1" not in contract:
    guard_code = r'''
  // DEFECT_015_CONSOLIDATED_GUARDS_V1
  const DEFECT_015_DAY_MS = 86400000;

  function defect015YmdParts(value, path) {
    const text = requireDateYmd(value, path);
    const [year, month, day] = text.split("-").map(Number);
    return { text, year, month, day, ms: Date.parse(`${text}T00:00:00Z`) };
  }

  function defect015TodayYmd(atMs) {
    return new Date(atMs).toISOString().slice(0, 10);
  }

  function defect015AddDaysYmd(ymd, days) {
    const base = defect015YmdParts(ymd, "date").ms;
    return new Date(base + Number(days) * DEFECT_015_DAY_MS).toISOString().slice(0, 10);
  }

  function defect015SubtractCalendarMonthsYmd(ymd, months) {
    const source = defect015YmdParts(ymd, "date");
    const first = new Date(Date.UTC(source.year, source.month - 1 - Number(months), 1));
    const year = first.getUTCFullYear();
    const monthIndex = first.getUTCMonth();
    const lastDay = new Date(Date.UTC(year, monthIndex + 1, 0)).getUTCDate();
    const day = Math.min(source.day, lastDay);
    return new Date(Date.UTC(year, monthIndex, day)).toISOString().slice(0, 10);
  }

  function defect015AssertYmdRange(fromValue, toValue, path, { maxInclusiveDays = null, maxDifferenceDays = null } = {}) {
    const from = defect015YmdParts(fromValue, `${path}.from`);
    const to = defect015YmdParts(toValue, `${path}.to`);
    if (to.ms < from.ms) fail("INVALID_OPERATION_PARAMS", `${path}: конец периода не может быть раньше начала.`);
    const differenceDays = (to.ms - from.ms) / DEFECT_015_DAY_MS;
    if (Number.isInteger(maxInclusiveDays) && differenceDays > maxInclusiveDays - 1) {
      fail("OZON_LIMIT_VIOLATION", `${path}: период не может превышать ${maxInclusiveDays} календарных дней.`);
    }
    if (Number.isInteger(maxDifferenceDays) && differenceDays > maxDifferenceDays) {
      fail("OZON_LIMIT_VIOLATION", `${path}: расстояние между границами не может превышать ${maxDifferenceDays} дней.`);
    }
    return { from, to, differenceDays };
  }

  function defect015OneCalendarMonthAfterMs(rfc3339) {
    const parsed = new Date(Date.parse(rfc3339));
    const year = parsed.getUTCFullYear();
    const month = parsed.getUTCMonth();
    const day = parsed.getUTCDate();
    const firstTarget = new Date(Date.UTC(year, month + 1, 1));
    const targetYear = firstTarget.getUTCFullYear();
    const targetMonth = firstTarget.getUTCMonth();
    const lastDay = new Date(Date.UTC(targetYear, targetMonth + 1, 0)).getUTCDate();
    return Date.UTC(
      targetYear,
      targetMonth,
      Math.min(day, lastDay),
      parsed.getUTCHours(),
      parsed.getUTCMinutes(),
      parsed.getUTCSeconds(),
      parsed.getUTCMilliseconds()
    );
  }

  function defect015AssertRfc3339Pair(object, fromKey, toKey, path) {
    const hasFrom = Object.prototype.hasOwnProperty.call(object || {}, fromKey);
    const hasTo = Object.prototype.hasOwnProperty.call(object || {}, toKey);
    if (hasFrom) requireRfc3339DateTime(object[fromKey], `${path}.${fromKey}`);
    if (hasTo) requireRfc3339DateTime(object[toKey], `${path}.${toKey}`);
    if (hasFrom && hasTo && Date.parse(object[toKey]) < Date.parse(object[fromKey])) {
      fail("INVALID_OPERATION_PARAMS", `${path}.${toKey} не может быть раньше ${path}.${fromKey}.`);
    }
    return { hasFrom, hasTo };
  }

  function defect015AssertHalfMonthPeriod(date) {
    const fromText = requireRfc3339DateTime(date.from, "params.date.from");
    const toText = requireRfc3339DateTime(date.to, "params.date.to");
    const from = defect015YmdParts(fromText.slice(0, 10), "params.date.from");
    const to = defect015YmdParts(toText.slice(0, 10), "params.date.to");
    if (from.year !== to.year || from.month !== to.month) {
      fail("OZON_LIMIT_VIOLATION", "params.date: cash-flow период должен быть одной половиной одного календарного месяца.");
    }
    const lastDay = new Date(Date.UTC(from.year, from.month, 0)).getUTCDate();
    const valid = (from.day === 1 && to.day === 15) || (from.day === 16 && to.day === lastDay);
    if (!valid) fail("OZON_LIMIT_VIOLATION", "params.date: допустим только период 1–15 или 16–последний день месяца.");
  }

  function validateDefect015OperationParams(operation, params, atMs = Date.now()) {
    const p = params && typeof params === "object" ? params : {};

    if (operation === "posting_fbo_list" && p.filter && typeof p.filter === "object") {
      defect015AssertRfc3339Pair(p.filter, "since", "to", "params.filter");
    }

    if (operation === "finance_cash_flow_statement_list" && p.date && typeof p.date === "object") {
      defect015AssertHalfMonthPeriod(p.date);
    }

    if (operation === "finance_transaction_list_v3" && p.filter?.date && typeof p.filter.date === "object") {
      const date = p.filter.date;
      const pair = defect015AssertRfc3339Pair(date, "from", "to", "params.filter.date");
      if (pair.hasFrom && pair.hasTo && Date.parse(date.to) > defect015OneCalendarMonthAfterMs(date.from)) {
        fail("OZON_LIMIT_VIOLATION", "params.filter.date: период finance_transaction_list_v3 не может превышать один календарный месяц.");
      }
    }

    if (operation === "finance_balance") {
      defect015AssertYmdRange(p.date_from, p.date_to, "params", { maxDifferenceDays: 30 });
    }

    if (operation === "finance_realization_by_day") {
      const year = Number(p.year);
      const month = Number(p.month);
      const day = Number(p.day);
      const ymd = `${String(year).padStart(4, "0")}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
      const requested = defect015YmdParts(ymd, "params.day/month/year");
      const today = defect015YmdParts(defect015TodayYmd(atMs), "current_date");
      if ((today.ms - requested.ms) / DEFECT_015_DAY_MS > 32) {
        fail("OZON_LIMIT_VIOLATION", "params.day/month/year: realization by-day доступен не старше 32 календарных дней от текущей даты.");
      }
    }

    if (operation === "finance_realization_posting" || operation === "finance_realization_v2") {
      const month = Number(p.month);
      const year = Number(p.year);
      if (!Number.isInteger(month) || month < 1 || month > 12) fail("INVALID_OPERATION_PARAMS", "params.month должен быть в диапазоне 1..12.");
      if (!Number.isInteger(year) || year * 12 + month < 2023 * 12 + 8) {
        fail("OZON_LIMIT_VIOLATION", "Период realization не может быть раньше 2023-08.");
      }
    }

    if (operation === "finance_products_buyout") {
      defect015AssertYmdRange(p.date_from, p.date_to, "params", { maxInclusiveDays: 31 });
    }

    if (operation === "fbo_draft_timeslot_info") {
      const range = defect015AssertYmdRange(p.date_from, p.date_to, "params");
      const today = defect015TodayYmd(atMs);
      const maxDate = defect015AddDaysYmd(today, 27);
      if (range.from.text < today || range.to.text > maxDate) {
        fail("OZON_LIMIT_VIOLATION", "params.date_from/date_to должны находиться в 28-дневном окне, начинающемся с текущей даты.");
      }
    }

    if (operation === "carriage_delivery_list_v2" && p.filter && Object.prototype.hasOwnProperty.call(p.filter, "departure_date")) {
      requireDateYmd(p.filter.departure_date, "params.filter.departure_date");
    }

    if (operation === "report_returns_create_v2" && p.filter && typeof p.filter === "object") {
      const from = requireRfc3339DateTime(p.filter.date_from, "params.filter.date_from");
      requireRfc3339DateTime(p.filter.date_to, "params.filter.date_to");
      const earliest = defect015SubtractCalendarMonthsYmd(defect015TodayYmd(atMs), 3);
      if (from.slice(0, 10) < earliest) fail("OZON_LIMIT_VIOLATION", "params.filter.date_from: отчёт по возвратам доступен только за последние три месяца.");
    }

    if (operation === "report_realization_posting_create") {
      const month = Number(p.month);
      const year = Number(p.year);
      if (year * 12 + month < 2023 * 12 + 8) fail("OZON_LIMIT_VIOLATION", "Период отчёта realization не может быть раньше 2023-08.");
    }

    if (operation === "product_certification_params_v2" && p.params?.expired_date && typeof p.params.expired_date === "object") {
      const expired = p.params.expired_date;
      if (Object.prototype.hasOwnProperty.call(expired, "date") && Object.prototype.hasOwnProperty.call(expired, "infinite")) {
        fail("INVALID_OPERATION_PARAMS", "params.params.expired_date: date и infinite взаимоисключающие представления срока действия.");
      }
    }

    const strictPerformanceAlt = new Set([
      "performance_campaign_product",
      "performance_media",
      "performance_campaign_product_csv",
      "performance_media_csv"
    ]);
    if (strictPerformanceAlt.has(operation)) defect015AssertRfc3339Pair(p, "from", "to", "params");

    const performance62 = new Set([
      "performance_expense",
      "performance_daily",
      "performance_media",
      "performance_expense_csv",
      "performance_daily_csv",
      "performance_media_csv"
    ]);
    if (performance62.has(operation)) {
      if (p.dateFrom != null && p.dateTo != null) {
        defect015AssertYmdRange(p.dateFrom, p.dateTo, "params", { maxInclusiveDays: 62 });
      } else if (p.from != null && p.to != null) {
        const from = requireRfc3339DateTime(p.from, "params.from");
        const to = requireRfc3339DateTime(p.to, "params.to");
        if (Date.parse(to) < Date.parse(from)) fail("INVALID_OPERATION_PARAMS", "params.to не может быть раньше params.from.");
        if (Date.parse(to) - Date.parse(from) > 62 * DEFECT_015_DAY_MS) fail("OZON_LIMIT_VIOLATION", "Performance statistics export не может превышать 62 дня.");
      }
    }

    if (operation === "performance_sku_statistics" && p.dateFrom != null) {
      const from = requireDateYmd(p.dateFrom, "params.dateFrom");
      const earliest = defect015AddDaysYmd(defect015TodayYmd(atMs), -1);
      if (from < earliest) fail("OZON_LIMIT_VIOLATION", "params.dateFrom для SKU statistics не может быть раньше предыдущего дня.");
    }
  }

'''
    anchor = "  const IMPLEMENTATION_BINDINGS = deepFreeze({"
    if contract.count(anchor) != 1:
        raise RuntimeError("IMPLEMENTATION_BINDINGS anchor not unique")
    contract = contract.replace(anchor, guard_code + anchor, 1)

if "validateDefect015OperationParams(operation, normalizedParams, Date.now());" not in contract:
    pattern = re.compile(
        r'(      const normalizedParams = meta\.execution_enabled === true && typeof meta\.normalizeParams === "function"\n'
        r'        \? sanitizeJsonValue\(meta\.normalizeParams\(params\), "normalized_params"\)\n'
        r'        : params;\n)'
        r'(      return deepFreeze\(\{ operation, params: normalizedParams \}\);)'
    )
    match = pattern.search(contract)
    if not match:
        raise RuntimeError("normalizeCommand normalizedParams hook not found")
    contract = contract[:match.start()] + match.group(1) + "      validateDefect015OperationParams(operation, normalizedParams, Date.now());\n" + match.group(2) + contract[match.end():]

write(CONTRACT, contract)

registry = read(REGISTRY)

# Dynamic/current-relative templates must not pretend to be universally runnable.
non_runnable = {
    "ozon_auto_add_products": "action_id + current auto_add_date returned by /v1/actions",
    "ozon_auto_add_candidates": "action_id + current auto_add_date returned by /v1/actions",
    "finance_cash_flow_statement_list": "date.from/date.to must be exactly one provider half-month plus page/page_size",
    "fbo_draft_timeslot_info": "explicit current/future date_from/date_to inside the provider 28-day horizon + draft parameters",
    "report_returns_create_v2": "explicit current RFC3339 range inside the provider last-three-month window + status",
    "performance_sku_statistics": "explicit near-current dateFrom/dateTo; dateFrom may not be earlier than the previous day",
}
for alias, requirement in non_runnable.items():
    registry = edit_operation(
        registry,
        alias,
        lambda block, requirement=requirement: set_template(
            block,
            f'template: null, template_runnable: false, required_parameters: ["{requirement}"]',
        ),
    )

# finance_balance keeps a runnable template but with the live-proven effective YMD wire format.
def edit_balance(block: str) -> str:
    block = block.replace('date_from: "2026-08-01T00:00:00Z"', 'date_from: "2026-08-01"')
    block = block.replace('date_to: "2026-08-28T23:59:59Z"', 'date_to: "2026-08-28"')
    if 'date_from: "2026-08-01"' not in block or 'date_to: "2026-08-28"' not in block:
        raise RuntimeError("finance_balance template YMD replacement failed")
    return block
registry = edit_operation(registry, "finance_balance", edit_balance)

# Two already-retired v1 routes are fail-closed. Transaction v3 is proactively
# disabled ahead of the provider 2026-09-08 shutdown so the shipped artifact
# cannot advertise a route that is about to die.
registry = edit_operation(
    registry,
    "fbs_stock_by_warehouse_v1",
    lambda block: set_lifecycle(block, "retired", "retired provider route; use fbs_stock_by_warehouse_v2"),
)
registry = edit_operation(
    registry,
    "fbs_carriage_available_list",
    lambda block: set_lifecycle(block, "retired", "retired provider route; use carriage_delivery_list_v2"),
)
registry = edit_operation(
    registry,
    "finance_transaction_list_v3",
    lambda block: set_lifecycle(block, "sunset_2026_09_08", "provider shutdown 2026-09-08; use finance accrual replacement operations"),
)

write(REGISTRY, registry)

# Existing package gates must understand non-runnable templates and the three
# fail-closed lifecycle operations.
effect_gate = VALIDATION / "run_effect_read_repair_gate.mjs"
text = read(effect_gate)
text = replace_once(text, "assert.equal(sellerReads.length, 271);", "assert.equal(sellerReads.length, 268);", "effect gate seller enabled count")
text = replace_once(text, "assert.equal(sellerCurrentReads.length, 269);", "assert.equal(sellerCurrentReads.length, 266);", "effect gate seller current count")
if "OZON_EFFECT_READ_REPAIR_NON_RUNNABLE_TEMPLATE_POLICY_PASS" not in text:
    old = '''  assert.ok(meta); assert.equal(meta.effect, "READ"); assert.equal(meta.execution_enabled, true); assert.equal(providerOf(meta), "seller_api"); assert.equal(meta.template?.operation, alias);
  assert.ok(entitlementText.includes(`"${meta.entitlement_key}"`));
  const normalized = contract.normalizeCommand(JSON.parse(JSON.stringify(meta.template)));
  assert.equal(normalized.operation, alias);'''
    new = '''  assert.ok(meta); assert.equal(meta.effect, "READ"); assert.equal(meta.execution_enabled, true); assert.equal(providerOf(meta), "seller_api");
  assert.ok(entitlementText.includes(`"${meta.entitlement_key}"`));
  if (meta.template_runnable === false) {
    assert.equal(meta.template, null, `${alias} non-runnable template must be null`);
    assert.ok(Array.isArray(meta.required_parameters) && meta.required_parameters.length > 0, `${alias} must expose its dynamic/current dependency`);
  } else {
    assert.equal(meta.template?.operation, alias);
    const normalized = contract.normalizeCommand(JSON.parse(JSON.stringify(meta.template)));
    assert.equal(normalized.operation, alias);
  }'''
    text = replace_once(text, old, new, "effect gate non-runnable template policy")
    text = text.replace('console.log("OZON_EFFECT_READ_REPAIR_GATE_PASS");', 'console.log("OZON_EFFECT_READ_REPAIR_NON_RUNNABLE_TEMPLATE_POLICY_PASS");\nconsole.log("OZON_EFFECT_READ_REPAIR_GATE_PASS");', 1)
if "OZON_EFFECT_READ_REPAIR_DEFECT_015_CHAIN_PASS" not in text:
    anchor = 'console.log("OZON_EFFECT_READ_REPAIR_GATE_PASS");\n'
    addition = '''const defect015 = spawnSync(process.execPath, [path.join(gateDir, "run_defect_015_date_repair_gate.mjs"), repo], { encoding: "utf8" });
if (defect015.stdout) process.stdout.write(defect015.stdout);
if (defect015.stderr) process.stderr.write(defect015.stderr);
assert.equal(defect015.status, 0, "DEFECT-015 deterministic repair regression must pass inside package effect gate");
console.log("OZON_EFFECT_READ_REPAIR_DEFECT_015_CHAIN_PASS");
'''
    # gateDir is declared immediately after the anchor in the baseline; place the
    # chain after that declaration instead.
    gate_decl = 'const gateDir = path.dirname(fileURLToPath(import.meta.url));\n'
    if text.count(gate_decl) != 1:
        raise RuntimeError("effect gate gateDir declaration not unique")
    text = text.replace(gate_decl, gate_decl + addition, 1)
write(effect_gate, text)

# Exact-schema gate: keep all 26 operations covered, but supply a deterministic
# explicit request for the one current-relative report whose registry template is now non-runnable.
exact_gate = VALIDATION / "run_exact_26_schema_gate.mjs"
text = read(exact_gate)
if "DEFECT_015_TEST_COMMANDS_V1" not in text:
    anchor = "const contract = globalThis.OzonContract;\n"
    addition = '''// DEFECT_015_TEST_COMMANDS_V1
Date.now = () => Date.UTC(2026, 8, 4, 12, 0, 0);
const DEFECT_015_TEST_COMMANDS = Object.freeze({
  report_returns_create_v2: { operation: "report_returns_create_v2", params: { filter: { date_from: "2026-09-01T00:00:00Z", date_to: "2026-09-03T23:59:59Z", status: "DisputeOpened" } } }
});
const commandFor = (alias) => JSON.parse(JSON.stringify(DEFECT_015_TEST_COMMANDS[alias] || ops[alias].template));
'''
    text = replace_once(text, anchor, anchor + addition, "exact gate deterministic command fixture")
    text = replace_once(text, "  const normalized = contract.normalizeCommand(JSON.parse(JSON.stringify(meta.template)));", "  const normalized = contract.normalizeCommand(commandFor(alias));", "exact gate template loop")
write(exact_gate, text)

# 26-read E2E gate uses the same deterministic explicit request for report_returns.
e2e_gate = VALIDATION / "run_all_26_e2e_gate.mjs"
text = read(e2e_gate)
if "DEFECT_015_TEST_COMMANDS_V1" not in text:
    anchor = "const operations = globalThis.OzonOperationRegistry.OPERATIONS;\n"
    addition = '''// DEFECT_015_TEST_COMMANDS_V1
Date.now = () => Date.UTC(2026, 8, 4, 12, 0, 0);
const DEFECT_015_TEST_COMMANDS = Object.freeze({
  report_returns_create_v2: { operation: "report_returns_create_v2", params: { filter: { date_from: "2026-09-01T00:00:00Z", date_to: "2026-09-03T23:59:59Z", status: "DisputeOpened" } } }
});
const commandFor = (alias) => JSON.parse(JSON.stringify(DEFECT_015_TEST_COMMANDS[alias] || operations[alias].template));
'''
    text = replace_once(text, anchor, anchor + addition, "e2e deterministic command fixture")
    text = replace_once(text, "JSON.parse(JSON.stringify(operations[alias].template))", "commandFor(alias)", "e2e alias command fixture")
write(e2e_gate, text)

# Canonical delivery/guidance documentation is append-only for this repair.
append_marked(
    PROJECT / "OZON_PATCH_DELIVERY_GATE.md",
    "DEFECT_015_DATE_CURRENTNESS_GATE_V1",
    '''## DEFECT_015_DATE_CURRENTNESS_GATE_V1 — mandatory provider date/business/currentness closure

A package touching Ozon request contracts or operation metadata is not deliverable until the deterministic DEFECT-015 gate and the ordinary read-effect package gate pass on the exact candidate. Required checks include: strict real YMD and RFC3339 validation; provider-specific period/recency rules; fail-closed retired/sunset operations; non-runnable treatment of dynamic/current-relative templates; and source/bundle/package coherence. A fresh Swagger/OpenAPI entry by itself is not proof that a provider route is current or that a primitive date format is effective.

Mandatory commands for this repair family include `node validation/read-effect-repair-v1/run_defect_015_date_repair_gate.mjs .` and `node validation/read-effect-repair-v1/run_effect_read_repair_gate.mjs .`. Provider-invalid deterministic negatives must terminate before transport with zero physical provider requests. Live Ozon verification remains a separate post-install gate and cannot be substituted for deterministic preflight closure.''',
)

append_marked(
    PROJECT / "README.md",
    "DEFECT_015_ACTIVE_DATE_CONTRACT_POLICY_V1",
    '''## DEFECT_015_ACTIVE_DATE_CONTRACT_POLICY_V1

Date/time/period requests are validated against the effective provider contract, including documented prose/business constraints, rather than mechanical OpenAPI `format` alone. Dynamic provider-derived selectors and current/future-only date requests are not published as permanent runnable templates. Retired operations are fail-closed and hidden from ordinary guidance. The 2026-09-04 DEFECT-015 repair gate is mandatory for any future change that can alter these invariants.''',
)

append_marked(
    PROJECT / "OZON_GUIDED_COMMAND_DISCOVERY_SPEC_2026-08-21.md",
    "DEFECT_015_GUIDANCE_CURRENTNESS_POLICY_V1",
    '''## DEFECT_015_GUIDANCE_CURRENTNESS_POLICY_V1

Guidance must not present a retired/sunset-disabled route, a provider-derived dynamic selector, or a current-relative date request with a fixed historical date as a self-contained runnable command. Such operations use `template_runnable: false` plus explicit `required_parameters`/dependency guidance until the caller supplies current provider-valid input. Normal guidance must prefer current replacement operations.''',
)

append_marked(
    PROJECT / "OZON_BRIDGE_REQUEST_PLANNER_ROADMAP_2026-08-17.md",
    "DEFECT_015_PLANNER_DATE_POLICY_V1",
    '''## DEFECT_015_PLANNER_DATE_POLICY_V1

Planner output must preserve the caller's exact valid date representation and fail closed on provider-invalid ranges before transport. It must not silently rewrite timestamps into dates, manufacture provider-derived selectors, or revive hidden retired operations. Current-relative requests require explicit current input or a separately proven dependency-resolution step.''',
)

append_marked(
    PROJECT / "OZON_BRIDGE_DEVELOPMENT_WORKFLOW_2026-08-17.md",
    "DEFECT_015_WORKFLOW_CURRENTNESS_GATE_V1",
    '''## DEFECT_015_WORKFLOW_CURRENTNESS_GATE_V1

For request-contract changes, delivery now includes a provider-currentness review independent of Swagger presence, deterministic date/business-boundary regressions, and a check that registry templates/guidance remain runnable only when provider semantics are time-stable. Known retired paths must be blocked locally and may not re-enter generated/package mirrors as current+enabled.''',
)

# Keep the MCP/nodebundle mirror byte-coherent with the repaired shared authorities.
bundle = read(BUNDLE)
for rel in ["shared/ozon_operation_registry.js", "shared/ozon_contract.js"]:
    source = read(PROJECT / "dist-step7-candidate" / rel).rstrip("\n")
    begin = f"/* BEGIN {rel} */"
    end = f"/* END {rel} */"
    pattern = re.compile(re.escape(begin) + r"\n.*?\n" + re.escape(end), re.S)
    matches = list(pattern.finditer(bundle))
    if len(matches) != 1:
        raise RuntimeError(f"nodebundle section {rel}: expected 1, got {len(matches)}")
    replacement = f"{begin}\n{source}\n\n{end}"
    bundle = pattern.sub(lambda _: replacement, bundle, count=1)
write(BUNDLE, bundle)

print("DEFECT_015_REPAIR_APPLICATOR_PASS")
