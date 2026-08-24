#!/usr/bin/env python3
import hashlib
import shutil
import subprocess
import sys
from pathlib import Path

A1_SERVICE_WORKER_SHA256 = "f9cb0720f411b479a22f00cb0ba7a3553de8ae8fba62de5a27a904b6d27a287c"
A2_SERVICE_WORKER_SHA256 = "9ccb1e82581c6710e0fba2cf284fbe90735589dd69b36226e423f583ef0894fe"
A2_TREE_MANIFEST_SHA256 = "fdf683a2f3b5466efbd5a5906463108ad5e38d584e1d000692cde6a90e6a29f4"
EXPECTED_FILE_COUNT = 19

OLD = '''        const begun = await beginWorkSessionRefresh(tab, key);\n        if (begun.already_in_progress) return { ok: true, code: "REFRESH_ALREADY_IN_PROGRESS", recovery: begun.recovery };\n        setTimeout(() => chrome.runtime.reload(), 0);\n        return { ok: true, recovery: begun.recovery, runtime_reload_scheduled: true };'''

NEW = '''        const begun = await beginWorkSessionRefresh(tab, key);\n        if (begun.already_in_progress) return { ok: true, code: "REFRESH_ALREADY_IN_PROGRESS", recovery: begun.recovery };\n        try {\n          await chrome.tabs.reload(tab);\n        } catch (error) {\n          const session = await workSessionFor(key);\n          if (session.state === OzonWorkSessionModel.STATES.RECOVERING && Number(session.revision) === Number(begun.recovery.revision)) {\n            await mutateWorkSession(key, session.revision, OzonWorkSessionModel.STATES.ERROR, { error: { code: "WORK_REFRESH_TAB_RELOAD_FAILED" } });\n          }\n          const recoveries = await getWorkRecoveries();\n          if (recoveries[key]?.recovery_id === begun.recovery.recovery_id) {\n            delete recoveries[key];\n            await storageSet({ [KEYS.WORK_SESSION_RECOVERIES]: recoveries });\n          }\n          await diagnostic("WORK_SESSION_REFRESH_TAB_RELOAD_FAILED", { recovery_id: begun.recovery.recovery_id, tab_id: tab, error: error?.message || String(error) }, { level: "error" });\n          return { ok: false, code: "WORK_REFRESH_TAB_RELOAD_FAILED", error: error?.message || String(error), recovery: begun.recovery };\n        }\n        await diagnostic("WORK_SESSION_REFRESH_TAB_RELOAD_SCHEDULED", { recovery_id: begun.recovery.recovery_id, tab_id: tab, conversation_key: key });\n        setTimeout(() => chrome.runtime.reload(), 0);\n        return { ok: true, recovery: begun.recovery, page_reload_scheduled: true, runtime_reload_scheduled: true };'''

def sha256(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()

def tree_digest(root: Path) -> str:
    lines = []
    files = sorted((p for p in root.rglob("*") if p.is_file()), key=lambda p: str(p.relative_to(root)).replace("\\", "/"))
    for file in files:
        rel = str(file.relative_to(root)).replace("\\", "/")
        lines.append(f"{rel}\0{sha256(file.read_bytes())}\n")
    return sha256("".join(lines).encode("utf-8"))

def main() -> None:
    if len(sys.argv) != 3:
        raise SystemExit("usage: materialize_patch_a2_refresh_wake_candidate.py <repo-root> <output-dir>")
    repo = Path(sys.argv[1]).resolve()
    out = Path(sys.argv[2]).resolve()
    a1 = repo / "tooling/llm-api-bridges/ozon-seller/validation/materialize_patch_a1_finish_fix_candidate.py"
    if not a1.is_file():
        raise RuntimeError(f"missing Patch A.1 materializer: {a1}")
    if out.exists():
        shutil.rmtree(out)
    subprocess.run([sys.executable, str(a1), str(repo), str(out)], check=True)

    files = [p for p in out.rglob("*") if p.is_file()]
    if len(files) != EXPECTED_FILE_COUNT:
        raise RuntimeError(f"Patch A.1 production file count {len(files)} != {EXPECTED_FILE_COUNT}")
    worker = out / "service_worker.js"
    before = worker.read_bytes()
    if sha256(before) != A1_SERVICE_WORKER_SHA256:
        raise RuntimeError("Patch A.1 service_worker.js identity mismatch")
    text = before.decode("utf-8")
    if text.count(OLD) != 1:
        raise RuntimeError("Patch A.2 Refresh source anchor is missing or ambiguous")
    worker.write_bytes(text.replace(OLD, NEW, 1).encode("utf-8"))
    after = worker.read_bytes()
    if sha256(after) != A2_SERVICE_WORKER_SHA256:
        raise RuntimeError("Patch A.2 service_worker.js identity mismatch")
    digest = tree_digest(out)
    if digest != A2_TREE_MANIFEST_SHA256:
        raise RuntimeError(f"Patch A.2 candidate tree digest {digest} != {A2_TREE_MANIFEST_SHA256}")

    print("PATCH_A2_A1_BASE_IDENTITY_PASS")
    print("PATCH_A2_REFRESH_OVERLAY_SINGLE_ANCHOR_PASS")
    print("PATCH_A2_SERVICE_WORKER_SHA256_PASS")
    print("PATCH_A2_PRODUCTION_FILE_COUNT_19_PASS")
    print("PATCH_A2_TREE_MANIFEST_SHA256_PASS")
    print(str(out))

if __name__ == "__main__":
    main()
