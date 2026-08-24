#!/usr/bin/env python3
import hashlib
import shutil
import subprocess
import sys
from pathlib import Path

A4_POPUP_SHA256 = "6dbf212dbc94b7cd5192cbb02dd2200dbcef221f559e9de54a3d717a32457b87"
A4_SERVICE_WORKER_SHA256 = "a6088180c7aae74fc3379f0adc7f52dc3180d77fcfe7acf9400dacd22ba293bc"
A4_TREE_MANIFEST_SHA256 = "acfba949b5df31f6a489653bb1d473dab7bb771f0089a060cd475b541271beb0"
A5_POPUP_SHA256 = "e77beb6eb5e23aebada2ded9a834e7095f14e74ee9f1e9b54503377a7d87b5e7"
A5_SERVICE_WORKER_SHA256 = "dd67b793d7c28595b5e795f918f702d4fd472c9f43f2bec467e56b85587d29b9"
A5_TREE_MANIFEST_SHA256 = "4b77ed8500e3caacefff43a82002dc6ef5bfd562511bf10ef57a5392069c22a0"
EXPECTED_FILE_COUNT = 19


def sha256(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()


def tree_digest(root: Path) -> str:
    lines = []
    for file in sorted((p for p in root.rglob("*") if p.is_file()), key=lambda p: str(p.relative_to(root)).replace("\\", "/")):
        rel = str(file.relative_to(root)).replace("\\", "/")
        lines.append(f"{rel}\0{sha256(file.read_bytes())}\n")
    return sha256("".join(lines).encode("utf-8"))


def replace_once(text: str, old: str, new: str, label: str) -> str:
    count = text.count(old)
    if count != 1:
        raise RuntimeError(f"Patch A.5 anchor {label} count {count} != 1")
    return text.replace(old, new, 1)


def main() -> None:
    if len(sys.argv) != 3:
        raise SystemExit("usage: materialize_patch_a5_work_resume_provider_status_candidate.py <repo-root> <output-dir>")
    repo = Path(sys.argv[1]).resolve()
    out = Path(sys.argv[2]).resolve()
    a4 = repo / "tooling/llm-api-bridges/ozon-seller/validation/materialize_patch_a4_refresh_inprocess_reinit_candidate.py"
    if not a4.is_file():
        raise RuntimeError(f"missing accepted Patch A.4 materializer: {a4}")
    if out.exists():
        shutil.rmtree(out)
    subprocess.run([sys.executable, str(a4), str(repo), str(out)], check=True)

    files = [p for p in out.rglob("*") if p.is_file()]
    if len(files) != EXPECTED_FILE_COUNT:
        raise RuntimeError(f"Patch A.4 production file count {len(files)} != {EXPECTED_FILE_COUNT}")
    popup = out / "popup.js"
    worker = out / "service_worker.js"
    if sha256(popup.read_bytes()) != A4_POPUP_SHA256:
        raise RuntimeError("Patch A.4 popup.js identity mismatch")
    if sha256(worker.read_bytes()) != A4_SERVICE_WORKER_SHA256:
        raise RuntimeError("Patch A.4 service_worker.js identity mismatch")
    if tree_digest(out) != A4_TREE_MANIFEST_SHA256:
        raise RuntimeError("Patch A.4 tree identity mismatch")

    p = popup.read_text(encoding="utf-8")
    p = replace_once(
        p,
        '  if ($("workShowHide")) { $("workShowHide").textContent = session.state === "active_visible" ? "Убрать кнопку" : "Показать кнопку"; $("workShowHide").disabled = !["active_visible", "active_hidden"].includes(session.state); }',
        '  if ($("workShowHide")) {\n    $("workShowHide").textContent = session.state === "active_visible" ? "Убрать кнопку" : "Показать кнопку";\n    const resumableInactive = session.state === "inactive" && bound;\n    $("workShowHide").disabled = !(["active_visible", "active_hidden"].includes(session.state) || resumableInactive);\n  }',
        "popup_resume_enable"
    )
    p = replace_once(
        p,
        '''$("workShowHide")?.addEventListener("click", () => busy($("workShowHide"), async () => {\n  const context = await resolvePopupContext(); const hide = lastState?.work_session?.state === "active_visible";\n  const response = await send(hide ? "OZ_WORK_HIDE" : "OZ_WORK_SHOW", { tab_id: context.tab_id, conversation_key: context.conversation_key });\n  if (!response.ok) return status(response.error || "Не удалось изменить видимость кнопки.", "error"); await refresh(); status(hide ? "Кнопки скрыты; worker и provider state сохранены." : "Созданы свежие Ozon controls без отправки prompt.", "ok");\n}));''',
        '''$("workShowHide")?.addEventListener("click", () => busy($("workShowHide"), async () => {\n  const context = await resolvePopupContext();\n  const sessionState = String(lastState?.work_session?.state || "inactive");\n  const messageType = sessionState === "active_visible"\n    ? "OZ_WORK_HIDE"\n    : (sessionState === "active_hidden" ? "OZ_WORK_SHOW" : "OZ_WORK_RESUME");\n  const response = await send(messageType, { tab_id: context.tab_id, conversation_key: context.conversation_key });\n  if (!response.ok) return status(response.error || "Не удалось изменить состояние work-session.", "error");\n  await refresh();\n  if (messageType === "OZ_WORK_HIDE") status("Кнопки скрыты; worker и provider state сохранены.", "ok");\n  else if (messageType === "OZ_WORK_SHOW") status("Созданы свежие Ozon controls без отправки prompt.", "ok");\n  else status("Work-session продолжена без стартового prompt; Ozon controls включены.", "ok");\n}));''',
        "popup_resume_dispatch"
    )
    p = replace_once(
        p,
        '$("workFinish")?.addEventListener("click", () => busy($("workFinish"), async () => { const context = await resolvePopupContext(); const response = await send("OZ_WORK_FINISH", { tab_id: context.tab_id, conversation_key: context.conversation_key }); if (!response.ok) return status(response.error || "Не удалось завершить work-session.", "error"); await refresh(); status("Work-session завершена; привязка retired.", "ok"); }));',
        '$("workFinish")?.addEventListener("click", () => busy($("workFinish"), async () => { const context = await resolvePopupContext(); const response = await send("OZ_WORK_FINISH", { tab_id: context.tab_id, conversation_key: context.conversation_key }); if (!response.ok) return status(response.error || "Не удалось завершить work-session.", "error"); await refresh(); status("Work-session завершена; диалог остаётся привязан. Для продолжения нажмите «Показать кнопку».", "ok"); }));',
        "popup_finish_message"
    )
    popup.write_text(p, encoding="utf-8")

    w = worker.read_text(encoding="utf-8")
    w = replace_once(
        w,
        '    last_status: settings.lastStatus?.code === "SAFE_PROBE_NOT_CONFIGURED" ? null : settings.lastStatus',
        '    last_status: settings.lastStatus?.scope === "provider" && settings.lastStatus?.code !== "SAFE_PROBE_NOT_CONFIGURED" ? settings.lastStatus : null',
        "provider_status_surface"
    )
    w = replace_once(
        w,
        '''  const clean = {\n    ok: Boolean(status.ok),\n    code: String(status.code || "").slice(0, 120),\n    message: String(status.message || "").slice(0, 800),\n    http_status: Number(status.http_status || 0),\n    at: new Date().toISOString()\n  };''',
        '''  const clean = {\n    scope: "provider",\n    ok: Boolean(status.ok),\n    code: String(status.code || "").slice(0, 120),\n    message: String(status.message || "").slice(0, 800),\n    http_status: Number(status.http_status || 0),\n    at: new Date().toISOString()\n  };''',
        "provider_status_scope"
    )
    resume_anchor = '      case "OZ_WORK_SHOW": {'
    resume_route = '''      case "OZ_WORK_RESUME": {\n        const tab = normalizeTabId(message.tab_id);\n        const key = normalizeConversationKey(message.conversation_key);\n        const session = await workSessionFor(key);\n        if (session.state !== OzonWorkSessionModel.STATES.INACTIVE) {\n          return { ok: false, code: "WORK_SESSION_NOT_INACTIVE", error: "Продолжить работу без prompt можно только из inactive work-session." };\n        }\n        const live = await assertTabConversation(tab, key);\n        const binding = await strictBindingForIdentity(live);\n        const manualOperation = await getManualOperation(key);\n        if (manualOperationActive(manualOperation)) {\n          return { ok: false, code: "WORK_RESUME_OPERATION_ACTIVE", error: "Нельзя продолжить inactive work-session: обнаружена незавершённая manual operation." };\n        }\n        const bindingSession = await mutateWorkSession(key, session.revision, OzonWorkSessionModel.STATES.BINDING, {\n          tab_id: tab,\n          origin: live.origin,\n          ai_id: live.ai_id,\n          conversation_id: live.conversation_id,\n          start_intent_id: null,\n          error: null\n        });\n        const visible = await mutateWorkSession(key, bindingSession.revision, OzonWorkSessionModel.STATES.ACTIVE_VISIBLE, { error: null });\n        try {\n          await setWorkSessionCommandAcceptance(key, true);\n          const applied = await tabMessage(tab, { type: "OZ_WORK_APPLY_VISIBILITY", visible: true, conversation_key: key });\n          if (!applied?.ok || applied.applied !== true) throw Object.assign(new Error(applied?.error || "Content script не подтвердил Resume."), { code: applied?.code || "WORK_RESUME_CONTENT_REJECTED" });\n        } catch (error) {\n          await setWorkSessionCommandAcceptance(key, false);\n          await mutateWorkSession(key, visible.revision, OzonWorkSessionModel.STATES.ERROR, { error: { code: error.code || "WORK_RESUME_FAILED" } });\n          return { ok: false, code: error.code || "WORK_RESUME_FAILED", error: error.message || String(error) };\n        }\n        await diagnostic("WORK_SESSION_RESUMED_WITHOUT_PROMPT", {\n          tab_id: tab,\n          conversation_key: key,\n          binding_id: binding.binding_id,\n          binding_revision: binding.revision,\n          session_revision: visible.revision,\n          external_request_executed: false\n        });\n        return { ok: true, resumed_without_prompt: true, binding, session: visible, state: await publicSettingsState(key) };\n      }\n'''
    w = replace_once(w, resume_anchor, resume_route + resume_anchor, "resume_route")
    w = replace_once(
        w,
        '''        await withBindingWrite(async () => {\n          const sessions = await getWorkSessions();\n          const bindings = await getConversationBindings();\n          delete bindings[key];\n          const current = OzonWorkSessionModel.normalize(sessions[key], key);\n          if (current.state !== OzonWorkSessionModel.STATES.FINISHING || current.revision !== finishing.revision) throw Object.assign(new Error("Work-session изменилась во время Finish."), { code: "WORK_FINISH_STALE_SESSION" });\n          transitionWorkSessionRecord(sessions, key, current.revision, OzonWorkSessionModel.STATES.INACTIVE, { tab_id: null, origin: null, ai_id: null, conversation_id: null, start_intent_id: null, error: null });\n          await storageSet({ [KEYS.CONVERSATION_BINDINGS]: bindings, [KEYS.WORK_SESSIONS]: sessions });\n        });\n        return { ok: true, terminalized_operation: terminalized, state: await publicSettingsState(key) };''',
        '''        await withBindingWrite(async () => {\n          const sessions = await getWorkSessions();\n          const current = OzonWorkSessionModel.normalize(sessions[key], key);\n          if (current.state !== OzonWorkSessionModel.STATES.FINISHING || current.revision !== finishing.revision) throw Object.assign(new Error("Work-session изменилась во время Finish."), { code: "WORK_FINISH_STALE_SESSION" });\n          transitionWorkSessionRecord(sessions, key, current.revision, OzonWorkSessionModel.STATES.INACTIVE, { tab_id: null, origin: null, ai_id: null, conversation_id: null, start_intent_id: null, error: null });\n          await storageSet({ [KEYS.WORK_SESSIONS]: sessions });\n        });\n        await diagnostic("WORK_SESSION_FINISHED_BINDING_PRESERVED", { conversation_key: key, tab_id: tab, external_request_executed: false });\n        return { ok: true, terminalized_operation: terminalized, binding_preserved: true, state: await publicSettingsState(key) };''',
        "finish_preserve_binding"
    )
    w = replace_once(
        w,
        '''  })().then(sendResponse).catch(async (error) => {\n    const code = String(error?.code || (error?.name === "AbortError" ? "REQUEST_TIMEOUT" : "EXTENSION_ERROR"));\n    const text = String(error?.message || error || "Unknown error");\n    await setStatus({ ok: false, code, message: text }).catch(() => null);\n    sendResponse({ ok: false, code, error: text });\n  });''',
        '''  })().then(sendResponse).catch(async (error) => {\n    const code = String(error?.code || (error?.name === "AbortError" ? "REQUEST_TIMEOUT" : "EXTENSION_ERROR"));\n    const text = String(error?.message || error || "Unknown error");\n    await diagnostic("EXTENSION_MESSAGE_FAILED", { message_type: String(message?.type || ""), code, error: text, tab_id: sender?.tab?.id || null }, { level: "error" }).catch(() => null);\n    sendResponse({ ok: false, code, error: text });\n  });''',
        "runtime_error_status_separation"
    )
    worker.write_text(w, encoding="utf-8")

    if sha256(popup.read_bytes()) != A5_POPUP_SHA256:
        raise RuntimeError(f"Patch A.5 popup.js identity mismatch: {sha256(popup.read_bytes())}")
    if sha256(worker.read_bytes()) != A5_SERVICE_WORKER_SHA256:
        raise RuntimeError(f"Patch A.5 service_worker.js identity mismatch: {sha256(worker.read_bytes())}")
    digest = tree_digest(out)
    if digest != A5_TREE_MANIFEST_SHA256:
        raise RuntimeError(f"Patch A.5 tree digest {digest} != {A5_TREE_MANIFEST_SHA256}")

    print("PATCH_A5_A4_BASE_IDENTITY_PASS")
    print("PATCH_A5_PROVIDER_STATUS_SCOPE_PASS")
    print("PATCH_A5_RUNTIME_ERRORS_DIAGNOSTIC_ONLY_PASS")
    print("PATCH_A5_RESUME_WITHOUT_PROMPT_PASS")
    print("PATCH_A5_FINISH_BINDING_PRESERVED_PASS")
    print("PATCH_A5_POPUP_INACTIVE_BOUND_RESUME_PASS")
    print("PATCH_A5_POPUP_SHA256_PASS")
    print("PATCH_A5_SERVICE_WORKER_SHA256_PASS")
    print("PATCH_A5_PRODUCTION_FILE_COUNT_19_PASS")
    print("PATCH_A5_TREE_MANIFEST_SHA256_PASS")
    print(str(out))


if __name__ == "__main__":
    main()
