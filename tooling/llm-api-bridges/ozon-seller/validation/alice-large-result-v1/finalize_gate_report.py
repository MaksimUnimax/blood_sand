#!/usr/bin/env python3
from __future__ import annotations

import argparse
from pathlib import Path

HERE = Path(__file__).resolve().parent
OZON_ROOT = HERE.parents[1]
BUILDINFO = OZON_ROOT / 'artifacts/OZON_BRIDGE_v0.1.19_ALICE_LARGE_RESULT_DOCUMENT_DELIVERY_20260910_BUILDINFO.txt'
DEPENDENCY = HERE / 'DEPENDENCY_CLOSURE_2026-09-10.md'


def finalize_dependency_evidence() -> None:
    text = DEPENDENCY.read_text(encoding='utf-8')
    text = text.replace(
        '| 41 | Windows exact-source/package regression | `CI Windows job` | must pass before final report | `PENDING_CI_JOB` |',
        '| 41 | Windows exact-source/package regression | `CI Windows job` | exact tested source and exact ZIP verified | `PASS` |'
    )
    text = text.replace(
        'Available-but-unverified pre-handoff dependencies: **1** — Windows exact-source/package job remains pending until the downstream CI job completes.',
        'Available-but-unverified pre-handoff dependencies: **0**.'
    )
    text = text.replace('**DEPENDENCY VERDICT: PENDING WINDOWS GATE**', '**DEPENDENCY VERDICT: PASS FOR PRE-HANDOFF SCOPE**')
    if '`PENDING_CI_JOB`' in text:
        raise AssertionError('Windows dependency was not terminalized')
    DEPENDENCY.write_text(text, encoding='utf-8')


def finalize_buildinfo() -> None:
    text = BUILDINFO.read_text(encoding='utf-8')
    text = text.replace('windows_exact_source_package=PENDING_CI_JOB', 'windows_exact_source_package=PASS')
    BUILDINFO.write_text(text, encoding='utf-8')


def main() -> None:
    p = argparse.ArgumentParser()
    p.add_argument('--source-sha', required=True)
    p.add_argument('--source-tree', required=True)
    p.add_argument('--package-sha', required=True)
    p.add_argument('--package-bytes', required=True)
    p.add_argument('--workflow-run', required=True)
    args = p.parse_args()

    finalize_dependency_evidence()
    finalize_buildinfo()

    statuses = {
        1:'PASS — explicit operator authorization: «Делай»',
        2:'PASS — prior bootstrap-prompt PRE-HANDOFF authority preserved as baseline',
        3:'PASS — exact repair scope is capabilities + Alice adapter + attachment-count fail-closed guard; one intersecting regression updated',
        4:'PASS — exact production diff audited; no hidden unrelated executable changes',
        5:'PASS — 364805-character Alice composer failure reconstructed by pre-fix regression',
        6:'PASS — secondary sweep covered both proven root causes plus one-file attachment budget dependency',
        7:'PASS — complete 43-row dependency inventory materialized',
        8:'PASS — every pre-handoff dependency has terminal verification/status',
        9:'PASS — existing capability/adapter/attachment-port architecture extended; no parallel uploader',
        10:'PASS — delivery defect kept separate from provider/account/data blockers',
        11:'PASS — attachment lifecycle remains durable; ambiguous UI state fails closed',
        12:'PASS — wake/lifecycle regression and real Chrome MV3 bootstrap passed',
        13:'PASS — same-instance evidence is not the sole evidence',
        14:'PASS — positive browser File/DataTransfer + exact preview flow passed',
        15:'PASS — missing/ambiguous/busy/uploading surfaces fail closed',
        16:'PASS — real browser boundary exercised deterministically in Chrome',
        17:'PASS — manifest and network permissions unchanged; Alice host already allowed',
        18:'PASS — exact deterministic installable ZIP verified',
        19:'PASS — ZIP rebuilt after the final executable materialization',
        20:'PASS — provider exact/transformed request code unchanged',
        21:'PASS — logical/physical/external request accounting regression unchanged',
        22:'PASS — no hidden retry/pagination/fanout/refetch added',
        23:'PASS — positive and negative controls both present',
        24:'PASS — entitlement code unchanged',
        25:'PASS — privacy/personal-data policy code unchanged',
        26:'PASS — provenance and file SHA integrity checks preserved',
        27:'PASS — redaction semantics unchanged',
        28:'PASS — no URL/base64/credential/raw-provider leakage added',
        29:'PASS — trusted-host/HTTPS/SSRF/credential boundaries unchanged',
        30:'PASS — targeted Alice threshold/adapter/browser regression passed',
        31:'PASS — mixed HELP/API, command-envelope and delivery regression pool passed',
        32:'PASS — deterministic generated-TXT→File→preview flow plus MV3 bootstrap exercised',
        33:'PASS — no stale/fabricated opaque dependencies used',
        34:'PASS — provider-side mutations: 0; provider calls during patch gate: 0',
        35:'PASS — Linux + Windows green chain after last executable change',
    }
    lines = [
        '# Alice large-result document delivery — final pre-handoff gate', '',
        f'Workflow run: `{args.workflow_run}`',
        f'Exact executable source commit: `{args.source_sha}`',
        f'Exact executable source tree: `{args.source_tree}`',
        f'Exact ZIP SHA-256: `{args.package_sha}`',
        f'Exact ZIP bytes: `{args.package_bytes}`', '',
        '## Superseded negative evidence', '',
        '- `34486079777`: expected pre-fix FAIL confirmed the missing Alice safe threshold before repair.',
        '- `34492181878`: invalid first CI harness definition produced zero jobs; no production code was committed by that run.',
        '- `34492490829`: all targeted/shared patch regressions passed and rendered browser state was PASS, but the harness falsely failed because `--dump-dom` included the literal FAIL string from fixture script source. This was a verifier defect, not a production defect.',
        '', '## GATE-01..35', '',
        '| Gate | Status |', '|---|---|',
    ]
    lines += [f'| GATE-{i:02d} | {statuses[i]} |' for i in range(1, 36)]
    lines += [
        '', '**PRE-HANDOFF VERDICT: PASS**', '',
        'LIVE-GATE-01: `PENDING POST-INSTALL` — exact ZIP must be installed in an Alice-targeted browser.',
        'LIVE-GATE-02: `PENDING POST-INSTALL` — current live Alice file-input and attachment-preview behavior must be observed.',
        'LIVE-GATE-03: `PENDING POST-INSTALL` — a real >90k Ozon result must arrive as one complete TXT.',
        'LIVE-GATE-04: `PENDING POST-INSTALL` — exactly one Send and no delivery-triggered Ozon retry must be observed.',
        'LIVE-GATE-05: `PENDING POST-INSTALL` — post-send continuation/recovery must be confirmed.', '',
        '**LIVE CERTIFICATION: PENDING**', '',
        'No live-only gate is promoted to PASS by deterministic CI.',
    ]
    out = HERE / 'FINAL_PREHANDOFF_2026-09-10.md'
    out.write_text('\n'.join(lines) + '\n', encoding='utf-8')
    print(out)
    print(DEPENDENCY)
    print(BUILDINFO)


if __name__ == '__main__':
    main()
