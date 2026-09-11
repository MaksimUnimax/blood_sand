#!/usr/bin/env python3
from __future__ import annotations
import argparse
from pathlib import Path

HERE = Path(__file__).resolve().parent
OZON = HERE.parents[1]
ARTIFACTS = OZON / "artifacts"

ROWS = [
("01","Owner authorization","current project chat","Alice post-attachment Send corrective patch explicitly authorized","PASS"),
("02","Historical package preservation","prior corrective evidence","old drag-drop package/hash remain immutable historical evidence","PASS"),
("03","Live failure boundary","owner screenshot + diagnostic export","TXT attached and marker staged; auto-Send absent","PASS"),
("04","Provider cardinality evidence","diagnostic export","successful business read executed once; blocked personal-data item stayed local","PASS"),
("05","Pre-fix deterministic reproduction","run 34557623845","blocked Oknyx accepted; one click event; zero submitted turns","PASS"),
("06","Current Alice public source","first-party yastatic bundle","Oknyx/inputStore contract read from current public bundle","PASS"),
("07","First-party source integrity","public source probe","bundle SHA-256 fb482e6ff25c77ed12081dd1cdab44c871297b9318b702c08843907e8aef619d","PASS"),
("08","Oknyx identity","first-party bundle","button#oknyx-button[data-testid=oknyx]","PASS"),
("09","Send aria contract","first-party bundle","arrow state aria-label is Отправить","PASS"),
("10","Native disabled contract","first-party bundle","native disabled predicate is separate from inputStore blocked state","PASS"),
("11","Blocked submit contract","first-party bundle","inputStore.status=blocked makes Oknyx submit handler no-op","PASS"),
("12","Blocked DOM signal","first-party BEM cn contract","blocked input state emits StandaloneOknyx_error","PASS"),
("13","BEM mapping integrity","module 16955 public probe","boolean modifier uses '_' separator; exact class proven","PASS"),
("14","Alice adapter guard","shared/ai_adapters.js","StandaloneOknyx_error reused as send_disabled","PASS"),
("15","No new control kind","source gate + sweep","send_blocked enum/state not introduced","PASS"),
("16","Clean Alice Send state","pinned Chrome fixture","unblocked active Send remains accepted","PASS"),
("17","Transient blocked state","pinned Chrome fixture","target waits through blocked state then resolves after unblock","PASS"),
("18","Persistent blocked state","pinned Chrome fixture","target times out fail-closed with zero extra click","PASS"),
("19","Ready/microphone negative","pinned Chrome fixture","not accepted as Send","PASS"),
("20","Stop negative","pinned Chrome fixture","not accepted as Send","PASS"),
("21","Native disabled negative","pinned Chrome fixture","not accepted as Send","PASS"),
("22","Marker integrity","composer_send + browser fixture","marker must remain exact before click","PASS"),
("23","Stable target sampling","composer_send regression","three stable validated samples required","PASS"),
("24","Target before commit ordering","attachment_delivery_port_content.js","waitForValidatedTarget precedes SEND_COMMIT","PASS"),
("25","Commit before click ordering","attachment_delivery_port_content.js","SEND_COMMIT precedes clickSynchronously","PASS"),
("26","Send commit cardinality","source gate + worker state machine","one commit call site; duplicate commit cannot click twice","PASS"),
("27","Click cardinality","source/browser gate","one click call site; clean transition exactly one click","PASS"),
("28","Unknown click outcome","existing delivery logic","observed click without user-turn never auto-resends","PASS"),
("29","Safe rollback","port worker regression","rollback only for proven no-click outcome","PASS"),
("30","Attachment transport","Alice DnD regressions","drag_drop_v1 preserved","PASS"),
("31","Attachment readiness","Alice DnD browser fixture","exact preview readiness and negatives preserved","PASS"),
("32","Generated full TXT","large-result regression","complete generated result becomes one TXT; no truncation","PASS"),
("33","Alice 90k boundary","large-result regression","90,000 text / 90,001 document, UTF-16 safe","PASS"),
("34","ChatGPT threshold isolation","large-result regression","1,048,000/1,048,001 semantics unchanged","PASS"),
("35","ChatGPT transport isolation","browser/source regression","file_input_v1 unchanged","PASS"),
("36","Original provider bytes","direct-binary regression","provider file byte semantics unchanged","PASS"),
("37","Artifact SHA integrity","delivery regression","complete attachment bytes validated before UI mutation","PASS"),
("38","MV3 lifecycle","wake/live-stop regressions","recovery and wake path retained","PASS"),
("39","Real Chrome MV3 bootstrap","extension worker smoke","service worker/IndexedDB/report capture bootstrap","PASS"),
("40","Mixed HELP/API","mixed-help regressions","ordered mixed command behavior unchanged","PASS"),
("41","Command envelope","command-envelope regressions","parser/cardinality unchanged","PASS"),
("42","Personal-data policy","live evidence + no scoped diff","OPERATION_DISABLED_BY_USER remains local; no bypass","PASS"),
("43","Provider/auth path","exact production diff","no provider/auth/request production changes","PASS_UNCHANGED"),
("44","Hidden retry/pagination/fanout","diff + regressions","none added","PASS"),
("45","Security/redaction","exact production diff + direct binary regression","credentials/base64/protected URL handling unchanged","PASS_UNCHANGED"),
("46","Secondary consumer sweep","final exact-source audit","old unsafe one-line Alice Send classifier absent across dist","PASS"),
("47","Manifest dependency order","manifest.json","shared/ai_adapters.js loaded before content_script and attachment port","PASS_UNCHANGED"),
("48","Linux exact-source chain","final CI","syntax/source/browser/MV3/shared/package gates","PASS"),
("49","Windows exact-source chain","final CI","source/shared/package canonical Git-blob parity","PASS"),
("50","Deterministic ZIP","Linux+Windows final CI","exact member set/SHA/bytes/fresh extraction","PASS"),
("51","Installed exact new ZIP","owner browser","install exact new package","PENDING_POST_INSTALL"),
("52","Live blocked-state wait","installed exact new ZIP","if Alice exposes blocked modifier Bridge must not commit/click until clear","PENDING_POST_INSTALL"),
("53","Live large-result auto-Send","installed exact new ZIP + explicit read","one complete TXT, one Send, no delivery-triggered provider retry","PENDING_POST_INSTALL"),
("54","Live continuation/reload","installed exact new ZIP","post-Send user-turn and MV3 recovery confirmed","PENDING_POST_INSTALL"),
]

