import { test } from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { toCalendarDate, fromCalendarDate } from '@frantss/temporal-fns/calendar';

const T = globalThis.Temporal;

test('widget adapters copy local calendar fields, including years 0 through 99', () => {
  for (const text of [
    '0000-01-01T12:34:56.789',
    '0099-12-31T23:59:59.999',
    '2026-10-23T14:30:15.123',
  ]) {
    const value = T.PlainDateTime.from(text);
    const date = toCalendarDate(value);
    assert.equal(date.getFullYear(), value.year);
    assert.ok(fromCalendarDate(date).equals(value));
  }
  const plain = T.PlainDate.from('2026-10-23');
  assert.ok(fromCalendarDate(toCalendarDate(plain)).equals(plain.toPlainDateTime()));
  const zoned = T.ZonedDateTime.from('2026-10-23T14:30:15.123[Asia/Tokyo]');
  assert.ok(fromCalendarDate(toCalendarDate(zoned)).equals(zoned.toPlainDateTime()));
  assert.throws(() => fromCalendarDate(new Date(NaN)), RangeError);
  assert.throws(() => fromCalendarDate({}), TypeError);
  assert.throws(() => toCalendarDate(T.PlainYearMonth.from('2026-10')), TypeError);
  assert.throws(
    () => toCalendarDate(T.PlainDateTime.from('2026-10-23T14:30:15.000001')),
    RangeError,
  );
  assert.throws(
    () => toCalendarDate(T.PlainDateTime.from('2026-10-23T14:30:15.000000001')),
    RangeError,
  );
});

test('widget adapters reject skipped host-local times and preserve valid repeated times', () => {
  const moduleUrl = new URL('../dist/calendar.js', import.meta.url).href;
  const script = `
    import assert from 'node:assert/strict';
    import {toCalendarDate,fromCalendarDate} from ${JSON.stringify(moduleUrl)};
    const T = globalThis.Temporal;
    assert.throws(()=>toCalendarDate(T.PlainDateTime.from('2026-03-08T02:30')),RangeError);
    const repeated = T.PlainDateTime.from('2026-11-01T01:30');
    assert.ok(fromCalendarDate(toCalendarDate(repeated)).equals(repeated));
    const remote = T.ZonedDateTime.from('2026-10-23T12:00[Asia/Tokyo]');
    const host = toCalendarDate(remote);
    assert.equal(host.getHours(),12);
    assert.notEqual(host.getTime(),remote.epochMilliseconds);
  `;
  const result = spawnSync(
    process.execPath,
    ['--import', 'temporal-polyfill/global', '--input-type=module', '-e', script],
    { env: { ...process.env, TZ: 'America/New_York' }, encoding: 'utf8' },
  );
  assert.equal(result.status, 0, result.stderr);
});
