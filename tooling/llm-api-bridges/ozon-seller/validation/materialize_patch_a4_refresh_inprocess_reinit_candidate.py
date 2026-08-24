#!/usr/bin/env python3
import hashlib
import shutil
import subprocess
import sys
from pathlib import Path

A3_SERVICE_WORKER_SHA256 = "d882e393bf3d1e6b89b8a3bec47f858cdf3e523cdf11a2819e30c1e5b3efe770"
A4_SERVICE_WORKER_SHA256 = "a6088180c7aae74fc3379f0adc7f52dc3180d77fcfe7acf9400dacd22ba293bc"
A4_TREE_MANIFEST_SHA256 = "acfba949b5df31f6a489653bb1d473dab7bb771f0089a060cd475b541271beb0"
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
        raise RuntimeError(f"Patch A.4 anchor {label} count {count} != 1")
    return text.replace(old, new, 1)


def replace_range_once(text: str, start_anchor: str, end_anchor: str, replacement: str, label: str) -> str:
    if text.count(start_anchor) != 1 or text.count(end_anchor) < 1:
        raise RuntimeError(f"Patch A.4 range anchor {label} is missing or ambiguous")
    start = text.index(start_anchor)
    end = text.index(end_anchor, start)
    return text[:start] + replacement + text[end:]


