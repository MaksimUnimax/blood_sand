#!/usr/bin/env python3
from __future__ import annotations

import argparse
import json
import shutil
from pathlib import Path

BASE_VERSION = "1.1.5"
BUILD_VERSION = "1.1.6"


def replace_once(text: str, old: str, new: str, *, label: str) -> str:
    count = text.count(old)
    if count != 1:
        raise RuntimeError(f"{label}: expected exactly one occurrence of {old!r}, got {count}")
    return text.replace(old, new, 1)


def main() -> int:
    parser = argparse.ArgumentParser(description="Build Wordstat 1.1.5 + narrow Yandex Search API overlay without mutating the reference tree.")
    parser.add_argument("--repo-root", default=None)
    parser.add_argument("--out", required=True)
    args = parser.parse_args()

    script_dir = Path(__file__).resolve().parent
    repo_root = Path(args.repo_root).resolve() if args.repo_root else script_dir.parents[3]
    source = repo_root / "tooling" / "llm-api-bridges" / "yandex-wordstat" / f"reference-{BASE_VERSION}"
    overlay = script_dir / "yandex_search_protocol_overlay.js"
    out = Path(args.out).resolve()

    if not source.is_dir():
        raise RuntimeError(f"source reference not found: {source}")
    if not overlay.is_file():
        raise RuntimeError(f"overlay not found: {overlay}")
    if out.exists():
        shutil.rmtree(out)
    shutil.copytree(source, out)
    shutil.copy2(overlay, out / "shared" / "yandex_search_protocol_overlay.js")

    manifest_path = out / "manifest.json"
    manifest = json.loads(manifest_path.read_text(encoding="utf-8"))
    if manifest.get("version") != BASE_VERSION:
        raise RuntimeError(f"unexpected source manifest version: {manifest.get('version')}")
    manifest["version"] = BUILD_VERSION
    manifest["name"] = "Wordstat + Yandex Search Bridge — ChatGPT ↔ Yandex"
    manifest["description"] = (
        "Контролируемый read-only мост ChatGPT ↔ Yandex Search API / Wordstat: "
        "сохраняет Wordstat 1.1.5 lifecycle и добавляет allowlisted webSearch/genSearch overlay."
    )
    scripts = manifest["content_scripts"][0]["js"]
    marker = "shared/wordstat_protocol.js"
    if marker not in scripts:
        raise RuntimeError("manifest: base wordstat protocol import not found")
    if "shared/yandex_search_protocol_overlay.js" not in scripts:
        scripts.insert(scripts.index(marker) + 1, "shared/yandex_search_protocol_overlay.js")
    manifest_path.write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

    service_worker_path = out / "service_worker.js"
    sw = service_worker_path.read_text(encoding="utf-8")
    sw = replace_once(sw, 'const VERSION = "1.1.5";', 'const VERSION = "1.1.6";', label="service_worker version")
    sw = replace_once(
        sw,
        '  "shared/wordstat_protocol.js",\n',
        '  "shared/wordstat_protocol.js",\n  "shared/yandex_search_protocol_overlay.js",\n',
        label="service_worker import",
    )
    service_worker_path.write_text(sw, encoding="utf-8")

    content_script_path = out / "content_script.js"
    cs = content_script_path.read_text(encoding="utf-8")
    cs = replace_once(cs, 'const VERSION = "1.1.5";', 'const VERSION = "1.1.6";', label="content_script version")
    content_script_path.write_text(cs, encoding="utf-8")

    build_note = out / "R2_YANDEX_SEARCH_OVERLAY_BUILD.txt"
    build_note.write_text(
        "Derived build: Wordstat Bridge 1.1.5 + R2 Yandex Search API overlay\n"
        "Build version: 1.1.6\n"
        "Base reference remains unmodified in Git.\n"
        "Added command prefix: YANDEX_SEARCH_API_V1\n"
        "Added result prefix: YANDEX_SEARCH_RESULT_V1\n"
        "Allowlisted methods: webSearch, genSearch\n"
        "No arbitrary URL/method passthrough. Existing local API key/folder storage keys are preserved by schema; a separate Chrome extension installation may have separate chrome.storage.\n",
        encoding="utf-8",
    )

    print(out)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
