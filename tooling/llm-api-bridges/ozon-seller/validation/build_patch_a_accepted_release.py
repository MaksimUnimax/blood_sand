#!/usr/bin/env python3
import hashlib
import sys
import zipfile
from pathlib import Path

EXPECTED_FILE_COUNT = 19
EXPECTED_SERVICE_WORKER_SHA256 = "a6088180c7aae74fc3379f0adc7f52dc3180d77fcfe7acf9400dacd22ba293bc"
EXPECTED_TREE_SHA256 = "acfba949b5df31f6a489653bb1d473dab7bb771f0089a060cd475b541271beb0"
EXPECTED_ZIP_SIZE = 138062
EXPECTED_ZIP_SHA256 = "4bfee6dca838a29ab11c63600b3be19121aa2b111294055c1426d3d01bcbbefb"
FIXED_ZIP_TIME = (2026, 8, 24, 0, 0, 0)


def sha256(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()


def tree_digest(root: Path) -> str:
    files = sorted((p for p in root.rglob("*") if p.is_file()), key=lambda p: p.relative_to(root).as_posix())
    lines = "".join(f"{p.relative_to(root).as_posix()}\0{sha256(p.read_bytes())}\n" for p in files)
    return sha256(lines.encode("utf-8"))


def main() -> None:
    if len(sys.argv) != 3:
        raise SystemExit("usage: build_patch_a_accepted_release.py <materialized-candidate-dir> <output.zip>")
    root = Path(sys.argv[1]).resolve()
    out = Path(sys.argv[2]).resolve()
    files = sorted((p for p in root.rglob("*") if p.is_file()), key=lambda p: p.relative_to(root).as_posix())
    if len(files) != EXPECTED_FILE_COUNT:
        raise RuntimeError(f"production file count {len(files)} != {EXPECTED_FILE_COUNT}")
    worker = root / "service_worker.js"
    worker_sha = sha256(worker.read_bytes())
    if worker_sha != EXPECTED_SERVICE_WORKER_SHA256:
        raise RuntimeError(f"service_worker.js SHA-256 mismatch: {worker_sha}")
    digest = tree_digest(root)
    if digest != EXPECTED_TREE_SHA256:
        raise RuntimeError(f"tree SHA-256 mismatch: {digest}")

    out.parent.mkdir(parents=True, exist_ok=True)
    if out.exists():
        out.unlink()
    with zipfile.ZipFile(out, "w", compression=zipfile.ZIP_DEFLATED, compresslevel=9) as zf:
        for p in files:
            rel = p.relative_to(root).as_posix()
            info = zipfile.ZipInfo(rel, date_time=FIXED_ZIP_TIME)
            info.compress_type = zipfile.ZIP_DEFLATED
            info.external_attr = 0o644 << 16
            zf.writestr(info, p.read_bytes(), compress_type=zipfile.ZIP_DEFLATED, compresslevel=9)

    raw = out.read_bytes()
    if len(raw) != EXPECTED_ZIP_SIZE:
        raise RuntimeError(f"ZIP size {len(raw)} != {EXPECTED_ZIP_SIZE}")
    zsha = sha256(raw)
    if zsha != EXPECTED_ZIP_SHA256:
        raise RuntimeError(f"ZIP SHA-256 mismatch: {zsha}")

    with zipfile.ZipFile(out, "r") as zf:
        names = sorted(n for n in zf.namelist() if not n.endswith("/"))
        if len(names) != EXPECTED_FILE_COUNT:
            raise RuntimeError(f"fresh ZIP inventory {len(names)} != {EXPECTED_FILE_COUNT}")

    print("PATCH_A_ACCEPTED_RELEASE_CANDIDATE_IDENTITY_PASS")
    print("PATCH_A_ACCEPTED_RELEASE_ZIP_SIZE_PASS")
    print("PATCH_A_ACCEPTED_RELEASE_ZIP_SHA256_PASS")
    print(str(out))


if __name__ == "__main__":
    main()
