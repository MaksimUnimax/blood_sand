"""Deterministic validation for the owner-approved V2 configuration only."""

from __future__ import annotations

import json
from datetime import date, timedelta
from pathlib import Path
from typing import Any, Mapping


class ConfigurationValidationError(ValueError):
    """Raised when versioned recommendation configuration violates an invariant."""


ROOT = Path(__file__).resolve().parents[1]
DATA_DIR = ROOT / "data"
FILES = {
    "calendar": "chertog_calendar.v1.json",
    "products": "product_policy.v2.json",
    "matrix": "recommendation_matrix.v2.json",
    "overrides": "marketplace_overrides.v1.json",
    "copy": "reason_copy.v2.json",
}
VERSIONS = {
    "calendar_version": "KIP_CHERTOG_CALENDAR_V1",
    "product_policy_version": "KIP_PRODUCT_POLICY_V2_SALES_WEIGHTED",
    "matrix_version": "KIP_RECOMMENDATION_MATRIX_V2_SALES_WEIGHTED",
    "marketplace_override_version": "KIP_MARKETPLACE_OVERRIDE_V1",
    "copy_version": "KIP_REASON_COPY_V2_SALES_WEIGHTED",
}
GENDERS = {"male", "female"}
MARKETPLACES = {"ozon", "wildberries"}
RELATIONS = {"DIRECT_PATRON", "DIRECT_DERIVED", "DIRECT_CHERTOG_SYMBOL", "CURATED_GENDER_SUBSTITUTE", "CURATED_MEANING_SUBSTITUTE"}
BASE_SELECTIONS = {"SEMANTIC_DIRECT", "SEMANTIC_DIRECT_SALES_PRIORITIZED", "SEMANTIC_CURATED_SALES_WEIGHTED", "SEMANTIC_CURATED_GENDER_FIT"}
FORBIDDEN_SELECTION_FIELDS = {"secondary", "secondary_product", "rank2", "alternates", "fallback_products", "fallback_product"}
FORBIDDEN_COPY_FIELDS = {"product_key", "sku", "relation_type", "selection_basis", "effective_product_key", "fallback_product"}


def _fail(message: str) -> None:
    raise ConfigurationValidationError(message)


def _object(value: Any, label: str) -> dict[str, Any]:
    if not isinstance(value, dict):
        _fail(f"{label} must be an object")
    return value


def _array(value: Any, label: str) -> list[Any]:
    if not isinstance(value, list):
        _fail(f"{label} must be an array")
    return value


def _string(value: Any, label: str) -> str:
    if not isinstance(value, str) or not value.strip():
        _fail(f"{label} must be a non-empty string")
    return value


def _bool(value: Any, label: str) -> bool:
    if not isinstance(value, bool):
        _fail(f"{label} must be boolean")
    return value


def _keys(obj: Mapping[str, Any], allowed: set[str], required: set[str], label: str) -> None:
    missing = required - obj.keys()
    unknown = set(obj) - allowed
    if missing:
        _fail(f"{label} missing required fields: {', '.join(sorted(missing))}")
    if unknown:
        _fail(f"{label} contains forbidden/unknown fields: {', '.join(sorted(unknown))}")


def load_configuration(config_dir: str | Path | None = None) -> dict[str, Any]:
    """Load exactly the five versioned JSON configuration files."""
    directory = Path(config_dir) if config_dir is not None else DATA_DIR
    loaded = {}
    for name, filename in FILES.items():
        try:
            with (directory / filename).open(encoding="utf-8") as handle:
                loaded[name] = json.load(handle)
        except (OSError, json.JSONDecodeError) as error:
            _fail(f"cannot load {filename}: {error}")
    return loaded


def _date_point(value: Any, label: str) -> tuple[int, int]:
    obj = _object(value, label)
    _keys(obj, {"day", "month"}, {"day", "month"}, label)
    day, month = obj["day"], obj["month"]
    if type(day) is not int or type(month) is not int:
        _fail(f"{label} day and month must be integers")
    try:
        date(2000, month, day)
    except ValueError:
        _fail(f"{label} is not a valid Gregorian day/month")
    return month, day


