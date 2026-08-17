# Exact operator v0.1.19 reconstruction bundle

Date: 2026-08-17
Status: bounded Step 1 validation reconstruction repair; development evidence only; not a canonical GitHub release.

## Why this bundle exists

The first independent Step 1 Codex validation stopped at `PATCH_RECONSTRUCTION_FAIL` before any production behavior tests. The GitHub copy at `development/operator-v0.1.19/ozon-bridge-v0.1.19-extension.zip` is not the pinned operator artifact: its repository blob is only 15,009 bytes, while the exact operator-supplied baseline is 100,320 bytes and has SHA-256 `2b86518bfdc81081e271c7f8346188fc7047999385d1da4428fa2a133dba15bf`.

The original 100,320-byte operator artifact was recovered from the operator's ChatGPT file Library and independently re-hashed before creating this bundle. This repair changes only reconstruction evidence. It does not change Step 1 production logic.

Do **not** use the old 15,009-byte ZIP for the bounded retest.

## Exact encoded source

The exact original ZIP is stored losslessly as five no-newline base64 parts in this directory:

- `00.b64.part`: 10,000 bytes; SHA-256 `c8b027cd94c38768dc998f2063a4e9ae2750cbf58a71935b45f929b79f7a725a`
- `01.b64.part`: 20,000 bytes; SHA-256 `e1046ece6c5034546ddca1cda846b6a798fbcb649da89664a2d644cb18581270`
- `02.b64.part`: 40,000 bytes; SHA-256 `ac55015397c0eaebd49729bc3ae868262719ae598e8cc7a3b50af7f7f1caf541`
- `03.b64.part`: 40,000 bytes; SHA-256 `a84658702b3377f4f5a43692bff8177edd5da32fd273975369697b33c0ec43cc`
- `04.b64.part`: 23,760 bytes; SHA-256 `97bdcf5e49da729eaf17d09ec1f658866d8a13c79363d2d210ae171250be70a6`

Concatenated base64 length: 133,760 bytes.
Concatenated base64 SHA-256: `2e0e44d85389c9deeab4650efe6a310b3be2204cfc3cd0df1d8c61c8f88c733c`.

Decoded ZIP:

- size: 100,320 bytes;
- SHA-256: `2b86518bfdc81081e271c7f8346188fc7047999385d1da4428fa2a133dba15bf`;
- production files: 17.

Use `reconstruct_operator_v0.1.19.py` to verify all part hashes, concatenate, validate base64, decode, and verify the final ZIP before writing it.

Example:

```text
python reconstruct_operator_v0.1.19.py --output D:\codex\Test\qa-step1-contract-capability-retest\ozon-bridge-v0.1.19-extension.zip
```

The script must print `RECONSTRUCTION_PASS` with the exact ZIP size/hash above. Any mismatch is a hard FAIL.

## Step 1 patch bytes on Windows

The first validation also observed SHA mismatches for all eight textual Step 1 patch parts. The repository has no pinned root `.gitattributes` at the frozen implementation SHA, so a Windows working-tree checkout is not an acceptable byte authority for these hashes.

For the bounded retest, extract each patch part directly from the exact target commit as raw Git object bytes. A platform-safe method is Python `subprocess.run(["git", "show", f"{TARGET_SHA}:{repo_path}"], stdout=<binary file>, check=True)`. Do not hash a CRLF-normalized working-tree copy and do not use PowerShell text redirection to create the raw parts.

Expected raw committed patch-part SHA-256 values remain:

1. `00.patch.part` — `8146303b3ac046f07d841873257d0207117490a3b3977fac523b5dc572c5292b`
2. `01.patch.part` — `4d20c05d750adb43863a6d5d386eb6647539e78b5f495e5c8b9eed3af02e6f28`
3. `02.patch.part` — `23dc7cc98b0877f97c67358263097e66f44f17fe5b55c88d8a3a09f283dddf61`
4. `03.patch.part` — `49e248a74638e51bb39e5d6f33929b1faf71b80b5db9ceedb00e767c95fa654d`
5. `04.patch.part` — `508c42a05f872a24bc7d8d279cd7777b95158b1a3fe76cbe58731663865f35f1`
6. `05.patch.part` — `5906016f7c72b660ba0debd99c7c758ef4f7b60c609dbce11bb08e1fc03504c0`
7. `06.patch.part` — `5dfd53ac85b8d28b637010dc5a61910d25e5e539a52687deeef796411fe8570d`
8. `07.patch.part` — `f752e2176c5a58b690dbf287d44d06fec92ede2ad89ce149baf484bc38bcd1d5`

Expected byte-for-byte concatenated patch SHA-256:

`5afe153c15eb4005a836d005bab531f8905dbdcd5b0541d52a6112a3ebb0e3ce`

After patching a fresh extraction of the exact reconstructed baseline, exactly three production files must differ and must have these SHA-256 values:

- `service_worker.js` — `b594872cff8f7049a441ffe8fe422d761069a14a48a1d32e7e54f568c7f0502a`
- `shared/ozon_contract.js` — `b8f39ded0163f45714eebff7f8c1a35242712918df5568935fbc77a442cc2987`
- `shared/ozon_provider.js` — `5e6d6bdf47e2561b0a015836d5a0f1c5ed28bd2a9625e84aadfdc49ab17deb74`

The other fourteen production files must remain byte-identical to the exact operator baseline hashes already recorded in `STEP1_IMPLEMENTATION_AND_LOCAL_EVIDENCE.md`.

## Scope boundary

This reconstruction repair does not change the reviewed Step 1 contract/capability semantics, AI DOM/composer code, delivery FSM, provider hosts/auth, or any Ozon operation. It exists only to make the independent validation target reconstructable from exact, platform-stable bytes.
