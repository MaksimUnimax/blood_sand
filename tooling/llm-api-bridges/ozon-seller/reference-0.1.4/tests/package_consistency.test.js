const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const child = require('node:child_process');

const ROOT = path.resolve(__dirname, '../ozon-bridge-v0.1.4-extension');

test('all runtime version surfaces are exactly 0.1.4', () => {
  const manifest = JSON.parse(fs.readFileSync(path.join(ROOT, 'manifest.json'), 'utf8'));
  assert.equal(manifest.version, '0.1.4');
  const files = ['content_script.js','service_worker.js','popup.js','popup.html','shared/ozon_contract.js','shared/runtime_names.js'];
  for (const rel of files) {
    const text = fs.readFileSync(path.join(ROOT, rel), 'utf8');
    assert.equal(text.includes('0.1.3'), false, `${rel} still contains 0.1.3`);
    assert.equal(text.includes('0.1.4'), true, `${rel} does not contain 0.1.4`);
  }
});

test('default autorun prompt documents pre-execution error envelope', () => {
  const text = fs.readFileSync(path.join(ROOT, 'shared/runtime_names.js'), 'utf8');
  assert.match(text, /external_request_executed=false/);
  assert.match(text, /parse\/validation\/watcher/);
});

test('all production JavaScript parses', () => {
  const jsFiles = [];
  function walk(dir) {
    for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, ent.name);
      if (ent.isDirectory()) walk(full);
      else if (ent.name.endsWith('.js')) jsFiles.push(full);
    }
  }
  walk(ROOT);
  for (const file of jsFiles) child.execFileSync(process.execPath, ['--check', file], { stdio: 'pipe' });
  assert.ok(jsFiles.length >= 10);
});

test('manifest still grants only ChatGPT and fixed Ozon Seller host', () => {
  const manifest = JSON.parse(fs.readFileSync(path.join(ROOT, 'manifest.json'), 'utf8'));
  assert.deepEqual(manifest.host_permissions, [
    'https://chatgpt.com/*',
    'https://chat.openai.com/*',
    'https://api-seller.ozon.ru/*'
  ]);
  assert.equal(manifest.permissions.includes('webRequest'), false);
});
