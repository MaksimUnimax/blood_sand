#!/usr/bin/env python3
from __future__ import annotations

import runpy
from pathlib import Path

HERE = Path(__file__).resolve().parent
V2 = HERE / "materialize_bootstrap_prompt_patch_v2.py"
runpy.run_path(str(V2), run_name="__main__")

ROOT = HERE.parents[1]
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


# Save All must not silently create a per-conversation override merely because
# the inherited effective text is visible in the current-dialog textarea.
worker_path = DIST / "service_worker.js"
worker = read(worker_path)
old_worker_save = '''        if (typeof message.global_auto_start_prompt_text === "string") await saveGlobalAutoStartPrompt(message.global_auto_start_prompt_text);\n        await saveReportPrefix(key, message);\n        if (typeof message.auto_start_prompt_text === "string") await saveAutoStartPrompt(key, message.auto_start_prompt_text);'''
new_worker_save = '''        if (typeof message.global_auto_start_prompt_text === "string") await saveGlobalAutoStartPrompt(message.global_auto_start_prompt_text);\n        await saveReportPrefix(key, message);\n        if (message.auto_start_prompt_override_enabled === true) {\n          if (typeof message.auto_start_prompt_text !== "string") throw Object.assign(new Error("Для индивидуального start prompt нужен текст."), { code: "AUTO_START_PROMPT_TEXT_REQUIRED" });\n          await saveAutoStartPrompt(key, message.auto_start_prompt_text);\n        } else if (message.auto_start_prompt_override_enabled === false) {\n          await resetAutoStartPrompt(key);\n        } else if (typeof message.auto_start_prompt_text === "string") {\n          // Backward-compatible message contract for an older popup talking to this worker.\n          await saveAutoStartPrompt(key, message.auto_start_prompt_text);\n        }'''
worker = replace_once(worker, old_worker_save, new_worker_save, "explicit per-dialog override save semantics")
write(worker_path, worker)

popup_path = DIST / "popup.js"
popup = read(popup_path)
old_controls = '''function setConversationControlsEnabled(enabled) {\n  for (const id of [\n    "startAuto", "pauseAuto", "resumeAuto", "finishAuto",\n    "autoStartPromptText", "resetAutoStartPrompt", "reportPrefixEnabled",\n    "reportPrefixText", "reportPrefixInterval"\n  ]) {\n    const element = $(id);\n    if (element) element.disabled = !enabled;\n  }\n}'''
new_controls = '''function setConversationControlsEnabled(enabled) {\n  for (const id of [\n    "startAuto", "pauseAuto", "resumeAuto", "finishAuto",\n    "autoStartPromptOverrideEnabled", "resetAutoStartPrompt", "reportPrefixEnabled",\n    "reportPrefixText", "reportPrefixInterval"\n  ]) {\n    const element = $(id);\n    if (element) element.disabled = !enabled;\n  }\n  const localPrompt = $("autoStartPromptText");\n  if (localPrompt) localPrompt.disabled = !enabled || $("autoStartPromptOverrideEnabled")?.checked !== true;\n}'''
popup = replace_once(popup, old_controls, new_controls, "conversation control gate with explicit override")

old_render = '''  const startPrompt = state.auto_start_prompt || {};\n  $("autoStartPromptText").value = startPrompt.text || globalStartPrompt.text || "";\n  if ($("autoStartPromptMeta")) $("autoStartPromptMeta").textContent = startPrompt.is_override === true\n    ? "Для текущего AI-диалога сохранён индивидуальный override. Изменение общего prompt его не перезапишет."\n    : "Текущий AI-диалог наследует общий стартовый prompt. Кнопка ниже удаляет индивидуальный override, если он появится.";'''
new_render = '''  const startPrompt = state.auto_start_prompt || {};\n  const localPromptOverride = startPrompt.is_override === true;\n  if ($("autoStartPromptOverrideEnabled")) $("autoStartPromptOverrideEnabled").checked = localPromptOverride;\n  $("autoStartPromptText").value = startPrompt.text || globalStartPrompt.text || "";\n  if ($("autoStartPromptMeta")) $("autoStartPromptMeta").textContent = localPromptOverride\n    ? "Для текущего AI-диалога сохранён индивидуальный override. Изменение общего prompt его не перезапишет."\n    : "Текущий AI-диалог наследует общий стартовый prompt. Обычное «Сохранить всё» не создаёт override, пока переключатель выключен.";'''
popup = replace_once(popup, old_render, new_render, "render explicit local override state")

