#!/usr/bin/env python3
"""Fail-closed verifier/reconstructor for the Step 7 exact Seller Swagger carrier."""
from __future__ import annotations
import argparse, base64, hashlib, json, lzma, os, tempfile
from pathlib import Path

HTTP_METHODS = {"get", "post", "put", "patch", "delete", "head", "options", "trace"}


def digest(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()


def require(ok: bool, message: str) -> None:
    if not ok:
        raise RuntimeError(message)


def atomic_write(path: Path, data: bytes) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    fd, temp = tempfile.mkstemp(prefix=f".{path.name}.", dir=path.parent)
    try:
        with os.fdopen(fd, "wb") as stream:
            stream.write(data); stream.flush(); os.fsync(stream.fileno())
        os.replace(temp, path)
    except BaseException:
        try: os.unlink(temp)
        except FileNotFoundError: pass
        raise


def verify(root: Path, output: Path | None) -> dict:
    manifest = json.loads((root / "manifest.json").read_text(encoding="utf-8"))
    require(manifest.get("schema") == "ozon.seller.exact-swagger.transport.v2", "manifest schema mismatch")
    authority = manifest["authority"]
    transport = manifest["transport"]
    frag = transport["fragments"]
    entries = frag["entries"]
    require(len(entries) == frag["count"] and entries, "fragment count mismatch")
    require([x["index"] for x in entries] == list(range(1, len(entries) + 1)), "fragment indices not contiguous")
    expected = [x["name"] for x in entries]
    actual = sorted(str(p.relative_to(root)).replace(os.sep, "/") for p in (root / frag["directory"]).glob("*.txt") if p.is_file())
    require(actual == sorted(expected), "missing, extra, or renamed fragment")
    chunks = []
    for item in entries:
        data = (root / item["name"]).read_bytes()
        require(len(data) == item["bytes"] <= 9000, f"fragment size mismatch: {item['name']}")
        require(digest(data) == item["sha256"], f"fragment hash mismatch: {item['name']}")
        chunks.append(data)
    encoded = b"".join(chunks)
    enc = transport["encoding"]
    require((len(encoded), digest(encoded)) == (enc["bytes"], enc["sha256"]), "Base64 carrier identity mismatch")
    packed = base64.b64decode(encoded, validate=True)
    comp = transport["compression"]
    require((len(packed), digest(packed)) == (comp["bytes"], comp["sha256"]), "XZ identity mismatch")
    raw = lzma.decompress(packed, format=lzma.FORMAT_XZ)
    require((len(raw), digest(raw)) == (authority["bytes"], authority["sha256"]), "raw authority identity mismatch")
    spec = json.loads(raw.decode("utf-8")); paths = spec.get("paths")
    require(isinstance(paths, dict), "paths must be object")
    operations = sum(1 for item in paths.values() if isinstance(item, dict) for method in item if method.lower() in HTTP_METHODS)
    require(spec.get("openapi") == authority["openapi"], "OpenAPI mismatch")
    require(spec.get("info", {}).get("title") == authority["info_title"], "title mismatch")
    require(spec.get("info", {}).get("version") == authority["info_version"], "version mismatch")
    require(len(paths) == authority["path_count"] == 463, "path count mismatch")
    require(operations == authority["operation_count"] == 463, "operation count mismatch")
    if output is not None: atomic_write(output, raw)
    return {"raw_bytes": len(raw), "raw_sha256": digest(raw), "openapi": spec["openapi"], "paths": len(paths), "operations": operations, "fragments": len(entries), "max_fragment_bytes": max(x["bytes"] for x in entries)}


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--root", type=Path, default=Path(__file__).resolve().parent)
    ap.add_argument("--output", type=Path)
    args = ap.parse_args()
    try: result = verify(args.root.resolve(), args.output.resolve() if args.output else None)
    except Exception as exc:
        print(f"STEP7_EXACT_SWAGGER_AUTHORITY_V2_FAIL: {exc}"); return 1
    for key, value in result.items(): print(f"{key}={value}")
    print("STEP7_EXACT_SWAGGER_AUTHORITY_V2_PASS")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