def _in_circular_range(point: tuple[int, int], start: tuple[int, int], end: tuple[int, int]) -> bool:
    return start <= point <= end if start <= end else point >= start or point <= end


def _validate_calendar(calendar: Any) -> set[str]:
    c = _object(calendar, "calendar")
    _keys(c, {"calendar_version", "birth_year_affects_selection", "chertogs"}, {"calendar_version", "birth_year_affects_selection", "chertogs"}, "calendar")
    if c["calendar_version"] != VERSIONS["calendar_version"]:
        _fail("calendar_version is missing or incorrect")
    if _bool(c["birth_year_affects_selection"], "birth_year_affects_selection") is not False:
        _fail("birth_year_affects_selection must be false")
    rows = _array(c["chertogs"], "calendar.chertogs")
    if len(rows) != 16:
        _fail("calendar must contain exactly 16 Chertogs")
    ids, ranges = set(), []
    for index, raw in enumerate(rows):
        row = _object(raw, f"calendar.chertogs[{index}]")
        _keys(row, {"chertog_id", "name", "patron", "start", "end"}, {"chertog_id", "name", "patron", "start", "end"}, f"calendar.chertogs[{index}]")
        cid = _string(row["chertog_id"], f"calendar.chertogs[{index}].chertog_id")
        if cid in ids:
            _fail(f"duplicate chertog_id: {cid}")
        ids.add(cid)
        _string(row["name"], f"calendar.chertogs[{index}].name")
        patron = _object(row["patron"], f"calendar.chertogs[{index}].patron")
        _keys(patron, {"name"}, {"name"}, f"calendar.chertogs[{index}].patron")
        _string(patron["name"], f"calendar.chertogs[{index}].patron.name")
        ranges.append((cid, _date_point(row["start"], f"calendar.chertogs[{index}].start"), _date_point(row["end"], f"calendar.chertogs[{index}].end")))
    cursor, finish = date(2000, 1, 1), date(2000, 12, 31)
    feb29 = None
    while cursor <= finish:
        point = (cursor.month, cursor.day)
        matches = [cid for cid, start, end in ranges if _in_circular_range(point, start, end)]
        if len(matches) != 1:
            _fail(f"calendar coverage invalid on {cursor:%d.%m}: {len(matches)} matching Chertogs")
        if point == (2, 29):
            feb29 = matches[0]
        cursor += timedelta(days=1)
    if feb29 != "volk":
        _fail("29.02 must belong to volk")
    return ids


def _validate_products(policy: Any, chertogs: set[str]) -> dict[str, dict[str, Any]]:
    p = _object(policy, "product policy")
    _keys(p, {"product_policy_version", "product_family", "products"}, {"product_policy_version", "product_family", "products"}, "product policy")
    if p["product_policy_version"] != VERSIONS["product_policy_version"]:
        _fail("product_policy_version is missing or incorrect")
    if p["product_family"] != "slavic_symbols_oberegs": _fail("product_family must be slavic_symbols_oberegs")
    rows = _array(p["products"], "product policy.products")
    if len(rows) != 25: _fail("product policy must contain exactly 25 products")
    products, skus = {}, set()
    allowed = {"product_key", "sku", "marketplace_name", "recommendation_identity", "customer_label", "gender_policy", "allowed_chertogs", "active_for_recommendation", "role"}
    required = allowed - {"role"}
    for i, raw in enumerate(rows):
        row = _object(raw, f"products[{i}]"); _keys(row, allowed, required, f"products[{i}]")
        key = _string(row["product_key"], f"products[{i}].product_key")
        if key in products: _fail(f"duplicate product_key: {key}")
        sku = _string(row["sku"], f"products[{i}].sku")
        if sku in skus: _fail(f"duplicate SKU: {sku}")
        skus.add(sku)
        for field in ("marketplace_name", "recommendation_identity", "customer_label"): _string(row[field], f"products[{i}].{field}")
        _string(row["gender_policy"], f"products[{i}].gender_policy")
        if row["gender_policy"] not in GENDERS | {"any"}: _fail(f"invalid gender_policy for {key}")
        allowed_chertogs = _array(row["allowed_chertogs"], f"products[{i}].allowed_chertogs")
        if any(not isinstance(cid, str) or cid not in chertogs for cid in allowed_chertogs): _fail(f"unknown allowed_chertog for {key}")
        _bool(row["active_for_recommendation"], f"products[{i}].active_for_recommendation")
        products[key] = row
    bear = products.get("bear_paw")
    if not bear or (bear["recommendation_identity"], bear["customer_label"], bear["gender_policy"], bear["allowed_chertogs"], bear["active_for_recommendation"]) != ("Печать Велеса", "Печать Велеса", "any", ["medved"], True): _fail("bear_paw violates locked V2 policy")
    for key, gender in {"svarog":"male", "chernobog":"male", "mara":"female", "zvezda_lady":"female"}.items():
        if products.get(key, {}).get("gender_policy") != gender: _fail(f"{key} must have gender_policy {gender}")
    if products.get("dazhdbog", {}).get("allowed_chertogs") != ["rasa"]: _fail("dazhdbog allowed_chertogs must be exactly ['rasa']")
    return products


