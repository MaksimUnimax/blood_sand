#!/usr/bin/env python3
import argparse
import hashlib
import json
import os
from pathlib import Path
import re
import tempfile

SCHEMA = "OZON_INSTALLABLE_NODEBUNDLE_MATERIALIZATION_V1"
SECTION_RE = re.compile(
    r"/\* BEGIN (?P<path>shared/[A-Za-z0-9_./-]+\.js) \*/\n(?P<body>.*?)\n/\* END (?P=path) \*/",
    re.DOTALL,
)
REQUIRED_REPAIRED_SECTIONS = {
    "shared/ozon_operation_registry.js",
    "shared/ozon_contract.js",
    "shared/ozon_entitlements.js",
    "shared/ozon_provider.js",
    "shared/provider_transport_core.js",
}
STDIO_MARKER = "/* BEGIN Step 7 MCP stdio shell */"


def normalize_lf(text: str) -> str:
    return text.replace("\r\n", "\n").replace("\r", "\n")


def sha256_bytes(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()


def stable_write(path: Path, data: bytes) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    fd, tmp_name = tempfile.mkstemp(prefix=f".{path.name}.", dir=str(path.parent))
    try:
        with os.fdopen(fd, "wb") as handle:
            handle.write(data)
        os.replace(tmp_name, path)
    finally:
        if os.path.exists(tmp_name):
            os.unlink(tmp_name)


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Materialize the installable Ozon nodebundle from frozen Step7 shared runtime sections.")
    parser.add_argument("--repo-root", default=".")
    parser.add_argument("--template", default=None, help="Bundle template. Defaults to dist/ozon-seller-mcp-nodebundle.js.")
    parser.add_argument("--candidate-root", default=None, help="Authoritative shared source directory. Defaults to dist-step7-candidate/shared.")
    parser.add_argument("--output", default=None, help="Output bundle. Defaults to the template path.")
    parser.add_argument("--manifest", default=None, help="Optional deterministic JSON manifest path.")
    return parser.parse_args()


def main() -> int:
    args = parse_args()
    repo = Path(args.repo_root).resolve()
    seller = repo / "tooling" / "llm-api-bridges" / "ozon-seller"
    template = Path(args.template).resolve() if args.template else seller / "dist" / "ozon-seller-mcp-nodebundle.js"
    candidate_root = Path(args.candidate_root).resolve() if args.candidate_root else seller / "dist-step7-candidate" / "shared"
    output = Path(args.output).resolve() if args.output else template

    template_bytes = template.read_bytes()
    template_text = normalize_lf(template_bytes.decode("utf-8"))
    if template_text.count(STDIO_MARKER) != 1:
        raise SystemExit(f"expected exactly one stdio shell marker in {template}")

    matches = list(SECTION_RE.finditer(template_text))
    if not matches:
        raise SystemExit(f"no shared runtime sections found in {template}")
    section_paths = [match.group("path") for match in matches]
    if len(section_paths) != len(set(section_paths)):
        raise SystemExit("duplicate shared runtime section markers in nodebundle")
    missing_required = sorted(REQUIRED_REPAIRED_SECTIONS.difference(section_paths))
    if missing_required:
        raise SystemExit(f"nodebundle template is missing repaired sections: {missing_required}")

    source_rows = []
    sources = {}
    for relative in section_paths:
        source_path = candidate_root / relative.removeprefix("shared/")
        if not source_path.is_file():
            raise SystemExit(f"missing authoritative shared source: {source_path}")
        source_text = normalize_lf(source_path.read_text(encoding="utf-8")).rstrip("\n")
        source_bytes = source_text.encode("utf-8")
        sources[relative] = source_text
        source_rows.append({
            "path": relative,
            "bytes": len(source_bytes),
            "sha256": sha256_bytes(source_bytes),
        })

    changed_sections = []

    def replace(match: re.Match) -> str:
        relative = match.group("path")
        old_body = match.group("body").rstrip("\n")
        new_body = sources[relative]
        if old_body != new_body:
            changed_sections.append(relative)
        return f"/* BEGIN {relative} */\n{new_body}\n\n/* END {relative} */"

    materialized_text = SECTION_RE.sub(replace, template_text)
    if materialized_text.count(STDIO_MARKER) != 1:
        raise SystemExit("stdio shell marker changed during materialization")

    post_matches = list(SECTION_RE.finditer(materialized_text))
    post_paths = [match.group("path") for match in post_matches]
    if post_paths != section_paths:
        raise SystemExit("shared runtime section order changed during materialization")
    for match in post_matches:
        relative = match.group("path")
        if match.group("body").rstrip("\n") != sources[relative]:
            raise SystemExit(f"materialized section differs from authoritative source: {relative}")

    output_bytes = materialized_text.encode("utf-8")
    stable_write(output, output_bytes)

    payload = {
        "schema": SCHEMA,
        "status": "PASS",
        "section_count": len(section_paths),
        "section_paths": section_paths,
        "required_repaired_sections": sorted(REQUIRED_REPAIRED_SECTIONS),
        "changed_section_count": len(changed_sections),
        "changed_sections": sorted(changed_sections),
        "template_bytes": len(template_bytes),
        "template_sha256": sha256_bytes(template_bytes),
        "output_bytes": len(output_bytes),
        "output_sha256": sha256_bytes(output_bytes),
        "source_sections": source_rows,
        "stdio_shell_preserved": True,
        "line_endings": "LF",
    }
    if args.manifest:
        manifest = Path(args.manifest).resolve()
        manifest_bytes = (json.dumps(payload, sort_keys=True, indent=2, ensure_ascii=False) + "\n").encode("utf-8")
        stable_write(manifest, manifest_bytes)

    print(f"OZON_INSTALLABLE_NODEBUNDLE_MATERIALIZED sections={len(section_paths)} changed={len(changed_sections)} sha256={payload['output_sha256']}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
