#!/usr/bin/env node
import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const FLOOR = 22; // Maintenance LTS until 2027-04
const ACTIVE_LTS = 24; // Active LTS until 2028-04
const ROOT = process.cwd();

const failures = [];
const ok = msg => console.log(`  ok  ${msg}`);
const fail = msg => {
  failures.push(msg);
  console.log(`  FAIL  ${msg}`);
};

function readJson(rel) {
  return JSON.parse(readFileSync(join(ROOT, rel), 'utf8'));
}

function readText(rel) {
  return readFileSync(join(ROOT, rel), 'utf8');
}

// 1. Root engines.node floor
console.log('engines.node floor');
{
  const root = readJson('package.json');
  const range = root.engines?.node;
  if (!range) {
    fail(`package.json missing engines.node`);
  } else if (range !== `>=${FLOOR}`) {
    fail(`package.json engines.node = "${range}", expected ">=${FLOOR}"`);
  } else {
    ok(`package.json engines.node = "${range}"`);
  }
}

// 2. Public packages match root engines.node
console.log('public packages engines.node');
{
  const publicPkgs = [
    'packages/uikit',
    'packages/uikit-css',
    'packages/uikit-icons',
    'packages/uikit-js',
    'packages/uikit-tailwind'
  ];
  const expected = `>=${FLOOR}`;
  for (const dir of publicPkgs) {
    const pkg = readJson(`${dir}/package.json`);
    const range = pkg.engines?.node;
    if (range === expected) {
      ok(`${dir}/package.json engines.node = "${range}"`);
    } else {
      fail(
        `${dir}/package.json engines.node = ${JSON.stringify(range)}, expected "${expected}"`
      );
    }
  }
}

// 3. .nvmrc = ACTIVE_LTS
console.log('.nvmrc');
{
  const nvmrc = readText('.nvmrc').trim();
  if (nvmrc === String(ACTIVE_LTS)) {
    ok(`.nvmrc = "${nvmrc}"`);
  } else {
    fail(`.nvmrc = "${nvmrc}", expected "${ACTIVE_LTS}"`);
  }
}

// 4. composite action default
console.log('setup-tooling action default');
{
  const yml = readText('.github/actions/setup-tooling/action.yml');
  const m = yml.match(/node-version:[\s\S]*?default:\s*'(\d+)'/);
  if (!m) {
    fail(`action.yml: cannot parse node-version default`);
  } else if (m[1] !== String(FLOOR)) {
    fail(`action.yml node-version default = "${m[1]}", expected "${FLOOR}"`);
  } else {
    ok(`action.yml node-version default = "${m[1]}"`);
  }
}

// 5. re-test.yml matrix
console.log('re-test.yml node-version matrix');
{
  const path = '.github/workflows/re-test.yml';
  if (!existsSync(join(ROOT, path))) {
    fail(`${path} missing`);
  } else {
    const yml = readText(path);
    const wantFloor = `${FLOOR}.x`;
    const wantActive = `${ACTIVE_LTS}.x`;
    const matrixMatch = yml.match(
      /matrix:\s*\n\s*node-version:\s*\[([^\]]+)\]/
    );
    if (!matrixMatch) {
      fail(`${path}: no node-version matrix found`);
    } else {
      const list = matrixMatch[1];
      if (!list.includes(wantFloor))
        fail(`${path} matrix missing ${wantFloor}`);
      else ok(`${path} matrix contains ${wantFloor}`);
      if (!list.includes(wantActive))
        fail(`${path} matrix missing ${wantActive}`);
      else ok(`${path} matrix contains ${wantActive}`);
    }
  }
}

// 6. @types/node major === FLOOR across all package.json
console.log('@types/node major');
{
  const allPkgs = [
    'package.json',
    'packages/uikit/package.json',
    'packages/uikit-css/package.json',
    'packages/uikit-icons/package.json',
    'packages/uikit-js/package.json',
    'packages/uikit-tailwind/package.json',
    'packages/uikit-cdn/package.json',
    'apps/docs/package.json'
  ];
  for (const rel of allPkgs) {
    if (!existsSync(join(ROOT, rel))) continue;
    const pkg = readJson(rel);
    const ranges = [pkg.devDependencies, pkg.dependencies]
      .filter(Boolean)
      .map(d => d['@types/node'])
      .filter(Boolean);
    for (const range of ranges) {
      const major = String(range).match(/(\d+)/)?.[1];
      if (major === String(FLOOR)) {
        ok(`${rel} @types/node "${range}"`);
      } else {
        fail(`${rel} @types/node = "${range}", expected major ${FLOOR}`);
      }
    }
  }
}

if (failures.length > 0) {
  console.error(`\n${failures.length} drift(s) detected.`);
  process.exit(1);
}
console.log('\nNode version invariant: aligned.');