def _validate_matrix(matrix: Any, chertogs: set[str], products: dict[str, dict[str, Any]]) -> dict[tuple[str, str], dict[str, Any]]:
    m = _object(matrix, "matrix"); _keys(m, {"matrix_version", "base_rows"}, {"matrix_version", "base_rows"}, "matrix")
    if m["matrix_version"] != VERSIONS["matrix_version"]: _fail("matrix_version is missing or incorrect")
    rows = _array(m["base_rows"], "matrix.base_rows")
    if len(rows) != 32: _fail("matrix must contain exactly 32 active base rows")
    cases = {}
    allowed = {"chertog_id", "gender", "product_key", "relation_type", "selection_basis", "reason_code", "active"}
    for i, raw in enumerate(rows):
        row = _object(raw, f"matrix.base_rows[{i}]"); _keys(row, allowed, allowed, f"matrix.base_rows[{i}]")
        _string(row["chertog_id"], "matrix chertog_id"); _string(row["gender"], "matrix gender")
        _string(row["product_key"], "matrix product_key"); _string(row["relation_type"], "matrix relation_type"); _string(row["selection_basis"], "matrix selection_basis")
        if row["chertog_id"] not in chertogs: _fail(f"unknown matrix chertog_id: {row.get('chertog_id')}")
        if row["gender"] not in GENDERS: _fail("invalid matrix gender")
        if row["relation_type"] not in RELATIONS: _fail("invalid matrix relation_type")
        if row["selection_basis"] not in BASE_SELECTIONS: _fail("invalid matrix selection_basis")
        _string(row["reason_code"], "matrix reason_code")
        if _bool(row["active"], "matrix active") is not True: _fail("matrix row must be active")
        case = (row["chertog_id"], row["gender"])
        if case in cases: _fail(f"duplicate base case: {case}")
        product = products.get(row["product_key"])
        if product is None: _fail(f"unknown matrix product_key: {row['product_key']}")
        if not product["active_for_recommendation"]: _fail(f"inactive/reserve matrix product: {row['product_key']}")
        if product["gender_policy"] not in ("any", row["gender"]): _fail(f"matrix gender-policy conflict for {row['product_key']}")
        if row["chertog_id"] not in product["allowed_chertogs"]: _fail(f"matrix allowed_chertogs conflict for {row['product_key']}")
        cases[case] = row
    expected = {(cid, gender) for cid in chertogs for gender in GENDERS}
    if set(cases) != expected: _fail("matrix has missing base case(s)")
    locked = {("medved","male"):"bear_paw", ("medved","female"):"bear_paw", ("volk","male"):"veles", ("volk","female"):"veles", ("lisa","male"):"chernobog", ("lisa","female"):"mara", ("orel","male"):"perun", ("orel","female"):"zvezda_lady", ("rasa","male"):"dazhdbog", ("rasa","female"):"dazhdbog"}
    for case, key in locked.items():
        if cases[case]["product_key"] != key: _fail(f"locked base result invalid for {case}: expected {key}")
    for case, row in cases.items():
        key = row["product_key"]
        if key == "bear_paw" and case[0] != "medved": _fail("bear_paw occurs outside medved")
        if key == "dazhdbog" and case[0] != "rasa": _fail("dazhdbog occurs outside rasa")
        if key in {"svarog", "chernobog"} and case[1] == "female": _fail(f"{key} must never appear in a female row")
        if key in {"mara", "zvezda_lady"} and case[1] == "male": _fail(f"{key} must never appear in a male row")
    if sum(row["product_key"] == "dazhdbog" for row in cases.values()) != 2: _fail("dazhdbog must occur in exactly two base rows")
    return cases


