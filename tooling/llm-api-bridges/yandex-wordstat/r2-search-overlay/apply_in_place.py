#!/usr/bin/env python3
from __future__ import annotations

import argparse
import json
import shutil
import sys
from datetime import datetime, timezone
from pathlib import Path

TARGET_VERSION = "1.1.6"
OVERLAY_NAME = "yandex_search_protocol_overlay.js"


def replace_once_or_already(text: str, old: str, new: str, *, label: str) -> str:
    if new in text:
        return text
    count = text.count(old)
    if count != 1:
        raise RuntimeError(f"{label}: expected exactly one occurrence of {old!r}, got {count}")
    return text.replace(old, new, 1)


def main() -> int:
    parser = argparse.ArgumentParser(
        description=(
            "Patch an existing unpacked Wordstat Bridge directory in place with the narrow "
            "Yandex Search API overlay. The directory path stays unchanged, so Chrome can keep "
            "the same unpacked-extension identity/storage."
        )
    )
    parser.add_argument("extension_dir", help="Path to the currently loaded unpacked Wordstat Bridge directory")
    parser.add_argument("--no-backup", action="store_true", help="Disable backup creation (not recommended)")
    args = parser.parse_args()

    extension_dir = Path(args.extension_dir).expanduser().resolve()
    overlay_source = Path(__file__).resolve().parent / OVERLAY_NAME

    required = [
        extension_dir / "manifest.json",
        extension_dir / "service_worker.js",
        extension_dir / "content_script.js",
        extension_dir / "shared" / "wordstat_protocol.js",
    ]
    missing = [str(path) for path in required if not path.is_file()]
    if missing:
        raise RuntimeError("Not a recognized Wordstat Bridge directory; missing: " + ", ".join(missing))
    if not overlay_source.is_file():
        raise RuntimeError(f"Overlay source not found: {overlay_source}")

    manifest_path = extension_dir / "manifest.json"
    manifest = json.loads(manifest_path.read_text(encoding="utf-8"))
    current_version = str(manifest.get("version") or "")
    if current_version not in {"1.1.5", TARGET_VERSION}:
        raise RuntimeError(
            f"Unsupported installed extension version {current_version!r}; expected 1.1.5 or already-patched {TARGET_VERSION}."
        )
    host_permissions = set(manifest.get("host_permissions") or [])
    if "https://searchapi.api.cloud.yandex.net/*" not in host_permissions:
        raise RuntimeError("Required Search API host permission is absent; refusing to broaden permissions silently.")

    timestamp = datetime.now(timezone.utc).strftime("%Y%m%dT%H%M%SZ")
    backup_dir = extension_dir / f".r2-search-overlay-backup-{timestamp}"
    backup_files = [manifest_path, extension_dir / "service_worker.js", extension_dir / "content_script.js"]
    existing_overlay = extension_dir / "shared" / OVERLAY_NAME
    if existing_overlay.exists():
        backup_files.append(existing_overlay)

    if not args.no_backup:
        backup_dir.mkdir(parents=False, exist_ok=False)
        for source in backup_files:
            relative = source.relative_to(extension_dir)
            destination = backup_dir / relative
            destination.parent.mkdir(parents=True, exist_ok=True)
            shutil.copy2(source, destination)

    try:
        shutil.copy2(overlay_source, existing_overlay)

        manifest = json.loads(manifest_path.read_text(encoding="utf-8"))
        scripts = manifest["content_scripts"][0]["js"]
        marker = "shared/wordstat_protocol.js"
        overlay_rel = f"shared/{OVERLAY_NAME}"
        if marker not in scripts:
            raise RuntimeError("manifest: base wordstat protocol import not found")
        if overlay_rel not in scripts:
            scripts.insert(scripts.index(marker) + 1, overlay_rel)
        manifest["version"] = TARGET_VERSION
        manifest["name"] = "Wordstat + Yandex Search Bridge — ChatGPT ↔ Yandex"
        manifest["description"] = (
            "Контролируемый read-only мост ChatGPT ↔ Yandex Search API / Wordstat: "
            "Wordstat lifecycle + allowlisted webSearch/genSearch overlay."
        )
        manifest_path.write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

        sw_path = extension_dir / "service_worker.js"
        sw = sw_path.read_text(encoding="utf-8")
        sw = replace_once_or_already(
            sw,
            'importScripts("shared/conversation_identity.js", "shared/manual_controls.js", "shared/wordstat_protocol.js", "shared/autorun_model.js");',
            'importScripts("shared/conversation_identity.js", "shared/manual_controls.js", "shared/wordstat_protocol.js", "shared/yandex_search_protocol_overlay.js", "shared/autorun_model.js");',
            label="service_worker import",
        )
        sw = replace_once_or_already(
            sw,
            'const VERSION = "1.1.5";',
            'const VERSION = "1.1.6";',
            label="service_worker version",
        )
        sw_path.write_text(sw, encoding="utf-8")

        cs_path = extension_dir / "content_script.js"
        cs = cs_path.read_text(encoding="utf-8")
        cs = replace_once_or_already(
            cs,
            'const VERSION = "1.1.5";',
            'const VERSION = "1.1.6";',
            label="content_script version",
        )
        cs_path.write_text(cs, encoding="utf-8")

        marker_path = extension_dir / "R2_YANDEX_SEARCH_OVERLAY_INSTALLED.txt"
        marker_path.write_text(
            "R2 Yandex Search API overlay installed in place.\n"
            "Version: 1.1.6\n"
            "Command prefix: YANDEX_SEARCH_API_V1\n"
            "Result prefix: YANDEX_SEARCH_RESULT_V1\n"
            "Allowlisted methods: webSearch, genSearch\n"
            "No credentials were read, copied, exported, or modified by this patcher.\n"
            "Reload this unpacked extension from chrome://extensions after patching.\n",
            encoding="utf-8",
        )
    except Exception:
        if not args.no_backup and backup_dir.is_dir():
            for backup in backup_dir.rglob("*"):
                if backup.is_file():
                    destination = extension_dir / backup.relative_to(backup_dir)
                    destination.parent.mkdir(parents=True, exist_ok=True)
                    shutil.copy2(backup, destination)
            if not (backup_dir / "shared" / OVERLAY_NAME).exists() and existing_overlay.exists():
                existing_overlay.unlink()
        raise

    print(f"Patched: {extension_dir}")
    if not args.no_backup:
        print(f"Backup: {backup_dir}")
    print("Next: chrome://extensions -> Reload the existing unpacked extension")
    return 0


if __name__ == "__main__":
    try:
        raise SystemExit(main())
    except Exception as exc:
        print(f"ERROR: {exc}", file=sys.stderr)
        raise