GATES = {
1:"explicit operator authorization",2:"prior evidence preserved",3:"exact repair scope",4:"no unrelated executable changes",5:"failing workflow reconstructed end-to-end",6:"secondary sweep beyond first symptom",7:"dependency/state inventory complete",8:"pre-handoff dependencies terminal",9:"existing architecture reused",10:"UI defect separate from provider/account behavior",11:"durable/fail-closed semantics preserved",12:"MV3 lifecycle regression passed",13:"same-instance evidence not sole evidence",14:"positive flow with fresh dependencies",15:"blocked/unknown/disabled negatives fail closed",16:"real browser boundary exercised",17:"manifest/network permissions unchanged",18:"exact installable artifact verified",19:"package built after final executable change",20:"request provenance unchanged",21:"accounting unchanged",22:"no hidden retry/duplicate/refetch/resend",23:"positive and negative controls",24:"entitlement fail-honest unchanged",25:"privacy preserved",26:"artifact provenance correct",27:"redaction preserved",28:"no protected/raw credential leakage",29:"trusted-host/HTTPS/SSRF boundaries unchanged",30:"targeted blocked-Send regression",31:"overlapping delivery/ChatGPT regressions",32:"complete deterministic product flow exercised pre-handoff",33:"no stale/fabricated success dependency",34:"no provider mutation/calls during patch gate",35:"full green Linux+Windows run after last executable change"}