def _validate_overrides(overrides: Any, cases: dict[tuple[str, str], dict[str, Any]], products: dict[str, dict[str, Any]], chertogs: set[str]) -> list[dict[str, Any]]:
    o = _object(overrides, "overrides"); _keys(o, {"marketplace_override_version", "overrides"}, {"marketplace_override_version", "overrides"}, "overrides")
    if o["marketplace_override_version"] != VERSIONS["marketplace_override_version"]: _fail("marketplace_override_version is missing or incorrect")
    rows = _array(o["overrides"], "overrides.overrides")
    if len(rows) != 1: _fail("must contain exactly one marketplace override")
    allowed = {"marketplace", "chertog_id", "gender", "base_product_key", "effective_product_key", "relation_type", "selection_basis", "reason_code"}; seen = set()
    for raw in rows:
        row = _object(raw, "override"); _keys(row, allowed, allowed, "override")
        for field in ("marketplace", "chertog_id", "gender", "base_product_key", "effective_product_key", "relation_type", "selection_basis"):
            _string(row[field], f"override {field}")
        key = (row["marketplace"], row["chertog_id"], row["gender"])
        if key in seen: _fail("duplicate override key")
        seen.add(key)
        if row["marketplace"] not in MARKETPLACES or row["chertog_id"] not in chertogs or row["gender"] not in GENDERS: _fail("invalid override marketplace, Chertog, or gender")
        if row["relation_type"] not in RELATIONS or row["selection_basis"] != "MARKETPLACE_OVERRIDE_SALES_WEIGHTED": _fail("invalid override relation_type or selection_basis")
        if (row["chertog_id"], row["gender"]) not in cases: _fail("override base case does not exist")
        if row["base_product_key"] != cases[(row["chertog_id"], row["gender"])]["product_key"]: _fail("override base_product_key does not match base matrix")
        effective = products.get(row["effective_product_key"])
        if effective is None or not effective["active_for_recommendation"]: _fail("override effective product is unknown or inactive")
        if effective["gender_policy"] not in ("any", row["gender"]) or row["chertog_id"] not in effective["allowed_chertogs"]: _fail("override effective product is not allowed for case")
        _string(row["reason_code"], "override reason_code")
    expected = {"marketplace":"wildberries", "chertog_id":"voron", "gender":"male", "base_product_key":"kolyadnik", "effective_product_key":"alatyr", "relation_type":"CURATED_MEANING_SUBSTITUTE", "selection_basis":"MARKETPLACE_OVERRIDE_SALES_WEIGHTED", "reason_code":"VORON_CHANGE_INNER_SUPPORT"}
    if rows[0] != expected: _fail("unapproved marketplace override")
    return rows


