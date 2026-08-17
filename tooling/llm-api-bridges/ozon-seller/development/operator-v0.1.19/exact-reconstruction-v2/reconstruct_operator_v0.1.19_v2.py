#!/usr/bin/env python3
import argparse
import base64
import hashlib
import io
import sys
import zipfile
from pathlib import Path

HERE = Path(__file__).resolve().parent
OLD = HERE.parent / "exact-reconstruction"

EXPECTED_B64_SIZE = 133760
EXPECTED_B64_SHA256 = "cb0bf7d1b467e8e28e1f083ed572ee4bb021034c0f2d3cffc734437648cc9d8f"
EXPECTED_ZIP_SIZE = 100320
EXPECTED_ZIP_SHA256 = "2b86518bfdc81081e271c7f8346188fc7047999385d1da4428fa2a133dba15bf"

EXPECTED_ZIP_FILES = [
    "content_script.js",
    "manifest.json",
    "popup.css",
    "popup.html",
    "popup.js",
    "service_worker.js",
    "shared/ai_adapters.js",
    "shared/bridge_autorun_model.js",
    "shared/composer_send.js",
    "shared/conversation_identity.js",
    "shared/manual_controls.js",
    "shared/ozon_contract.js",
    "shared/ozon_credentials.js",
    "shared/ozon_provider.js",
    "shared/proven_writing_block_capture.js",
    "shared/provider_transport_core.js",
    "shared/runtime_names.js",
]

# The first reconstruction upload was preserved as evidence. 00 was exact;
# 01-04 were transport-truncated to the LAST 19,999 bytes. V2 adds only the
# missing prefixes and verifies every committed fragment before concatenation.
FRAGMENTS = [
    (OLD / "00.b64.part", 10000, "c8b027cd94c38768dc998f2063a4e9ae2750cbf58a71935b45f929b79f7a725a"),
    (HERE / "01.prefix.part", 1, "a1fce4363854ff888cff4b8e7875d600c2682390412a8cf79b37d0b11148b0fa"),
    (OLD / "01.b64.part", 19999, "834702eb1f34ad16939dde63704849648f44e545f5ace7aa482b238d5780e997"),
    (HERE / "02.prefix.a.part", 10000, "8d158aaab37882a812bb59a762e4046cf11ab3bd40ab93b57f887bbd78c59e51"),
    (HERE / "02.prefix.b.part", 10000, "bbf010640377b945789b5098e7857432e32f00377eb9222ea598410f7632668f"),
    (HERE / "02.prefix.c.part", 1, "a1fce4363854ff888cff4b8e7875d600c2682390412a8cf79b37d0b11148b0fa"),
    (OLD / "02.b64.part", 19999, "b1a00551f41d7371e3fc219aca97ec2827f534d5a2a285338a4be685e9b141ba"),
    (HERE / "03.prefix.a.part", 10000, "8feabdfe53c66c38d75f9d9105ee0545b2dcd306bfaf3c9afa29c8a5793eaef6"),
    (HERE / "03.prefix.b.part", 10000, "eef0d6bd3ede1303acc49efa3d8717270ed68ae25e51896514e669b6cff70fce"),
    (HERE / "03.prefix.c.part", 1, "acac86c0e609ca906f632b0e2dacccb2b77d22b0621f20ebece1a4835b93f6f0"),
    (OLD / "03.b64.part", 19999, "f479201cb1e4eb967b2c368a63e3c5316f1b6038a77e691daa8ba5f48ef412b6"),
    (HERE / "04.prefix.part", 3761, "a94fe9654a7ee800e7474f8b90b8f167bf7e051f35e689d97923c2fef5e429d4"),
    (OLD / "04.b64.part", 19999, "71eb0cef609302d82468b978ed8c0fe69a7921dc4e8e9f068675a6f51740da5a"),
]


def sha256(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()


def die(message: str) -> None:
    print(f"RECONSTRUCTION_V2_FAIL: {message}", file=sys.stderr)
    raise SystemExit(1)


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("output_zip", type=Path)
    args = parser.parse_args()

    pieces = []
    for path, expected_size, expected_sha in FRAGMENTS:
        data = path.read_bytes()
        observed_sha = sha256(data)
        print(f"FRAGMENT {path.name} size={len(data)} sha256={observed_sha}")
        if len(data) != expected_size:
            die(f"{path}: size {len(data)} != {expected_size}")
        if observed_sha != expected_sha:
            die(f"{path}: sha256 {observed_sha} != {expected_sha}")
        pieces.append(data)

    b64_data = b"".join(pieces)
    b64_sha = sha256(b64_data)
    print(f"BASE64 size={len(b64_data)} sha256={b64_sha}")
    if len(b64_data) != EXPECTED_B64_SIZE:
        die(f"base64 size {len(b64_data)} != {EXPECTED_B64_SIZE}")
    if b64_sha != EXPECTED_B64_SHA256:
        die(f"base64 sha256 {b64_sha} != {EXPECTED_B64_SHA256}")

    try:
        zip_data = base64.b64decode(b64_data, validate=True)
    except Exception as exc:
        die(f"base64 decode error: {exc}")

    zip_sha = sha256(zip_data)
    print(f"ZIP size={len(zip_data)} sha256={zip_sha}")
    if len(zip_data) != EXPECTED_ZIP_SIZE:
        die(f"zip size {len(zip_data)} != {EXPECTED_ZIP_SIZE}")
    if zip_sha != EXPECTED_ZIP_SHA256:
        die(f"zip sha256 {zip_sha} != {EXPECTED_ZIP_SHA256}")

    with zipfile.ZipFile(io.BytesIO(zip_data), "r") as zf:
        names = zf.namelist()
    if names != EXPECTED_ZIP_FILES:
        die(f"zip inventory mismatch: {names!r}")

    args.output_zip.parent.mkdir(parents=True, exist_ok=True)
    args.output_zip.write_bytes(zip_data)
    print("RECONSTRUCTION_V2_PASS")


if __name__ == "__main__":
    main()
