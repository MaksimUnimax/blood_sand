#!/usr/bin/env python3
import hashlib
import shutil
import subprocess
import sys
from pathlib import Path

A2_SERVICE_WORKER_SHA256 = "1c9bca51298ee215e8b8c29af8be44763eabd76ad1b357b709a996e87f2b0ce6"
A3_SERVICE_WORKER_SHA256 = "d882e393bf3d1e6b89b8a3bec47f858cdf3e523cdf11a2819e30c1e5b3efe770"
A3_TREE_MANIFEST_SHA256 = "ddb3cc38586191dd4d015e189847472157ff4ed00c54856f4a11ea4c1b249a21"
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
        raise RuntimeError(f"Patch A.3 anchor {label} count {count} != 1")
    return text.replace(old, new, 1)


def main() -> None:
    if len(sys.argv) != 3:
        raise SystemExit("usage: materialize_patch_a3_refresh_response_boundary_candidate.py <repo-root> <output-dir>")
    repo = Path(sys.argv[1]).resolve()
    out = Path(sys.argv[2]).resolve()
    a2 = repo / "tooling/llm-api-bridges/ozon-seller/validation/materialize_patch_a2_refresh_wake_candidate.py"
    if not a2.is_file():
        raise RuntimeError(f"missing Patch A.2 materializer: {a2}")
    if out.exists():
        shutil.rmtree(out)
    subprocess.run([sys.executable, str(a2), str(repo), str(out)], check=True)

    files = [p for p in out.rglob("*") if p.is_file()]
    if len(files) != EXPECTED_FILE_COUNT:
        raise RuntimeError(f"Patch A.2 production file count {len(files)} != {EXPECTED_FILE_COUNT}")
    worker = out / "service_worker.js"
    before = worker.read_bytes()
    if sha256(before) != A2_SERVICE_WORKER_SHA256:
        raise RuntimeError("Patch A.2 service_worker.js identity mismatch")
    text = before.decode("utf-8")

    text = replace_once(
        text,
        '''let workSessionRecoveryResumeInFlight = null;\nasync function resumeWorkSessionRecoveries() {''',
        '''async function reloadRefreshOwnerTabAfterRuntimeRenewal(recovery) {\n  const tabId = Number(recovery?.tab_id || 0);\n  if (!Number.isInteger(tabId) || tabId <= 0) {\n    return { ok: false, code: "WORK_REFRESH_TAB_RELOAD_FAILED", error: "Recovery owner tab is missing." };\n  }\n  try {\n    await chrome.tabs.reload(tabId);\n  } catch (error) {\n    return { ok: false, code: "WORK_REFRESH_TAB_RELOAD_FAILED", error: error?.message || String(error) };\n  }\n  await diagnostic("WORK_SESSION_REFRESH_POST_RUNTIME_TAB_RELOAD_SCHEDULED", {\n    recovery_id: recovery.recovery_id,\n    tab_id: tabId,\n    conversation_key: recovery.conversation_key,\n    runtime_generation: WORKER_SESSION_ID\n  });\n  return { ok: true, tab_id: tabId };\n}\n\nlet workSessionRecoveryResumeInFlight = null;\nasync function resumeWorkSessionRecoveries() {''',
        "post_runtime_tab_reload_helper"
    )

    text = replace_once(
        text,
        '''    const identityCheck = await waitForRefreshTabIdentity(recovery);\n    if (!identityCheck.ok) {''',
        '''    const pageReload = await reloadRefreshOwnerTabAfterRuntimeRenewal(recovery);\n    if (!pageReload.ok) {\n      await setWorkSessionCommandAcceptance(key, false);\n      await mutateWorkSession(key, session.revision, OzonWorkSessionModel.STATES.ERROR, { error: { code: pageReload.code || "WORK_REFRESH_TAB_RELOAD_FAILED" } });\n      await diagnostic(pageReload.code || "WORK_REFRESH_TAB_RELOAD_FAILED", { recovery_id: recovery.recovery_id, tab_id: recovery.tab_id, runtime_generation: WORKER_SESSION_ID, error: pageReload.error || null }, { level: "error" });\n      delete recoveries[key];\n      continue;\n    }\n    const identityCheck = await waitForRefreshTabIdentity(recovery);\n    if (!identityCheck.ok) {''',
        "new_runtime_tab_reload_before_identity"
    )

    old_route = '''      case "OZ_WORK_REFRESH": {\n        const tab = normalizeTabId(message.tab_id);\n        const key = normalizeConversationKey(message.conversation_key);\n        const begun = await beginWorkSessionRefresh(tab, key);\n        if (begun.already_in_progress) return { ok: true, code: "REFRESH_ALREADY_IN_PROGRESS", recovery: begun.recovery };\n        let wakeAlarmScheduled = false;\n        try {\n          await chrome.alarms.create(WORK_SESSION_REFRESH_WAKE_ALARM, { when: Date.now() + 1000, persistAcrossSessions: true });\n          wakeAlarmScheduled = true;\n        } catch (_) {\n          try {\n            await chrome.alarms.create(WORK_SESSION_REFRESH_WAKE_ALARM, { when: Date.now() + 1000 });\n            wakeAlarmScheduled = true;\n          } catch (_) {}\n        }\n        try {\n          await chrome.tabs.reload(tab);\n        } catch (error) {\n          if (wakeAlarmScheduled) { try { await chrome.alarms.clear(WORK_SESSION_REFRESH_WAKE_ALARM); } catch (_) {} }\n          const session = await workSessionFor(key);\n          if (session.state === OzonWorkSessionModel.STATES.RECOVERING && Number(session.revision) === Number(begun.recovery.revision)) {\n            await mutateWorkSession(key, session.revision, OzonWorkSessionModel.STATES.ERROR, { error: { code: "WORK_REFRESH_TAB_RELOAD_FAILED" } });\n          }\n          const recoveries = await getWorkRecoveries();\n          if (recoveries[key]?.recovery_id === begun.recovery.recovery_id) {\n            delete recoveries[key];\n            await storageSet({ [KEYS.WORK_SESSION_RECOVERIES]: recoveries });\n          }\n          await diagnostic("WORK_SESSION_REFRESH_TAB_RELOAD_FAILED", { recovery_id: begun.recovery.recovery_id, tab_id: tab, error: error?.message || String(error) }, { level: "error" });\n          return { ok: false, code: "WORK_REFRESH_TAB_RELOAD_FAILED", error: error?.message || String(error), recovery: begun.recovery };\n        }\n        await diagnostic("WORK_SESSION_REFRESH_TAB_RELOAD_SCHEDULED", { recovery_id: begun.recovery.recovery_id, tab_id: tab, conversation_key: key, wake_alarm_scheduled: wakeAlarmScheduled });\n        setTimeout(() => chrome.runtime.reload(), 0);\n        return { ok: true, recovery: begun.recovery, page_reload_scheduled: true, runtime_reload_scheduled: true, wake_alarm_scheduled: wakeAlarmScheduled };\n      }\n'''
    new_route = '''      case "OZ_WORK_REFRESH": {\n        const tab = normalizeTabId(message.tab_id);\n        const key = normalizeConversationKey(message.conversation_key);\n        const begun = await beginWorkSessionRefresh(tab, key);\n        if (begun.already_in_progress) return { ok: true, code: "REFRESH_ALREADY_IN_PROGRESS", recovery: begun.recovery };\n        let wakeAlarmScheduled = false;\n        try {\n          await chrome.alarms.create(WORK_SESSION_REFRESH_WAKE_ALARM, { when: Date.now() + 1000, persistAcrossSessions: true });\n          wakeAlarmScheduled = true;\n        } catch (_) {\n          try {\n            await chrome.alarms.create(WORK_SESSION_REFRESH_WAKE_ALARM, { when: Date.now() + 1000 });\n            wakeAlarmScheduled = true;\n          } catch (_) {}\n        }\n        await diagnostic("WORK_SESSION_REFRESH_RUNTIME_RELOAD_ARMED", {\n          recovery_id: begun.recovery.recovery_id,\n          tab_id: tab,\n          conversation_key: key,\n          wake_alarm_scheduled: wakeAlarmScheduled\n        });\n        return {\n          ok: true,\n          recovery: begun.recovery,\n          runtime_reload_scheduled: true,\n          page_reload_deferred_to_new_runtime: true,\n          wake_alarm_scheduled: wakeAlarmScheduled,\n          runtime_reload_after_response: true\n        };\n      }\n\n'''
    text = replace_once(text, old_route, new_route, "refresh_route_response_boundary")

    text = replace_once(
        text,
        '''  })().then(sendResponse).catch(async (error) => {\n    const code = String(error?.code || (error?.name === "AbortError" ? "REQUEST_TIMEOUT" : "EXTENSION_ERROR"));''',
        '''  })().then((response) => {\n    const runtimeReloadAfterResponse = response?.runtime_reload_after_response === true;\n    if (!runtimeReloadAfterResponse) {\n      sendResponse(response);\n      return;\n    }\n    const publicResponse = { ...response };\n    delete publicResponse.runtime_reload_after_response;\n    sendResponse(publicResponse);\n    try { chrome.runtime.reload(); } catch (_) {}\n  }).catch(async (error) => {\n    const code = String(error?.code || (error?.name === "AbortError" ? "REQUEST_TIMEOUT" : "EXTENSION_ERROR"));''',
        "message_response_boundary_reload"
    )

    worker.write_bytes(text.encode("utf-8"))
    after = worker.read_bytes()
    if sha256(after) != A3_SERVICE_WORKER_SHA256:
        raise RuntimeError(f"Patch A.3 service_worker.js identity mismatch: {sha256(after)}")
    digest = tree_digest(out)
    if digest != A3_TREE_MANIFEST_SHA256:
        raise RuntimeError(f"Patch A.3 candidate tree digest {digest} != {A3_TREE_MANIFEST_SHA256}")

    print("PATCH_A3_A2_BASE_IDENTITY_PASS")
    print("PATCH_A3_RESPONSE_BOUNDARY_RELOAD_PASS")
    print("PATCH_A3_NO_TIMER_RUNTIME_RELOAD_PASS")
    print("PATCH_A3_POST_RUNTIME_TAB_RELOAD_PASS")
    print("PATCH_A3_SERVICE_WORKER_SHA256_PASS")
    print("PATCH_A3_PRODUCTION_FILE_COUNT_19_PASS")
    print("PATCH_A3_TREE_MANIFEST_SHA256_PASS")
    print(str(out))


if __name__ == "__main__":
    main()
