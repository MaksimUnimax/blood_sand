# Step 1 patch parts manifest

Concatenate these files byte-for-byte in lexical order:

1. `00.patch.part` — SHA-256 `8146303b3ac046f07d841873257d0207117490a3b3977fac523b5dc572c5292b`
2. `01.patch.part` — SHA-256 `4d20c05d750adb43863a6d5d386eb6647539e78b5f495e5c8b9eed3af02e6f28`
3. `02.patch.part` — SHA-256 `23dc7cc98b0877f97c67358263097e66f44f17fe5b55c88d8a3a09f283dddf61`
4. `03.patch.part` — SHA-256 `49e248a74638e51bb39e5d6f33929b1faf71b80b5db9ceedb00e767c95fa654d`
5. `04.patch.part` — SHA-256 `508c42a05f872a24bc7d8d279cd7777b95158b1a3fe76cbe58731663865f35f1`
6. `05.patch.part` — SHA-256 `5906016f7c72b660ba0debd99c7c758ef4f7b60c609dbce11bb08e1fc03504c0`
7. `06.patch.part` — SHA-256 `5dfd53ac85b8d28b637010dc5a61910d25e5e539a52687deeef796411fe8570d`
8. `07.patch.part` — SHA-256 `f752e2176c5a58b690dbf287d44d06fec92ede2ad89ce149baf484bc38bcd1d5`

Expected concatenated patch SHA-256:

`5afe153c15eb4005a836d005bab531f8905dbdcd5b0541d52a6112a3ebb0e3ce`

Apply to a fresh extraction of the exact operator v0.1.19 baseline ZIP. Expected candidate changed-file SHA-256 values are recorded in `STEP1_IMPLEMENTATION_AND_LOCAL_EVIDENCE.md`.