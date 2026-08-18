import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';

const EXPECTED_SOURCE_GIT_BLOB = '841429741d5ff9144a8a40506e657dc4392fe37c';
const harnessPath = path.resolve(process.argv[2] || '');
const candidateDir = path.resolve(process.argv[3] || '');
const chromePath = path.resolve(process.argv[4] || '');
const projectRoot = path.resolve(process.argv[5] || '');
if (![harnessPath, path.join(candidateDir,'manifest.json'), chromePath, projectRoot].every(fs.existsSync)) {
  throw new Error('usage: node V3E_BROWSER_GIT_BLOB_RUNNER.mjs <exact-v3c-browser-harness.mjs> <exact-v3-candidate-dir> <cft-chrome.exe> <puppeteer-project-root>');
}
const gitBlobSha = (buf) => createHash('sha1').update(Buffer.concat([Buffer.from(`blob ${buf.length}\0`), buf])).digest('hex');
const sha256 = (buf) => createHash('sha256').update(buf).digest('hex');
const raw = fs.readFileSync(harnessPath);
const actualBlob = gitBlobSha(raw);
if (actualBlob !== EXPECTED_SOURCE_GIT_BLOB) throw new Error(`browser harness Git blob mismatch: expected ${EXPECTED_SOURCE_GIT_BLOB}, got ${actualBlob}`);
const puppeteerPkg = path.join(projectRoot, 'node_modules', 'puppeteer', 'package.json');
const corePkg = path.join(projectRoot, 'node_modules', 'puppeteer-core', 'package.json');
if (!fs.existsSync(puppeteerPkg) && !fs.existsSync(corePkg)) throw new Error('Puppeteer package not found under supplied project root');
const tempName = `.v3e-browser-harness-${process.pid}-${Date.now()}.mjs`;
const relocated = path.join(projectRoot, tempName);
fs.writeFileSync(relocated, raw);
const relocatedRaw = fs.readFileSync(relocated);
const relocatedBlob = gitBlobSha(relocatedRaw);
if (relocatedBlob !== EXPECTED_SOURCE_GIT_BLOB) throw new Error(`relocated browser harness Git blob changed: ${relocatedBlob}`);
console.log(`V3E_BROWSER_SOURCE_GIT_BLOB=${actualBlob}`);
console.log(`V3E_BROWSER_SOURCE_SHA256=${sha256(raw)}`);
console.log('V3E_BROWSER_RELOCATED_BYTES_IDENTICAL=PASS');
console.log(`V3E_BROWSER_PROJECT_ROOT=${projectRoot}`);
const syntax = spawnSync(process.execPath, ['--check', relocated], { cwd: projectRoot, encoding: 'utf8' });
process.stdout.write(syntax.stdout || ''); process.stderr.write(syntax.stderr || '');
if (syntax.status !== 0) { try { fs.unlinkSync(relocated); } catch (_) {} process.exit(syntax.status ?? 1); }
const run = spawnSync(process.execPath, [relocated, candidateDir, chromePath], { cwd: projectRoot, encoding: 'utf8', timeout: 120000 });
process.stdout.write(run.stdout || ''); process.stderr.write(run.stderr || '');
try { fs.unlinkSync(relocated); } catch (_) {}
process.exit(run.status ?? 1);
