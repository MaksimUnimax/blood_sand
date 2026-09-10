#!/usr/bin/env python3
from __future__ import annotations

from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
DIST = ROOT / "dist-step7-candidate"


def read(path: Path) -> str:
    return path.read_text(encoding="utf-8")


def write(path: Path, text: str) -> None:
    path.write_text(text, encoding="utf-8", newline="\n")


def replace_once(text: str, old: str, new: str, label: str) -> str:
    count = text.count(old)
    if count != 1:
        raise RuntimeError(f"{label}: expected exactly one match, got {count}")
    return text.replace(old, new, 1)


def patch_runtime_names() -> None:
    path = DIST / "shared/runtime_names.js"
    text = read(path)
    old = '    AUTO_START_PROMPTS: "ozmb_auto_start_prompts",\n'
    new = old + '    GLOBAL_AUTO_START_PROMPT: "ozmb_global_auto_start_prompt_v1",\n'
    text = replace_once(text, old, new, "runtime global start-prompt storage key")
    write(path, text)


def patch_service_worker() -> None:
    path = DIST / "service_worker.js"
    text = read(path)

    start = text.index("async function getAutoStartPrompt(")
    end = text.index("function publicRun(run) {", start)
    replacement = r'''function normalizeGlobalAutoStartPromptRecord(raw) {
  const current = raw && typeof raw === "object" && !Array.isArray(raw) ? raw : null;
  const now = new Date().toISOString();
  if (current?.text && String(current.text).trim()) {
    const normalizedText = normalizeAutoStartPromptText(current.text);
    if (current.is_default === true && normalizedText !== DEFAULT_AUTO_START_TEXT) {
      return { record: { text: DEFAULT_AUTO_START_TEXT, is_default: true, updated_at: now }, changed: true };
    }
    return {
      record: { text: normalizedText, is_default: current.is_default === true, updated_at: current.updated_at || null },
      changed: normalizedText !== current.text
    };
  }
  return { record: { text: DEFAULT_AUTO_START_TEXT, is_default: true, updated_at: now }, changed: true };
}

async function getGlobalAutoStartPrompt({ ensureStored = true } = {}) {
  return withStartPromptWrite(async () => {
    const data = await storageGet(KEYS.GLOBAL_AUTO_START_PROMPT);
    const normalized = normalizeGlobalAutoStartPromptRecord(data[KEYS.GLOBAL_AUTO_START_PROMPT]);
    if (ensureStored && normalized.changed) await storageSet({ [KEYS.GLOBAL_AUTO_START_PROMPT]: normalized.record });
    return normalized.record;
  });
}

async function saveGlobalAutoStartPrompt(text) {
  const normalizedText = normalizeAutoStartPromptText(text);
  return withStartPromptWrite(async () => {
    const record = {
      text: normalizedText,
      is_default: normalizedText === DEFAULT_AUTO_START_TEXT,
      updated_at: new Date().toISOString()
    };
    await storageSet({ [KEYS.GLOBAL_AUTO_START_PROMPT]: record });
    return record;
  });
}

async function resetGlobalAutoStartPrompt() {
  return saveGlobalAutoStartPrompt(DEFAULT_AUTO_START_TEXT);
}

async function getAutoStartPrompt(conversationKey, { ensureStored = true } = {}) {
  const key = normalizeConversationKey(conversationKey);
  return withStartPromptWrite(async () => {
    const data = await storageGet([KEYS.AUTO_START_PROMPTS, KEYS.GLOBAL_AUTO_START_PROMPT]);
    const prompts = { ...(data[KEYS.AUTO_START_PROMPTS] || {}) };
    const current = prompts[key] || null;
    const globalResolved = normalizeGlobalAutoStartPromptRecord(data[KEYS.GLOBAL_AUTO_START_PROMPT]);
    const updates = {};

    if (globalResolved.changed && ensureStored) updates[KEYS.GLOBAL_AUTO_START_PROMPT] = globalResolved.record;

    if (current?.text && String(current.text).trim() && current.is_default !== true) {
      if (Object.keys(updates).length) await storageSet(updates);
      return {
        text: normalizeAutoStartPromptText(current.text),
        is_default: false,
        is_override: true,
        source: "conversation_override",
        updated_at: current.updated_at || null
      };
    }

    if (current && ensureStored) {
      delete prompts[key];
      updates[KEYS.AUTO_START_PROMPTS] = prompts;
    }
    if (Object.keys(updates).length) await storageSet(updates);
    return { ...globalResolved.record, is_override: false, source: "global" };
  });
}

async function saveAutoStartPrompt(conversationKey, text) {
  const key = normalizeConversationKey(conversationKey);
  const normalizedText = normalizeAutoStartPromptText(text);
  return withStartPromptWrite(async () => {
    const data = await storageGet(KEYS.AUTO_START_PROMPTS);
    const prompts = { ...(data[KEYS.AUTO_START_PROMPTS] || {}) };
    prompts[key] = {
      text: normalizedText,
      is_default: false,
      updated_at: new Date().toISOString()
    };
    await storageSet({ [KEYS.AUTO_START_PROMPTS]: prompts });
    return { ...prompts[key], is_override: true, source: "conversation_override" };
  });
}

async function resetAutoStartPrompt(conversationKey) {
  const key = normalizeConversationKey(conversationKey);
  await withStartPromptWrite(async () => {
    const data = await storageGet(KEYS.AUTO_START_PROMPTS);
    const prompts = { ...(data[KEYS.AUTO_START_PROMPTS] || {}) };
    if (Object.prototype.hasOwnProperty.call(prompts, key)) {
      delete prompts[key];
      await storageSet({ [KEYS.AUTO_START_PROMPTS]: prompts });
    }
  });
  return getAutoStartPrompt(key);
}

'''
    text = text[:start] + replacement + text[end:]

    old_common = '''  const [sendData, microphoneData, copyProfiles] = await Promise.all([\n    storageGet(KEYS.SEND_BUTTON_PROFILE),\n    storageGet(KEYS.MICROPHONE_BUTTON_PROFILE),\n    getCopyButtonProfiles()\n  ]);'''
    new_common = '''  const [sendData, microphoneData, copyProfiles, globalStartPrompt] = await Promise.all([\n    storageGet(KEYS.SEND_BUTTON_PROFILE),\n    storageGet(KEYS.MICROPHONE_BUTTON_PROFILE),\n    getCopyButtonProfiles(),\n    getGlobalAutoStartPrompt()\n  ]);'''
    text = replace_once(text, old_common, new_common, "common public settings global prompt read")

    old_public = '''    personal_data_enabled: settings.personalDataEnabled === true,\n    seller_api_metadata: OzonEntitlements.summary(settings.sellerApiMetadata),'''
    new_public = '''    personal_data_enabled: settings.personalDataEnabled === true,\n    global_auto_start_prompt: {\n      text: String(globalStartPrompt?.text || DEFAULT_AUTO_START_TEXT),\n      is_default: globalStartPrompt?.is_default === true,\n      updated_at: globalStartPrompt?.updated_at || null\n    },\n    seller_api_metadata: OzonEntitlements.summary(settings.sellerApiMetadata),'''
    text = replace_once(text, old_public, new_public, "public global start-prompt state")

    old_effective = '''    auto_start_prompt: {\n      text: String(startPrompt?.text || DEFAULT_AUTO_START_TEXT),\n      is_default: startPrompt?.is_default === true,\n      updated_at: startPrompt?.updated_at || null\n    },'''
    new_effective = '''    auto_start_prompt: {\n      text: String(startPrompt?.text || DEFAULT_AUTO_START_TEXT),\n      is_default: startPrompt?.is_default === true,\n      is_override: startPrompt?.is_override === true,\n      source: String(startPrompt?.source || "global"),\n      updated_at: startPrompt?.updated_at || null\n    },'''
    text = replace_once(text, old_effective, new_effective, "effective per-conversation start-prompt state")

    text = replace_once(
        text,
        '    auto_start_prompt: { text: DEFAULT_AUTO_START_TEXT, is_default: true, updated_at: null },',
        '    auto_start_prompt: { ...common.global_auto_start_prompt, is_override: false, source: "global" },',
        "new-chat effective prompt state"
    )

    global_case_start = text.index('      case "OZ_SAVE_GLOBAL_SETTINGS": {')
    global_case_end = text.index('      case "OZ_SAVE_SETTINGS": {', global_case_start)
    global_case = text[global_case_start:global_case_end]
    global_case = replace_once(
        global_case,
        '        await storageSet(values);\n        return { ok: true, state: await publicGlobalSettingsState(message.page_context_error || null) };',
        '        await storageSet(values);\n        if (typeof message.global_auto_start_prompt_text === "string") await saveGlobalAutoStartPrompt(message.global_auto_start_prompt_text);\n        return { ok: true, state: await publicGlobalSettingsState(message.page_context_error || null) };',
        "global settings prompt save"
    )
    text = text[:global_case_start] + global_case + text[global_case_end:]

    settings_case_start = text.index('      case "OZ_SAVE_SETTINGS": {')
    settings_case_end = text.index('      case "OZ_RESET_AUTO_START_PROMPT": {', settings_case_start)
    settings_case = text[settings_case_start:settings_case_end]
    settings_case = replace_once(
        settings_case,
        '        await storageSet(values);\n        await saveReportPrefix(key, message);',
        '        await storageSet(values);\n        if (typeof message.global_auto_start_prompt_text === "string") await saveGlobalAutoStartPrompt(message.global_auto_start_prompt_text);\n        await saveReportPrefix(key, message);',
        "conversation settings global prompt save"
    )
    text = text[:settings_case_start] + settings_case + text[settings_case_end:]

    reset_marker = '      case "OZ_RESET_AUTO_START_PROMPT": {'
    global_reset_case = '''      case "OZ_RESET_GLOBAL_AUTO_START_PROMPT": {\n        await resetGlobalAutoStartPrompt();\n        if (typeof message.conversation_key === "string" && message.conversation_key.trim()) {\n          return { ok: true, state: await publicSettingsState(message.conversation_key) };\n        }\n        return { ok: true, state: await publicGlobalSettingsState(message.page_context_error || null) };\n      }\n'''
    text = replace_once(text, reset_marker, global_reset_case + reset_marker, "global reset message route")

    old_new_chat = '          const sent = await tabMessage(tab, { type: "OZ_WORK_SEND_INITIAL_PROMPT", intent_id: pending.transaction.intent_id, revision: pending.transaction.revision, prompt_text: DEFAULT_AUTO_START_TEXT });'
    new_new_chat = '          const bootstrapPrompt = await getGlobalAutoStartPrompt();\n          const sent = await tabMessage(tab, { type: "OZ_WORK_SEND_INITIAL_PROMPT", intent_id: pending.transaction.intent_id, revision: pending.transaction.revision, prompt_text: String(bootstrapPrompt?.text || DEFAULT_AUTO_START_TEXT) });'
    text = replace_once(text, old_new_chat, new_new_chat, "new-chat Start uses editable global prompt")

    write(path, text)


