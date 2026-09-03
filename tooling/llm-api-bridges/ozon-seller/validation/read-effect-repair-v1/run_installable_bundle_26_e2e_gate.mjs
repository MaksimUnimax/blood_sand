#!/usr/bin/env node
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import process from "node:process";
import { spawnSync } from "node:child_process";

const repo = path.resolve(process.argv[2] || ".");
const bundle = path.resolve(process.argv[3] || path.join(repo, "tooling", "llm-api-bridges", "ozon-seller", "dist", "ozon-seller-mcp-nodebundle.js"));
const candidateShared = path.join(repo, "tooling", "llm-api-bridges", "ozon-seller", "dist-step7-candidate", "shared");
const existingGate = path.join(repo, "tooling", "llm-api-bridges", "ozon-seller", "validation", "read-effect-repair-v1", "run_all_26_e2e_gate.mjs");
const source = fs.readFileSync(bundle, "utf8").replace(/\r\n/g, "\n").replace(/\r/g, "\n");
const stdioMarker = "/* BEGIN Step 7 MCP stdio shell */";
assert.equal(source.split(stdioMarker).length - 1, 1, "bundle must contain exactly one Step7 MCP stdio shell marker");

const required = new Set([
  "shared/ozon_operation_registry.js",
  "shared/ozon_contract.js",
  "shared/ozon_credentials.js",
  "shared/ozon_entitlements.js",
  "shared/provider_transport_core.js",
  "shared/ozon_provider.js",
]);
const sectionStart = /\/\* BEGIN (shared\/[A-Za-z0-9_./-]+\.js) \*\/\n/g;
const sections = new Map();
for (const match of source.matchAll(sectionStart)) {
  const relative = match[1];
  assert.ok(!sections.has(relative), `duplicate bundle section ${relative}`);
  const bodyStart = match.index + match[0].length;
  const endMarker = `\n\n/* END ${relative} */`;
  const bodyEnd = source.indexOf(endMarker, bodyStart);
  assert.ok(bodyEnd >= bodyStart, `missing end marker for ${relative}`);
  sections.set(relative, source.slice(bodyStart, bodyEnd));
}
assert.ok(sections.size > 0, "bundle contains no shared runtime sections");
for (const relative of required) assert.ok(sections.has(relative), `bundle missing required section ${relative}`);

for (const relative of required) {
  const candidate = fs.readFileSync(path.join(candidateShared, relative.slice("shared/".length)), "utf8").replace(/\r\n/g, "\n").replace(/\r/g, "\n").replace(/\n+$/g, "");
  assert.equal(sections.get(relative), candidate, `${relative}: installable bundle differs from frozen candidate`);
}

const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), "ozon-installable-26-e2e-"));
try {
  const tempShared = path.join(tempRoot, "tooling", "llm-api-bridges", "ozon-seller", "dist-step7-candidate", "shared");
  fs.mkdirSync(tempShared, { recursive: true });
  for (const [relative, body] of sections) {
    fs.writeFileSync(path.join(tempShared, relative.slice("shared/".length)), `${body}\n`, "utf8");
  }
  const result = spawnSync(process.execPath, [existingGate, tempRoot], {
    cwd: repo,
    encoding: "utf8",
    env: { ...process.env },
    maxBuffer: 32 * 1024 * 1024,
  });
  if (result.stdout) process.stdout.write(result.stdout);
  if (result.stderr) process.stderr.write(result.stderr);
  assert.equal(result.status, 0, `installable bundle 26-read gate failed with status ${result.status}`);
} finally {
  fs.rmSync(tempRoot, { recursive: true, force: true });
}

console.log(`OZON_INSTALLABLE_BUNDLE_SECTION_COUNT=${sections.size}`);
console.log("OZON_INSTALLABLE_BUNDLE_ALL_26_E2E_PASS");
