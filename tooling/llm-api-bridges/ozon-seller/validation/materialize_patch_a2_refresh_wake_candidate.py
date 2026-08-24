#!/usr/bin/env python3
import hashlib
import shutil
import subprocess
import sys
from pathlib import Path

A1_SERVICE_WORKER_SHA256 = "f9cb0720f411b479a22f00cb0ba7a3553de8ae8fba62de5a27a904b6d27a287c"
A2_SERVICE_WORKER_SHA256 = "1c9bca51298ee215e8b8c29af8be44763eabd76ad1b357b709a996e87f2b0ce6"
A2_TREE_MANIFEST_SHA256 = "ce4ab71244a4ffe7bad680cb99f10360ceec5f55e76410eb8b83d8b686234b3f"
EXPECTED_FILE_COUNT = 19

def sha256(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()

def tree_digest(root: Path) -> str:
    lines = []
    files = sorted((p for p in root.rglob("*") if p.is_file()), key=lambda p: str(p.relative_to(root)).replace("\\", "/"))
    for file in files:
        rel = str(file.relative_to(root)).replace("\\", "/")
        lines.append(f"{rel}\0{sha256(file.read_bytes())}\n")
    return sha256("".join(lines).encode("utf-8"))

def replace_once(text: str, old: str, new: str, label: str) -> str:
    count = text.count(old)
    if count != 1:
        raise RuntimeError(f"Patch A.2 anchor {label} count {count} != 1")
    return text.replace(old, new, 1)

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

    text = replace_once(
        text,
        'const PROVIDER_QUOTA_ALARM = "ozon-provider-quota-wake-v1";\n',
        'const PROVIDER_QUOTA_ALARM = "ozon-provider-quota-wake-v1";\nconst WORK_SESSION_REFRESH_WAKE_ALARM = "ozon-work-session-refresh-wake-v1";\n',
        "wake_alarm_constant"
    )

    text = replace_once(
        text,
        'async function resumeWorkSessionRecoveries() {\n  const recoveries = await getWorkRecoveries();',
        'async function resumeWorkSessionRecoveriesOnce() {\n  const recoveries = await getWorkRecoveries();',
        "resume_once_rename"
    )

    reconnect_helpers = '''async function waitForRefreshTabIdentity(recovery, timeoutMs = 15000) {\n  const deadline = Date.now() + Math.max(1000, Number(timeoutMs || 15000));\n  let lastCode = "IDENTITY_UNAVAILABLE";\n  let lastError = "Content runtime is not ready after extension reload.";\n  while (Date.now() < deadline) {\n    const response = await tabMessage(Number(recovery.tab_id), { type: "OZ_GET_IDENTITY" });\n    if (response?.ok && response.identity) {\n      const identity = normalizeIdentity(response.identity);\n      const matches = identity.origin === recovery.origin && identity.ai_id === recovery.ai_id && identity.conversation_id === recovery.conversation_id;\n      if (!matches) return { ok: false, code: "WORK_REFRESH_CONTEXT_INVALID", identity };\n      return { ok: true, identity };\n    }\n    lastCode = response?.code || "IDENTITY_UNAVAILABLE";\n    lastError = response?.error || lastError;\n    await sleep(250);\n  }\n  return { ok: false, code: "WORK_REFRESH_CONTENT_RECONNECT_TIMEOUT", error: lastError, last_code: lastCode };\n}\n\nlet workSessionRecoveryResumeInFlight = null;\nasync function resumeWorkSessionRecoveries() {\n  if (workSessionRecoveryResumeInFlight) return workSessionRecoveryResumeInFlight;\n  workSessionRecoveryResumeInFlight = resumeWorkSessionRecoveriesOnce().finally(() => { workSessionRecoveryResumeInFlight = null; });\n  return workSessionRecoveryResumeInFlight;\n}\n\n'''
    text = replace_once(
        text,
        'async function resumeWorkSessionRecoveriesOnce() {\n  const recoveries = await getWorkRecoveries();',
        reconnect_helpers + 'async function resumeWorkSessionRecoveriesOnce() {\n  const recoveries = await getWorkRecoveries();',
        "reconnect_helpers"
    )

    old_identity = '''    let identity = null;\n    try { identity = await tabIdentity(Number(recovery.tab_id)); } catch (_) { identity = null; }\n    if (!identity || identity.origin !== recovery.origin || identity.ai_id !== recovery.ai_id || identity.conversation_id !== recovery.conversation_id) {\n      await setWorkSessionCommandAcceptance(key, false);\n      await mutateWorkSession(key, session.revision, OzonWorkSessionModel.STATES.ERROR, { error: { code: "WORK_REFRESH_CONTEXT_INVALID" } });\n      delete recoveries[key];\n      continue;\n    }'''
    new_identity = '''    const identityCheck = await waitForRefreshTabIdentity(recovery);\n    if (!identityCheck.ok) {\n      await setWorkSessionCommandAcceptance(key, false);\n      await mutateWorkSession(key, session.revision, OzonWorkSessionModel.STATES.ERROR, { error: { code: identityCheck.code || "WORK_REFRESH_CONTEXT_INVALID" } });\n      await diagnostic(identityCheck.code || "WORK_REFRESH_CONTEXT_INVALID", { recovery_id: recovery.recovery_id, tab_id: recovery.tab_id, last_code: identityCheck.last_code || null, error: identityCheck.error || null }, { level: "error" });\n      delete recoveries[key];\n      continue;\n    }'''
    text = replace_once(text, old_identity, new_identity, "reconnect_wait")

    text = replace_once(
        text,
        '  await storageSet({ [KEYS.WORK_SESSION_RECOVERIES]: recoveries });\n}\n\nfunction normalizeBindingRecord',
        '  await storageSet({ [KEYS.WORK_SESSION_RECOVERIES]: recoveries });\n  if (Object.keys(recoveries).length === 0) {\n    try { await chrome.alarms.clear(WORK_SESSION_REFRESH_WAKE_ALARM); } catch (_) {}\n  }\n}\n\nfunction normalizeBindingRecord',
        "wake_alarm_clear"
    )

    old_alarm = '''if (chrome.alarms?.onAlarm?.addListener) {\n  chrome.alarms.onAlarm.addListener((alarm) => {\n    if (String(alarm?.name || "") !== PROVIDER_QUOTA_ALARM) return;\n    void resumeProviderQuotaWaits();\n  });\n}'''
    new_alarm = '''if (chrome.alarms?.onAlarm?.addListener) {\n  chrome.alarms.onAlarm.addListener((alarm) => {\n    const name = String(alarm?.name || "");\n    if (name === WORK_SESSION_REFRESH_WAKE_ALARM) { void resumeWorkSessionRecoveries(); return; }\n    if (name === PROVIDER_QUOTA_ALARM) void resumeProviderQuotaWaits();\n  });\n}'''
    text = replace_once(text, old_alarm, new_alarm, "wake_alarm_listener")

    old_route = '''        const begun = await beginWorkSessionRefresh(tab, key);\n        if (begun.already_in_progress) return { ok: true, code: "REFRESH_ALREADY_IN_PROGRESS", recovery: begun.recovery };\n        setTimeout(() => chrome.runtime.reload(), 0);\n        return { ok: true, recovery: begun.recovery, runtime_reload_scheduled: true };'''
    new_route = '''        const begun = await beginWorkSessionRefresh(tab, key);\n        if (begun.already_in_progress) return { ok: true, code: "REFRESH_ALREADY_IN_PROGRESS", recovery: begun.recovery };\n        let wakeAlarmScheduled = false;\n        try {\n          await chrome.alarms.create(WORK_SESSION_REFRESH_WAKE_ALARM, { when: Date.now() + 1000, persistAcrossSessions: true });\n          wakeAlarmScheduled = true;\n        } catch (_) {\n          try {\n            await chrome.alarms.create(WORK_SESSION_REFRESH_WAKE_ALARM, { when: Date.now() + 1000 });\n            wakeAlarmScheduled = true;\n          } catch (_) {}\n        }\n        try {\n          await chrome.tabs.reload(tab);\n        } catch (error) {\n          if (wakeAlarmScheduled) { try { await chrome.alarms.clear(WORK_SESSION_REFRESH_WAKE_ALARM); } catch (_) {} }\n          const session = await workSessionFor(key);\n          if (session.state === OzonWorkSessionModel.STATES.RECOVERING && Number(session.revision) === Number(begun.recovery.revision)) {\n            await mutateWorkSession(key, session.revision, OzonWorkSessionModel.STATES.ERROR, { error: { code: "WORK_REFRESH_TAB_RELOAD_FAILED" } });\n          }\n          const recoveries = await getWorkRecoveries();\n          if (recoveries[key]?.recovery_id === begun.recovery.recovery_id) {\n            delete recoveries[key];\n            await storageSet({ [KEYS.WORK_SESSION_RECOVERIES]: recoveries });\n          }\n          await diagnostic("WORK_SESSION_REFRESH_TAB_RELOAD_FAILED", { recovery_id: begun.recovery.recovery_id, tab_id: tab, error: error?.message || String(error) }, { level: "error" });\n          return { ok: false, code: "WORK_REFRESH_TAB_RELOAD_FAILED", error: error?.message || String(error), recovery: begun.recovery };\n        }\n        await diagnostic("WORK_SESSION_REFRESH_TAB_RELOAD_SCHEDULED", { recovery_id: begun.recovery.recovery_id, tab_id: tab, conversation_key: key, wake_alarm_scheduled: wakeAlarmScheduled });\n        setTimeout(() => chrome.runtime.reload(), 0);\n        return { ok: true, recovery: begun.recovery, page_reload_scheduled: true, runtime_reload_scheduled: true, wake_alarm_scheduled: wakeAlarmScheduled };'''
    text = replace_once(text, old_route, new_route, "refresh_route")

    worker.write_bytes(text.encode("utf-8"))
    after = worker.read_bytes()
    if sha256(after) != A2_SERVICE_WORKER_SHA256:
        raise RuntimeError(f"Patch A.2 service_worker.js identity mismatch: {sha256(after)}")
    digest = tree_digest(out)
    if digest != A2_TREE_MANIFEST_SHA256:
        raise RuntimeError(f"Patch A.2 candidate tree digest {digest} != {A2_TREE_MANIFEST_SHA256}")

    print("PATCH_A2_A1_BASE_IDENTITY_PASS")
    print("PATCH_A2_REFRESH_OVERLAYS_SINGLE_ANCHOR_PASS")
    print("PATCH_A2_PERSISTENT_WAKE_FALLBACK_PASS")
    print("PATCH_A2_CONTENT_RECONNECT_WAIT_PASS")
    print("PATCH_A2_SERVICE_WORKER_SHA256_PASS")
    print("PATCH_A2_PRODUCTION_FILE_COUNT_19_PASS")
    print("PATCH_A2_TREE_MANIFEST_SHA256_PASS")
    print(str(out))

if __name__ == "__main__":
    main()