old_payload = '''      report_prefix_interval: Number($("reportPrefixInterval").value || 1),\n      auto_start_prompt_text: $("autoStartPromptText").value,\n      conversation_key: context.conversation_key'''
new_payload = '''      report_prefix_interval: Number($("reportPrefixInterval").value || 1),\n      auto_start_prompt_override_enabled: $("autoStartPromptOverrideEnabled")?.checked === true,\n      auto_start_prompt_text: $("autoStartPromptText").value,\n      conversation_key: context.conversation_key'''
popup = replace_once(popup, old_payload, new_payload, "popup explicit local override save flag")

handler_marker = '$("resetGlobalAutoStartPrompt").addEventListener("click", () => busy($("resetGlobalAutoStartPrompt"), async () => {'
override_handler = '''$("autoStartPromptOverrideEnabled")?.addEventListener("change", () => {\n  const enabled = $("autoStartPromptOverrideEnabled").checked === true;\n  const pageAvailable = lastState?.page_context_available !== false;\n  $("autoStartPromptText").disabled = !pageAvailable || !enabled;\n  if (enabled && lastState?.auto_start_prompt?.is_override !== true) {\n    $("autoStartPromptText").value = lastState?.global_auto_start_prompt?.text || lastState?.auto_start_prompt?.text || "";\n  }\n});\n\n'''
popup = replace_once(popup, handler_marker, override_handler + handler_marker, "local override editor toggle handler")
write(popup_path, popup)

html_path = DIST / "popup.html"
html = read(html_path)
old_local_section = '<section><h2>Стартовый prompt текущего диалога</h2><p class="warning">Если для текущего диалога нет индивидуального override, он наследует общий prompt выше. Этот же effective prompt используется и кнопкой «Начать работу», и Autorun.</p><label for="autoStartPromptText">Индивидуальный текст текущего диалога</label><textarea id="autoStartPromptText" rows="14" spellcheck="true"></textarea><div class="buttons single-row"><button id="resetAutoStartPrompt" class="secondary wide">Использовать общий prompt</button></div><p id="autoStartPromptMeta" class="meta">Индивидуальный override доступен только после появления подтверждённого conversation ID.</p></section>'
new_local_section = '<section><h2>Стартовый prompt текущего диалога</h2><p class="warning">По умолчанию этот диалог наследует общий prompt выше. Индивидуальный override создаётся только явным включением переключателя и не возникает от обычного «Сохранить всё».</p><label class="check" for="autoStartPromptOverrideEnabled"><input id="autoStartPromptOverrideEnabled" type="checkbox"> Использовать индивидуальный prompt только для этого диалога</label><label for="autoStartPromptText">Индивидуальный текст текущего диалога</label><textarea id="autoStartPromptText" rows="14" spellcheck="true"></textarea><div class="buttons single-row"><button id="resetAutoStartPrompt" class="secondary wide">Использовать общий prompt</button></div><p id="autoStartPromptMeta" class="meta">Индивидуальный override доступен только после появления подтверждённого conversation ID.</p></section>'
html = replace_once(html, old_local_section, new_local_section, "explicit local override UI")
write(html_path, html)

checks = [
    ('auto_start_prompt_override_enabled: $("autoStartPromptOverrideEnabled")?.checked === true' in popup, "popup override flag"),
    ('id="autoStartPromptOverrideEnabled"' in html, "override checkbox"),
    ('message.auto_start_prompt_override_enabled === true' in worker, "worker override enable branch"),
    ('message.auto_start_prompt_override_enabled === false' in worker, "worker override disable branch"),
    ('await resetAutoStartPrompt(key);' in worker, "worker inheritance restore branch"),
    ('"autoStartPromptOverrideEnabled", "resetAutoStartPrompt"' in popup, "override identity gate"),
]
failed = [label for ok, label in checks if not ok]
if failed:
    raise RuntimeError("v3 post-patch invariants failed: " + ", ".join(failed))
print("BOOTSTRAP_PROMPT_MATERIALIZATION_V3_EXPLICIT_OVERRIDE_PASS")