def patch_popup_js() -> None:
    path = DIST / "popup.js"
    text = read(path)

    old_render = '''  const startPrompt = state.auto_start_prompt || {};\n  $("autoStartPromptText").value = startPrompt.text || "";'''
    new_render = '''  const globalStartPrompt = state.global_auto_start_prompt || {};\n  $("globalAutoStartPromptText").value = globalStartPrompt.text || "";\n  if ($("globalAutoStartPromptMeta")) $("globalAutoStartPromptMeta").textContent = globalStartPrompt.is_default === true\n    ? "Общий prompt сейчас совпадает со встроенным default. Он доступен и сохраняется даже до появления conversation ID."\n    : "Используется пользовательский общий prompt для новых диалогов и для диалогов без индивидуального override.";\n\n  const startPrompt = state.auto_start_prompt || {};\n  $("autoStartPromptText").value = startPrompt.text || globalStartPrompt.text || "";\n  if ($("autoStartPromptMeta")) $("autoStartPromptMeta").textContent = startPrompt.is_override === true\n    ? "Для текущего AI-диалога сохранён индивидуальный override. Изменение общего prompt его не перезапишет."\n    : "Текущий AI-диалог наследует общий стартовый prompt. Кнопка ниже удаляет индивидуальный override, если он появится.";'''
    text = replace_once(text, old_render, new_render, "popup render global/effective prompt")

    text = replace_once(
        text,
        '    auto_send: $("autoSend").checked,\n    personal_data_enabled: $("personalDataEnabled")?.checked === true\n',
        '    auto_send: $("autoSend").checked,\n    personal_data_enabled: $("personalDataEnabled")?.checked === true,\n    global_auto_start_prompt_text: $("globalAutoStartPromptText").value\n',
        "popup save global prompt regardless of identity"
    )

    reset_marker = '$("resetAutoStartPrompt").addEventListener("click", () => busy($("resetAutoStartPrompt"), async () => {'
    global_handler = '''$("resetGlobalAutoStartPrompt").addEventListener("click", () => busy($("resetGlobalAutoStartPrompt"), async () => {\n  const context = await resolvePopupContext({ required: false });\n  const response = await send("OZ_RESET_GLOBAL_AUTO_START_PROMPT", {\n    conversation_key: context.available ? context.conversation_key : null,\n    page_context_error: context.error || null\n  });\n  if (!response.ok) return status(response.error || "Не удалось вернуть общий стартовый prompt по умолчанию.", "error");\n  renderState(response.state);\n  status("Общий стартовый prompt возвращён к встроенному default.", "ok");\n}));\n\n'''
    text = replace_once(text, reset_marker, global_handler + reset_marker, "popup global reset handler")

    text = replace_once(
        text,
        '    status("Стартовый prompt autorun возвращён к встроенному безопасному варианту.", "ok");',
        '    status("Индивидуальный prompt удалён: текущий диалог снова использует общий стартовый prompt.", "ok");',
        "current prompt reset semantics"
    )
    write(path, text)


