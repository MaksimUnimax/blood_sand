#!/usr/bin/env python3
import argparse
import hashlib
import json
from pathlib import Path

EXPECTED_SHA = "39e053a147180d1df4ded6ed0272aaaf02dd6a371144d8ebed7113fd218e4b40"
EXPECTED_BYTES = 3933043
HTTP_METHODS = {"get", "post", "put", "patch", "delete", "head", "options", "trace"}
PRIVACY_TOKENS = {
    "buyer", "customer", "phone", "email", "recipient", "passport", "person",
    "client", "contact", "sender", "name", "address", "fio", "first_name",
    "last_name", "middle_name"
}


def parse_args():
    p = argparse.ArgumentParser()
    p.add_argument("--swagger", required=True)
    p.add_argument("--inventory", required=True)
    p.add_argument("--out", required=True)
    return p.parse_args()


def resolve_ref(spec, ref):
    if not isinstance(ref, str) or not ref.startswith("#/"):
        return None
    cur = spec
    for token in ref[2:].split("/"):
        token = token.replace("~1", "/").replace("~0", "~")
        if not isinstance(cur, dict) or token not in cur:
            return None
        cur = cur[token]
    return cur


def schema_ref_name(ref):
    return ref.split("/")[-1] if isinstance(ref, str) else None


def walk_schema(spec, node, *, depth=0, seen_refs=None, props=None, refs=None, types=None, formats=None):
    if seen_refs is None:
        seen_refs = set()
    if props is None:
        props = set()
    if refs is None:
        refs = set()
    if types is None:
        types = set()
    if formats is None:
        formats = set()
    if depth > 24 or not isinstance(node, dict):
        return props, refs, types, formats

    ref = node.get("$ref")
    if isinstance(ref, str):
        refs.add(ref)
        if ref not in seen_refs:
            seen_refs.add(ref)
            target = resolve_ref(spec, ref)
            if isinstance(target, dict):
                walk_schema(spec, target, depth=depth + 1, seen_refs=seen_refs, props=props, refs=refs, types=types, formats=formats)

    t = node.get("type")
    if isinstance(t, str):
        types.add(t)
    fmt = node.get("format")
    if isinstance(fmt, str):
        formats.add(fmt)

    properties = node.get("properties")
    if isinstance(properties, dict):
        for name, child in properties.items():
            props.add(str(name))
            walk_schema(spec, child, depth=depth + 1, seen_refs=seen_refs, props=props, refs=refs, types=types, formats=formats)

    for key in ("items", "additionalProperties", "not"):
        child = node.get(key)
        if isinstance(child, dict):
            walk_schema(spec, child, depth=depth + 1, seen_refs=seen_refs, props=props, refs=refs, types=types, formats=formats)
    for key in ("allOf", "oneOf", "anyOf"):
        children = node.get(key)
        if isinstance(children, list):
            for child in children:
                if isinstance(child, dict):
                    walk_schema(spec, child, depth=depth + 1, seen_refs=seen_refs, props=props, refs=refs, types=types, formats=formats)
    return props, refs, types, formats


def schema_summary(spec, schema):
    if not isinstance(schema, dict):
        return None
    props, refs, types, formats = walk_schema(spec, schema)
    lower_props = {p.lower() for p in props}
    privacy_hits = sorted({p for p in lower_props if p in PRIVACY_TOKENS or any(tok in p for tok in PRIVACY_TOKENS if len(tok) >= 5)})
    return {
        "root_ref": schema.get("$ref"),
        "root_ref_name": schema_ref_name(schema.get("$ref")),
        "root_type": schema.get("type"),
        "root_format": schema.get("format"),
        "reachable_refs": sorted(refs),
        "reachable_property_names": sorted(props),
        "reachable_types": sorted(types),
        "reachable_formats": sorted(formats),
        "privacy_name_hits_discovery_only": privacy_hits,
    }


def request_evidence(spec, path_item, op):
    parameters = []
    combined = []
    if isinstance(path_item.get("parameters"), list):
        combined.extend(path_item["parameters"])
    if isinstance(op.get("parameters"), list):
        combined.extend(op["parameters"])
    for raw in combined:
        p = raw
        if isinstance(raw, dict) and "$ref" in raw:
            p = resolve_ref(spec, raw["$ref"]) or raw
        if not isinstance(p, dict):
            continue
        schema = p.get("schema")
        parameters.append({
            "name": p.get("name"),
            "in": p.get("in"),
            "required": p.get("required", False),
            "type": p.get("type"),
            "format": p.get("format"),
            "schema": schema_summary(spec, schema),
        })

    request_body = op.get("requestBody")
    request_body_evidence = None
    if isinstance(request_body, dict):
        if "$ref" in request_body:
            request_body = resolve_ref(spec, request_body["$ref"]) or request_body
        content = request_body.get("content") if isinstance(request_body, dict) else None
        media = {}
        if isinstance(content, dict):
            for mime, item in content.items():
                if isinstance(item, dict):
                    media[mime] = schema_summary(spec, item.get("schema"))
        request_body_evidence = {
            "required": request_body.get("required", False) if isinstance(request_body, dict) else False,
            "content": media,
        }
    return {"parameters": parameters, "request_body": request_body_evidence}


