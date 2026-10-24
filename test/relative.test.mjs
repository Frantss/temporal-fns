import { test } from 'node:test';
import assert from 'node:assert/strict';
import * as f from '../dist/index.js';

const T = globalThis.Temporal;
const base = T.PlainDateTime.from('2026-01-01T00:00');

test('approximate distances select phrases and suffix direction at thresholds', () => {
  for (const [seconds, expected] of [
    [0, 'less than a minute'],
    [29, 'less than a minute'],
    [30, '1 minute'],
    [89, '1 minute'],
    [90, '2 minutes'],
    [2700, 'about 1 hour'],
    [5400, 'about 2 hours'],
    [86400, '1 day'],
    [151200, '2 days'],
    [2592000, 'about 1 month'],
    [3888000, '2 months'],
    [5184000, '2 months'],
    [31536000, 'about 1 year'],
  ]) {
    assert.equal(f.formatDistance(base.add({ seconds }), base), expected);
  }
  assert.equal(f.formatDistance(base.add({ days: 2 }), base, { addSuffix: true }), 'in 2 days');
  assert.equal(
    f.formatDistance(base.subtract({ days: 2 }), base, { addSuffix: true }),
    '2 days ago',
  );
  for (const [seconds, expected] of [
    [4, 'less than 5 seconds'],
    [5, 'less than 10 seconds'],
    [10, 'less than 20 seconds'],
    [20, 'half a minute'],
    [40, 'less than a minute'],
    [60, '1 minute'],
  ]) {
    assert.equal(f.formatDistance(base.add({ seconds }), base, { includeSeconds: true }), expected);
  }
  assert.throws(() => f.formatDistance(base, base, { locale: 'fr' }), RangeError);
  assert.throws(() => f.formatDistance(base, base, { addSuffix: 1 }), TypeError);
});

test('strict distances use requested units, rounding and calendar-relative months', () => {
  const value = base.add({ seconds: 91 });
  assert.equal(f.formatDistanceStrict(value, base), '2 minutes');
  assert.equal(
    f.formatDistanceStrict(value, base, { unit: 'minute', roundingMethod: 'floor' }),
    '1 minute',
  );
  assert.equal(
    f.formatDistanceStrict(value, base, {
      unit: 'minute',
      roundingMethod: 'ceil',
      addSuffix: true,
    }),
    'in 2 minutes',
  );
  assert.equal(
    f.formatDistanceStrict(base, value, {
      unit: 'minute',
      roundingMethod: 'trunc',
      addSuffix: true,
    }),
    '1 minute ago',
  );
  const jan = T.PlainDate.from('2026-01-31');
  assert.equal(
    f.formatDistanceStrict(T.PlainDate.from('2026-02-28'), jan, { unit: 'month' }),
    '1 month',
  );
  const before = T.ZonedDateTime.from('2026-03-07T12:00[America/New_York]');
  const after = before.add({ days: 1 });
  assert.equal(f.formatDistanceStrict(after, before, { unit: 'hour' }), '23 hours');
  assert.equal(f.formatDistanceStrict(after, before, { unit: 'day' }), '1 day');
  assert.throws(() => f.formatDistanceStrict(value, base, { unit: 'week' }), RangeError);
  assert.throws(
    () => f.formatDistanceStrict(value, base, { roundingMethod: 'invalid' }),
    RangeError,
  );
});

test('relative phrases use calendar days and include clocks on distant dates', () => {
  const date = T.PlainDate.from('2026-10-23');
  for (const [days, expected] of [
    [-7, '10/16/2026'],
    [-2, 'last Wednesday'],
    [-1, 'yesterday'],
    [0, 'today'],
    [1, 'tomorrow'],
    [2, 'Sunday'],
    [7, '10/30/2026'],
  ]) {
    assert.equal(f.formatRelative(date.add({ days }), date), expected);
  }
  const datetime = date.toPlainDateTime('14:30');
  assert.match(f.formatRelative(datetime, datetime), /^today at 2:30\s*PM$/);
  assert.match(
    f.formatRelative(datetime.add({ days: 7 }), datetime),
    /^10\/30\/2026 at 2:30\s*PM$/,
  );
  const instant = T.Instant.from('2026-10-24T01:00Z');
  assert.match(
    f.formatRelative(instant, instant.subtract({ hours: 2 }), { timeZone: 'America/Montevideo' }),
    /^today at 10:00\s*PM$/,
  );
});

test('relative functions enforce matching kinds and explicit zone context', () => {
  const instant = T.Instant.from('2026-10-23T12:00Z');
  const zoned = instant.toZonedDateTimeISO('UTC');
  for (const fn of [f.formatDistance, f.formatDistanceStrict, f.formatRelative]) {
    assert.throws(() => fn(instant, instant), TypeError);
    assert.throws(() => fn(base, base, { timeZone: 'UTC' }), RangeError);
    assert.throws(() => fn(zoned, zoned.withTimeZone('America/Montevideo')), RangeError);
    assert.throws(() => fn(base, zoned), TypeError);
    assert.equal(typeof fn(instant, instant, { timeZone: 'UTC' }), 'string');
    assert.equal(
      typeof fn(zoned, zoned.withTimeZone('America/Montevideo'), { timeZone: 'UTC' }),
      'string',
    );
  }
});

test('ToNow functions use the supplied zone and support all four relative kinds', () => {
  const now = T.Now.zonedDateTimeISO('UTC');
  const future = now.add({ days: 3650 });
  for (const value of [
    future.toPlainDate(),
    future.toPlainDateTime(),
    future.toInstant(),
    future,
  ]) {
    assert.match(
      f.formatDistanceToNow(value, { timeZone: 'UTC', addSuffix: true }),
      /^in about 10 years$/,
    );
    assert.equal(
      f.formatDistanceToNowStrict(value, { timeZone: 'UTC', unit: 'year', addSuffix: true }),
      'in 10 years',
    );
  }
  assert.equal(typeof f.formatDistanceToNow(future), 'string');
  assert.equal(typeof f.formatDistanceToNowStrict(future), 'string');
  assert.throws(() => f.formatDistanceToNow(future.toPlainDate()), TypeError);
});