def main() -> None:
    if len(sys.argv) != 3:
        raise SystemExit("usage: materialize_patch_a4_refresh_inprocess_reinit_candidate.py <repo-root> <output-dir>")
    repo = Path(sys.argv[1]).resolve()
    out = Path(sys.argv[2]).resolve()
    a3 = repo / "tooling/llm-api-bridges/ozon-seller/validation/materialize_patch_a3_refresh_response_boundary_candidate.py"
    if not a3.is_file():
        raise RuntimeError(f"missing Patch A.3 materializer: {a3}")
    if out.exists():
        shutil.rmtree(out)
    subprocess.run([sys.executable, str(a3), str(repo), str(out)], check=True)

    files = [p for p in out.rglob("*") if p.is_file()]
    if len(files) != EXPECTED_FILE_COUNT:
        raise RuntimeError(f"Patch A.3 production file count {len(files)} != {EXPECTED_FILE_COUNT}")
    worker = out / "service_worker.js"
    before = worker.read_bytes()
    if sha256(before) != A3_SERVICE_WORKER_SHA256:
        raise RuntimeError(f"Patch A.3 service_worker.js identity mismatch: {sha256(before)}")
    text = before.decode("utf-8")

    text = replace_once(
        text,
        'const WORKER_SESSION_ID = `worker-${crypto.randomUUID()}`;\nconst DEFAULT_AUTO_START_TEXT',
        'const WORKER_SESSION_ID = `worker-${crypto.randomUUID()}`;\nlet workSessionRuntimeGeneration = `work-runtime-${crypto.randomUUID()}`;\nconst DEFAULT_AUTO_START_TEXT',
        "work_session_generation"
    )

    text = replace_once(
        text,
        '    old_runtime_generation: WORKER_SESSION_ID,\n    tab_id: tab,',
        '    old_runtime_generation: workSessionRuntimeGeneration,\n    new_runtime_generation: `work-runtime-${crypto.randomUUID()}`,\n    worker_session_id: WORKER_SESSION_ID,\n    tab_id: tab,',
        "recovery_generations"
    )

    text = replace_once(
        text,
        '  await diagnostic("WORK_SESSION_REFRESH_PREPARED", { recovery_id: recovery.recovery_id, old_runtime_generation: WORKER_SESSION_ID, operation_phase: operation.phase, provider_dispatched: operation.provider_dispatched, delivery_preserved: operation.delivery_preserved === true });',
        '  await diagnostic("WORK_SESSION_REFRESH_PREPARED", { recovery_id: recovery.recovery_id, old_runtime_generation: recovery.old_runtime_generation, new_runtime_generation: recovery.new_runtime_generation, worker_session_id: WORKER_SESSION_ID, operation_phase: operation.phase, provider_dispatched: operation.provider_dispatched, delivery_preserved: operation.delivery_preserved === true });',
        "prepared_diagnostic"
    )

    reload_helper = '''async function reloadRefreshOwnerTabInProcess(recovery, timeoutMs = 15000) {\n  const tabId = Number(recovery?.tab_id || 0);\n  if (!Number.isInteger(tabId) || tabId <= 0) {\n    return { ok: false, code: "WORK_REFRESH_TAB_RELOAD_FAILED", error: "Recovery owner tab is missing." };\n  }\n  const loaded = await new Promise((resolve) => {\n    let settled = false;\n    let sawLoading = false;\n    const finish = (result) => {\n      if (settled) return;\n      settled = true;\n      clearTimeout(timer);\n      try { chrome.tabs.onUpdated.removeListener(listener); } catch (_) {}\n      resolve(result);\n    };\n    const listener = (updatedTabId, changeInfo, tab) => {\n      if (Number(updatedTabId) !== tabId) return;\n      if (changeInfo?.status === "loading") sawLoading = true;\n      if (changeInfo?.status === "complete" && sawLoading) finish({ ok: true, tab });\n    };\n    const timer = setTimeout(() => finish({ ok: false, code: "WORK_REFRESH_TAB_RELOAD_TIMEOUT", error: "AI tab reload did not complete in time." }), Math.max(1000, Number(timeoutMs || 15000)));\n    chrome.tabs.onUpdated.addListener(listener);\n    Promise.resolve(chrome.tabs.reload(tabId)).catch((error) => {\n      finish({ ok: false, code: "WORK_REFRESH_TAB_RELOAD_FAILED", error: error?.message || String(error) });\n    });\n  });\n  if (!loaded?.ok) return loaded;\n  await diagnostic("WORK_SESSION_REFRESH_TAB_RELOAD_COMPLETED", {\n    recovery_id: recovery.recovery_id,\n    tab_id: tabId,\n    conversation_key: recovery.conversation_key,\n    worker_session_id: WORKER_SESSION_ID,\n    runtime_generation: recovery.new_runtime_generation\n  });\n  return { ok: true, tab_id: tabId };\n}\n\n'''
    text = replace_range_once(
        text,
        "async function reloadRefreshOwnerTabAfterRuntimeRenewal(recovery) {",
        "let workSessionRecoveryResumeInFlight = null;",
        reload_helper,
        "reload_helper"
    )

    text = replace_once(
        text,
        '''    const pageReload = await reloadRefreshOwnerTabAfterRuntimeRenewal(recovery);\n    if (!pageReload.ok) {\n      await setWorkSessionCommandAcceptance(key, false);\n      await mutateWorkSession(key, session.revision, OzonWorkSessionModel.STATES.ERROR, { error: { code: pageReload.code || "WORK_REFRESH_TAB_RELOAD_FAILED" } });\n      await diagnostic(pageReload.code || "WORK_REFRESH_TAB_RELOAD_FAILED", { recovery_id: recovery.recovery_id, tab_id: recovery.tab_id, runtime_generation: WORKER_SESSION_ID, error: pageReload.error || null }, { level: "error" });\n      delete recoveries[key];\n      continue;\n    }\n    const identityCheck = await waitForRefreshTabIdentity(recovery);''',
        '''    const identityCheck = await waitForRefreshTabIdentity(recovery);''',
        "remove_resume_page_reload"
    )

    text = replace_once(
        text,
        '''    const handshake = await tabMessage(Number(recovery.tab_id), { type: "OZ_WORK_RUNTIME_RENEW", runtime_generation: WORKER_SESSION_ID, conversation_key: key, visible: false });\n    if (!handshake?.ok || handshake.runtime_generation !== WORKER_SESSION_ID || handshake.applied !== true) {''',
        '''    const runtimeGeneration = String(recovery.new_runtime_generation || workSessionRuntimeGeneration);\n    const handshake = await tabMessage(Number(recovery.tab_id), { type: "OZ_WORK_RUNTIME_RENEW", runtime_generation: runtimeGeneration, conversation_key: key, visible: false });\n    if (!handshake?.ok || handshake.runtime_generation !== runtimeGeneration || handshake.applied !== true) {''',
        "content_generation_handshake"
    )

    text = replace_once(
        text,
        '    await diagnostic("WORK_SESSION_REFRESH_RESUMED", { recovery_id: recovery.recovery_id, old_runtime_generation: recovery.old_runtime_generation, new_runtime_generation: WORKER_SESSION_ID, restored_state: target, delivery_preserved: recovery.operation?.delivery_preserved === true, ui_record_generation: handshake.ui_record_generation || null });',
        '    await diagnostic("WORK_SESSION_REFRESH_RESUMED", { recovery_id: recovery.recovery_id, old_runtime_generation: recovery.old_runtime_generation, new_runtime_generation: runtimeGeneration, worker_session_id: WORKER_SESSION_ID, restored_state: target, delivery_preserved: recovery.operation?.delivery_preserved === true, ui_record_generation: handshake.ui_record_generation || null });',
        "resumed_diagnostic"
    )

    refresh_route = '''      case "OZ_WORK_REFRESH": {\n        const tab = normalizeTabId(message.tab_id);\n        const key = normalizeConversationKey(message.conversation_key);\n        const begun = await beginWorkSessionRefresh(tab, key);\n        if (begun.already_in_progress) return { ok: true, code: "REFRESH_ALREADY_IN_PROGRESS", recovery: begun.recovery };\n        const oldRuntimeGeneration = String(begun.recovery.old_runtime_generation || workSessionRuntimeGeneration);\n        const newRuntimeGeneration = String(begun.recovery.new_runtime_generation || `work-runtime-${crypto.randomUUID()}`);\n        workSessionRuntimeGeneration = newRuntimeGeneration;\n        await diagnostic("WORK_SESSION_REFRESH_RUNTIME_REINITIALIZED", {\n          recovery_id: begun.recovery.recovery_id,\n          tab_id: tab,\n          conversation_key: key,\n          worker_session_id: WORKER_SESSION_ID,\n          old_runtime_generation: oldRuntimeGeneration,\n          new_runtime_generation: newRuntimeGeneration\n        });\n        const pageReload = await reloadRefreshOwnerTabInProcess(begun.recovery);\n        if (!pageReload.ok) {\n          const session = await workSessionFor(key);\n          await setWorkSessionCommandAcceptance(key, false);\n          if (session.state === OzonWorkSessionModel.STATES.RECOVERING && Number(session.revision) === Number(begun.recovery.revision)) {\n            await mutateWorkSession(key, session.revision, OzonWorkSessionModel.STATES.ERROR, { error: { code: pageReload.code || "WORK_REFRESH_TAB_RELOAD_FAILED" } });\n          }\n          const recoveries = await getWorkRecoveries();\n          if (recoveries[key]?.recovery_id === begun.recovery.recovery_id) {\n            delete recoveries[key];\n            await storageSet({ [KEYS.WORK_SESSION_RECOVERIES]: recoveries });\n          }\n          await diagnostic(pageReload.code || "WORK_REFRESH_TAB_RELOAD_FAILED", { recovery_id: begun.recovery.recovery_id, tab_id: tab, worker_session_id: WORKER_SESSION_ID, runtime_generation: newRuntimeGeneration, error: pageReload.error || null }, { level: "error" });\n          return { ok: false, code: pageReload.code || "WORK_REFRESH_TAB_RELOAD_FAILED", error: pageReload.error || "AI tab reload failed.", recovery: begun.recovery };\n        }\n        await resumeWorkSessionRecoveries();\n        const restored = await workSessionFor(key);\n        const restoredOk = [OzonWorkSessionModel.STATES.ACTIVE_VISIBLE, OzonWorkSessionModel.STATES.ACTIVE_HIDDEN].includes(restored.state);\n        if (!restoredOk) {\n          return { ok: false, code: restored.error?.code || "WORK_REFRESH_RECOVERY_FAILED", error: "Work-session recovery did not restore an active state.", recovery: begun.recovery, session: restored };\n        }\n        return {\n          ok: true,\n          recovery: begun.recovery,\n          runtime_reinitialized: true,\n          physical_worker_reloaded: false,\n          worker_session_id: WORKER_SESSION_ID,\n          old_runtime_generation: oldRuntimeGeneration,\n          new_runtime_generation: newRuntimeGeneration,\n          page_reload_completed: true,\n          restored_state: restored.state\n        };\n      }\n\n'''
    text = replace_range_once(
        text,
        '      case "OZ_WORK_REFRESH": {',
        '      case "OZ_WORK_START": {',
        refresh_route,
        "refresh_route"
    )

    text = replace_once(
        text,
        '''  })().then((response) => {\n    const runtimeReloadAfterResponse = response?.runtime_reload_after_response === true;\n    if (!runtimeReloadAfterResponse) {\n      sendResponse(response);\n      return;\n    }\n    const publicResponse = { ...response };\n    delete publicResponse.runtime_reload_after_response;\n    sendResponse(publicResponse);\n    try { chrome.runtime.reload(); } catch (_) {}\n  }).catch(async (error) => {''',
        '''  })().then(sendResponse).catch(async (error) => {''',
        "remove_physical_extension_reload"
    )

    worker.write_bytes(text.encode("utf-8"))
    after = worker.read_bytes()
    actual_worker_sha = sha256(after)
    if actual_worker_sha != A4_SERVICE_WORKER_SHA256:
        raise RuntimeError(f"Patch A.4 service_worker.js identity mismatch: {actual_worker_sha}")
    digest = tree_digest(out)
    if digest != A4_TREE_MANIFEST_SHA256:
        raise RuntimeError(f"Patch A.4 candidate tree digest {digest} != {A4_TREE_MANIFEST_SHA256}")

    print("PATCH_A4_A3_BASE_IDENTITY_PASS")
    print("PATCH_A4_SEPARATE_WORK_RUNTIME_GENERATION_PASS")
    print("PATCH_A4_NO_PHYSICAL_EXTENSION_RELOAD_PASS")
    print("PATCH_A4_INPROCESS_RUNTIME_REINITIALIZATION_PASS")
    print("PATCH_A4_SAME_TAB_RELOAD_COMPLETION_BARRIER_PASS")
    print("PATCH_A4_CONTENT_RUNTIME_RENEW_HANDSHAKE_PASS")
    print("PATCH_A4_SERVICE_WORKER_SHA256_PASS")
    print("PATCH_A4_PRODUCTION_FILE_COUNT_19_PASS")
    print("PATCH_A4_TREE_MANIFEST_SHA256_PASS")
    print(str(out))


if __name__ == "__main__":
    main()
