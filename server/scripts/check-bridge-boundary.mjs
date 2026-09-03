/* global console */
import { readdir, readFile } from 'node:fs/promises';
import { join, relative } from 'node:path';

const sourceRoots = ['apps', 'packages'];
const forbidden = 'tooling/llm-api-bridges/ozon-seller';

async function filesUnder(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const nested = await Promise.all(entries.map(async (entry) => {
    const path = join(directory, entry.name);
    return entry.isDirectory() ? filesUnder(path) : [path];
  }));
  return nested.flat();
}

const files = (await Promise.all(sourceRoots.map(filesUnder))).flat();
const offenders = [];
for (const file of files.filter((path) => /\.(?:[cm]?[jt]sx?)$/.test(path))) {
  if ((await readFile(file, 'utf8')).includes(forbidden)) offenders.push(relative('.', file));
}
if (offenders.length > 0) {
  throw new Error(`Forbidden Bridge implementation import/reference in: ${offenders.join(', ')}`);
}
console.log('Bridge boundary guard passed.');
