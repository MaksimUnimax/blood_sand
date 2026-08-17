#!/usr/bin/env python3
import argparse
import base64
import hashlib
from pathlib import Path

PARTS = [
    ("00.b64.part", 10000, "c8b027cd94c38768dc998f2063a4e9ae2750cbf58a71935b45f929b79f7a725a"),
    ("01.b64.part", 20000, "e1046ece6c5034546ddca1cda846b6a798fbcb649da89664a2d644cb18581270"),
    ("02.b64.part", 40000, "ac55015397c0eaebd49729bc3ae868262719ae598e8cc7a3b50af7f7f1caf541"),
    ("03.b64.part", 40000, "a84658702b3377f4f5a43692bff8177edd5da32fd273975369697b33c0ec43cc"),
    ("04.b64.part", 23760, "97bdcf5e49da729eaf17d09ec1f658866d8a13c79363d2d210ae171250be70a6"),
]
FULL_B64_SIZE = 133760
FULL_B64_SHA256 = "2e0e44d85389c9deeab4650efe6a310b3be2204cfc3cd0df1d8c61c8f88c733c"
ZIP_SIZE = 100320
ZIP_SHA256 = "2b86518bfdc81081e271c7f8346188fc7047999385d1da4428fa2a133dba15bf"


def sha256(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()


def main() -> None:
    parser = argparse.ArgumentParser(description="Reconstruct exact operator Ozon Bridge v0.1.19 baseline ZIP")
    parser.add_argument("--parts-dir", type=Path, default=Path(__file__).resolve().parent)
    parser.add_argument("--output", type=Path, required=True)
    args = parser.parse_args()

    encoded_parts = []
    for name, expected_size, expected_hash in PARTS:
        data = (args.parts_dir / name).read_bytes()
        actual_hash = sha256(data)
        if len(data) != expected_size or actual_hash != expected_hash:
            raise SystemExit(
                f"PART_FAIL {name} size={len(data)} sha256={actual_hash} "
                f"expected_size={expected_size} expected_sha256={expected_hash}"
            )
        encoded_parts.append(data)

    encoded = b"".join(encoded_parts)
    encoded_hash = sha256(encoded)
    if len(encoded) != FULL_B64_SIZE or encoded_hash != FULL_B64_SHA256:
        raise SystemExit(
            f"BASE64_FAIL size={len(encoded)} sha256={encoded_hash} "
            f"expected_size={FULL_B64_SIZE} expected_sha256={FULL_B64_SHA256}"
        )

    try:
        zip_bytes = base64.b64decode(encoded, validate=True)
    except Exception as exc:
        raise SystemExit(f"BASE64_DECODE_FAIL {exc}") from exc

    zip_hash = sha256(zip_bytes)
    if len(zip_bytes) != ZIP_SIZE or zip_hash != ZIP_SHA256:
        raise SystemExit(
            f"ZIP_FAIL size={len(zip_bytes)} sha256={zip_hash} "
            f"expected_size={ZIP_SIZE} expected_sha256={ZIP_SHA256}"
        )

    args.output.parent.mkdir(parents=True, exist_ok=True)
    args.output.write_bytes(zip_bytes)
    print(f"RECONSTRUCTION_PASS size={len(zip_bytes)} sha256={zip_hash} output={args.output}")


if __name__ == "__main__":
    main()
