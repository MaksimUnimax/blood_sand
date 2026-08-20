import { createHash } from 'node:crypto';
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

const here = path.dirname(fileURLToPath(import.meta.url));
const candidateDir = path.resolve(process.argv[2] || '');
if (!candidateDir) {
  console.error('usage: node RUN_TARGETED_COMPOSER_WAIT_REGRESSION.mjs <candidate-production-dir>');
  process.exit(2);
}

const parts = [
  ['targeted-test-parts/00.mjs.part', 7975, '31d76f7b370395860d911b4fa0717168c1cf803c7160d5798796e0f80959403e'],
  ['targeted-test-parts/01.mjs.part', 7907, '244479f2ee3556dcbf2e993cd63155114cc874224dc2f16f4a861d618bc1c9b5'],
  ['targeted-test-parts/02.mjs.part', 4234, '8d44fc9bb0ac49d7341a11159ba20d07fcd7ffa0f2ab30c7a604636f27cfc570'],
  ['targeted-test-parts/03.mjs.part', 1826, '68f34f7d43955d33649547b34bb773dc9424923b1fc5519ab77092c368cd530a'],
];

const buffers = parts.map(([relative, expectedBytes, expectedSha]) => {
  const file = path.join(here, relative);
  const data = readFileSync(file);
  const sha = createHash('sha256').update(data).digest('hex');
  if (data.length !== expectedBytes) throw new Error(`${relative}: expected ${expectedBytes} bytes, got ${data.length}`);
  if (sha !== expectedSha) throw new Error(`${relative}: SHA-256 mismatch: ${sha}`);
  return data;
});

const tmp = mkdtempSync(path.join(os.tmpdir(), 'ozon-composer-wait-regression-'));
const testFile = path.join(tmp, 'TARGETED_COMPOSER_WAIT_REGRESSION.mjs');
try {
  writeFileSync(testFile, Buffer.concat(buffers));
  const syntax = spawnSync(process.execPath, ['--check', testFile], { stdio: 'inherit' });
  if (syntax.status !== 0) process.exit(syntax.status ?? 1);
  const run = spawnSync(process.execPath, [testFile, candidateDir], { stdio: 'inherit' });
  process.exit(run.status ?? 1);
} finally {
  rmSync(tmp, { recursive: true, force: true });
}