def patch_popup_html() -> None:
    path = DIST / "popup.html"
    text = read(path)
    old = '<section><h2>Стартовый prompt Autorun</h2><p class="warning">Этот текст отправляется один раз при нажатии «▶ Авторежим».</p><label for="autoStartPromptText">Текст стартового prompt</label><textarea id="autoStartPromptText" rows="14" spellcheck="true"></textarea><div class="buttons single-row"><button id="resetAutoStartPrompt" class="secondary wide">Вернуть стартовый prompt по умолчанию</button></div><p class="meta">Хранится отдельно для текущего AI-диалога.</p></section>'
    new = '<section><h2>Общий стартовый prompt</h2><p class="warning">Этот шаблон доступен до появления conversation ID и используется кнопкой «Начать работу» в новом ChatGPT/Alice-чате. Диалоги с индивидуальным override не перезаписываются.</p><label for="globalAutoStartPromptText">Общий текст для новых диалогов</label><textarea id="globalAutoStartPromptText" rows="14" spellcheck="true"></textarea><div class="buttons single-row"><button id="resetGlobalAutoStartPrompt" class="secondary wide">Вернуть общий prompt по умолчанию</button></div><p id="globalAutoStartPromptMeta" class="meta">Хранится глобально в chrome.storage.local и не требует conversation ID.</p></section><section><h2>Стартовый prompt текущего диалога</h2><p class="warning">Если для текущего диалога нет индивидуального override, он наследует общий prompt выше. Этот же effective prompt используется и кнопкой «Начать работу», и Autorun.</p><label for="autoStartPromptText">Индивидуальный текст текущего диалога</label><textarea id="autoStartPromptText" rows="14" spellcheck="true"></textarea><div class="buttons single-row"><button id="resetAutoStartPrompt" class="secondary wide">Использовать общий prompt</button></div><p id="autoStartPromptMeta" class="meta">Индивидуальный override доступен только после появления подтверждённого conversation ID.</p></section>'
    text = replace_once(text, old, new, "popup start-prompt sections")
    write(path, text)


