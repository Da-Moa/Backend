import assert from 'node:assert/strict';
import { mkdtempSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import test from 'node:test';
import { loadEnv } from '../../../../scripts/loadEnv.mjs';

test('환경 로더는 주입 값·환경별 local·local·환경별·기본 순서를 유지하며 테스트에서 local을 제외한다', t => {
  const directory = mkdtempSync(join(tmpdir(), 'da-moa-env-'));
  const previous = { ...process.env };
  t.after(() => {
    for (const key of Object.keys(process.env)) if (!(key in previous)) delete process.env[key];
    Object.assign(process.env, previous);
    rmSync(directory, { recursive: true, force: true });
  });
  writeFileSync(join(directory, '.env'), 'SPLIT_ENV_BASE=base\nSPLIT_ENV_FIRST=base\nSPLIT_ENV_INJECTED=file\n');
  writeFileSync(join(directory, '.env.local'), 'SPLIT_ENV_LOCAL=local\nSPLIT_ENV_FIRST=local\n');
  writeFileSync(join(directory, '.env.production'), 'SPLIT_ENV_MODE=production\n');
  writeFileSync(join(directory, '.env.production.local'), 'SPLIT_ENV_FIRST=production-local\n');
  process.env.NODE_ENV = 'production';
  process.env.SPLIT_ENV_INJECTED = 'process';
  loadEnv(directory);
  assert.equal(process.env.SPLIT_ENV_FIRST, 'production-local');
  assert.equal(process.env.SPLIT_ENV_BASE, 'base');
  assert.equal(process.env.SPLIT_ENV_LOCAL, 'local');
  assert.equal(process.env.SPLIT_ENV_MODE, 'production');
  assert.equal(process.env.SPLIT_ENV_INJECTED, 'process');
  for (const key of ['SPLIT_ENV_FIRST', 'SPLIT_ENV_LOCAL', 'SPLIT_ENV_MODE']) delete process.env[key];
  process.env.NODE_ENV = 'test';
  loadEnv(directory);
  assert.equal(process.env.SPLIT_ENV_FIRST, 'base');
  assert.equal(process.env.SPLIT_ENV_LOCAL, undefined);
  assert.equal(process.env.SPLIT_ENV_MODE, undefined);
});