def _validate_copy(copy: Any, chertogs: set[str], cases: dict[tuple[str, str], dict[str, Any]], overrides: list[dict[str, Any]]) -> None:
    c = _object(copy, "reason copy"); _keys(c, {"copy_version", "full_dob_supported_as_display_context", "year_affects_selection", "records"}, {"copy_version", "full_dob_supported_as_display_context", "year_affects_selection", "records"}, "reason copy")
    if c["copy_version"] != VERSIONS["copy_version"]: _fail("copy_version is missing or incorrect")
    if _bool(c["full_dob_supported_as_display_context"], "full_dob_supported_as_display_context") is not True: _fail("full_dob_supported_as_display_context must be true")
    if _bool(c["year_affects_selection"], "year_affects_selection") is not False: _fail("year_affects_selection must be false")
    rows = _array(c["records"], "reason copy.records")
    if len(rows) != 33: _fail("reason copy must contain exactly 33 records")
    allowed = {"reason_code", "chertog_id", "gender", "marketplace", "themes", "recommendation_template", "why_it_fits_template"}; required = allowed - {"gender", "marketplace"}; by_code = {}
    for i, raw in enumerate(rows):
        row = _object(raw, f"reason copy.records[{i}]"); _keys(row, allowed, required, f"reason copy.records[{i}]")
        code = _string(row["reason_code"], "reason_code")
        if code in by_code: _fail(f"duplicate reason_code: {code}")
        _string(row["chertog_id"], "reason-copy chertog_id")
        if row["chertog_id"] not in chertogs: _fail("unknown reason-copy chertog_id")
        if "gender" in row and (not isinstance(row["gender"], str) or row["gender"] not in GENDERS): _fail("invalid reason-copy gender")
        if "marketplace" in row and (not isinstance(row["marketplace"], str) or row["marketplace"] not in MARKETPLACES): _fail("invalid reason-copy marketplace")
        themes = _array(row["themes"], "reason-copy themes")
        if not themes or any(not isinstance(item, str) or not item.strip() for item in themes): _fail("reason-copy themes must be non-empty strings")
        _string(row["recommendation_template"], "reason-copy recommendation_template"); _string(row["why_it_fits_template"], "reason-copy why_it_fits_template")
        by_code[code] = row
    for case, matrix_row in cases.items():
        row = by_code.get(matrix_row["reason_code"])
        if row is None: _fail(f"missing matrix reason code: {matrix_row['reason_code']}")
        if row.get("chertog_id") != case[0] or row.get("gender") != case[1] or "marketplace" in row: _fail(f"base reason record scope mismatch: {matrix_row['reason_code']}")
    override = overrides[0]; row = by_code.get(override["reason_code"])
    if row is None: _fail(f"missing override reason code: {override['reason_code']}")
    if (row.get("chertog_id"), row.get("gender"), row.get("marketplace")) != ("voron", "male", "wildberries"): _fail("override reason record scope mismatch")
    if set(by_code) != {row["reason_code"] for row in cases.values()} | {override["reason_code"]}: _fail("orphan reason-copy record")
    if "marketplace" in by_code.get("VORON_MALE_KOLYADNIK", {}): _fail("VORON_MALE_KOLYADNIK must not be marketplace-scoped")


def validate_configuration(config_dir: str | Path | None = None, configuration: Mapping[str, Any] | None = None) -> None:
    """Validate canonical, alternate-directory, or supplied V2 configuration.

    This routine only validates configuration and intentionally performs no
    Chertog resolution, recommendation selection, I/O beyond optional JSON
    loading, marketplace access, or response rendering.
    """
    if config_dir is not None and configuration is not None: _fail("provide config_dir or configuration, not both")
    data = dict(configuration) if configuration is not None else load_configuration(config_dir)
    if set(data) != set(FILES): _fail("configuration must contain exactly calendar, products, matrix, overrides, and copy")
    chertogs = _validate_calendar(data["calendar"])
    products = _validate_products(data["products"], chertogs)
    cases = _validate_matrix(data["matrix"], chertogs, products)
    overrides = _validate_overrides(data["overrides"], cases, products, chertogs)
    _validate_copy(data["copy"], chertogs, cases, overrides)


def main() -> int:
    try:
        validate_configuration()
    except ConfigurationValidationError as error:
        print(f"configuration invalid: {error}")
        return 1
    print("configuration valid")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
