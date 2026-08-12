const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '../ozon-bridge-v0.1.4-extension');
vm.runInThisContext(fs.readFileSync(path.join(ROOT, 'shared/ozon_contract.js'), 'utf8'), { filename: path.join(ROOT, 'shared/ozon_contract.js') });

function parseReport(text) {
  assert.ok(text.startsWith('OZON_RESULT_V1\n'));
  return JSON.parse(text.slice('OZON_RESULT_V1\n'.length));
}

test('contract version and valid command fingerprint remain stable', () => {
  assert.equal(OzonContract.VERSION, '0.1.4');
  const command = OzonContract.parseCommand('OZON_API_V1 {"operation":"roles","params":{}}');
  assert.equal(command.operation, 'roles');
  assert.match(OzonContract.commandFingerprint(command), /^[0-9a-f]{8}$/);
});

test('textFingerprint handles invalid JSON and NBSP deterministically without exposing text', () => {
  const bad = 'OZON_API_V1\u00a0{"operation":"roles","params":{"x":"bad\ncontrol"}}';
  const normalized = bad.replace(/\u00a0/g, ' ');
  assert.equal(OzonContract.textFingerprint(bad), OzonContract.textFingerprint(normalized));
  assert.match(OzonContract.textFingerprint(bad), /^[0-9a-f]{8}$/);
  assert.throws(() => OzonContract.parseCommand(bad), (err) => err.code === 'INVALID_JSON');
});

test('pre-execution report has canonical result envelope and explicitly proves zero external requests', () => {
  const err = Object.assign(new Error('Некорректный JSON: Bad control character in string literal in JSON at position 27'), { code: 'INVALID_JSON' });
  const report = OzonContract.formatPreExecutionErrorReport({
    requestId: 'preexec-1',
    error: err,
    stage: 'command_parse',
    commandFingerprint: 'deadbeef'
  });
  const envelope = parseReport(report);
  assert.equal(envelope.version, '0.1.4');
  assert.equal(envelope.request_id, 'preexec-1');
  assert.equal(envelope.operation, null);
  assert.deepEqual(envelope.command, { accepted: false, fingerprint: 'deadbeef' });
  assert.equal(envelope.request_meta.provider, 'ozon');
  assert.equal(envelope.request_meta.stage, 'command_parse');
  assert.equal(envelope.request_meta.external_request_executed, false);
  assert.equal(envelope.http_status, 0);
  assert.equal(envelope.elapsed_ms, 0);
  assert.equal(envelope.pagination, null);
  assert.equal(envelope.rate_limit, null);
  assert.equal(envelope.result.error.code, 'INVALID_JSON');
  assert.equal(envelope.result.error.automatic_retry, false);
  assert.equal(envelope.result.error.stage, 'command_parse');
  assert.equal(envelope.result.error.external_request_executed, false);
});

test('pre-execution report redacts secrets and never includes malformed command text', () => {
  const rawCommand = 'OZON_API_V1 {"operation":"roles","params":{"Api-Key":"supersecretvalue"';
  const err = Object.assign(new Error('Api-Key: topsecret Authorization=BearerSecret012345678901234567890123456789 user@example.com +7 999 123-45-67 https://evil.invalid/path'), { code: 'INVALID_JSON' });
  const report = OzonContract.formatPreExecutionErrorReport({
    requestId: 'preexec-2',
    error: err,
    stage: 'command_parse',
    commandFingerprint: OzonContract.textFingerprint(rawCommand)
  });
  assert.equal(report.includes(rawCommand), false);
  assert.equal(report.includes('topsecret'), false);
  assert.equal(report.includes('user@example.com'), false);
  assert.equal(report.includes('+7 999 123-45-67'), false);
  assert.equal(report.includes('https://evil.invalid/path'), false);
  assert.match(report, /\[REDACTED\]/);
  assert.match(report, /\[REDACTED_EMAIL\]/);
  assert.match(report, /\[REDACTED_PHONE\]/);
  assert.match(report, /\[REDACTED_URL\]/);
});

test('invalid stage and fingerprint fail closed to safe canonical values', () => {
  const err = Object.assign(new Error('x'), { code: 'BAD CODE WITH SPACE' });
  const env = parseReport(OzonContract.formatPreExecutionErrorReport({
    requestId: 'x', error: err, stage: 'spaces are bad', commandFingerprint: 'not-a-hash'
  }));
  assert.equal(env.request_meta.stage, 'pre_execution');
  assert.equal(env.command.fingerprint, '00000000');
  assert.equal(env.result.error.code, 'OZON_BRIDGE_ERROR');
});

test('Unicode parse error message survives safely', () => {
  const err = Object.assign(new Error('Ошибка разбора: неверный символ — проверка Юникода'), { code: 'INVALID_JSON' });
  const env = parseReport(OzonContract.formatPreExecutionErrorReport({ requestId: 'u', error: err, stage: 'command_parse', commandFingerprint: '1234abcd' }));
  assert.match(env.result.error.message, /проверка Юникода/);
});