def main() -> None:
    patch_runtime_names()
    patch_service_worker()
    patch_popup_js()
    patch_popup_html()

    worker = read(DIST / "service_worker.js")
    popup = read(DIST / "popup.js")
    html = read(DIST / "popup.html")
    runtime = read(DIST / "shared/runtime_names.js")
    checks = [
        ('GLOBAL_AUTO_START_PROMPT: "ozmb_global_auto_start_prompt_v1"' in runtime, "storage key"),
        ("async function getGlobalAutoStartPrompt" in worker, "global getter"),
        ("async function saveGlobalAutoStartPrompt" in worker, "global saver"),
        ("async function resetGlobalAutoStartPrompt" in worker, "global reset"),
        ('source: "conversation_override"' in worker, "conversation override"),
        ('source: "global"' in worker, "global inheritance"),
        ('const bootstrapPrompt = await getGlobalAutoStartPrompt();' in worker, "new chat global read"),
        ('prompt_text: DEFAULT_AUTO_START_TEXT' not in worker, "hard-coded new-chat send removed"),
        ('global_auto_start_prompt_text: $("globalAutoStartPromptText").value' in popup, "popup global save"),
        ('id="globalAutoStartPromptText"' in html, "global textarea"),
        ('id="resetGlobalAutoStartPrompt"' in html, "global reset button"),
    ]
    failed = [label for ok, label in checks if not ok]
    if failed:
        raise RuntimeError("post-patch invariants failed: " + ", ".join(failed))
    print("BOOTSTRAP_PROMPT_MATERIALIZATION_V2_PASS")


if __name__ == "__main__":
    main()