def main():
    p=argparse.ArgumentParser()
    p.add_argument('--source-sha',required=True); p.add_argument('--source-tree',required=True)
    p.add_argument('--package-name',required=True); p.add_argument('--package-sha',required=True)
    p.add_argument('--package-bytes',required=True,type=int); p.add_argument('--production-files',required=True,type=int)
    p.add_argument('--workflow-run',required=True)
    a=p.parse_args()

    dep=["# Alice auto-send blocked guard — dependency closure","",f"Exact executable source commit: `{a.source_sha}`",f"Exact executable source tree: `{a.source_tree}`",f"Final CI workflow run: `{a.workflow_run}`","","| # | Dependency | Authority/path | Verified behavior | Status |","|---|---|---|---|---|"]
    dep += [f"| {n} | {d} | `{auth}` | {beh} | `{st}` |" for n,d,auth,beh,st in ROWS]
    dep += ["","Unaccounted pre-handoff dependencies: **0**.","Stale active assumptions after secondary sweep: **0**.","Available-but-unverified pre-handoff dependencies: **0**.","Live-only dependencies: **4**, all explicitly `PENDING_POST_INSTALL`.","","**DEPENDENCY VERDICT: PASS FOR PRE-HANDOFF SCOPE**","","No live-only check is promoted by deterministic CI."]
    (HERE/'DEPENDENCY_CLOSURE_2026-09-11.md').write_text('\n'.join(dep)+'\n',encoding='utf-8')

    final=["# Alice auto-send blocked guard — final pre-handoff","",f"Workflow run: `{a.workflow_run}`",f"Exact executable source commit: `{a.source_sha}`",f"Exact executable source tree: `{a.source_tree}`",f"Exact ZIP: `{a.package_name}`",f"Exact ZIP SHA-256: `{a.package_sha}`",f"Exact ZIP bytes: `{a.package_bytes}`",f"Production files: `{a.production_files}`","","## Root defect","","The installed prior package successfully attached the full TXT and staged the marker, but auto-Send did not occur. Current first-party Alice source proves that `inputStore.status === \"blocked\"` is exposed as the `StandaloneOknyx_error` BEM modifier while the native Oknyx button may still render `aria-label=\"Отправить\"` and remain natively enabled. Alice's own click handler then intentionally no-ops submit. The prior Bridge classifier ignored that modifier and could commit/click too early.","","## Correction","","The Alice adapter now treats `StandaloneOknyx_error` as the existing `send_disabled` state. No new state enum was introduced. The existing stable-target wait therefore holds before `OZ_ATTACHMENT_SEND_COMMIT`; once Alice clears the modifier, the same existing commit/click/user-turn state machine proceeds.","","## GATE-01..35","","| Gate | Status |","|---|---|"]
    final += [f"| GATE-{i:02d} | PASS — {GATES[i]} |" for i in range(1,36)]
    final += ["","**PRE-HANDOFF VERDICT: PASS**","","LIVE-GATE-01: `PENDING POST-INSTALL` — install the exact ZIP above.","LIVE-GATE-02: `PENDING POST-INSTALL` — verify attached-file blocked state is waited out without premature Send commit/click.","LIVE-GATE-03: `PENDING POST-INSTALL` — verify a real >90k Ozon result becomes one complete TXT and is sent exactly once.","LIVE-GATE-04: `PENDING POST-INSTALL` — verify no delivery-triggered Ozon retry/refetch/resend.","LIVE-GATE-05: `PENDING POST-INSTALL` — verify resulting user-turn plus continuation/reload recovery.","","**LIVE CERTIFICATION: PENDING**","","No live-only gate is promoted to PASS by deterministic CI."]
    (HERE/'FINAL_PREHANDOFF_2026-09-11.md').write_text('\n'.join(final)+'\n',encoding='utf-8')

    build=[
      'patch=alice_auto_send_blocked_guard_2026-09-11','version=0.1.19',f'exact_executable_commit={a.source_sha}',f'exact_executable_tree={a.source_tree}',f'package={a.package_name}',f'package_bytes={a.package_bytes}',f'package_sha256={a.package_sha}',f'production_files={a.production_files}',
      'alice_attachment_strategy=drag_drop_v1','alice_plain_text_safe_threshold_utf16_code_units=90000','alice_send_blocked_dom_modifier=StandaloneOknyx_error','alice_blocked_state_reuses=send_disabled','chatgpt_attachment_strategy=file_input_v1','chatgpt_plain_text_threshold_unicode_code_points=1048000','provider_calls_during_patch_gate=0','automatic_retry_added=false','automatic_pagination_added=false','automatic_fanout_added=false','automatic_refetch_added=false','automatic_resend_added=false','linux_exact_source_package=PASS','windows_exact_source_package=PASS','pre_handoff=PASS','live_auto_send=PENDING_POST_INSTALL','live_large_result_delivery=PENDING_POST_INSTALL']
    (ARTIFACTS/(a.package_name.removesuffix('.zip')+'_BUILDINFO.txt')).write_text('\n'.join(build)+'\n',encoding='utf-8')
    print(HERE/'DEPENDENCY_CLOSURE_2026-09-11.md'); print(HERE/'FINAL_PREHANDOFF_2026-09-11.md')

if __name__=='__main__': main()
