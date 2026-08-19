# Ozon Bridge v0.1.19 — resolved raw-Git-object authority transport

Date: 2026-08-19
Status: `MANDATORY_RESOLVED_GIT_OBJECT_TRANSPORT`
Scope: validation-only. Production/candidate bytes and permanent-gate semantics are unchanged.

## 1. Trigger and classification

Resolved construction report commit:
`9884a4aed413dc93d6cd6ef8ad7f09d8b57b5dfa`.

The report produced three primary authority identity failures and three derivative blockers. Candidate reconstruction, browser substrate and functional gate were not executed.

Primary report observations:

- resolved ledger: expected Git blob `852b805b23b10fa53054ee7714ab04222bcc1c6c`, materialized bytes `23686`, locally recomputed blob `dde697646a4650613696ecd29528df72993383c1`;
- resolved execution contract: expected Git blob `d366b466f32a6213bb4a139b120bf071c203cda4`, materialized bytes `16910`, locally recomputed blob `10c0787dced83c014027833907c0f1963a72b8d6`;
- resolved standalone plan: expected Git blob `6b3ffd121e7ada80b99048c75ed193f87ee54178`, materialized bytes `12371`, locally recomputed blob `7f459fcac8a32888cda22643085152835d1cc8c0`.

Live GitHub contents metadata independently confirms the expected objects and the same byte lengths:

- ledger: blob `852b805...`, size `23686`;
- execution contract: blob `d366b46...`, size `16910`;
- standalone plan: blob `6b3ffd1...`, size `12371`.

Therefore the source pins are not superseded by the failed materialized copies. The observed failure is an authority **transport/materialization** defect: the local copies had the expected lengths but different bytes. The exact text transformation primitive is not proven and must not be guessed.

Classification remains `HARNESS_ERROR`; this report contains no production behavior failure evidence.

## 2. Effective transport rule

For every pinned Git authority object, the only accepted source of validation bytes is the local Git object database after an exact Git fetch makes the object reachable.

Forbidden as authority-byte sources:

- connector-decoded file text;
- copied text from chat/tool output;
- PowerShell `Get-Content`/`Set-Content` text pipelines;
- `Invoke-WebRequest`/HTTP response text decoded and re-encoded as a string;
- JSON encode/decode round trips;
- newline normalization;
- Unicode normalization;
- `fs.writeFileSync(path, string)` for a pinned authority object;
- checkout working-tree bytes when `.gitattributes`/`core.autocrlf` or filters could transform them.

Allowed exact source:

`git cat-file blob <exact-git-blob-sha>` captured as a binary `Buffer` with `shell:false`.

For each object, before use:

1. require `git cat-file -t <sha>` = `blob`;
2. obtain raw bytes via `git cat-file blob <sha>` into a binary Buffer;
3. recompute `SHA1("blob " + byteLength + "\0" + rawBytes)` and require exact equality with `<sha>`;
4. require pinned byte length when specified;
5. require pinned SHA-256 when specified;
6. write the Buffer directly;
7. reread as Buffer and require byte equality, Git blob equality and SHA-256 equality.

No alternate/legacy/corrected/fallback expected identity field exists.

## 3. Pinned binary-safe materializer

Validation helper source:

`tooling/llm-api-bridges/ozon-seller/validation/full-gate/RESOLVED_GIT_OBJECT_MATERIALIZER.mjs`

Commit:
`6d7db624247ab98de2a10dfb849e6f03ccc1d811`

Git blob:
`195862c990a06879835683224630a6b97ff56c84`

Expected source bytes:
`3195`

Expected source SHA-256:
`d203b563d8a372bcf6804ba0a5cf19e7d1439a918783b1740f1c8ecc132e2b5d`

CLI:

`node RESOLVED_GIT_OBJECT_MATERIALIZER.mjs <repo-root> <exact-git-blob-sha> <dest> [expected-size] [expected-sha256]`

The helper must pass `node --check` before use.

Bootstrap rule: do not obtain the materializer itself through the failed text-materialization path. Resolve commit:path to blob with Git and extract its blob bytes through `git cat-file` using a minimal binary Node/CLI bootstrap, or execute an already exact Git-object-derived copy after verifying its blob. The bootstrap must itself use binary buffers and must not pass authority bytes through a text pipeline.

## 4. Required Stage-1 behavior

A mismatch observed from any connector/text/working-tree materialization is a **fixable validation transport defect**, not an unrepairable authority failure. The construction job MUST NOT stop there.

It must:

1. fetch the required exact commits/branch objects from GitHub into the local repository without modifying the candidate working tree;
2. verify commit:path -> expected blob where a path+commit authority is pinned;
3. rematerialize every authority through raw Git objects using the rule above;
4. rerun the complete authority identity audit over all items;
5. continue internal validation-only construction fixes until the complete construction defect set is zero.

The construction stage may stop before candidate execution only if, after exact Git fetch:

- a required pinned object is genuinely absent from the object database; or
- a pinned commit:path genuinely resolves to a different blob than the direct authority; or
- raw `git cat-file blob <expected-sha>` bytes fail to recompute to that same Git blob; or
- another unresolved construction defect cannot be repaired without production/dependency/system changes or assertion weakening.

Any such stop must still report the complete unresolved construction defect set in the single final result.

## 5. No semantic changes

This transport authority changes only how exact authority bytes are obtained.

It does not change:

- permanent 164-assertion B01-B15 ledger;
- deterministic production candidate;
- E1/E2/E3/E4/E5 behavior;
- CFT/browser contract;
- zero-network safety rules;
- non-fail-fast candidate execution;
- hard packaging interlock;
- logged-in live acceptance boundary.
