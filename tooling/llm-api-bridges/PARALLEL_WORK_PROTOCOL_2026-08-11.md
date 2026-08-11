# PARALLEL WORK PROTOCOL — Ozon collection + Wildberries bridge

Date: 2026-08-11
Repository: `MaksimUnimax/blood_sand`

## Goal

Allow two independent ChatGPT dialogs to work in the same repository at the same time without overwriting each other:

- dialog A: continue Ozon factual marketplace data collection;
- dialog B: develop the Wildberries bridge using the frozen Ozon Bridge reference.

## Shared checkpoint and branch model

`main` is the integration branch, not the active working branch while the two dialogs run in parallel.

Both working branches MUST be created from the same integration checkpoint that contains this protocol and the immutable Ozon Bridge reference.

Working branches:

- `work/ozon-data-collection-2026-08-11`
- `work/wildberries-bridge-2026-08-11`

Each dialog must re-read its live branch before every GitHub mutation and must not assume another dialog's state from memory.

## Immutable Ozon reference

Canonical reference for WB implementation:

`tooling/llm-api-bridges/ozon-seller/reference-0.1.3/`

The reference contains:

- tested production extension ZIP;
- source/tests/evidence ZIP;
- documentation;
- build/test evidence.

The reference is immutable during parallel work. WB may copy/adapt patterns from it but must not edit files under `reference-0.1.3/`.

## Path ownership

### Ozon dialog owns

- `marketing/data/raw/marketplace/ozon/**`
- `marketing/data/normalized/marketplace/ozon/**`
- `marketing/data/registry/ozon_measurements.csv`

Current task is collection/recording only. The Ozon dialog must not make downstream cross-market/site conclusions while WB collection is incomplete.

The Ozon dialog must not edit Wildberries bridge/data paths.

### Wildberries dialog owns

- `tooling/llm-api-bridges/wildberries/**`
- `marketing/data/raw/marketplace/wildberries/**`
- `marketing/data/normalized/marketplace/wildberries/**`
- `marketing/data/registry/wildberries_measurements.csv`

The Wildberries dialog must not edit Ozon raw/normalized/registry data or the immutable Ozon reference.

## Shared files frozen during parallel work

To prevent textual merge conflicts, neither working dialog should edit these shared integration files unless the user explicitly stops parallel mode and assigns ownership:

- `marketing/data/registry/marketplace_measurements.csv`
- `marketing/data/DATA_ARCHITECTURE.md`
- `marketing/data/DATA_SCHEMA_CONTRACT.md`
- shared roadmap/integration documents under `marketing/roadmap/`
- cross-market/site conclusions or final assortment/site strategy documents.

`marketplace_measurements.csv` is a frozen pre-parallel snapshot. New observations go only into the per-market registries while parallel mode is active.

## Commit discipline

Each dialog commits only to its own working branch.

Commit prefixes should remain explicit, for example:

- Ozon: `data(ozon): ...`
- WB bridge: `feat(wb-bridge): ...`, `test(wb-bridge): ...`, `docs(wb-bridge): ...`
- WB data: `data(wb): ...`

No dialog force-pushes or moves the other dialog's branch.

## Integration procedure

When both tracks reach their checkpoints:

1. stop new writes in both dialogs;
2. re-read live `main` and both working branch heads;
3. compare each branch against the common base;
4. integrate one branch into `main`;
5. rebase/merge the second branch on the new `main` only after re-reading live state;
6. regenerate `marketing/data/registry/marketplace_measurements.csv` from the two per-market registries rather than manually interleaving concurrent edits;
7. run relevant tests/document validation;
8. only after Ozon + WB factual collection completeness is established resume shared site/assortment conclusions.

## Conflict rule

If a task unexpectedly requires a path owned by the other dialog or a frozen shared file, stop that mutation and surface the dependency. Do not 'just edit it' from both dialogs.

This protocol is the authority for parallel work until explicitly retired or replaced in live GitHub.
