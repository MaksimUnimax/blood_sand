import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import cryptoMod from 'node:crypto';

const root = process.argv[2];
if (!root) throw new Error('extension root required');
class FakeElement {
  constructor(tag = 'div') { this.tagName = tag.toUpperCase(); this.id = ''; this.textContent = ''; this.style = {}; this.isConnected = false; }
  remove() { this.isConnected = false; if (this.id) elements.delete(this.id); }
  closest() { return null; }
}
class HTMLElement extends FakeElement {}
class Element extends HTMLElement {}
const elements = new Map();
const runtimeListeners = [];
const document = {
  querySelector() { return null; },
  getElementById(id) { return elements.get(id) || null; },
  createElement(tag) { return new HTMLElement(tag); },
  documentElement: { appendChild(el) { el.isConnected = true; if (el.id) elements.set(el.id, el); } }
};
const chrome = { runtime: { connect() { throw new Error('synthetic unavailable port'); }, onMessage: { addListener(fn) { runtimeListeners.push(fn); } }, lastError: null } };
const active = { id: 'chatgpt', composerContext() { return null; }, userMessages() { return []; }, assistantMessages() { return []; }, messageId() { return null; } };
const context = vm.createContext({ console, chrome, document, HTMLElement, Element, location: { origin: 'https://chatgpt.com', pathname: '/c/12345678-1234-1234-1234-123456789abc' }, crypto: cryptoMod.webcrypto, TextEncoder, TextDecoder, URL, setTimeout, clearTimeout, setInterval, clearInterval, queueMicrotask, Math, Promise });
context.globalThis = context;
context.BB2ConversationIdentity = { resolveWithEvidence() { return { status: 'confirmed', origin: 'https://chatgpt.com', conversation_id: '12345678-1234-1234-1234-123456789abc', ai_id: 'chatgpt' }; }, resolve() { return this.resolveWithEvidence(); } };
context.OzonAIAdapters = { adapterForLocation() { return active; } };
context.OzonAIDeliveryCapabilities = { profile() { return { attachments_supported: true, attachment_strategy: 'file_input_v1' }; }, fileDispatchDecision() { return { dispatch_allowed: true }; } };
context.OzonWebFileAttachment = { base64ToBytes() { return new Uint8Array(); } };
context.BB2ComposerSend = {};
for (const rel of ['attachment_delivery_port_content.js','attachment_delivery_wake_content.js']) vm.runInContext(fs.readFileSync(path.join(root, rel), 'utf8'), context, { filename: rel });
await new Promise((resolve) => setTimeout(resolve, 500));
const plaque = elements.get('ozon-attachment-delivery-status') || null;
context.__OZON_ATTACHMENT_DELIVERY_PORT_RUNTIME__?.dispose?.();
if (!plaque || !String(plaque.textContent).includes('ATTACHMENT_PORT_UNAVAILABLE')) throw new Error(`expected false idle plaque, got ${plaque?.textContent || 'none'}`);
console.error('PREFX_GLOBAL_IDLE_PLAQUE_REPRODUCED=YES');
console.error('FIRST_DIVERGENCE=IDLE_RECOVERY_PROBE_ESCALATED_TO_USER_VISIBLE_DELIVERY_ERROR');
console.error('provider_calls_during_test=0');
process.exit(1);
