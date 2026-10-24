import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import * as library from '@frantss/temporal-fns';
import * as calendar from '@frantss/temporal-fns/calendar';

test('package exports every proposed function and only the intended entry points', () => {
  const proposal = readFileSync(new URL('../docs/api-proposal.md', import.meta.url), 'utf8');
  const names = [
    ...new Set([...proposal.matchAll(/^([a-z]\w+)(?:<[^\n]+>)?\(/gm)].map((match) => match[1])),
  ].sort();
  const exports = [...Object.keys(library), ...Object.keys(calendar)].sort();
  assert.equal(names.length, 56);
  assert.deepEqual(exports, names);
  assert.equal(Object.keys(library).length, 54);
  assert.deepEqual(Object.keys(calendar).sort(), ['fromCalendarDate', 'toCalendarDate']);
  for (const exported of Object.values(library)) assert.equal(typeof exported, 'function');
});

test('importing the package never installs or replaces global Temporal', () => {
  const result = spawnSync(
    process.execPath,
    [
      '--input-type=module',
      '-e',
      `
    import assert from 'node:assert/strict';
    globalThis.Temporal = undefined;
    const library = await import('@frantss/temporal-fns');
    assert.equal(globalThis.Temporal,undefined);
    assert.throws(()=>library.endOfDay({[Symbol.toStringTag]:'Temporal.PlainTime'}),ReferenceError);
  `,
    ],
    { encoding: 'utf8' },
  );
  assert.equal(result.status, 0, result.stderr);
});
