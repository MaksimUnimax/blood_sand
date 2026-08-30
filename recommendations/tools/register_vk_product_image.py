#!/usr/bin/env python3
"""Register one VK image and atomically update protected illustration state.

Run under the staging service account/environment.  This command deliberately
does not echo tokens, upload URLs, or attachment IDs.
"""
from __future__ import annotations

import argparse
import json
import mimetypes
import os
import stat
import tempfile
from pathlib import Path

import httpx

from recommendations.vk.illustrations import (
    VKIllustrationConfigurationError, active_product_keys, validate_attachment,
)


def _runtime_path() -> Path:
    raw = os.environ.get("KIP_VK_PRODUCT_ILLUSTRATIONS_PATH")
    if not raw:
        raise ValueError("KIP_VK_PRODUCT_ILLUSTRATIONS_PATH is required")
    return Path(raw)


def _config() -> tuple[int, str, int | None]:
    try:
        group_id = int(os.environ["KIP_VK_GROUP_ID"])
    except (KeyError, ValueError) as exc:
        raise ValueError("protected VK group configuration is required") from exc
    token = os.environ.get("KIP_VK_GROUP_TOKEN")
    if group_id <= 0 or not token:
        raise ValueError("protected VK group configuration is invalid")
    raw_peer = os.environ.get("KIP_VK_IMAGE_REGISTRATION_PEER_ID")
    peer = int(raw_peer) if raw_peer else None
    if peer == 0:
        raise ValueError("image registration peer is invalid")
    return group_id, token, peer


def _api(client: httpx.Client, method: str, token: str, payload: dict) -> dict:
    try:
        response = client.post("https://api.vk.com/method/" + method, data={**payload, "access_token": token, "v": "5.199"})
        value = response.json()
    except (httpx.HTTPError, ValueError) as exc:
        raise RuntimeError("VK API registration request failed") from exc
    if not isinstance(value, dict) or "error" in value or "response" not in value:
        raise RuntimeError("VK API registration request was rejected")
    return value["response"]


def register(file_path: Path) -> str:
    group_id, token, peer_id = _config()
    if not file_path.is_file() or not mimetypes.guess_type(file_path.name)[0] in {"image/png", "image/jpeg", "image/webp"}:
        raise ValueError("file must be an existing PNG, JPEG, or WebP image")
    with httpx.Client(timeout=20) as client:
        upload = _api(client, "photos.getMessagesUploadServer", token, {"group_id": group_id, **({"peer_id": peer_id} if peer_id else {})})
        if not isinstance(upload, dict) or not isinstance(upload.get("upload_url"), str):
            raise RuntimeError("VK upload server response is invalid")
        try:
            uploaded = client.post(upload["upload_url"], files={"photo": (file_path.name, file_path.read_bytes(), mimetypes.guess_type(file_path.name)[0])}).json()
        except (httpx.HTTPError, ValueError) as exc:
            raise RuntimeError("VK image upload failed") from exc
        if not isinstance(uploaded, dict) or not all(isinstance(uploaded.get(key), str) for key in ("photo", "server", "hash")):
            raise RuntimeError("VK image upload response is invalid")
        saved = _api(client, "photos.saveMessagesPhoto", token, {"photo": uploaded["photo"], "server": uploaded["server"], "hash": uploaded["hash"]})
    if not isinstance(saved, list) or len(saved) != 1 or not isinstance(saved[0], dict):
        raise RuntimeError("VK saved photo response is invalid")
    photo = saved[0]
    if type(photo.get("owner_id")) is not int or type(photo.get("id")) is not int:
        raise RuntimeError("VK saved photo identity is invalid")
    return validate_attachment(f"photo{photo['owner_id']}_{photo['id']}")


def update_registry(product_key: str, attachment: str, assign_all: bool) -> None:
    expected = active_product_keys()
    if product_key not in expected:
        raise ValueError("unknown active recommendation product key")
    path = _runtime_path()
    current = {"version": 1, "attachments": {}}
    if path.exists():
        try: current = json.loads(path.read_text(encoding="utf-8"))
        except (OSError, json.JSONDecodeError) as exc: raise ValueError("existing runtime registry is invalid") from exc
    if not isinstance(current, dict) or current.get("version") != 1 or not isinstance(current.get("attachments"), dict):
        raise ValueError("existing runtime registry is invalid")
    mappings = dict(current["attachments"])
    if set(mappings) - expected:
        raise ValueError("existing runtime registry contains unknown product key")
    for key, value in mappings.items(): validate_attachment(value)
    if assign_all:
        mappings = {key: attachment for key in expected}
    else:
        mappings[product_key] = attachment
    path.parent.mkdir(parents=True, exist_ok=True)
    fd, temp_name = tempfile.mkstemp(prefix=".product-illustrations-", dir=path.parent)
    try:
        with os.fdopen(fd, "w", encoding="utf-8") as handle:
            json.dump({"version": 1, "attachments": dict(sorted(mappings.items()))}, handle, ensure_ascii=False, separators=(",", ":"))
            handle.flush(); os.fsync(handle.fileno()
            )
        os.chmod(temp_name, stat.S_IRUSR | stat.S_IWUSR)
        os.replace(temp_name, path)
    finally:
        if os.path.exists(temp_name): os.unlink(temp_name)


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--product-key", required=True)
    source = parser.add_mutually_exclusive_group(required=True)
    source.add_argument("--file")
    source.add_argument("--attachment")
    parser.add_argument("--assign-all-active-products", action="store_true")
    args = parser.parse_args()
    try:
        attachment = register(Path(args.file)) if args.file else validate_attachment(args.attachment)
        update_registry(args.product_key, attachment, args.assign_all_active_products)
    except (ValueError, VKIllustrationConfigurationError, RuntimeError) as exc:
        print("registration failed:", str(exc))
        return 1
    print("registration completed")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
