import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';

const DIST = process.argv[2] ? resolve(process.argv[2]) : resolve('tooling/llm-api-bridges/ozon-seller/dist-step7-candidate');
const adapters = readFileSync(join(DIST,'shared/ai_adapters.js'),'utf8');
const port = readFileSync(join(DIST,'attachment_delivery_port_content.js'),'utf8');

assert.match(adapters,/const aliceInputBlocked = button\.classList\?\.contains\?\.\("StandaloneOknyx_error"\) === true;/,'Alice blocked modifier guard missing');
assert.match(adapters,/controlDisabled\(button\) \|\| aliceInputBlocked\) \? "send_disabled" : "send_active"/,'blocked state must reuse send_disabled closed set');
assert.doesNotMatch(adapters,/kind:\s*"send_blocked"/,'new control kind is forbidden; reuse send_disabled');

const sendFnStart = port.indexOf('async function sendReadyAttachment');
assert.ok(sendFnStart >= 0,'sendReadyAttachment missing');
const sendFnEnd = port.indexOf('\n  async function processRecovery',sendFnStart);
assert.ok(sendFnEnd > sendFnStart,'sendReadyAttachment boundary missing');
const sendFn = port.slice(sendFnStart,sendFnEnd);
const waitIndex = sendFn.indexOf('BB2ComposerSend.waitForValidatedTarget');
const commitIndex = sendFn.indexOf('OZ_ATTACHMENT_SEND_COMMIT');
const clickIndex = sendFn.indexOf('BB2ComposerSend.clickSynchronously');
assert.ok(waitIndex >= 0 && commitIndex > waitIndex && clickIndex > commitIndex,'target validation must precede SEND_COMMIT which must precede click');
assert.equal((sendFn.match(/OZ_ATTACHMENT_SEND_COMMIT/g)||[]).length,1,'exactly one Send commit call site expected');
assert.equal((sendFn.match(/BB2ComposerSend\.clickSynchronously/g)||[]).length,1,'exactly one click call site expected');

assert.match(adapters,/const CHATGPT = Object\.freeze/,'ChatGPT adapter authority missing');
assert.match(adapters,/attachmentSurface\(\) \{ const input = chatgptFileInput\(\); return input \? \{ kind: "file_input_v1"/,'ChatGPT file-input path must remain unchanged');

console.log('ALICE_BLOCKED_REUSES_SEND_DISABLED_CLOSED_SET_PASS');
console.log('ALICE_SEND_TARGET_BEFORE_COMMIT_BEFORE_CLICK_PASS');
console.log('ALICE_EXACTLY_ONE_SEND_COMMIT_AND_CLICK_CALLSITE_PASS');
console.log('CHATGPT_SEND_AND_ATTACHMENT_ISOLATION_PASS');
console.log('ALICE_AUTO_SEND_POSTFIX_SOURCE_GATE_PASS');
