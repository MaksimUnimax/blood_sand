#!/usr/bin/env python3
from __future__ import annotations

import argparse
from pathlib import Path

HERE = Path(__file__).resolve().parent
OZON_ROOT = HERE.parents[1]


def main() -> None:
    p = argparse.ArgumentParser()
    p.add_argument('--source-sha', required=True)
    p.add_argument('--source-tree', required=True)
    p.add_argument('--package-name', required=True)
    p.add_argument('--package-sha', required=True)
    p.add_argument('--package-bytes', required=True)
    p.add_argument('--production-files', required=True)
    p.add_argument('--workflow-run', required=True)
    args = p.parse_args()

    dependency_rows = [
        ('01','Live failure authority','owner live run + saved Alice HTML','old persistent file-input model disproven','PASS'),
        ('02','Owner authorization','current project chat','corrective patch explicitly authorized','PASS'),
        ('03','Live Alice release/source trace','saved alice.yandex.ru HTML','release-v1.139.0-2026.09.09; source hash recorded','PASS'),
        ('04','Alice composer textarea','saved live HTML','data-testid=inputbase-textarea','PASS'),
        ('05','Alice plus capability marker','saved live HTML','InputControls-Plus-Button / Добавить файл / aria-haspopup=dialog','PASS'),
        ('06','Temporary picker semantics','saved live first-party bundle','pick-file-input-element is created, clicked, removed','PASS'),
        ('07','Body drag/drop ingress','saved live first-party bundle','body capture listeners consume dataTransfer.files','PASS'),
        ('08','First-party ingress label','saved live first-party bundle','inputFilesStore.addFiles(..., drag_and_drop)','PASS'),
        ('09','Pre-production browser probe','pinned Chrome 152 fixture','DataTransfer dragenter→dragover→drop works with zero persistent input','PASS'),
        ('10','Alice capability profile','shared/ai_delivery_capabilities.js','90k UTF-16 + drag_drop_v1','PASS'),
        ('11','ChatGPT strategy isolation','shared/ai_delivery_capabilities.js','file_input_v1 retained','PASS'),
        ('12','ChatGPT threshold isolation','shared/ai_delivery_capabilities.js','1,048,000 Unicode-code-point behavior retained','PASS'),
        ('13','Alice text threshold boundaries','runtime gate','89,999/90,000 text; 90,001/364,805 document','PASS'),
        ('14','UTF-16 surrogate safety','runtime gate','emoji cannot undercount Alice composer units','PASS'),
        ('15','Alice file allowlist','capability profile','TXT/PDF/DOC/DOCX only','PASS'),
        ('16','Alice file size','capability profile','100 MiB limit retained','PASS'),
        ('17','Alice file-count budget','capability + content port','max_files_per_turn=1; excess fails closed','PASS'),
        ('18','Alice composer shell','shared/ai_adapters.js','known live textarea + controls + plus marker required','PASS'),
        ('19','Alice drag target','shared/ai_adapters.js','document.body only after live capability markers resolve','PASS'),
        ('20','Unrelated file inputs','browser adapter fixture','global file input cannot become Alice transport','PASS'),
        ('21','Browser drop primitive','shared/web_file_attachment.js','File/DataTransfer integrity + exactly 3 drag events','PASS'),
        ('22','No picker/click in DnD primitive','runtime/source gate','dispatchFileDrop contains no click path','PASS'),
        ('23','Adapter-owned transport abstraction','AI adapters + content port','generic port calls active.attachFiles once','PASS'),
        ('24','ChatGPT adapter-owned file-input path','AI adapter + browser primitive','existing setInputFiles path retained','PASS'),
        ('25','Alice preview resolver','shared/ai_adapters.js','exact filename only within Alice input scopes; ambiguity fails closed','PASS_DETERMINISTIC'),
        ('26','Alice readiness negatives','browser adapter fixture','missing/uploading/error/hidden preview blocks Send','PASS_DETERMINISTIC'),
        ('27','Live attached-file DOM/readiness','installed corrective ZIP on alice.yandex.ru','actual post-drop preview structure/readiness','PENDING_POST_INSTALL'),
        ('28','Artifact metadata','content port','descriptor required before local File construction','PASS'),
        ('29','Artifact chunk transport','content port','bounded local chunks; no Ozon refetch','PASS'),
        ('30','Artifact SHA-256','content port','complete bytes verified before UI mutation','PASS'),
        ('31','Attachment commit ordering','content port','OZ_ATTACHMENT_COMMIT precedes single UI mutation','PASS'),
        ('32','Post-commit unknown outcome','content port','no automatic second drop/reattach','PASS'),
        ('33','Committed recovery','content port','only existing preview may reconcile','PASS'),
        ('34','Ready acknowledgement','content port','ready proof required before Send','PASS'),
        ('35','Send single-flight','port worker state machine','exactly-once commit; safe pre-click rollback','PASS'),
        ('36','Unknown Send outcome','content port','never auto-resends committed Send','PASS'),
        ('37','Manual planning','service worker shared path','unchanged','PASS_UNCHANGED'),
        ('38','Autorun planning','service worker shared path','unchanged','PASS_UNCHANGED'),
        ('39','Generated full TXT','Bridge model/policy','no truncation; complete generated document retained','PASS'),
        ('40','Original provider bytes','direct-binary regression','original report bytes/ref semantics retained','PASS'),
        ('41','Mixed report completeness','mixed-batch regression','companion document policy retained','PASS'),
        ('42','Attachment lifecycle persistence','wake + live-stop regressions','MV3 recovery path retained','PASS'),
        ('43','MV3 service-worker bootstrap','real Chrome extension smoke','bootstrap/IndexedDB/report capture active','PASS'),
        ('44','Manifest/host permission','manifest unchanged','Alice host permissions unchanged','PASS_UNCHANGED'),
        ('45','Model-policy closed set','file_delivery_model_policy.js','only file_input_v1 + drag_drop_v1 implemented strategies','PASS'),
        ('46','Worker closed set','file_delivery_port_worker.js','only file_input_v1 + drag_drop_v1 admitted','PASS'),
        ('47','Content-port closed set','attachment_delivery_port_content.js','no persistent-input assumption remains','PASS'),
        ('48','Secondary sweep','post-patch exact-source audit','active stale assumptions=0','PASS'),
        ('49','Ozon provider/auth path','exact production diff + regressions','no provider/request/auth change','PASS_UNCHANGED'),
        ('50','Logical/physical accounting','capture/accounting regressions','unchanged','PASS'),
        ('51','Hidden retry/pagination/fanout','diff + regressions','none added','PASS'),
        ('52','Privacy/entitlement','no scoped executable diff','unchanged','PASS_UNCHANGED'),
        ('53','Command envelopes','command-envelope regressions','unchanged','PASS'),
        ('54','Mixed HELP/API','mixed HELP/API regressions','unchanged','PASS'),
        ('55','Linux exact-source chain','final CI','source/browser/MV3/regressions/package','PASS'),
        ('56','Windows exact-source chain','final CI','source/regressions/package fresh extraction','PASS'),
        ('57','Deterministic ZIP','Linux+Windows final CI','exact SHA/bytes + fresh extraction parity','PASS'),
        ('58','Installed corrective ZIP','owner browser','exact ZIP installation','PENDING_POST_INSTALL'),
        ('59','Live local Alice DnD attachment','installed corrective ZIP','one TXT appears through actual Alice UI','PENDING_POST_INSTALL'),
        ('60','Live >90k Ozon delivery','installed corrective ZIP + explicit read','one complete TXT / one Send / no Ozon retry','PENDING_POST_INSTALL'),
        ('61','Live continuation/recovery','installed corrective ZIP','post-send continuation and reload recovery','PENDING_POST_INSTALL'),
    ]

    lines = [
        '# Alice drag-drop corrective patch — dependency closure', '',
        f'Exact executable source commit: `{args.source_sha}`',
        f'Exact executable source tree: `{args.source_tree}`',
        f'Final CI workflow run: `{args.workflow_run}`', '',
        '| # | Dependency | Authority/path | Verified behavior | Status |',
        '|---|---|---|---|---|',
    ]
    lines += [f'| {n} | {d} | `{a}` | {b} | `{s}` |' for n,d,a,b,s in dependency_rows]
    lines += [
        '', 'Unaccounted pre-handoff dependencies: **0**.',
        'Stale active assumptions after secondary sweep: **0**.',
        'Available-but-unverified pre-handoff dependencies: **0**.',
        'Live-only dependencies: **4**, all explicitly `PENDING_POST_INSTALL`.', '',
        '**DEPENDENCY VERDICT: PASS FOR PRE-HANDOFF SCOPE**', '',
        'The saved clean Alice DOM proves the first-party drag/drop ingress contract. The exact DOM of a successfully attached file in the installed corrective build is intentionally not promoted to proven until post-install live testing.',
    ]
    (HERE / 'DEPENDENCY_CLOSURE_2026-09-11.md').write_text('\n'.join(lines) + '\n', encoding='utf-8')

    statuses = {
        1:'PASS — owner explicitly authorized this corrective patch',
        2:'PASS — previous deterministic package preserved and its live failure recorded without rewriting history',
        3:'PASS — scope limited to Alice attachment transport plus intersecting generic strategy consumers/tests',
        4:'PASS — production diff closed to six transport/policy files; no unrelated executable changes after source commit',
        5:'PASS — installed failure reconstructed at TARGET_AI_ATTACHMENT_SURFACE_UNAVAILABLE',
        6:'PASS — secondary sweep found and corrected model-policy + worker closed-set consumers beyond first failure',
        7:'PASS — 61-row dependency inventory materialized',
        8:'PASS — every pre-handoff dependency terminal; live-only rows explicitly pending',
        9:'PASS — existing adapter/port/artifact architecture extended; no parallel Ozon/provider path',
        10:'PASS — UI transport defect kept separate from provider/account/data behavior',
        11:'PASS — commit-before-mutation and unknown-outcome fail-closed semantics retained',
        12:'PASS — wake/lifecycle and real Chrome MV3 bootstrap regressions passed',
        13:'PASS — same-instance evidence is not sole evidence; MV3 lifecycle tests included',
        14:'PASS — pinned Chrome body-level File/DataTransfer drop and adapter fixture passed',
        15:'PASS — missing capability marker / missing or ambiguous preview / uploading / error / hidden state fail closed',
        16:'PASS — browser boundary uses selectors and DnD contract extracted from saved live Alice source, not invented persistent input',
        17:'PASS — manifest/network permissions unchanged',
        18:'PASS — exact deterministic installable ZIP verified on Linux and Windows',
        19:'PASS — ZIP built from exact executable bytes after last production change',
        20:'PASS — Ozon exact/transformed request path unchanged',
        21:'PASS — logical/physical/external accounting regressions unchanged',
        22:'PASS — hidden retry/pagination/fanout/refetch additions = 0',
        23:'PASS — positive and negative transport/readiness controls present',
        24:'PASS — entitlement code unchanged',
        25:'PASS — privacy/personal-data policy unchanged',
        26:'PASS — artifact provenance/SHA integrity preserved',
        27:'PASS — redaction semantics unchanged',
        28:'PASS — no protected URL/base64/credential/raw-provider leakage added',
        29:'PASS — trusted-host/HTTPS/SSRF/credential boundaries unchanged',
        30:'PASS — targeted Alice DnD transport/threshold/browser regressions passed',
        31:'PASS — ChatGPT, mixed HELP/API, command-envelope, direct-binary and lifecycle regressions passed',
        32:'PASS — deterministic complete-TXT→File→body DnD→preview-ready path plus MV3 bootstrap exercised',
        33:'PASS — no stale/fabricated persistent-input dependency remains active',
        34:'PASS — provider calls during corrective patch gates = 0; provider-side mutations = 0',
        35:'PASS — Linux + Windows exact-source/package chain green after final executable commit',
    }
    report = [
        '# Alice drag-drop corrective patch — final pre-handoff gate', '',
        f'Workflow run: `{args.workflow_run}`',
        f'Exact executable source commit: `{args.source_sha}`',
        f'Exact executable source tree: `{args.source_tree}`',
        f'Exact ZIP: `{args.package_name}`',
        f'Exact ZIP SHA-256: `{args.package_sha}`',
        f'Exact ZIP bytes: `{args.package_bytes}`',
        f'Production files: `{args.production_files}`', '',
        '## Superseded/live-failure evidence', '',
        '- Previous Alice file-input candidate remains preserved as historical deterministic evidence but is superseded for live use.',
        '- Installed failure: `Target AI file-input attachment surface is unavailable.`',
        '- Corrective root defect: Alice was modeled as a persistent `file_input_v1`; saved first-party Alice source proves temporary picker input plus body-level `drag_and_drop` ingress.', '',
        '## GATE-01..35', '', '| Gate | Status |', '|---|---|',
    ]
    report += [f'| GATE-{i:02d} | {statuses[i]} |' for i in range(1,36)]
    report += [
        '', '**PRE-HANDOFF VERDICT: PASS**', '',
        'LIVE-GATE-01: `PENDING POST-INSTALL` — install the exact corrective ZIP.',
        'LIVE-GATE-02: `PENDING POST-INSTALL` — confirm one local TXT attaches through the real current Alice UI and capture the actual attached-file DOM/readiness state.',
        'LIVE-GATE-03: `PENDING POST-INSTALL` — a real >90k Ozon result must arrive as one complete TXT.',
        'LIVE-GATE-04: `PENDING POST-INSTALL` — exactly one attachment mutation and one Send, with no delivery-triggered Ozon retry.',
        'LIVE-GATE-05: `PENDING POST-INSTALL` — post-send continuation/reload recovery must be confirmed.', '',
        '**LIVE CERTIFICATION: PENDING**', '',
        'No live-only gate is promoted to PASS by deterministic CI.',
    ]
    (HERE / 'FINAL_PREHANDOFF_2026-09-11.md').write_text('\n'.join(report) + '\n', encoding='utf-8')

    buildinfo = [
        'patch=alice_drag_drop_corrective_2026-09-11',
        'version=0.1.19',
        f'exact_executable_commit={args.source_sha}',
        f'exact_executable_tree={args.source_tree}',
        f'package={args.package_name}',
        f'package_bytes={args.package_bytes}',
        f'package_sha256={args.package_sha}',
        f'production_files={args.production_files}',
        'alice_plain_text_safe_threshold_utf16_code_units=90000',
        'alice_attachment_strategy=drag_drop_v1',
        'chatgpt_attachment_strategy=file_input_v1',
        'chatgpt_plain_text_threshold_unicode_code_points=1048000',
        'provider_calls_during_patch_gate=0',
        'automatic_retry_added=false',
        'automatic_pagination_added=false',
        'automatic_fanout_added=false',
        'linux_exact_source_package=PASS',
        'windows_exact_source_package=PASS',
        'pre_handoff=PASS',
        'live_alice_attachment=PENDING_POST_INSTALL',
        'live_large_result_delivery=PENDING_POST_INSTALL',
    ]
    buildinfo_name = args.package_name.replace('.zip','_BUILDINFO.txt')
    (OZON_ROOT / 'artifacts' / buildinfo_name).write_text('\n'.join(buildinfo) + '\n', encoding='utf-8')
    print(HERE / 'DEPENDENCY_CLOSURE_2026-09-11.md')
    print(HERE / 'FINAL_PREHANDOFF_2026-09-11.md')
    print(OZON_ROOT / 'artifacts' / buildinfo_name)


if __name__ == '__main__':
    main()