def response_evidence(spec, op):
    out = {}
    responses = op.get("responses")
    if not isinstance(responses, dict):
        return out
    for code, raw in responses.items():
        r = raw
        if isinstance(raw, dict) and "$ref" in raw:
            r = resolve_ref(spec, raw["$ref"]) or raw
        if not isinstance(r, dict):
            continue
        entry = {"description": r.get("description"), "schema": None, "content": {}}
        if isinstance(r.get("schema"), dict):
            entry["schema"] = schema_summary(spec, r["schema"])
        content = r.get("content")
        if isinstance(content, dict):
            for mime, item in content.items():
                if isinstance(item, dict):
                    entry["content"][mime] = schema_summary(spec, item.get("schema"))
        out[str(code)] = entry
    return out


def response_media_flags(op, evidence):
    produces = op.get("produces") if isinstance(op.get("produces"), list) else []
    content_types = set(str(x).lower() for x in produces)
    formats = set()
    types = set()
    for r in evidence.values():
        for mime, s in r.get("content", {}).items():
            content_types.add(str(mime).lower())
            if isinstance(s, dict):
                formats.update(s.get("reachable_formats", []))
                types.update(s.get("reachable_types", []))
        s = r.get("schema")
        if isinstance(s, dict):
            formats.update(s.get("reachable_formats", []))
            types.update(s.get("reachable_types", []))
    is_binary = any(x in {"binary", "byte"} for x in formats) or any(
        any(tok in mime for tok in ("application/pdf", "application/octet-stream", "text/csv", "application/zip"))
        for mime in content_types
    )
    is_json = any("json" in mime for mime in content_types)
    return {
        "declared_media_types": sorted(content_types),
        "reachable_formats": sorted(formats),
        "reachable_types": sorted(types),
        "binary_or_file_response_signal": is_binary,
        "json_response_signal": is_json,
    }


def main():
    args = parse_args()
    swagger_path = Path(args.swagger)
    raw = swagger_path.read_bytes()
    sha = hashlib.sha256(raw).hexdigest()
    assert sha == EXPECTED_SHA, (sha, EXPECTED_SHA)
    assert len(raw) == EXPECTED_BYTES, (len(raw), EXPECTED_BYTES)
    spec = json.loads(raw.decode("utf-8"))
    paths = spec.get("paths")
    assert isinstance(paths, dict)
    operation_count = sum(1 for item in paths.values() if isinstance(item, dict) for method in item if method.lower() in HTTP_METHODS)
    assert operation_count == 463, operation_count

    inventory = json.loads(Path(args.inventory).read_text(encoding="utf-8"))
    assert inventory["schema"] == "OZON_WORKFLOW_REPORT_DOCUMENT_INVENTORY_V1"
    pending = [r for r in inventory["rows"] if not r.get("accepted_step3_alias")]
    assert len(pending) == 118, len(pending)

    rows = []
    for inv in pending:
        method = inv["http_method"].lower()
        route = inv["fixed_path"]
        path_item = paths.get(route)
        assert isinstance(path_item, dict), f"Swagger path missing: {route}"
        op = path_item.get(method)
        assert isinstance(op, dict), f"Swagger operation missing: {method.upper()} {route}"
        responses = response_evidence(spec, op)
        rows.append({
            "operation_key": inv["operation_key"],
            "inventory_detection_reasons": inv["detection_reasons"],
            "inventory_candidate_classification": inv["step5_classification"],
            "swagger_operation_id": op.get("operationId"),
            "swagger_tags": op.get("tags", []),
            "swagger_summary": op.get("summary"),
            "swagger_description": op.get("description"),
            "swagger_deprecated": op.get("deprecated", False),
            "swagger_consumes": op.get("consumes", []),
            "swagger_produces": op.get("produces", []),
            "request": request_evidence(spec, path_item, op),
            "responses": responses,
            "response_media": response_media_flags(op, responses),
            "semantic_decision": "UNRESOLVED_REQUIRES_EXPLICIT_STEP5_DECISION",
        })

    assert len(rows) == 118
    assert len({r["operation_key"] for r in rows}) == 118
    out = {
        "schema": "OZON_STEP5_EXACT_SCHEMA_EVIDENCE_V1",
        "as_of": "2026-08-29",
        "seller_swagger": {
            "sha256": sha,
            "bytes": len(raw),
            "operations": operation_count,
        },
        "candidate_inventory": {
            "pending_rows": 118,
            "source_schema": inventory["schema"],
        },
        "boundary": "This file extracts exact Swagger evidence only. It makes no automatic read/write/privacy authorization decision. Property-name privacy hits are discovery-only and require explicit review.",
        "rows": rows,
    }
    Path(args.out).write_text(json.dumps(out, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print("STEP5_EXACT_SCHEMA_AUTHORITY_IDENTITY_PASS")
    print("STEP5_EXACT_SCHEMA_PENDING_118_EXTRACTED_PASS")
    print("OZON_STEP5_EXACT_SCHEMA_EVIDENCE_AUTHOR_GATE_PASS")


if __name__ == "__main__":
    main()
