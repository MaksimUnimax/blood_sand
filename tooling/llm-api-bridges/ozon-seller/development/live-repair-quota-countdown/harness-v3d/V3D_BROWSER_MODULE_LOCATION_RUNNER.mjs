import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';

const EXPECTED_V3C_SHA256 = '05c8ce0d0799b4891b79f73cf1201a2ed187f0527128b35802286280988ea534';
const harnessPath = path.resolve(process.argv[2] || '');
const candidateDir = path.resolve(process.argv[3] || '');
const chromePath = path.resolve(process.argv[4] || '');
const projectRoot = path.resolve(process.argv[5] || '');
if (![harnessPath, path.join(candidateDir,'manifest.json'), chromePath, projectRoot].every(fs.existsSync)) {
  throw new Error('usage: node V3D_BROWSER_MODULE_LOCATION_RUNNER.mjs <exact-v3c-browser-harness.mjs> <exact-v3-candidate-dir> <cft-chrome.exe> <puppeteer-project-root>');
}
const sha256 = (buf) => createHash('sha256').update(buf).digest('hex');
const raw = fs.readFileSync(harnessPath);
if (sha256(raw) !== EXPECTED_V3C_SHA256) throw new Error('V3C browser harness SHA-256 mismatch');
const puppeteerPkg = path.join(projectRoot, 'node_modules', 'puppeteer', 'package.json');
const corePkg = path.join(projectRoot, 'node_modules', 'puppeteer-core', 'package.json');
if (!fs.existsSync(puppeteerPkg) && !fs.existsSync(corePkg)) throw new Error('Puppeteer package not found under supplied project root');
const tempName = `.v3d-browser-harness-${process.pid}-${Date.now()}.mjs`;
const relocated = path.join(projectRoot, tempName);
fs.writeFileSync(relocated, raw);
if (sha256(fs.readFileSync(relocated)) !== EXPECTED_V3C_SHA256) throw new Error('relocated browser harness bytes changed');
console.log(`V3D_BROWSER_SOURCE_SHA256=${EXPECTED_V3C_SHA256}`);
console.log('V3D_BROWSER_RELOCATED_BYTES_IDENTICAL=PASS');
console.log(`V3D_BROWSER_PROJECT_ROOT=${projectRoot}`);
const syntax = spawnSync(process.execPath, ['--check', relocated], { cwd: projectRoot, encoding: 'utf8' });
process.stdout.write(syntax.stdout || ''); process.stderr.write(syntax.stderr || '');
if (syntax.status !== 0) { try { fs.unlinkSync(relocated); } catch (_) {} process.exit(syntax.status ?? 1); }
const run = spawnSync(process.execPath, [relocated, candidateDir, chromePath], { cwd: projectRoot, encoding: 'utf8', timeout: 90000 });
process.stdout.write(run.stdout || ''); process.stderr.write(run.stderr || '');
try { fs.unlinkSync(relocated); } catch (_) {}
process.exit(run.status ?? 1);
