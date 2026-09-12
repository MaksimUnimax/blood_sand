import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";

const root = process.argv[2] || path.resolve(import.meta.dirname, "../../dist-step7-candidate");
const content = readFileSync(path.join(root, "content_script.js"), "utf8");
const attachment = readFileSync(path.join(root, "attachment_delivery_port_content.js"), "utf8");
assert(content.includes('close.setAttribute("aria-label", "Закрыть")'), "main page toasts must remain closable");
assert(content.includes('close.addEventListener("click"'), "main page toast close handler missing");
assert(attachment.includes('function createStatusPlate()'), "attachment status must use one central constructor");
assert(attachment.includes('data-ozon-attachment-status-close'), "attachment status close control missing");
assert(attachment.includes('close.setAttribute("aria-label", "Закрыть")'), "attachment close accessibility label missing");
assert(attachment.includes('pointerEvents: "auto"'), "attachment close must be clickable");
assert(attachment.includes('root.remove()'), "attachment close must remove only the visual plate");
assert(!attachment.includes('pointerEvents: "none"'), "attachment status must not disable its close control");
console.log("STATUS_PLATE_CLOSE_GATE_PASS");
